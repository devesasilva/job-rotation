import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  criarStreamNotificacoes,
  listarNotificacoes,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  limparTodasNotificacoes,
} from "../services/notificacaoService";
import somNotificacaoUrl from "../assets/drop_notification.mp3";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [indisponivel, setIndisponivel] = useState(false);
  const [toasts, setToasts] = useState([]);
  const streamRef = useRef(null);
  const reconexaoRef = useRef(null);
  const eventosConhecidosRef = useRef(new Set());
  const historicoInicializadoRef = useRef(false);
  const notificacoesConhecidasRef = useRef(new Set());
  const [somAtivado, setSomAtivadoState] = useState(
    localStorage.getItem("notificationSoundEnabled") === "true"
  );

  const reproduzirPing = useCallback(() => {
    const audio = new Audio(somNotificacaoUrl);
    audio.volume = 0.7;
    return audio.play();
  }, []);

  const tocarPing = useCallback(() => {
    if (!somAtivado) {
      return;
    }

    reproduzirPing().catch((error) => {
      console.warn(
        "Não foi possível reproduzir o som da notificação:",
        error
      );
    });
  }, [somAtivado, reproduzirPing]);

  const setSomAtivado = useCallback((ativado) => {
    setSomAtivadoState(ativado);
    localStorage.setItem(
      "notificationSoundEnabled",
      String(ativado)
    );
  }, []);

  const removerToast = useCallback((id) => {
    setToasts((atuais) =>
      atuais.filter((toast) => toast.id !== id)
    );
  }, []);

  const atualizar = useCallback(async (pagina = 1) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setNotificacoes([]);
      setNaoLidas(0);
      return;
    }

    try {
      const dados = await listarNotificacoes(
        pagina,
        20,
        false
      );

      const itens = dados.itens || [];
      const novas = itens.filter(
        (item) =>
          !item.lida &&
          !notificacoesConhecidasRef.current.has(item._id)
      );

      if (!historicoInicializadoRef.current) {
        itens.forEach((item) =>
          notificacoesConhecidasRef.current.add(item._id)
        );
        historicoInicializadoRef.current = true;
      } else {
        novas.forEach((item) =>
          notificacoesConhecidasRef.current.add(item._id)
        );

        novas.forEach((nova) => {
          const id = `${nova._id}-${Date.now()}`;
          setToasts((atuais) => [
            ...atuais,
            { id, notificacao: nova },
          ]);
          tocarPing();
          setTimeout(() => removerToast(id), 5000);
        });
      }

      setNotificacoes(itens);
      setNaoLidas(dados.naoLidas || 0);
      setIndisponivel(false);
      return dados;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }

      setIndisponivel(true);
      return null;
    }
  }, [removerToast, tocarPing]);

  const marcarComoLida = useCallback(async (id) => {
    let eraNaoLida = false;

    setNotificacoes((atuais) =>
      atuais.map((notificacao) =>
        notificacao._id === id
          ? (() => {
              eraNaoLida = !notificacao.lida;
              return { ...notificacao, lida: true };
            })()
          : notificacao
      )
    );

    if (eraNaoLida) {
      setNaoLidas((total) => Math.max(0, total - 1));
    }

    try {
      await marcarNotificacaoComoLida(id);
      await atualizar();
    } catch {
      await atualizar();
    }
  }, [atualizar]);

  const marcarTodasComoLidas = useCallback(async () => {
    setNotificacoes((atuais) =>
      atuais.map((notificacao) => ({
        ...notificacao,
        lida: true,
      }))
    );
    setNaoLidas(0);

    try {
      await marcarTodasNotificacoesComoLidas();
      await atualizar();
    } catch {
      await atualizar();
    }
  }, [atualizar]);

  const limparTodas = useCallback(async () => {
    try {
      await limparTodasNotificacoes();
      setNotificacoes([]);
      setNaoLidas(0);
      notificacoesConhecidasRef.current.clear();
      await atualizar();
      return true;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensagem ||
          "Não foi possível limpar as notificações."
      );
    }
  }, [atualizar]);

  useEffect(() => {
    let tokenAtual = null;
    let polling = null;

    const fecharStream = () => {
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
      }
    };

    const abrirStream = () => {
      fecharStream();
      const stream = criarStreamNotificacoes();

      if (!stream) {
        setIndisponivel(true);
        return;
      }

      streamRef.current = stream;

      stream.addEventListener("open", () => {
        setIndisponivel(false);
        if (reconexaoRef.current) {
          clearTimeout(reconexaoRef.current);
        }
      });

      stream.addEventListener("notificacao", (evento) => {
        let dados;

        try {
          dados = JSON.parse(evento.data);
        } catch {
          return;
        }

        if (
          dados.eventId &&
          eventosConhecidosRef.current.has(dados.eventId)
        ) {
          return;
        }

        if (dados.eventId) {
          eventosConhecidosRef.current.add(dados.eventId);
        }
        atualizar();
      });

      stream.addEventListener("error", () => {
        setIndisponivel(true);
        stream.close();

        reconexaoRef.current = setTimeout(
          abrirStream,
          30000
        );
      });
    };

    const sincronizarSessao = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (tokenAtual !== null) {
          fecharStream();
          if (reconexaoRef.current) {
            clearTimeout(reconexaoRef.current);
          }
          setNotificacoes([]);
          setNaoLidas(0);
        }

        tokenAtual = null;
        historicoInicializadoRef.current = false;
        notificacoesConhecidasRef.current.clear();
        eventosConhecidosRef.current.clear();
        return;
      }

      if (tokenAtual === token && streamRef.current) {
        return;
      }

      tokenAtual = token;
      setIndisponivel(false);
      atualizar();
      abrirStream();
    };

    sincronizarSessao();

    const verificacaoSessao = setInterval(
      sincronizarSessao,
      1000
    );
    polling = setInterval(() => {
      if (localStorage.getItem("token")) {
        atualizar();
      }
    }, 30000);

    return () => {
      clearInterval(verificacaoSessao);
      if (polling) {
        clearInterval(polling);
      }
      if (reconexaoRef.current) {
        clearTimeout(reconexaoRef.current);
      }
      fecharStream();
    };
  }, [
    atualizar,
    removerToast,
    tocarPing,
  ]);

  const valor = {
    notificacoes,
    naoLidas,
    indisponivel,
    toasts,
    somAtivado,
    setSomAtivado,
    reproduzirPing,
    atualizar,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
  };

  return (
    <NotificationContext.Provider value={valor}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const contexto = useContext(NotificationContext);

  if (!contexto) {
    throw new Error(
      "useNotifications deve ser usado dentro de NotificationProvider"
    );
  }

  return contexto;
}
