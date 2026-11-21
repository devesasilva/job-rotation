const crypto = require("crypto");
const Usuario = require("../models/Usuario");
const {
  getAvatarContainerClient,
  getCanonicalBlobUrl,
  generateBlobReadSasUrl,
  checkAzureStorageAvailability,
} = require("../../config/azureStorage");

const MIME_SIGNATURES = {
  "image/jpeg": [
    (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  ],
  "image/png": [
    (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  ],
  "image/webp": [
    (buf) =>
      buf.length >= 12 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP",
  ],
};

const EXTENSION_BY_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const validateImageFile = (file) => {
  if (!file || !file.buffer || file.buffer.length === 0) {
    const error = new Error("Nenhum arquivo de imagem foi enviado.");
    error.status = 400;
    throw error;
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSizeBytes || file.buffer.length > maxSizeBytes) {
    const error = new Error("O tamanho máximo permitido para o avatar é 5 MB.");
    error.status = 413;
    throw error;
  }

  let detectedMime = null;
  for (const [mime, validators] of Object.entries(MIME_SIGNATURES)) {
    if (validators.some((validator) => validator(file.buffer))) {
      detectedMime = mime;
      break;
    }
  }

  if (!detectedMime) {
    const error = new Error(
      "Tipo de arquivo não permitido. Apenas JPEG, PNG e WebP são aceitos."
    );
    error.status = 400;
    throw error;
  }

  return {
    mimeType: detectedMime,
    extension: EXTENSION_BY_MIME[detectedMime],
  };
};

const ensureAzureAvailable = async () => {
  const availability = await checkAzureStorageAvailability();
  if (!availability.enabled) {
    const error = new Error(
      availability.reason || "O serviço de armazenamento de fotos está indisponível no momento."
    );
    error.status = 503;
    error.code = "AZURE_STORAGE_UNAVAILABLE";
    error.details = availability;
    throw error;
  }
};

const getAvatarStatus = async () => {
  return await checkAzureStorageAvailability();
};

const consultarAvatar = async (userId) => {
  const usuario = await Usuario.findById(userId).select("avatar nome email");
  if (!usuario) {
    const error = new Error("Usuário não encontrado.");
    error.status = 404;
    throw error;
  }

  if (!usuario.avatar || !usuario.avatar.blobName) {
    return {
      avatar: null,
    };
  }

  try {
    const avatarUrl = await generateBlobReadSasUrl(usuario.avatar.blobName);
    return {
      avatar: {
        avatarUrl,
        contentType: usuario.avatar.contentType,
        size: usuario.avatar.size,
        updatedAt: usuario.avatar.updatedAt,
      },
    };
  } catch (err) {
    // Se o Azure estiver inacessível, não quebra a consulta do perfil
    return {
      avatar: {
        avatarUrl: null,
        contentType: usuario.avatar.contentType,
        size: usuario.avatar.size,
        updatedAt: usuario.avatar.updatedAt,
        indisponivel: true,
      },
    };
  }
};

const cadastrarAvatar = async (userId, file) => {
  await ensureAzureAvailable();

  const usuario = await Usuario.findById(userId);
  if (!usuario) {
    const error = new Error("Usuário não encontrado.");
    error.status = 404;
    throw error;
  }

  if (usuario.avatar && usuario.avatar.blobName) {
    const error = new Error(
      "O usuário já possui uma foto de perfil cadastrada. Utilize a opção de substituição."
    );
    error.status = 409;
    throw error;
  }

  const { mimeType, extension } = validateImageFile(file);
  const blobName = `avatars/${userId}/${crypto.randomUUID()}.${extension}`;
  const containerClient = getAvatarContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // 1. Upload do blob para o Azure
  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  });

  const canonicalUrl = getCanonicalBlobUrl(blobName);

  // 2. Atualiza MongoDB (com rollback em caso de falha)
  try {
    usuario.avatar = {
      blobName,
      url: canonicalUrl,
      contentType: mimeType,
      size: file.buffer.length,
      updatedAt: new Date(),
    };
    await usuario.save();
  } catch (dbError) {
    // Rollback: tenta apagar o blob recém-criado
    try {
      await blockBlobClient.deleteIfExists();
    } catch (cleanupErr) {
      console.error("Falha ao remover blob órfão durante rollback:", cleanupErr.message);
    }
    throw dbError;
  }

  const avatarUrl = await generateBlobReadSasUrl(blobName);

  return {
    avatarUrl,
    contentType: usuario.avatar.contentType,
    size: usuario.avatar.size,
    updatedAt: usuario.avatar.updatedAt,
  };
};

