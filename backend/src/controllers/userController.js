const avatarService = require("../services/avatarService");

const obterAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await avatarService.consultarAvatar(userId);
    const storageStatus = await avatarService.getAvatarStatus();

    return res.status(200).json({
      avatar: result.avatar,
      storageAvailable: storageStatus.enabled,
      storageReason: storageStatus.reason || null,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      mensagem: error.message || "Erro ao consultar foto de perfil.",
    });
  }
};

const criarAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    const result = await avatarService.cadastrarAvatar(userId, file);
    return res.status(201).json({
      mensagem: "Foto de perfil cadastrada com sucesso!",
      avatar: result,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      mensagem: error.message || "Erro ao cadastrar foto de perfil.",
    });
  }
};

const atualizarAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    const result = await avatarService.substituirAvatar(userId, file);
    return res.status(200).json({
      mensagem: "Foto de perfil atualizada com sucesso!",
      avatar: result,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      mensagem: error.message || "Erro ao atualizar foto de perfil.",
    });
  }
};

const deletarAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    await avatarService.excluirAvatar(userId);
    return res.status(204).send();
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      mensagem: error.message || "Erro ao excluir foto de perfil.",
    });
  }
};

const obterStatusStorage = async (req, res) => {
  try {
    const status = await avatarService.getAvatarStatus();
    return res.status(200).json(status);
  } catch (error) {
    return res.status(200).json({
      enabled: false,
      reason: "Não foi possível verificar o status do Azure Blob Storage.",
    });
  }
};

module.exports = {
  obterAvatar,
  criarAvatar,
  atualizarAvatar,
  deletarAvatar,
  obterStatusStorage,
};
