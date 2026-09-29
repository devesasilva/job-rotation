import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_API;

export default function Organizacao() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [organizacao, setOrganizacao] = useState(null);
  const [membros, setMembros] = useState([]);

  const [abaAtiva, setAbaAtiva] = useState("membros");

  const [loading, setLoading] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [errorMembros, setErrorMembros] = useState("");

  // Modal de adicionar membro
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [emailMembro, setEmailMembro] = useState("");
  const [perfilMembro, setPerfilMembro] = useState("MEMBRO");
  const [adicionandoMembro, setAdicionandoMembro] = useState(false);

  // Modal de editar membro
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState(null);
  const [perfilEditado, setPerfilEditado] = useState("");
  const [editandoMembro, setEditandoMembro] = useState(false);

  useEffect(() => {
    carregarOrganizacao();
    carregarMembros();
  }, [id]);

  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      withCredentials: true,
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    };
  };

  const carregarOrganizacao = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.get(
        `${API}/organizacoes/${id}`,
        getConfig()
      );

      setOrganizacao(response.data);
    } catch (error) {
      console.error("Erro ao carregar organização:", error);

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setErrorMsg(
        error.response?.data?.mensagem ||
          "Não foi possível carregar a organização."
      );
    } finally {
      setLoading(false);
    }
  };

  const carregarMembros = async () => {
    setLoadingMembros(true);
    setErrorMembros("");

    try {
      const response = await axios.get(
        `${API}/organizacoes/${id}/membros`,
        getConfig()
      );

      setMembros(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setErrorMembros(
        error.response?.data?.mensagem ||
          "Não foi possível carregar os membros."
      );
    } finally {
      setLoadingMembros(false);
    }
  };

  const abrirModalAdicionar = () => {
    setEmailMembro("");
    setPerfilMembro("Membro");
    setErrorMembros("");
    setModalAdicionarAberto(true);
  };

  const fecharModalAdicionar = () => {
    if (adicionandoMembro) return;

    setModalAdicionarAberto(false);
    setEmailMembro("");
    setPerfilMembro("Membro");
  };

  const handleAdicionarMembro = async (e) => {
    e.preventDefault();

    if (!emailMembro.trim()) {
      setErrorMembros("Digite o email do membro.");
      return;
    }

    setAdicionandoMembro(true);
    setErrorMembros("");

    try {
      await axios.post(
        `${API}/organizacoes/${id}/membros`,
        {
          email: emailMembro.trim(),
          perfil: perfilMembro,
        },
        getConfig()
      );

      fecharModalAdicionar();
      await carregarMembros();
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setErrorMembros(
        error.response?.data?.mensagem ||
          "Não foi possível adicionar o membro."
      );
    } finally {
      setAdicionandoMembro(false);
    }
  };

  // ============================================================
  // EDITAR MEMBRO
  // ============================================================

  const abrirModalEditar = (membro) => {
    setMembroSelecionado(membro);
    setPerfilEditado(membro.perfil || "Membro");
    setErrorMembros("");
    setModalEditarAberto(true);
  };

  const fecharModalEditar = () => {
    if (editandoMembro) return;

    setModalEditarAberto(false);
    setMembroSelecionado(null);
    setPerfilEditado("");
  };

  const handleEditarMembro = async (e) => {
    e.preventDefault();

    if (!perfilEditado) {
      setErrorMembros("Selecione um perfil.");
      return;
    }

    if (!membroSelecionado?._id) {
      setErrorMembros("Membro não encontrado.");
      return;
    }

    setEditandoMembro(true);
    setErrorMembros("");

    try {
      await axios.put(
        `${API}/organizacoes/${id}/membros/${membroSelecionado._id}`,
        {
          perfil: perfilEditado,
        },
        getConfig()
      );

      fecharModalEditar();
      await carregarMembros();
    } catch (error) {
      console.error("Erro ao editar membro:", error);

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setErrorMembros(
        error.response?.data?.mensagem ||
          "Não foi possível editar o membro."
      );
    } finally {
      setEditandoMembro(false);
    }
  };

  // ============================================================
  // REMOVER MEMBRO
  // ============================================================

  const handleRemoverMembro = async (membro) => {
    const nomeMembro =
      membro.usuario?.nome ||
      membro.nome ||
      membro.usuario?.email ||
      membro.email ||
      "este membro";

    const confirmar = window.confirm(
      `Tem certeza que deseja remover ${nomeMembro} da organização?`
    );

    if (!confirmar) return;

    setErrorMembros("");

    try {
      await axios.delete(
        `${API}/organizacoes/${id}/membros/${membro._id}`,
        getConfig()
      );

      await carregarMembros();
    } catch (error) {
      console.error("Erro ao remover membro:", error);

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setErrorMembros(
        error.response?.data?.mensagem ||
          "Não foi possível remover o membro."
      );
    }
  };

  // ============================================================
  // LOADING DA ORGANIZAÇÃO
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#111111]">
        <main className="mx-auto flex min-h-screen w-[min(1160px,calc(100%-40px))] items-center justify-center">
          <p className="font-semibold text-[#686864]">
            Carregando organização...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <header className="sticky top-0 z-30 border-b-2 border-[#111111] bg-white/95 backdrop-blur-[10px]">
        <div className="mx-auto flex h-[74px] w-[min(1160px,calc(100%-40px))] items-center justify-between">
          <button
            onClick={() => navigate("/main")}
            className="font-['Space_Grotesk',Arial,sans-serif] text-lg font-bold"
          >
            ← Voltar
          </button>

          <span className="font-['Space_Grotesk',Arial,sans-serif] text-lg font-bold">
            Job Rotation
          </span>
        </div>
      </header>

      <main className="mx-auto w-[min(1160px,calc(100%-40px))] py-14 sm:py-20">
        {errorMsg ? (
          <div className="rounded-[18px] border-2 border-[#ff6b5f] bg-[#fff1ef] p-6">
            <p className="font-semibold text-[#b9362d]">
              {errorMsg}
            </p>
          </div>
        ) : (
          <>
            {/* CABEÇALHO DA ORGANIZAÇÃO */}
            <section className="mb-10">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
                Organização
              </div>

              <h1 className="font-['Space_Grotesk',Arial,sans-serif] text-[clamp(42px,7vw,72px)] font-bold leading-[0.95] tracking-[-0.055em]">
                {organizacao?.nome}
              </h1>

              <p className="mt-5 max-w-[600px] text-[17px] leading-relaxed text-[#686864]">
                Gerencie as pessoas, funções e rodízios da sua organização.
              </p>
            </section>

            {/* ABAS */}
            <section>
              <div className="border-b-2 border-[#111111]">
                <div className="flex gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setAbaAtiva("membros")}
                    className={`min-w-[110px] px-5 py-4 text-sm font-bold transition-colors ${
                      abaAtiva === "membros"
                        ? "border-b-4 border-[#ff6b5f] text-[#111111]"
                        : "text-[#686864] hover:text-[#111111]"
                    }`}
                  >
                    Membros
                  </button>

                  <button
                    type="button"
                    onClick={() => setAbaAtiva("funcoes")}
                    className={`min-w-[110px] px-5 py-4 text-sm font-bold transition-colors ${
                      abaAtiva === "funcoes"
                        ? "border-b-4 border-[#b7dc58] text-[#111111]"
                        : "text-[#686864] hover:text-[#111111]"
                    }`}
                  >
                    Funções
                  </button>

                  <button
                    type="button"
                    onClick={() => setAbaAtiva("rodizios")}
                    className={`min-w-[110px] px-5 py-4 text-sm font-bold transition-colors ${
                      abaAtiva === "rodizios"
                        ? "border-b-4 border-[#8eb9ff] text-[#111111]"
                        : "text-[#686864] hover:text-[#111111]"
                    }`}
                  >
                    Rodízios
                  </button>
                </div>
              </div>

              {/* CONTEÚDO DAS ABAS */}
              <div className="pt-8">
                {/* =====================================================
                    MEMBROS
                ====================================================== */}
                {abaAtiva === "membros" && (
                  <section>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-3xl font-bold tracking-[-0.04em]">
                          Membros
                        </h2>

                        <p className="mt-2 text-sm text-[#686864]">
                          Pessoas que fazem parte desta organização.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={abrirModalAdicionar}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
                      >
                        + Adicionar membro
                      </button>
                    </div>

                    {errorMembros && (
                      <div className="mb-5 rounded-[12px] border-2 border-[#ff6b5f] bg-[#fff1ef] px-4 py-3 text-sm font-medium text-[#b9362d]">
                        {errorMembros}
                      </div>
                    )}

                    {loadingMembros ? (
                      <div className="rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4] p-8 text-center">
                        <p className="font-semibold text-[#686864]">
                          Carregando membros...
                        </p>
                      </div>
                    ) : membros.length === 0 ? (
                      <div className="rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4] p-8 sm:p-10">
                        <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#111111] bg-[#b7dc58] text-xl font-bold">
                          +
                        </div>

                        <h3 className="mt-5 font-['Space_Grotesk',Arial,sans-serif] text-2xl font-bold tracking-[-0.04em]">
                          Nenhum membro
                        </h3>

                        <p className="mt-2 max-w-[500px] text-sm leading-relaxed text-[#686864]">
                          Ainda não há membros cadastrados nesta organização.
                        </p>

                        <button
                          type="button"
                          onClick={abrirModalAdicionar}
                          className="mt-6 min-h-11 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
                        >
                          + Adicionar membro
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-[18px] border-2 border-[#111111]">
                        {/* CABEÇALHO DA LISTA */}
                        <div className="hidden grid-cols-[1fr_180px_180px] border-b-2 border-[#111111] bg-[#f8f7f4] px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] sm:grid">
                          <span>Membro</span>
                          <span>Perfil</span>
                          <span>Ações</span>
                        </div>

                        {/* MEMBROS */}
                        {membros.map((membro) => (
                          <div
                            key={membro._id}
                            className="grid gap-4 border-b border-[#deded9] px-5 py-5 last:border-b-0 sm:grid-cols-[1fr_180px_180px] sm:items-center"
                          >
                            <div>
                              <p className="font-bold">
                                {membro.usuario?.nome ||
                                  membro.nome ||
                                  "Usuário"}
                              </p>

                              <p className="mt-1 text-sm text-[#686864]">
                                {membro.usuario?.email ||
                                  membro.email ||
                                  "Email não informado"}
                              </p>
                            </div>

                            <div>
                              <span className="inline-flex rounded-full border border-[#111111] bg-[#f8f7f4] px-3 py-1 text-xs font-bold">
                                {membro.perfil || "Membro"}
                              </span>
                            </div>

                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={() => abrirModalEditar(membro)}
                                className="text-sm font-bold underline underline-offset-4 hover:no-underline"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoverMembro(membro)
                                }
                                className="text-sm font-bold text-[#b9362d] underline underline-offset-4 hover:no-underline"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* =====================================================
                    FUNÇÕES
                ====================================================== */}
                {abaAtiva === "funcoes" && (
                  <section>
                    <div className="mb-6">
                      <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-3xl font-bold tracking-[-0.04em]">
                        Funções
                      </h2>

                      <p className="mt-2 text-sm text-[#686864]">
                        Funções disponíveis dentro da organização.
                      </p>
                    </div>

                    <div className="rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4] p-8 sm:p-10">
                      <h3 className="font-['Space_Grotesk',Arial,sans-serif] text-2xl font-bold">
                        Funções
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-[#686864]">
                        O gerenciamento de funções será exibido aqui.
                      </p>
                    </div>
                  </section>
                )}

                {/* =====================================================
                    RODÍZIOS
                ====================================================== */}
                {abaAtiva === "rodizios" && (
                  <section>
                    <div className="mb-6">
                      <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-3xl font-bold tracking-[-0.04em]">
                        Rodízios
                      </h2>

                      <p className="mt-2 text-sm text-[#686864]">
                        Rodízios cadastrados nesta organização.
                      </p>
                    </div>

                    <div className="rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4] p-8 sm:p-10">
                      <h3 className="font-['Space_Grotesk',Arial,sans-serif] text-2xl font-bold">
                        Rodízios
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-[#686864]">
                        O gerenciamento de rodízios será exibido aqui.
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ============================================================
          MODAL — ADICIONAR MEMBRO
      ============================================================ */}
      {modalAdicionarAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 px-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              fecharModalAdicionar();
            }
          }}
        >
          <div className="w-full max-w-[500px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#b7dc58]" />
                Novo membro
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Adicione um
                <br />
                membro.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                Informe o email do usuário que deseja adicionar à
                organização.
              </p>
            </div>

            <form onSubmit={handleAdicionarMembro}>
              <label
                htmlFor="email-membro"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Email
              </label>

              <input
                id="email-membro"
                type="email"
                value={emailMembro}
                onChange={(e) => {
                  setEmailMembro(e.target.value);
                  setErrorMembros("");
                }}
                placeholder="Ex.: usuario@email.com"
                autoFocus
                className="w-full border-0 border-b-2 border-[#deded9] bg-transparent px-0 py-3 text-[15px] text-[#111111] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#111111]"
              />

              <label
                htmlFor="perfil-membro"
                className="mb-2 mt-6 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Perfil
              </label>

              <select
                id="perfil-membro"
                value={perfilMembro}
                onChange={(e) => setPerfilMembro(e.target.value)}
                className="w-full rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none"
              >
                <option value="Membro">Membro</option>
                <option value="Moderador">Moderador</option>
                <option value="Administrador">Administrador</option>
              </select>

              {errorMembros && (
                <div className="mt-4 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                  {errorMembros}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModalAdicionar}
                  disabled={adicionandoMembro}
                  className="min-h-12 rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={adicionandoMembro}
                  className="min-h-12 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adicionandoMembro
                    ? "Adicionando..."
                    : "Adicionar membro →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL — EDITAR MEMBRO
      ============================================================ */}
      {modalEditarAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 px-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              fecharModalEditar();
            }
          }}
        >
          <div className="w-full max-w-[500px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffd84d]" />
                Editar membro
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Edite o
                <br />
                perfil.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                Escolha o novo perfil para este membro.
              </p>
            </div>

            <form onSubmit={handleEditarMembro}>
              <label
                htmlFor="perfil-editado"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Perfil
              </label>

              <select
                id="perfil-editado"
                value={perfilEditado}
                onChange={(e) => {
                  setPerfilEditado(e.target.value);
                  setErrorMembros("");
                }}
                className="w-full rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none"
              >
                <option value="Membro">Membro</option>
                <option value="Moderador">Moderador</option>
                <option value="Administrador">Administrador</option>

              </select>

              {errorMembros && (
                <div className="mt-4 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                  {errorMembros}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModalEditar}
                  disabled={editandoMembro}
                  className="min-h-12 rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={editandoMembro}
                  className="min-h-12 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editandoMembro
                    ? "Salvando..."
                    : "Salvar alterações →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}