const substituirAvatar = async (userId, file) => {
  await ensureAzureAvailable();

  const usuario = await Usuario.findById(userId);
  if (!usuario) {
    const error = new Error("Usuário não encontrado.");
    error.status = 404;
    throw error;
  }

  if (!usuario.avatar || !usuario.avatar.blobName) {
    const error = new Error(
      "Nenhuma foto de perfil encontrada para substituição. Utilize o cadastro inicial."
    );
    error.status = 404;
    throw error;
  }

  const oldBlobName = usuario.avatar.blobName;
  const { mimeType, extension } = validateImageFile(file);
  const newBlobName = `avatars/${userId}/${crypto.randomUUID()}.${extension}`;
  const containerClient = getAvatarContainerClient();
  const newBlockBlobClient = containerClient.getBlockBlobClient(newBlobName);

  // 1. Upload do novo blob
  await newBlockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  });

  const canonicalUrl = getCanonicalBlobUrl(newBlobName);

  // 2. Atualiza MongoDB (com rollback do novo blob se falhar)
  try {
    usuario.avatar = {
      blobName: newBlobName,
      url: canonicalUrl,
      contentType: mimeType,
      size: file.buffer.length,
      updatedAt: new Date(),
    };
    await usuario.save();
  } catch (dbError) {
    try {
      await newBlockBlobClient.deleteIfExists();
    } catch (cleanupErr) {
      console.error("Falha ao remover novo blob durante rollback:", cleanupErr.message);
    }
    throw dbError;
  }

  // 3. Apaga o blob antigo (sem falhar a requisição se a exclusão antiga falhar)
  if (oldBlobName) {
    try {
      const oldBlockBlobClient = containerClient.getBlockBlobClient(oldBlobName);
      await oldBlockBlobClient.deleteIfExists();
    } catch (cleanupErr) {
      console.error("Falha ao remover blob anterior após substituição:", cleanupErr.message);
    }
  }

  const avatarUrl = await generateBlobReadSasUrl(newBlobName);

  return {
    avatarUrl,
    contentType: usuario.avatar.contentType,
    size: usuario.avatar.size,
    updatedAt: usuario.avatar.updatedAt,
  };
};

const excluirAvatar = async (userId) => {
  const usuario = await Usuario.findById(userId);
  if (!usuario) {
    const error = new Error("Usuário não encontrado.");
    error.status = 404;
    throw error;
  }

  // Idempotente: se já não tem avatar, retorna sucesso
  if (!usuario.avatar || !usuario.avatar.blobName) {
    return;
  }

  const oldBlobName = usuario.avatar.blobName;

  // 1. Remove primeiro a referência no MongoDB
  usuario.avatar = null;
  await usuario.save();

  // 2. Tenta apagar o blob do Azure
  try {
    const availability = await checkAzureStorageAvailability();
    if (availability.enabled && oldBlobName) {
      const containerClient = getAvatarContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(oldBlobName);
      await blockBlobClient.deleteIfExists();
    }
  } catch (cleanupErr) {
    console.error("Falha ao apagar blob durante exclusão do avatar:", cleanupErr.message);
  }
};

module.exports = {
  validateImageFile,
  getAvatarStatus,
  consultarAvatar,
  cadastrarAvatar,
  substituirAvatar,
  excluirAvatar,
};
