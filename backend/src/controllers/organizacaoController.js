const organizacaoService = require('../services/organizacaoService');

const criarOrganizacao = async (req, res) => {
  try {
    const { nome } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        mensagem: 'O nome da organização é obrigatório.',
      });
    }

    const organizacao = await organizacaoService.criarOrganizacao(
      nome.trim(),
      usuarioId
    );

    return res.status(201).json({
      mensagem: 'Organização criada com sucesso!',
      organizacao,
    });
  } catch (error) {
    console.error('Erro ao criar organização:', error);

    return res.status(500).json({
      mensagem: 'Erro ao criar organização.',
      erro: error.message,
    });
  }
};

const buscarOrganizacao = async (req, res) => {
  try {
    const organizacaoId = req.params.id;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const organizacao =
      await organizacaoService.buscarOrganizacaoPorId(
        organizacaoId,
        usuarioId
      );

    if (!organizacao) {
      return res.status(404).json({
        mensagem: 'Organização não encontrada.',
      });
    }

    return res.status(200).json(organizacao);
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({
        mensagem: error.message,
      });
    }

    console.error('Erro ao consultar organização:', error);

    return res.status(500).json({
      mensagem: 'Erro ao consultar organização.',
      erro: error.message,
    });
  }
};  

module.exports = {
  criarOrganizacao,
  buscarOrganizacao,
};