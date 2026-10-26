
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

const atualizarRodizio = async (req, res) => {
  try {
    const { id: organizacaoId, rodizioId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizio = await rodizioService.atualizarRodizio(
      organizacaoId,
      rodizioId,
      req.body || {},
      usuarioId
    );

    return res.status(200).json({
      mensagem: 'Rodízio atualizado com sucesso.',
      rodizio,
    });
  } catch (error) {
    console.error('Erro ao atualizar rodízio:', error);
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao atualizar rodízio.',
    });
  }
};

const excluirRodizio = async (req, res) => {
  try {
    const { id: organizacaoId, rodizioId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    await rodizioService.excluirRodizio(
      organizacaoId,
      rodizioId,
      usuarioId
    );

    return res.status(200).json({
      mensagem: 'Rodízio excluído com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao excluir rodízio:', error);
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao excluir rodízio.',
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

const adicionarAtribuicao = async (req, res) => {
  try {
    const { id: organizacaoId, rodizioId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizio =
      await rodizioService.adicionarAtribuicao(
        organizacaoId,
        rodizioId,
        req.body || {},
        usuarioId
      );

    return res.status(201).json({
      mensagem: 'Linha adicionada ao rodízio com sucesso.',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao adicionar linha.',
    });
  }
};

const atualizarAtribuicao = async (req, res) => {
  try {
    const {
      id: organizacaoId,
      rodizioId,
      atribuicaoId,
    } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizio =
      await rodizioService.atualizarAtribuicao(
        organizacaoId,
        rodizioId,
        atribuicaoId,
        req.body || {},
        usuarioId
      );

    return res.status(200).json({
      mensagem: 'Linha atualizada com sucesso.',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao atualizar linha.',
    });
  }
};

const removerAtribuicao = async (req, res) => {
  try {
    const {
      id: organizacaoId,
      rodizioId,
      atribuicaoId,
    } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizio =
      await rodizioService.removerAtribuicao(
        organizacaoId,
        rodizioId,
        atribuicaoId,
        usuarioId
      );

    return res.status(200).json({
      mensagem: 'Linha removida do rodízio com sucesso.',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao remover linha.',
    });
  }
};

const rotacionarRodizio = async (req, res) => {
  try {
    const { id: organizacaoId, rodizioId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const rodizio = await rodizioService.rotacionarRodizio(
      organizacaoId,
      rodizioId,
      usuarioId
    );

    return res.status(200).json({
      mensagem: 'Rodízio rotacionado com sucesso.',
      rodizio,
    });
  } catch (error) {
    console.error('Erro ao rotacionar rodízio:', error);
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao rotacionar rodízio.',
    });
  }
};

module.exports = {
  criarRodizio,
  atualizarRodizio,
  excluirRodizio,
  listarRodizios,
  listarMinhaRotacaoAtual,
  buscarRodizioPorId,
  adicionarMembro,
  removerMembro,
  adicionarFuncao,
  removerFuncao,
  adicionarAtribuicao,
  atualizarAtribuicao,
  removerAtribuicao,
  rotacionarRodizio,
};
