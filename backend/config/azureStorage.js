const {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");

const DEFAULT_CONTAINER_NAME = "user-profiles";

const parseConnectionString = (connStr) => {
  if (!connStr) return {};
  const map = {};
  connStr.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const key = part.substring(0, idx).trim();
      const val = part.substring(idx + 1).trim();
      if (key) map[key] = val;
    }
  });
  return map;
};

const getAzureStorageConfiguration = () => {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const sasUrl = process.env.AZURE_STORAGE_SAS_URL || process.env.AZURE_STORAGE_CONTAINER_SAS_URL;
  const authMode = process.env.AZURE_STORAGE_AUTH_MODE || (sasUrl ? "sas-url" : "connection-string");
  const containerName =
    process.env.AZURE_STORAGE_CONTAINER_NAME || DEFAULT_CONTAINER_NAME;

  if (!accountName && !connectionString && !sasUrl) {
    return {
      enabled: false,
      reason: "A configuração do Azure Blob Storage não foi informada nas variáveis de ambiente.",
    };
  }

  if (authMode === "sas-url") {
    if (!sasUrl) {
      return {
        enabled: false,
        reason: "AZURE_STORAGE_SAS_URL é obrigatória quando o modo é sas-url.",
      };
    }
    return {
      enabled: true,
      authMode: "sas-url",
      sasUrl,
      containerName,
    };
  }

  if (authMode === "connection-string") {
    if (!connectionString) {
      return {
        enabled: false,
        reason: "AZURE_STORAGE_CONNECTION_STRING é obrigatória no modo connection-string.",
      };
    }
    const parsed = parseConnectionString(connectionString);
    return {
      enabled: true,
      authMode: "connection-string",
      connectionString,
      accountName: parsed.AccountName || accountName,
      accountKey: parsed.AccountKey || accountKey,
      containerName,
    };
  }

  if (authMode === "managed-identity") {
    if (!accountName) {
      return {
        enabled: false,
        reason: "AZURE_STORAGE_ACCOUNT_NAME é obrigatória no modo managed-identity.",
      };
    }
    return {
      enabled: true,
      authMode: "managed-identity",
      accountName,
      containerName,
    };
  }

  return {
    enabled: false,
    reason: "AZURE_STORAGE_AUTH_MODE inválido. Use connection-string, managed-identity ou sas-url.",
  };
};

