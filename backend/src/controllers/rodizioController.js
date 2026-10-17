
const rodizioService = require('../services/rodizioService');

const criarRodizio = async (req, res) => {
  try {
    const { id: organizacaoId } = req.params;
    const usuarioId = req.user?.id;
    const { ciclo, dataInicio, dataFim } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        mensagem:
          'Data de início e data de término são obrigatórias.',
      });
    }

    const rodizio = await rodizioService.criarRodizio(
      organizacaoId,
      usuarioId,
      { ciclo, dataInicio, dataFim }
    );

    return res.status(201).json({
      mensagem: 'Rodízio criado com sucesso!',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao criar rodízio.',
    });
  }
};

const listarRodizios = async (req, res) => {
  try {
    const { id: organizacaoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizios = await rodizioService.listarRodizios(
      organizacaoId,
      usuarioId
    );

    return res.status(200).json(rodizios);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao listar rodízios.',
    });
  }
};

const listarMinhaRotacaoAtual = async (req, res) => {
  try {
    const { id: organizacaoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizios =
      await rodizioService.listarMinhaRotacaoAtual(
        organizacaoId,
        usuarioId
      );

    return res.status(200).json(rodizios);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem:
        error.message || 'Erro ao consultar rotação atual.',
    });
  }
};

const buscarRodizioPorId = async (req, res) => {
  try {
    const { id: organizacaoId, rodizioId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizio =
      await rodizioService.buscarRodizioPorId(
        rodizioId,
        organizacaoId,
        usuarioId
      );

    return res.status(200).json(rodizio);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao buscar rodízio.',
    });
  }
};

// Adiciona um membro a um rodízio.
const adicionarMembro = async (req, res) => {
  try {
    const { id: organizacaoId, rodizioId } = req.params;
    const usuarioId = req.user?.id;
    const { membroId } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    if (!membroId) {
      return res.status(400).json({
        mensagem: 'O ID do membro é obrigatório.',
      });
    }

    const rodizio = await rodizioService.adicionarMembro(
      organizacaoId,
      rodizioId,
      membroId,
      usuarioId
    );

    return res.status(200).json({
      mensagem: 'Membro adicionado ao rodízio com sucesso.',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao adicionar membro.',
    });
  }
};

// Remove um membro de um rodízio.
const removerMembro = async (req, res) => {
  try {
    const {
      id: organizacaoId,
      rodizioId,
      membroId,
    } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizio = await rodizioService.removerMembro(
      organizacaoId,
      rodizioId,
      membroId,
      usuarioId
    );

    return res.status(200).json({
      mensagem: 'Membro removido do rodízio com sucesso.',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao remover membro.',
    });
  }
};

// Adiciona uma função a um rodízio.
const adicionarFuncao = async (req, res) => {
  try {
    const { id: organizacaoId, rodizioId } = req.params;
    const usuarioId = req.user?.id;
    const { funcaoId } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    if (!funcaoId) {
      return res.status(400).json({
        mensagem: 'O ID da função é obrigatório.',
      });
    }

    const rodizio = await rodizioService.adicionarFuncao(
      organizacaoId,
      rodizioId,
      funcaoId,
      usuarioId
    );

    return res.status(200).json({
      mensagem: 'Função adicionada ao rodízio com sucesso.',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao adicionar função.',
    });
  }
};

// Remove uma função de um rodízio.
const removerFuncao = async (req, res) => {
  try {
    const {
      id: organizacaoId,
      rodizioId,
      funcaoId,
    } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizio = await rodizioService.removerFuncao(
      organizacaoId,
      rodizioId,
      funcaoId,
      usuarioId
    );

    return res.status(200).json({
      mensagem: 'Função removida do rodízio com sucesso.',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao remover função.',
    });
  }
};

module.exports = {
  criarRodizio,
  listarRodizios,
  listarMinhaRotacaoAtual,
  buscarRodizioPorId,
  adicionarMembro,
  removerMembro,
  adicionarFuncao,
  removerFuncao,
};
