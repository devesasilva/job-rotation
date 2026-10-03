import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_API;

export default function Organizacao() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [organizacao, setOrganizacao] = useState(null);
  const [membros, setMembros] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [usuario, setUsuario] = useState(null);

  const [abaAtiva, setAbaAtiva] = useState("membros");

  const [loading, setLoading] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [loadingFuncoes, setLoadingFuncoes] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [errorMembros, setErrorMembros] = useState("");
  const [errorFuncoes, setErrorFuncoes] = useState("");

  // Logout
  const [saindo, setSaindo] = useState(false);

  // Modal de adicionar membro
  const [modalAdicionarAberto, setModalAdicionarAberto] =
    useState(false);
  const [emailMembro, setEmailMembro] = useState("");
  const [perfilMembro, setPerfilMembro] = useState("Membro");
  const [adicionandoMembro, setAdicionandoMembro] = useState(false);

  // Modal de editar membro
  const [modalEditarAberto, setModalEditarAberto] =
    useState(false);
  const [membroSelecionado, setMembroSelecionado] =
    useState(null);
  const [perfilEditado, setPerfilEditado] = useState("");
  const [editandoMembro, setEditandoMembro] = useState(false);

  // Modal de adicionar função
  const [modalAdicionarFuncaoAberto, setModalAdicionarFuncaoAberto] =
    useState(false);
  const [nomeFuncao, setNomeFuncao] = useState("");
  const [descricaoFuncao, setDescricaoFuncao] = useState("");
  const [adicionandoFuncao, setAdicionandoFuncao] = useState(false);

  useEffect(() => {
    carregarOrganizacao();
    carregarMembros();
    carregarFuncoes();
    carregarUsuario();
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

  // ============================================================
  // USUÁRIO
  // ============================================================

  const carregarUsuario = async () => {
    try {
      const response = await axios.get(
        `${API}/auth/me`,
        getConfig()
      );

      setUsuario(response.data);
    } catch (error) {
      console.error(
        "Erro ao carregar usuário:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  /*
   * Iniciais do usuário
   */
  const obterIniciais = (nome = "") => {
    const partes = nome
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length === 0) {
      return "?";
    }

    if (partes.length === 1) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      partes[0][0] +
      partes[partes.length - 1][0]
    ).toUpperCase();
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    if (saindo) {
      return;
    }

    setSaindo(true);

    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          `${API}/auth/logout`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error(
        "Erro ao realizar logout:",
        error
      );
    } finally {
      localStorage.removeItem("token");

      setUsuario(null);
      setSaindo(false);

      navigate("/login");
    }
  };

  // ============================================================
  // ORGANIZAÇÃO
  // ============================================================

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
      console.error(
        "Erro ao carregar organização:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
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

  // ============================================================
  // MEMBROS
  // ============================================================

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
      console.error(
        "Erro ao carregar membros:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
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

  // ============================================================
  // FUNÇÕES
  // ============================================================

  const carregarFuncoes = async () => {
    setLoadingFuncoes(true);
    setErrorFuncoes("");

    try {
      const response = await axios.get(
        `${API}/organizacoes/${id}/funcoes`,
        getConfig()
      );

      setFuncoes(response.data || []);
    } catch (error) {
      console.error(
        "Erro ao carregar funções:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorFuncoes(
        error.response?.data?.mensagem ||
          "Não foi possível carregar as funções."
      );
    } finally {
      setLoadingFuncoes(false);
    }
  };

  // ============================================================
  // ADICIONAR FUNÇÃO
  // ============================================================

  const abrirModalAdicionarFuncao = () => {
    setNomeFuncao("");
    setDescricaoFuncao("");
    setErrorFuncoes("");
    setModalAdicionarFuncaoAberto(true);
  };

  const fecharModalAdicionarFuncao = () => {
    if (adicionandoFuncao) {
      return;
    }

    setModalAdicionarFuncaoAberto(false);
    setNomeFuncao("");
    setDescricaoFuncao("");
  };

  const handleAdicionarFuncao = async (e) => {
    e.preventDefault();

    if (!nomeFuncao.trim()) {
      setErrorFuncoes(
        "O nome da função é obrigatório."
      );
      return;
    }

    setAdicionandoFuncao(true);
    setErrorFuncoes("");

    try {
      await axios.post(
        `${API}/organizacoes/${id}/funcoes`,
        {
          nome: nomeFuncao.trim(),
          descricao: descricaoFuncao.trim() || undefined,
        },
        getConfig()
      );

      fecharModalAdicionarFuncao();
      await carregarFuncoes();
    } catch (error) {
      console.error(
        "Erro ao adicionar função:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorFuncoes(
        error.response?.data?.mensagem ||
          "Não foi possível cadastrar a função."
      );
    } finally {
      setAdicionandoFuncao(false);
    }
  };

  // ============================================================
  // ADICIONAR MEMBRO
  // ============================================================

  const abrirModalAdicionar = () => {
    setEmailMembro("");
    setPerfilMembro("Membro");
    setErrorMembros("");
    setModalAdicionarAberto(true);
  };

  const fecharModalAdicionar = () => {
    if (adicionandoMembro) {
      return;
    }

    setModalAdicionarAberto(false);
    setEmailMembro("");
    setPerfilMembro("Membro");
  };

  const handleAdicionarMembro = async (e) => {
    e.preventDefault();

    if (!emailMembro.trim()) {
      setErrorMembros(
        "Digite o email do membro."
      );
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
      console.error(
        "Erro ao adicionar membro:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
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
    setPerfilEditado(
      membro.perfil || "Membro"
    );
    setErrorMembros("");
    setModalEditarAberto(true);
  };

  const fecharModalEditar = () => {
    if (editandoMembro) {
      return;
    }

    setModalEditarAberto(false);
    setMembroSelecionado(null);
    setPerfilEditado("");
  };

  const handleEditarMembro = async (e) => {
    e.preventDefault();

    if (!perfilEditado) {
      setErrorMembros(
        "Selecione um perfil."
      );
      return;
    }

    if (!membroSelecionado?._id) {
      setErrorMembros(
        "Membro não encontrado."
      );
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
      console.error(
        "Erro ao editar membro:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
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

    if (!confirmar) {
      return;
    }

    setErrorMembros("");

    try {
      await axios.delete(
        `${API}/organizacoes/${id}/membros/${membro._id}`,
        getConfig()
      );

      await carregarMembros();
    } catch (error) {
      console.error(
        "Erro ao remover membro:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
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
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#111111]">
        {/* NAVBAR */}
        <header className="sticky top-0 z-30 border-b-2 border-[#111111] bg-white/95 backdrop-blur-[10px]">
          <div className="mx-auto flex h-[74px] w-[min(1160px,calc(100%-40px))] items-center justify-between gap-5">

            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate("/main")}
              className="flex cursor-pointer items-center gap-[10px] border-0 bg-transparent p-0 font-['Space_Grotesk',Arial,sans-serif] text-[18px] font-bold tracking-[-0.04em] text-[#111111]"
            >
              <span className="relative grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-lg border-2 border-[#111111] before:absolute before:left-[5px] before:top-[5px] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#ff6b5f] after:absolute after:bottom-[5px] after:right-[5px] after:h-[7px] after:w-[7px] after:rounded-full after:bg-[#b7dc58]" />

              <span>
                Job Rotation
              </span>
            </button>

            {/* Usuário */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-[#111111]">
                  {usuario?.nome || "Usuário"}
                </p>

                <p className="text-[11px] text-[#686864]">
                  Minha conta
                </p>
              </div>

              <div
                className="grid h-[42px] w-[42px] place-items-center rounded-full border-2 border-[#111111] bg-[#ffd84d] font-['Space_Grotesk',Arial,sans-serif] text-sm font-bold"
                title={
                  usuario?.nome || "Usuário"
                }
              >
                {obterIniciais(
                  usuario?.nome
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={saindo}
                title="Sair"
                className="flex h-[42px] cursor-pointer items-center gap-2 rounded-[9px] bg-white px-3 font-bold text-[#b9362d] transition-all duration-200 hover:-translate-y-1 hover:bg-[#fff1ef] hover:shadow-[3px_3px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>

                <span className="hidden sm:inline">
                  {saindo
                    ? "Saindo..."
                    : "Sair"}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-74px)] w-[min(1160px,calc(100%-40px))] items-center justify-center">
          <p className="font-semibold text-[#686864]">
            Carregando organização...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111111]">

      {/* ============================================================
          NAVBAR
      ============================================================ */}
      <header className="sticky top-0 z-30 border-b-2 border-[#111111] bg-white/95 backdrop-blur-[10px]">
        <div className="mx-auto flex h-[74px] w-[min(1160px,calc(100%-40px))] items-center justify-between gap-5">

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/main")}
            className="flex cursor-pointer items-center gap-[10px] border-0 bg-transparent p-0 font-['Space_Grotesk',Arial,sans-serif] text-[18px] font-bold tracking-[-0.04em] text-[#111111]"
          >
            <span className="relative grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-lg border-2 border-[#111111] before:absolute before:left-[5px] before:top-[5px] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#ff6b5f] after:absolute after:bottom-[5px] after:right-[5px] after:h-[7px] after:w-[7px] after:rounded-full after:bg-[#b7dc58]" />

            <span>
              Job Rotation
            </span>
          </button>

          {/* Usuário + Logout */}
          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[#111111]">
                {usuario?.nome || "Usuário"}
              </p>

              <p className="text-[11px] text-[#686864]">
                Minha conta
              </p>
            </div>

            {/* Avatar */}
            <div
              className="grid h-[42px] w-[42px] place-items-center rounded-full border-2 border-[#111111] bg-[#ffd84d] font-['Space_Grotesk',Arial,sans-serif] text-sm font-bold"
              title={
                usuario?.nome || "Usuário"
              }
            >
              {obterIniciais(
                usuario?.nome
              )}
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={saindo}
              title="Sair"
              className="flex h-[42px] cursor-pointer items-center gap-2 rounded-[9px] bg-white px-3 font-bold text-[#b9362d] transition-all duration-200 hover:-translate-y-1 hover:bg-[#fff1ef] hover:shadow-[3px_3px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>

              <span className="hidden sm:inline">
                {saindo
                  ? "Saindo..."
                  : "Sair"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          CONTEÚDO
      ============================================================ */}
      <main className="mx-auto w-[min(1160px,calc(100%-40px))] py-10 sm:py-14">

        {/* VOLTAR */}
        <button
          type="button"
          onClick={() => navigate("/main")}
          className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-[9px] border-2 border-[#111111] bg-white px-3 py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-1 hover:shadow-[3px_3px_0_#111111]"
          aria-label="Voltar para minhas organizações"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>

          <span>Voltar</span>
        </button>

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
                    className={`min-w-[110px] cursor-pointer px-5 py-4 text-sm font-bold transition-colors ${
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
                    className={`min-w-[110px] cursor-pointer px-5 py-4 text-sm font-bold transition-colors ${
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
                    className={`min-w-[110px] cursor-pointer px-5 py-4 text-sm font-bold transition-colors ${
                      abaAtiva === "rodizios"
                        ? "border-b-4 border-[#8eb9ff] text-[#111111]"
                        : "text-[#686864] hover:text-[#111111]"
                    }`}
                  >
                    Rodízios
                  </button>

                </div>
              </div>

              {/* CONTEÚDO */}
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
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
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
                          className="mt-6 min-h-11 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
                        >
                          + Adicionar membro
                        </button>

                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-[18px] border-2 border-[#111111]">

                        {/* CABEÇALHO */}
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
                                {membro.perfil ||
                                  "Membro"}
                              </span>
                            </div>

                            <div className="flex gap-4">

                              <button
                                type="button"
                                onClick={() =>
                                  abrirModalEditar(
                                    membro
                                  )
                                }
                                className="cursor-pointer text-sm font-bold underline underline-offset-4 hover:no-underline"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoverMembro(
                                    membro
                                  )
                                }
                                className="cursor-pointer text-sm font-bold text-[#b9362d] underline underline-offset-4 hover:no-underline"
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

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-3xl font-bold tracking-[-0.04em]">
                          Funções
                        </h2>

                        <p className="mt-2 text-sm text-[#686864]">
                          Funções disponíveis dentro da organização.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={abrirModalAdicionarFuncao}
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
                      >
                        + Adicionar função
                      </button>
                    </div>

                    {errorFuncoes && (
                      <div className="mb-5 rounded-[12px] border-2 border-[#ff6b5f] bg-[#fff1ef] px-4 py-3 text-sm font-medium text-[#b9362d]">
                        {errorFuncoes}
                      </div>
                    )}

                    {loadingFuncoes ? (
                      <div className="rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4] p-8 text-center">
                        <p className="font-semibold text-[#686864]">
                          Carregando funções...
                        </p>
                      </div>
                    ) : funcoes.length === 0 ? (
                      <div className="rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4] p-8 sm:p-10">

                        <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#111111] bg-[#b7dc58] text-xl font-bold">
                          +
                        </div>

                        <h3 className="mt-5 font-['Space_Grotesk',Arial,sans-serif] text-2xl font-bold tracking-[-0.04em]">
                          Nenhuma função
                        </h3>

                        <p className="mt-2 max-w-[500px] text-sm leading-relaxed text-[#686864]">
                          Ainda não há funções cadastradas nesta organização.
                        </p>

                        <button
                          type="button"
                          onClick={abrirModalAdicionarFuncao}
                          className="mt-6 min-h-11 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
                        >
                          + Adicionar função
                        </button>

                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-[18px] border-2 border-[#111111]">

                        {/* CABEÇALHO */}
                        <div className="hidden grid-cols-[1fr_2fr] border-b-2 border-[#111111] bg-[#f8f7f4] px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] sm:grid">
                          <span>Função</span>
                          <span>Descrição</span>
                        </div>

                        {/* FUNÇÕES */}
                        {funcoes.map((funcao) => (
                          <div
                            key={funcao._id}
                            className="grid gap-4 border-b border-[#deded9] px-5 py-5 last:border-b-0 sm:grid-cols-[1fr_2fr] sm:items-center"
                          >

                            <div>
                              <p className="font-bold">
                                {funcao.nome}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm leading-relaxed text-[#686864]">
                                {funcao.descricao ||
                                  "Nenhuma descrição informada."}
                              </p>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}

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
                Informe o email do usuário que deseja adicionar à organização.
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
                onChange={(e) =>
                  setPerfilMembro(e.target.value)
                }
                className="w-full cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none"
              >
                <option value="Membro">
                  Membro
                </option>

                <option value="Moderador">
                  Moderador
                </option>

                <option value="Administrador">
                  Administrador
                </option>
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
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={adicionandoMembro}
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
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
                  setPerfilEditado(
                    e.target.value
                  );
                  setErrorMembros("");
                }}
                className="w-full cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none"
              >
                <option value="Membro">
                  Membro
                </option>

                <option value="Moderador">
                  Moderador
                </option>

                <option value="Administrador">
                  Administrador
                </option>
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
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={editandoMembro}
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* ============================================================
          MODAL — ADICIONAR FUNÇÃO
      ============================================================ */}
      {modalAdicionarFuncaoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 px-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              fecharModalAdicionarFuncao();
            }
          }}
        >
          <div className="w-full max-w-[500px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">

            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#b7dc58]" />
                Nova função
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Adicione uma
                <br />
                função.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                Cadastre uma nova função para esta organização.
              </p>
            </div>

            <form onSubmit={handleAdicionarFuncao}>

              <label
                htmlFor="nome-funcao"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Nome
              </label>

              <input
                id="nome-funcao"
                type="text"
                value={nomeFuncao}
                onChange={(e) => {
                  setNomeFuncao(e.target.value);
                  setErrorFuncoes("");
                }}
                placeholder="Ex.: Desenvolvedor Backend"
                autoFocus
                className="w-full border-0 border-b-2 border-[#deded9] bg-transparent px-0 py-3 text-[15px] text-[#111111] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#111111]"
              />

              <label
                htmlFor="descricao-funcao"
                className="mb-2 mt-6 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Descrição
              </label>

              <textarea
                id="descricao-funcao"
                value={descricaoFuncao}
                onChange={(e) => {
                  setDescricaoFuncao(e.target.value);
                  setErrorFuncoes("");
                }}
                placeholder="Ex.: Responsável pelo desenvolvimento das APIs."
                rows={4}
                className="w-full resize-none rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none"
              />

              {errorFuncoes && (
                <div className="mt-4 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                  {errorFuncoes}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={fecharModalAdicionarFuncao}
                  disabled={adicionandoFuncao}
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={adicionandoFuncao}
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adicionandoFuncao
                    ? "Adicionando..."
                    : "Adicionar função →"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}