const getBlobServiceClient = () => {
  const configuration = getAzureStorageConfiguration();

  if (!configuration.enabled) {
    const error = new Error(configuration.reason);
    error.code = "AZURE_STORAGE_NOT_CONFIGURED";
    throw error;
  }

  if (configuration.authMode === "sas-url") {
    try {
      const urlObj = new URL(configuration.sasUrl);
      // Aponta para a raiz do host da storage account com a query SAS
      const hostSasUrl = `${urlObj.origin}${urlObj.search}`;
      return new BlobServiceClient(hostSasUrl);
    } catch {
      return new BlobServiceClient(configuration.sasUrl);
    }
  }

  if (configuration.authMode === "connection-string") {
    return BlobServiceClient.fromConnectionString(configuration.connectionString);
  }

  if (configuration.authMode === "managed-identity") {
    return new BlobServiceClient(
      `https://${configuration.accountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
  }

  throw new Error("Modo de autenticação Azure não suportado.");
};

const getAvatarContainerClient = () => {
  const configuration = getAzureStorageConfiguration();

  if (!configuration.enabled) {
    const error = new Error(configuration.reason);
    error.code = "AZURE_STORAGE_NOT_CONFIGURED";
    throw error;
  }

  if (configuration.authMode === "sas-url") {
    try {
      const urlObj = new URL(configuration.sasUrl);
      const pathname = urlObj.pathname.replace(/^\/+/g, "");
      // Se a SAS URL apontar diretamente para o container
      if (pathname.length > 0) {
        return new ContainerClient(configuration.sasUrl);
      }
    } catch {
      // Fallback
    }
    return getBlobServiceClient().getContainerClient(configuration.containerName);
  }

  return getBlobServiceClient().getContainerClient(configuration.containerName);
};

const checkAzureStorageAvailability = async () => {
  const configuration = getAzureStorageConfiguration();

  if (!configuration.enabled) {
    return configuration;
  }

  try {
    const containerClient = getAvatarContainerClient();

    // 1. Tenta verificar se o container existe
    try {
      const containerExists = await containerClient.exists();
      if (containerExists) {
        return { enabled: true, containerName: configuration.containerName };
      }
    } catch (existsErr) {
      // SAS tokens com escopo de container (sr=c) muitas vezes recebem 403 AuthorizationFailure
      // ao chamar 'Get Container Properties' (usada por exists()), mas possuem permissões completas
      // para operações em blobs (racwdl: read, add, create, write, delete, list).
      if (
        existsErr.statusCode === 403 ||
        existsErr.code === "AuthorizationFailure" ||
        existsErr.code === "AuthorizationPermissionMismatch"
      ) {
        try {
          const iter = containerClient.listBlobsFlat();
          await iter.next();
          return { enabled: true, containerName: configuration.containerName };
        } catch (listErr) {
          // Se for uma SAS de container configurada, assumimos habilitado para operações em blobs
          if (configuration.authMode === "sas-url") {
            return { enabled: true, containerName: configuration.containerName };
          }
          throw listErr;
        }
      }
      throw existsErr;
    }

    return {
      enabled: false,
      reason: `O container '${configuration.containerName}' não foi encontrado no Azure Blob Storage.`,
    };
  } catch (error) {
    return {
      enabled: false,
      reason: "Não foi possível conectar ao Azure Blob Storage.",
      cause: error.message || error.code,
    };
  }
};

const getCanonicalBlobUrl = (blobName) => {
  const containerClient = getAvatarContainerClient();
  const blobClient = containerClient.getBlobClient(blobName);
  const rawUrl = blobClient.url;
  const [canonical] = rawUrl.split("?");
  return canonical;
};

const generateBlobReadSasUrl = async (blobName, durationMinutes = 5) => {
  const configuration = getAzureStorageConfiguration();
  if (!configuration.enabled) {
    throw new Error(configuration.reason);
  }

  const containerClient = getAvatarContainerClient();
  const blobClient = containerClient.getBlobClient(blobName);
  const [canonicalUrl] = blobClient.url.split("?");

  const startsOn = new Date(Date.now() - 60 * 1000); // 1 minuto antes contra desvios de relógio
  const expiresOn = new Date(Date.now() + durationMinutes * 60 * 1000);

  // 1. Connection string ou AccountName + AccountKey
  if (configuration.accountName && configuration.accountKey) {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      configuration.accountName,
      configuration.accountKey
    );
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: configuration.containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
      },
      sharedKeyCredential
    ).toString();

    return `${canonicalUrl}?${sasToken}`;
  }

  // 2. Managed Identity
  if (configuration.authMode === "managed-identity") {
    const blobServiceClient = getBlobServiceClient();
    const userDelegationKey = await blobServiceClient.getUserDelegationKey(
      startsOn,
      expiresOn
    );
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: configuration.containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
      },
      userDelegationKey,
      configuration.accountName
    ).toString();

    return `${canonicalUrl}?${sasToken}`;
  }

  // 3. Se uma SAS URL já foi fornecida com assinatura (ex: AZURE_STORAGE_SAS_URL)
  if (configuration.authMode === "sas-url" && configuration.sasUrl) {
    // blobClient.url já contém a query string SAS se o containerClient foi criado com SAS URL
    if (blobClient.url.includes("?")) {
      return blobClient.url;
    }
    const parsed = new URL(configuration.sasUrl);
    const query = parsed.search; // ?sp=...
    return query ? `${canonicalUrl}${query}` : canonicalUrl;
  }

  throw new Error("Não foi possível gerar a URL temporária de leitura com as credenciais atuais.");
};

module.exports = {
  DEFAULT_CONTAINER_NAME,
  getAzureStorageConfiguration,
  getBlobServiceClient,
  getAvatarContainerClient,
  checkAzureStorageAvailability,
  getCanonicalBlobUrl,
  generateBlobReadSasUrl,
};
