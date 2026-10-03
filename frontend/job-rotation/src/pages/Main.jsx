import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_API;

export default function Main() {
  const navigate = useNavigate();

  const [organizacoes, setOrganizacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de criação/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeOrganizacao, setNomeOrganizacao] = useState("");
  const [organizacaoParaEditar, setOrganizacaoParaEditar] =
    useState(null);

  const [criando, setCriando] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [menuAberto, setMenuAberto] = useState(null);
  const [usuario, setUsuario] = useState(null);

  // Exclusão de organização
  const [organizacaoParaExcluir, setOrganizacaoParaExcluir] =
    useState(null);

  const [excluindo, setExcluindo] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Logout
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");

      const config = {
        withCredentials: true,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      };

      const organizacoesResponse = await axios.get(
        `${API}/organizacoes/me`,
        config
      );

      setOrganizacoes(organizacoesResponse.data || []);

      const usuarioResponse = await axios.get(
        `${API}/auth/me`,
        config
      );

      setUsuario(usuarioResponse.data);
    } catch (error) {
      console.error(
        "Erro ao carregar a Main:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorMsg(
        error.response?.data?.mensagem ||
          "Não foi possível carregar seus dados."
      );
    } finally {
      setLoading(false);
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

  /*
   * Logout
   */
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
      /*
       * Mesmo se o servidor apresentar algum erro,
       * removemos o token localmente para encerrar
       * a sessão no navegador.
       */
      localStorage.removeItem("token");

      setUsuario(null);
      setSaindo(false);

      navigate("/login");
    }
  };

  /*
   * Abre o modal para criar uma organização
   */
  const abrirModalCriacao = () => {
    setOrganizacaoParaEditar(null);
    setNomeOrganizacao("");
    setErrorMsg("");
    setModalAberto(true);
  };

  /*
   * Criar organização
   */
  const handleCriarOrganizacao = async (e) => {
    e.preventDefault();

    if (!nomeOrganizacao.trim()) {
      setErrorMsg(
        "Digite o nome da organização."
      );
      return;
    }

    setCriando(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API}/organizacoes/criar`,
        {
          nome: nomeOrganizacao.trim(),
        },
        {
          withCredentials: true,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const novaOrganizacao =
        response.data.organizacao;

      if (novaOrganizacao?._id) {
        navigate(
          `/organizacao/${novaOrganizacao._id}`
        );
        return;
      }

      await carregarDados();

      setModalAberto(false);
      setNomeOrganizacao("");
    } catch (error) {
      console.error(
        "Erro ao criar organização:",
        error
      );

      setErrorMsg(
        error.response?.data?.mensagem ||
          "Não foi possível criar a organização."
      );
    } finally {
      setCriando(false);
    }
  };

  /*
   * Editar organização
   */
  const handleEditar = (organizacao) => {
    setMenuAberto(null);
    setErrorMsg("");

    setOrganizacaoParaEditar(organizacao);
    setNomeOrganizacao(
      organizacao.nome || ""
    );
    setModalAberto(true);
  };

  /*
   * Salvar edição da organização
   */
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    if (!nomeOrganizacao.trim()) {
      setErrorMsg(
        "Digite o nome da organização."
      );
      return;
    }

    if (!organizacaoParaEditar?._id) {
      setErrorMsg(
        "Organização não encontrada."
      );
      return;
    }

    setSalvandoEdicao(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API}/organizacoes/${organizacaoParaEditar._id}`,
        {
          nome: nomeOrganizacao.trim(),
        },
        {
          withCredentials: true,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const organizacaoAtualizada =
        response.data.organizacao;

      setOrganizacoes(
        (organizacoesAtuais) =>
          organizacoesAtuais.map(
            (organizacao) =>
              organizacao._id ===
              organizacaoParaEditar._id
                ? {
                    ...organizacao,
                    nome:
                      organizacaoAtualizada?.nome ||
                      nomeOrganizacao.trim(),
                  }
                : organizacao
          )
      );

      setModalAberto(false);
      setOrganizacaoParaEditar(null);
      setNomeOrganizacao("");
      setErrorMsg("");

      setMensagemSucesso(
        "Organização atualizada com sucesso!"
      );

      setTimeout(() => {
        setMensagemSucesso("");
      }, 3000);
    } catch (error) {
      console.error(
        "Erro ao editar organização:",
        error
      );

      setErrorMsg(
        error.response?.data?.mensagem ||
          "Não foi possível editar a organização."
      );
    } finally {
      setSalvandoEdicao(false);
    }
  };

  /*
   * Visualizar organização
   */
  const handleVisualizar = (organizacaoId) => {
    setMenuAberto(null);

    navigate(
      `/organizacao/${organizacaoId}`
    );
  };

  /*
   * Abre o modal de confirmação de exclusão
   */
  const handleExcluir = (organizacao) => {
    setMenuAberto(null);
    setOrganizacaoParaExcluir(organizacao);
    setErrorMsg("");
  };

  /*
   * Confirma a exclusão da organização
   */
  const confirmarExclusao = async () => {
    if (!organizacaoParaExcluir?._id) {
      return;
    }

    setExcluindo(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API}/organizacoes/${organizacaoParaExcluir._id}`,
        {
          withCredentials: true,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      setOrganizacoes(
        (organizacoesAtuais) =>
          organizacoesAtuais.filter(
            (organizacao) =>
              organizacao._id !==
              organizacaoParaExcluir._id
          )
      );

      setOrganizacaoParaExcluir(null);

      setMensagemSucesso(
        "Organização excluída com sucesso!"
      );

      setTimeout(() => {
        setMensagemSucesso("");
      }, 3000);
    } catch (error) {
      console.error(
        "Erro ao excluir organização:",
        error
      );

      setErrorMsg(
        error.response?.data?.mensagem ||
          "Não foi possível excluir a organização."
      );
    } finally {
      setExcluindo(false);
    }
  };

  /*
   * Fecha o modal de criação/edição
   */
  const fecharModalOrganizacao = () => {
    if (criando || salvandoEdicao) {
      return;
    }

    setModalAberto(false);
    setNomeOrganizacao("");
    setOrganizacaoParaEditar(null);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-white text-[#111111]">
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
            <button
              type="button"
              className="grid h-[42px] w-[42px] cursor-pointer place-items-center rounded-full border-2 border-[#111111] bg-[#ffd84d] font-['Space_Grotesk',Arial,sans-serif] text-sm font-bold transition-transform duration-200 hover:-translate-y-1 hover:shadow-[3px_3px_0_#111111]"
              title={
                usuario?.nome || "Usuário"
              }
            >
              {obterIniciais(
                usuario?.nome
              )}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={saindo}
              title="Sair"
              className="flex h-[42px] cursor-pointer items-center gap-2 rounded-[9px] bg-white px-3 font-bold text-[#b9362d] transition-all duration-200 hover:-translate-y-1 hover:bg-[#fff1ef] hover:shadow-[3px_3px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {/* Ícone de sair */}
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

      <main className="mx-auto w-[min(1160px,calc(100%-40px))] py-14 sm:py-20">

        <section className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
            Área de trabalho
          </div>

          <h1 className="max-w-[700px] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(42px,7vw,72px)] font-bold leading-[0.95] tracking-[-0.055em]">
            Minhas
            <br />
            organizações.
          </h1>

          <p className="mt-5 max-w-[600px] text-[17px] leading-relaxed text-[#686864]">
            Acesse suas organizações ou crie uma nova para começar
            a organizar pessoas, funções e rodízios.
          </p>
        </section>

        {/* ALERTA DE SUCESSO */}
        {mensagemSucesso && (
          <div
            role="alert"
            className="mb-6 rounded-[12px] border-2 border-[#111111] bg-[#dff5b5] px-4 py-3 text-sm font-bold text-[#111111] shadow-[4px_4px_0_#111111]"
          >
            ✓ {mensagemSucesso}
          </div>
        )}

        {errorMsg &&
          !modalAberto &&
          !organizacaoParaExcluir && (
            <div
              role="alert"
              className="mb-6 rounded-[12px] border-2 border-[#ff6b5f] bg-[#fff1ef] px-4 py-3 text-sm font-medium text-[#b9362d]"
            >
              {errorMsg}
            </div>
          )}

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4]">
            <p className="font-semibold text-[#686864]">
              Carregando suas organizações...
            </p>
          </div>
        ) : (
          <>
            {organizacoes.length === 0 && (
              <section className="rounded-[24px] border-2 border-[#111111] bg-[#f8f7f4] p-8 shadow-[8px_9px_0_#111111] sm:p-12">
                <div className="max-w-[620px]">
                  <div className="mb-6 grid h-14 w-14 place-items-center rounded-xl border-2 border-[#111111] bg-[#8eb9ff] text-2xl font-bold">
                    +
                  </div>

                  <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                    Nenhuma organização no momento.
                  </h2>

                  <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-[#686864]">
                    Crie sua primeira organização para começar a
                    adicionar pessoas, funções e montar seus rodízios.
                  </p>

                  <button
                    type="button"
                    onClick={abrirModalCriacao}
                    className="mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0_#111111]"
                  >
                    + Criar organização
                  </button>
                </div>
              </section>
            )}

            {organizacoes.length > 0 && (
              <section>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-2xl font-bold tracking-[-0.04em]">
                    Suas organizações
                  </h2>

                  <button
                    type="button"
                    onClick={abrirModalCriacao}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
                  >
                    + Criar organização
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {organizacoes.map(
                    (organizacao, index) => (
                      <article
                        key={organizacao._id}
                        className="relative rounded-[18px] border-2 border-[#111111] bg-white p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[6px_7px_0_#111111]"
                      >
                        <div
                          className={`mb-6 grid h-12 w-12 place-items-center rounded-xl border-2 border-[#111111] text-xl font-bold ${
                            index % 3 === 0
                              ? "bg-[#ff6b5f]"
                              : index % 3 === 1
                              ? "bg-[#b7dc58]"
                              : "bg-[#8eb9ff]"
                          }`}
                        >
                          {organizacao.nome
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleVisualizar(
                                organizacao._id
                              )
                            }
                            className="cursor-pointer text-left"
                          >
                            <h3 className="font-['Space_Grotesk',Arial,sans-serif] text-2xl font-bold leading-tight tracking-[-0.04em] hover:underline hover:underline-offset-4">
                              {organizacao.nome}
                            </h3>

                            <p className="mt-2 text-sm text-[#686864]">
                              Clique para acessar
                            </p>
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setMenuAberto(
                                  menuAberto ===
                                    organizacao._id
                                    ? null
                                    : organizacao._id
                                )
                              }
                              className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border-2 border-[#111111] bg-white text-xl font-bold leading-none transition-colors hover:bg-[#f8f7f4]"
                              aria-label={`Opções de ${organizacao.nome}`}
                            >
                              ⋮
                            </button>

                            {menuAberto ===
                              organizacao._id && (
                              <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-[12px] border-2 border-[#111111] bg-white shadow-[5px_6px_0_#111111]">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVisualizar(
                                      organizacao._id
                                    )
                                  }
                                  className="block w-full cursor-pointer px-4 py-3 text-left text-sm font-semibold hover:bg-[#f8f7f4]"
                                >
                                  Visualizar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditar(
                                      organizacao
                                    )
                                  }
                                  className="block w-full cursor-pointer border-t border-[#deded9] px-4 py-3 text-left text-sm font-semibold hover:bg-[#f8f7f4]"
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleExcluir(
                                      organizacao
                                    )
                                  }
                                  className="block w-full cursor-pointer border-t border-[#deded9] px-4 py-3 text-left text-sm font-semibold text-[#b9362d] hover:bg-[#fff1ef]"
                                >
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 px-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              fecharModalOrganizacao();
            }
          }}
        >
          <div className="w-full max-w-[500px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    organizacaoParaEditar
                      ? "bg-[#b7dc58]"
                      : "bg-[#ffd84d]"
                  }`}
                />

                {organizacaoParaEditar
                  ? "Editar organização"
                  : "Nova organização"}
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                {organizacaoParaEditar ? (
                  <>
                    Edite sua
                    <br />
                    organização.
                  </>
                ) : (
                  <>
                    Crie sua
                    <br />
                    organização.
                  </>
                )}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                {organizacaoParaEditar
                  ? "Altere o nome da sua organização."
                  : "Escolha um nome para identificar sua organização dentro do Job Rotation."}
              </p>
            </div>

            <form
              onSubmit={
                organizacaoParaEditar
                  ? handleSalvarEdicao
                  : handleCriarOrganizacao
              }
            >
              <label
                htmlFor="nome-organizacao"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Nome da organização
              </label>

              <input
                id="nome-organizacao"
                type="text"
                value={nomeOrganizacao}
                onChange={(e) => {
                  setNomeOrganizacao(
                    e.target.value
                  );
                  setErrorMsg("");
                }}
                placeholder="Ex.: Equipe de Comunicação"
                autoFocus
                disabled={
                  criando || salvandoEdicao
                }
                className="w-full border-0 border-b-2 border-[#deded9] bg-transparent px-0 py-3 text-[15px] text-[#111111] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
              />

              {errorMsg && (
                <div className="mt-4 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                  {errorMsg}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModalOrganizacao}
                  disabled={
                    criando || salvandoEdicao
                  }
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    criando || salvandoEdicao
                  }
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {organizacaoParaEditar
                    ? salvandoEdicao
                      ? "Salvando..."
                      : "Salvar alterações →"
                    : criando
                    ? "Criando..."
                    : "Criar organização →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO */}
      {organizacaoParaExcluir && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 px-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !excluindo
            ) {
              setOrganizacaoParaExcluir(
                null
              );
              setErrorMsg("");
            }
          }}
        >
          <div className="w-full max-w-[500px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
                Excluir organização
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Excluir esta
                <br />
                organização?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                Deseja realmente excluir a organização{" "}
                <strong className="font-bold text-[#111111]">
                  {
                    organizacaoParaExcluir.nome
                  }
                </strong>
                ?
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[#b9362d]">
                Essa ação removerá a organização e
                seus membros.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                {errorMsg}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={excluindo}
                onClick={() => {
                  setOrganizacaoParaExcluir(
                    null
                  );
                  setErrorMsg("");
                }}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusao}
                disabled={excluindo}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#ff6b5f] px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {excluindo
                  ? "Excluindo..."
                  : "Excluir organização"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}