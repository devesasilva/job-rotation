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

const adicionarMembro = async (req, res) => {
  try {
    const { id: organizacaoId } = req.params;
    const { email, perfil } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',});
      }

      if (!email) {
        return res.status(400).json({
          mensagem: 'O email do membro é obrigatório.',
        });
      }

      const novoMembro = await organizacaoService.adicionarMembro(
        organizacaoId,
        usuarioId,
        email,
        perfil
      );

      return res.status(201).json({
        mensagem: 'Membro adicionado com sucesso!',
        membro: novoMembro,
      });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao adicionar membro.',
    });
  }
};

const listarMembros = async (req, res) => {
  try {
    const { id: organizacaoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const membros = await organizacaoService.listarMembros(organizacaoId, usuarioId);

    return res.status(200).json(membros);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao listar membros.',
    });
  }
};

const editarMembro = async (req, res) => {
  try {
    const { id: organizacaoId, membroId } = req.params;
    const { perfil } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    if (!perfil) {
      return res.status(400).json({
        mensagem: 'O perfil do membro é obrigatório.',
      });
    } 

    const membroAtualizado = await organizacaoService.editarMembro(
      organizacaoId,
      usuarioId,
      membroId,
      perfil
    );

    return res.status(200).json({
      mensagem: 'Membro atualizado com sucesso!',
      membro: membroAtualizado,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao atualizar membro.',
    });
  } 
};

const removerMembro = async (req, res) => {
  try {
    const { id: organizacaoId, membroId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    await organizacaoService.removerMembro(organizacaoId, usuarioId, membroId);

    return res.status(200).json({
      mensagem: 'Membro removido com sucesso!',
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem: error.message || 'Erro ao remover membro.',
    });
  }
};

module.exports = {
  criarOrganizacao,
  buscarOrganizacao,
  adicionarMembro,
  listarMembros,
  editarMembro,
  removerMembro,
};