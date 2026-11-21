import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [aberta, setAberta] = useState(false);
  const [erroLimpeza, setErroLimpeza] = useState("");
  const [limpando, setLimpando] = useState(false);
  const containerRef = useRef(null);
  const {
    notificacoes,
    naoLidas,
    indisponivel,
    somAtivado,
    setSomAtivado,
    reproduzirPing,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
  } = useNotifications();

  useEffect(() => {
    const handleClickFora = (evento) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(evento.target)
      ) {
        setAberta(false);
      }
    };
    const handleEscape = (evento) => {
      if (evento.key === "Escape") {
        setAberta(false);
      }
    };

    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickFora
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const abrirNotificacao = async (notificacao) => {
    if (!notificacao.lida) {
      await marcarComoLida(notificacao._id);
    }
    setAberta(false);
    navigate("/notificacoes");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberta((valor) => !valor)}
        className="relative grid h-[42px] w-[42px] cursor-pointer place-items-center rounded-[9px] border-2 border-[#111111] bg-white text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[3px_3px_0_#111111]"
        aria-label="Abrir notificações"
        aria-expanded={aberta}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {naoLidas > 0 && (
          <span className="absolute -right-2 -top-2 min-w-[22px] rounded-full border-2 border-[#111111] bg-[#ff6b5f] px-1 text-[11px] leading-[18px] text-white">
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </button>

      {aberta && (
        <div className="absolute right-0 top-[50px] z-50 w-[min(360px,calc(100vw-32px))] rounded-[14px] border-2 border-[#111111] bg-white p-3 shadow-[6px_6px_0_#111111]">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-[#deded9] pb-2">
            <strong className="text-sm">Notificações</strong>
            <button
              type="button"
              onClick={() => {
                const novoEstado = !somAtivado;
                setSomAtivado(novoEstado);

                if (novoEstado) {
                  reproduzirPing().catch((error) => {
                    console.warn(
                      "Não foi possível reproduzir o som de prévia:",
                      error
                    );
                  });
                }
              }}
              className="text-xs text-[#686864] underline"
            >
              Som {somAtivado ? "ativado" : "desativado"}
            </button>
          </div>

          {indisponivel && (
            <div className="mb-2 rounded-lg bg-[#fff1ef] px-3 py-2 text-xs text-[#9f342c]">
              As notificações estão temporariamente indisponíveis.
            </div>
          )}

          {notificacoes.length === 0 ? (
            <p className="px-2 py-5 text-center text-sm text-[#686864]">
              Você ainda não possui notificações.
            </p>
          ) : (
            <div className="max-h-[360px] space-y-1 overflow-y-auto">
              {notificacoes.slice(0, 5).map((notificacao) => (
                <button
                  type="button"
                  key={notificacao._id}
                  onClick={() => abrirNotificacao(notificacao)}
                  className={`block w-full rounded-lg border p-3 text-left ${
                    notificacao.lida
                      ? "border-transparent bg-white"
                      : "border-[#ffd84d] bg-[#fffbea]"
                  }`}
                >
                  <strong className="block text-sm">
                    {notificacao.titulo}
                  </strong>
                  <span className="mt-1 block line-clamp-2 text-xs font-normal text-[#686864]">
                    {notificacao.mensagem}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between border-t border-[#deded9] pt-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={marcarTodasComoLidas}
                className="text-xs underline"
              >
                Marcar todas como lidas
              </button>
              <button
                type="button"
                onClick={() => {
                  setErroLimpeza("");
                  setLimpando(true);
                  limparTodas()
                    .then(() => setAberta(false))
                    .catch((error) =>
                      setErroLimpeza(error.message)
                    )
                    .finally(() => setLimpando(false));
                }}
                disabled={limpando}
                className="text-xs font-bold text-[#b9362d] underline disabled:opacity-50"
              >
                {limpando ? "Limpando..." : "Limpar"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setAberta(false);
                navigate("/notificacoes");
              }}
              className="text-xs font-bold underline"
            >
              Ver todas
            </button>
          </div>
          {erroLimpeza && (
            <p className="mt-2 text-xs text-[#b9362d]" role="alert">
              {erroLimpeza}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
