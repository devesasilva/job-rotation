const funcaoService = require('../services/funcaoService');

const criar = async (req, res) => {
  try {
    const { id: organizacaoId } = req.params;
    const usuarioId = req.user?.id;
    const { nome, descricao } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({
        mensagem: 'O nome da função é obrigatório.',
      });
    }

    if (
      descricao !== undefined &&
      descricao !== null &&
      typeof descricao !== 'string'
    ) {
      return res.status(400).json({
        mensagem: 'A descrição da função deve ser um texto.',
      });
    }

    const funcao = await funcaoService.criarFuncao(
      organizacaoId,
      usuarioId,
      {
        nome,
        descricao,
      }
    );

    return res.status(201).json({
      mensagem: 'Função cadastrada com sucesso!',
      funcao,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao cadastrar função.',
    });
  }
};

const listar = async (req, res) => {
  try {
    const { id: organizacaoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const funcoes = await funcaoService.listarFuncoes(
      organizacaoId,
      usuarioId
    );

    return res.status(200).json(funcoes);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao listar funções.',
    });
  }
};

const editar = async (req, res) => {
  try {
    const { id: organizacaoId, funcaoId } = req.params;
    const usuarioId = req.user?.id;
    const { nome, descricao } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({
        mensagem: 'O nome da função é obrigatório.',
      });
    }

    if (
      descricao !== undefined &&
      descricao !== null &&
      typeof descricao !== 'string'
    ) {
      return res.status(400).json({
        mensagem: 'A descrição da função deve ser um texto.',
      });
    }

    const funcao = await funcaoService.editarFuncao(
      organizacaoId,
      usuarioId,
      funcaoId,
      {
        nome,
        descricao,
      }
    );

    return res.status(200).json({
      mensagem: 'Função atualizada com sucesso!',
      funcao,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao editar função.',
    });
  }
};

const excluir = async (req, res) => {
  try {
    const { id: organizacaoId, funcaoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    await funcaoService.excluirFuncao(
      organizacaoId,
      usuarioId,
      funcaoId
    );

    return res.status(200).json({
      mensagem: 'Função excluída com sucesso!',
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao excluir função.',
    });
  }
};

module.exports = {
  criar,
  listar,
  editar,
  excluir,
};