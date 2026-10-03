const rodizioService = require('../services/rodizioService');

const agendarRodizio = async (req, res) => {
  try {
    const { id: organizacaoId } = req.params;
    const usuarioId = req.user?.id;

    const {
      participante,
      funcao,
      ciclo,
      dataInicio,
      dataFim,
    } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    if (!participante || !funcao || !dataInicio || !dataFim) {
      return res.status(400).json({
        mensagem:
          'Participante, função, data de início e data de término são obrigatórios.',
      });
    }

    const rodizio =
      await rodizioService.agendarRodizio(
        organizacaoId,
        usuarioId,
        {
          participante,
          funcao,
          ciclo,
          dataInicio,
          dataFim,
        }
      );

    return res.status(201).json({
      mensagem: 'Rotação agendada com sucesso!',
      rodizio,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem:
        error.message ||
        'Erro ao agendar rotação.',
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

    const rodizios =
      await rodizioService.listarRodizios(
        organizacaoId,
        usuarioId
      );

    return res.status(200).json(rodizios);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem:
        error.message ||
        'Erro ao listar rotações.',
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
        error.message ||
        'Erro ao consultar rotação atual.',
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
      mensagem:
        error.message ||
        'Erro ao buscar rotação.',
    });
  }
};

module.exports = {
  agendarRodizio,
  listarRodizios,
  listarMinhaRotacaoAtual,
  buscarRodizioPorId,
};