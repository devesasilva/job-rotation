const notificacaoService =
  require('../services/notificacaoService');

const listar = async (req, res) => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const naoLidas =
      req.query.naoLidas === 'true';

    const resultado =
      await notificacaoService.listarNotificacoes(
        usuarioId,
        {
          pagina: req.query.pagina,
          limite: req.query.limite,
          naoLidas,
        }
      );

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem:
        error.message || 'Erro ao listar notificações.',
    });
  }
};

const contarNaoLidas = async (req, res) => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const total =
      await notificacaoService.contarNaoLidas(
        usuarioId
      );

    return res.status(200).json({ total });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem:
        error.message ||
        'Erro ao contar notificações não lidas.',
    });
  }
};

const marcarComoLida = async (req, res) => {
  try {
    const notificacao =
      await notificacaoService.marcarComoLida(
        req.user.id,
        req.params.id
      );

    return res.status(200).json({
      mensagem: 'Notificação marcada como lida.',
      notificacao: {
        _id: notificacao._id,
        lida: notificacao.lida,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem:
        error.message ||
        'Erro ao marcar notificação como lida.',
    });
  }
};

const marcarTodasComoLidas = async (req, res) => {
  try {
    const total =
      await notificacaoService.marcarTodasComoLidas(
        req.user.id
      );

    return res.status(200).json({
      mensagem:
        'Todas as notificações foram marcadas como lidas.',
      total,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem:
        error.message ||
        'Erro ao marcar notificações como lidas.',
    });
  }
};

const limparTodas = async (req, res) => {
  try {
    const total =
      await notificacaoService.limparNotificacoes(
        req.user.id
      );

    return res.status(200).json({
      mensagem:
        'Todas as notificações foram removidas permanentemente.',
      total,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensagem:
        error.message ||
        'Erro ao limpar notificações.',
    });
  }
};

const stream = (req, res) => {
  res.status(200);
  res.setHeader(
    'Content-Type',
    'text/event-stream'
  );
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const usuarioId = req.user.id;
  const remover =
    notificacaoService.registrarClienteSse(
      usuarioId,
      res
    );

  res.write(': connected\n\n');

  const heartbeat = setInterval(() => {
    if (!res.destroyed) {
      res.write(': heartbeat\n\n');
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    remover();
  });
};

module.exports = {
  listar,
  contarNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas,
  limparTodas,
  stream,
};
