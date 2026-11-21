import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { useNotifications } from "../contexts/NotificationContext";
import { listarNotificacoes } from "../services/notificacaoService";

export default function Notificacoes() {
  const navigate = useNavigate();
  const {
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
    indisponivel,
  } = useNotifications();
  const [itens, setItens] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtro, setFiltro] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [limpandoTodas, setLimpandoTodas] = useState(false);

  const carregar = async (paginaAtual = pagina) => {
    setCarregando(true);
    setErro("");

    try {
      const dados = await listarNotificacoes(
        paginaAtual,
        20,
        filtro === "nao-lidas"
      );
      setItens(dados.itens || []);
      setPagina(dados.pagina || 1);
      setTotalPaginas(dados.totalPaginas || 1);
    } catch {
      setErro(
        "Não foi possível carregar as notificações agora."
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar(1);
  }, [filtro]);

  const marcarIndividual = async (notificacao) => {
    await marcarComoLida(notificacao._id);
    await carregar(pagina);
  };

  const marcarTodas = async () => {
    await marcarTodasComoLidas();
    await carregar(pagina);
  };

  const limparTodasPermanentemente = async () => {
    setErro("");
    setLimpandoTodas(true);

    try {
      await limparTodas();
      setPagina(1);
      await carregar(1);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível limpar as notificações."
      );
    } finally {
      setLimpandoTodas(false);
    }
  };

  const mudarPagina = async (novaPagina) => {
    if (novaPagina < 1) {
      return;
    }

    if (novaPagina > totalPaginas) {
      return;
    }

    await carregar(novaPagina);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#111111]">
      <header className="sticky top-0 z-30 border-b-2 border-[#111111] bg-white/95">
        <div className="mx-auto flex h-[74px] w-[min(1160px,calc(100%-40px))] items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/main")}
            className="flex items-center gap-2 border-0 bg-transparent text-lg font-bold"
          >
            <span className="grid h-[30px] w-[30px] place-items-center rounded-lg border-2 border-[#111111]" />
            Job Rotation
          </button>
          <NotificationBell />
        </div>
      </header>

      <main className="mx-auto w-[min(1160px,calc(100%-40px))] py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-2 text-sm underline"
            >
              Voltar
            </button>
            <h1 className="text-3xl font-bold">Notificações</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={marcarTodas}
              className="rounded-[9px] border-2 border-[#111111] bg-[#ffd84d] px-4 py-2"
            >
              Marcar todas como lidas
            </button>
            <button
              type="button"
              onClick={limparTodasPermanentemente}
              disabled={limpandoTodas}
              className="rounded-[9px] border-2 border-[#111111] bg-[#ffb6ae] px-4 py-2 text-[#7f271f] disabled:opacity-50"
            >
              {limpandoTodas ? "Limpando..." : "Limpar todas"}
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setFiltro("todas")}
            className={`rounded-lg border-2 px-4 py-2 ${
              filtro === "todas"
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#deded9] bg-white"
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFiltro("nao-lidas")}
            className={`rounded-lg border-2 px-4 py-2 ${
              filtro === "nao-lidas"
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#deded9] bg-white"
            }`}
          >
            Não lidas
          </button>
        </div>

        {indisponivel && (
          <div className="mb-4 rounded-lg border border-[#d8b5b0] bg-[#fff1ef] px-4 py-3 text-sm">
            As notificações estão temporariamente indisponíveis.
          </div>
        )}

        {carregando ? (
          <p className="py-10 text-center text-[#686864]">
            Carregando notificações...
          </p>
        ) : erro ? (
          <div className="rounded-xl border-2 border-[#111111] bg-white p-6 text-center">
            <p>{erro}</p>
            <button
              type="button"
              onClick={() => carregar(pagina)}
              className="mt-3 underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : itens.length === 0 ? (
          <div className="rounded-xl border-2 border-[#111111] bg-white p-10 text-center">
            <p className="font-semibold">
              Nenhuma notificação encontrada.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {itens.map((notificacao) => (
              <article
                key={notificacao._id}
                className={`rounded-xl border-2 p-5 ${
                  notificacao.lida
                    ? "border-[#deded9] bg-white"
                    : "border-[#111111] bg-[#fffbea]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">
                      {notificacao.titulo}
                    </h2>
                    <p className="mt-1 text-sm font-normal text-[#686864]">
                      {notificacao.mensagem}
                    </p>
                    <p className="mt-2 text-xs text-[#686864]">
                      {new Date(
                        notificacao.createdAt
                      ).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!notificacao.lida && (
                      <button
                        type="button"
                        onClick={() =>
                          marcarIndividual(notificacao)
                        }
                        className="rounded-lg border-2 border-[#111111] bg-white px-3 py-2 text-sm"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {itens.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => mudarPagina(pagina - 1)}
              disabled={pagina <= 1}
              className="rounded-lg border-2 border-[#111111] px-3 py-2 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => mudarPagina(pagina + 1)}
              disabled={pagina >= totalPaginas}
              className="rounded-lg border-2 border-[#111111] px-3 py-2 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
