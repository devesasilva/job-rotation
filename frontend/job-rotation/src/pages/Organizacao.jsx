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
  const [rodizios, setRodizios] = useState([]);
  const [minhaRotacaoAtual, setMinhaRotacaoAtual] = useState([]);
  const [rodizioSelecionado, setRodizioSelecionado] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [abaAtiva, setAbaAtiva] = useState("membros");

  const [loading, setLoading] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [loadingFuncoes, setLoadingFuncoes] = useState(false);
  const [loadingRodizios, setLoadingRodizios] = useState(false);
  const [loadingMinhaRotacao, setLoadingMinhaRotacao] = useState(false);
  const [loadingRodizioDetalhe, setLoadingRodizioDetalhe] =
    useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [errorMembros, setErrorMembros] = useState("");
  const [errorFuncoes, setErrorFuncoes] = useState("");
  const [errorRodizios, setErrorRodizios] = useState("");
  const [errorMinhaRotacao, setErrorMinhaRotacao] = useState("");

  const [saindo, setSaindo] = useState(false);

  const [modalAdicionarAberto, setModalAdicionarAberto] =
    useState(false);
  const [emailMembro, setEmailMembro] = useState("");
  const [perfilMembro, setPerfilMembro] = useState("Membro");
  const [adicionandoMembro, setAdicionandoMembro] = useState(false);

  const [modalEditarAberto, setModalEditarAberto] =
    useState(false);
  const [membroSelecionado, setMembroSelecionado] =
    useState(null);
  const [perfilEditado, setPerfilEditado] = useState("");
  const [editandoMembro, setEditandoMembro] = useState(false);

  const [membroParaExcluir, setMembroParaExcluir] =
    useState(null);
  const [excluindoMembro, setExcluindoMembro] =
    useState(false);

  const [modalAdicionarFuncaoAberto, setModalAdicionarFuncaoAberto] =
    useState(false);
  const [modalEditarFuncaoAberto, setModalEditarFuncaoAberto] =
    useState(false);
  const [funcaoSelecionada, setFuncaoSelecionada] = useState(null);
  const [nomeFuncao, setNomeFuncao] = useState("");
  const [descricaoFuncao, setDescricaoFuncao] = useState("");
  const [adicionandoFuncao, setAdicionandoFuncao] = useState(false);
  const [editandoFuncao, setEditandoFuncao] = useState(false);

  const [funcaoParaExcluir, setFuncaoParaExcluir] = useState(null);
  const [excluindoFuncao, setExcluindoFuncao] = useState(false);

  const [modalAgendarRodizioAberto, setModalAgendarRodizioAberto] =
    useState(false);
  const [cicloRodizio, setCicloRodizio] = useState("Mensal");
  const [dataInicioRodizio, setDataInicioRodizio] = useState("");
  const [dataFimRodizio, setDataFimRodizio] = useState("");
  const [agendandoRodizio, setAgendandoRodizio] =
    useState(false);
  const [alterandoAtribuicoes, setAlterandoAtribuicoes] =
    useState(false);
  const [errorAtribuicoes, setErrorAtribuicoes] =
    useState("");
  const [cicloEditado, setCicloEditado] = useState("Mensal");
  const [dataInicioEditada, setDataInicioEditada] =
    useState("");
  const [dataFimEditada, setDataFimEditada] = useState("");
  const [salvandoDetalhesRodizio, setSalvandoDetalhesRodizio] =
    useState(false);
  const [errorDetalhesRodizio, setErrorDetalhesRodizio] =
    useState("");
  const [rodizioParaRotacionar, setRodizioParaRotacionar] =
    useState(null);
  const [rotacionandoRodizioId, setRotacionandoRodizioId] =
    useState(null);
  const [errorRotacionarRodizio, setErrorRotacionarRodizio] =
    useState("");
  const [rodizioParaExcluir, setRodizioParaExcluir] =
    useState(null);
  const [excluindoRodizioId, setExcluindoRodizioId] =
    useState(null);
  const [errorExcluirRodizio, setErrorExcluirRodizio] =
    useState("");

  useEffect(() => {
    carregarOrganizacao();
    carregarMembros();
    carregarFuncoes();
    carregarUsuario();
  }, [id]);

  useEffect(() => {
    if (abaAtiva === "rodizios") {
      carregarRodizios();
      carregarMinhaRotacaoAtual();
    }
  }, [abaAtiva, id]);

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

  const carregarRodizios = async () => {
    setLoadingRodizios(true);
    setErrorRodizios("");

    try {
      const response = await axios.get(
        `${API}/organizacoes/${id}/rodizios`,
        getConfig()
      );

      setRodizios(response.data || []);
    } catch (error) {
      console.error(
        "Erro ao carregar rodízios:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorRodizios(
        error.response?.data?.mensagem ||
          "Não foi possível carregar os rodízios."
      );
    } finally {
      setLoadingRodizios(false);
    }
  };

  const carregarMinhaRotacaoAtual = async () => {
    setLoadingMinhaRotacao(true);
    setErrorMinhaRotacao("");

    try {
      const response = await axios.get(
        `${API}/organizacoes/${id}/rodizios/minha`,
        getConfig()
      );

      setMinhaRotacaoAtual(response.data || []);
    } catch (error) {
      console.error(
        "Erro ao carregar minha rotação atual:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorMinhaRotacao(
        error.response?.data?.mensagem ||
          "Não foi possível consultar sua rotação atual."
      );
    } finally {
      setLoadingMinhaRotacao(false);
    }
  };

  const abrirDetalhesRodizio = async (rodizioId) => {
    if (!rodizioId) {
      return;
    }

    setLoadingRodizioDetalhe(true);
    setErrorRodizios("");
    setErrorAtribuicoes("");

    try {
      const response = await axios.get(
        `${API}/organizacoes/${id}/rodizios/${rodizioId}`,
        getConfig()
      );

      setRodizioSelecionado(response.data);
      setCicloEditado(response.data.ciclo || "Mensal");
      setDataInicioEditada(
        converterParaDataHoraLocal(response.data.dataInicio)
      );
      setDataFimEditada(
        converterParaDataHoraLocal(response.data.dataFim)
      );
      setErrorDetalhesRodizio("");
    } catch (error) {
      console.error(
        "Erro ao buscar rodízio:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorRodizios(
        error.response?.data?.mensagem ||
          "Não foi possível carregar os detalhes do rodízio."
      );
    } finally {
      setLoadingRodizioDetalhe(false);
    }
  };

  const salvarAtribuicoes = async (
    rodizioId,
    metodo,
    caminho = "",
    dados
  ) => {
    if (alterandoAtribuicoes) {
      return;
    }

    setAlterandoAtribuicoes(true);
    setErrorAtribuicoes("");

    try {
      const response = await axios({
        method: metodo,
        url: `${API}/organizacoes/${id}/rodizios/${rodizioId}/atribuicoes${caminho}`,
        data: dados,
        ...getConfig(),
      });
      const rodizioAtualizado = response.data.rodizio;

      setRodizioSelecionado(rodizioAtualizado);
      setRodizios((atuais) =>
        atuais.map((rodizio) =>
          rodizio._id === rodizioAtualizado._id
            ? rodizioAtualizado
            : rodizio
        )
      );
      await carregarMinhaRotacaoAtual();
    } catch (error) {
      console.error(
        "Erro ao atualizar a tabela do rodízio:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorAtribuicoes(
        error.response?.data?.mensagem ||
          "Não foi possível atualizar a tabela do rodízio."
      );
    } finally {
      setAlterandoAtribuicoes(false);
    }
  };

  const adicionarLinhaAtribuicao = () => {
    salvarAtribuicoes(
      rodizioSelecionado._id,
      "post",
      "",
      {}
    );
  };

  const atualizarCelulaAtribuicao = (
    atribuicaoId,
    campo,
    valor
  ) => {
    salvarAtribuicoes(
      rodizioSelecionado._id,
      "patch",
      `/${atribuicaoId}`,
      { [campo]: valor || null }
    );
  };

  const removerLinhaAtribuicao = (atribuicaoId) => {
    salvarAtribuicoes(
      rodizioSelecionado._id,
      "delete",
      `/${atribuicaoId}`
    );
  };

  const salvarDetalhesRodizio = async (e) => {
    e.preventDefault();

    if (!dataInicioEditada || !dataFimEditada) {
      setErrorDetalhesRodizio(
        "Informe as datas de início e término."
      );
      return;
    }

    const inicio = new Date(dataInicioEditada);
    const fim = new Date(dataFimEditada);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime()) ||
      inicio >= fim
    ) {
      setErrorDetalhesRodizio(
        "A data de início deve ser anterior à data de término."
      );
      return;
    }

    setSalvandoDetalhesRodizio(true);
    setErrorDetalhesRodizio("");

    try {
      const response = await axios.patch(
        `${API}/organizacoes/${id}/rodizios/${rodizioSelecionado._id}`,
        {
          ciclo: cicloEditado,
          dataInicio: inicio.toISOString(),
          dataFim: fim.toISOString(),
        },
        getConfig()
      );
      const rodizioAtualizado = response.data.rodizio;

      setRodizioSelecionado(rodizioAtualizado);
      setRodizios((atuais) =>
        atuais.map((rodizio) =>
          rodizio._id === rodizioAtualizado._id
            ? rodizioAtualizado
            : rodizio
        )
      );
      setRodizioSelecionado(null);
      setErrorAtribuicoes("");
      setErrorDetalhesRodizio("");
      await carregarMinhaRotacaoAtual();
    } catch (error) {
      console.error(
        "Erro ao atualizar os dados do rodízio:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorDetalhesRodizio(
        error.response?.data?.mensagem ||
          error.message ||
          "Não foi possível atualizar os dados do rodízio."
      );
    } finally {
      setSalvandoDetalhesRodizio(false);
    }
  };

  const confirmarRotacaoManual = async () => {
    if (!rodizioParaRotacionar || rotacionandoRodizioId) {
      return;
    }

    const { _id: rodizioId } = rodizioParaRotacionar;
    setRotacionandoRodizioId(rodizioId);
    setErrorRotacionarRodizio("");

    try {
      const response = await axios.post(
        `${API}/organizacoes/${id}/rodizios/${rodizioId}/rotacionar`,
        {},
        getConfig()
      );
      const rodizioAtualizado = response.data.rodizio;

      setRodizios((atuais) =>
        atuais.map((rodizio) =>
          rodizio._id === rodizioAtualizado._id
            ? rodizioAtualizado
            : rodizio
        )
      );
      setRodizioSelecionado((atual) =>
        atual?._id === rodizioAtualizado._id
          ? rodizioAtualizado
          : atual
      );
      setRodizioParaRotacionar(null);
      await carregarMinhaRotacaoAtual();
    } catch (error) {
      console.error(
        "Erro ao rotacionar rodízio:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorRotacionarRodizio(
        error.response?.data?.mensagem ||
          "Não foi possível rotacionar o rodízio."
      );
    } finally {
      setRotacionandoRodizioId(null);
    }
  };

  const confirmarExclusaoRodizio = async () => {
    if (!rodizioParaExcluir || excluindoRodizioId) {
      return;
    }

    const { _id: rodizioId } = rodizioParaExcluir;
    setExcluindoRodizioId(rodizioId);
    setErrorExcluirRodizio("");

    try {
      await axios.delete(
        `${API}/organizacoes/${id}/rodizios/${rodizioId}`,
        getConfig()
      );

      setRodizios((atuais) =>
        atuais.filter((rodizio) => rodizio._id !== rodizioId)
      );
      setRodizioSelecionado((atual) =>
        atual?._id === rodizioId ? null : atual
      );
      setRodizioParaExcluir(null);
      await carregarMinhaRotacaoAtual();
    } catch (error) {
      console.error("Erro ao excluir rodízio:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorExcluirRodizio(
        error.response?.data?.mensagem ||
          "Não foi possível excluir o rodízio."
      );
    } finally {
      setExcluindoRodizioId(null);
    }
  };

  const formatarData = (data) => {
    if (!data) {
      return "Data não informada";
    }

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
      return "Data inválida";
    }

    return dataFormatada.toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const converterParaDataHoraLocal = (data) => {
    if (!data) {
      return "";
    }

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
      return "";
    }

    const dataLocal = new Date(
      dataFormatada.getTime() -
        dataFormatada.getTimezoneOffset() * 60000
    );

    return dataLocal.toISOString().slice(0, 16);
  };

  const obterMinhasFuncoes = () => {
    const obterId = (valor) =>
      String(valor?._id || valor?.id || valor || "");
    const usuarioId = obterId(usuario);
    const meusMembrosIds = new Set(
      membros
        .filter(
          (membro) => obterId(membro.usuario) === usuarioId
        )
        .map((membro) => obterId(membro))
    );
    const minhasFuncoesAtuais = minhaRotacaoAtual.flatMap((rodizio) =>
      (rodizio.atribuicoes || [])
        .filter(
          (atribuicao) => {
            const membroId = obterId(atribuicao.membro);
            const usuarioDoMembroId = obterId(
              atribuicao.membro?.usuario
            );

            return (
              meusMembrosIds.has(membroId) ||
              (usuarioId && usuarioDoMembroId === usuarioId)
            );
          }
        )
        .map((atribuicao) => {
          const funcaoId = obterId(atribuicao.funcao);
          return (
            atribuicao.funcao?.nome ||
            funcoes.find(
              (funcao) => obterId(funcao) === funcaoId
            )?.nome
          );
        })
        .filter(Boolean)
    );

    return [...new Set(minhasFuncoesAtuais)].join(", ") || "não definida";
  };

  const usuarioPodeGerenciarRodizios = membros.some((membro) => {
    const usuarioId = usuario?._id || usuario?.id;
    const usuarioDoMembroId =
      membro.usuario?._id || membro.usuario?.id || membro.usuario;

    return (
      String(usuarioDoMembroId || "") === String(usuarioId || "") &&
      ["Administrador", "Moderador"].includes(membro.perfil)
    );
  });

  const formatarPeriodo = (inicio, fim) => {
    return `${formatarData(inicio)} → ${formatarData(fim)}`;
  };

  const abrirModalAgendarRodizio = () => {
    setCicloRodizio("Mensal");
    setDataInicioRodizio("");
    setDataFimRodizio("");
    setErrorRodizios("");
    setModalAgendarRodizioAberto(true);
  };

  const fecharModalAgendarRodizio = () => {
    if (agendandoRodizio) {
      return;
    }

    setModalAgendarRodizioAberto(false);
    setCicloRodizio("Mensal");
    setDataInicioRodizio("");
    setDataFimRodizio("");
  };

  const handleAgendarRodizio = async (e) => {
    e.preventDefault();

    if (!dataInicioRodizio) {
      setErrorRodizios(
        "Informe a data de início."
      );
      return;
    }

    if (!dataFimRodizio) {
      setErrorRodizios(
        "Informe a data de término."
      );
      return;
    }

    const inicio = new Date(dataInicioRodizio);
    const fim = new Date(dataFimRodizio);

    if (inicio >= fim) {
      setErrorRodizios(
        "A data de início deve ser anterior à data de término."
      );
      return;
    }

    setAgendandoRodizio(true);
    setErrorRodizios("");

    try {
      await axios.post(
        `${API}/organizacoes/${id}/rodizios`,
        {
          ciclo: cicloRodizio,
          dataInicio: inicio.toISOString(),
          dataFim: fim.toISOString(),
        },
        getConfig()
      );

      setModalAgendarRodizioAberto(false);
      setCicloRodizio("Mensal");
      setDataInicioRodizio("");
      setDataFimRodizio("");

      await carregarRodizios();
      await carregarMinhaRotacaoAtual();
    } catch (error) {
      console.error(
        "Erro ao agendar rodízio:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorRodizios(
        error.response?.data?.mensagem ||
          "Não foi possível agendar o rodízio."
      );
    } finally {
      setAgendandoRodizio(false);
    }
  };

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
          descricao:
            descricaoFuncao.trim() || undefined,
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

  const abrirModalEditarFuncao = (funcao) => {
    setFuncaoSelecionada(funcao);
    setNomeFuncao(funcao.nome || "");
    setDescricaoFuncao(funcao.descricao || "");
    setErrorFuncoes("");
    setModalEditarFuncaoAberto(true);
  };

  const fecharModalEditarFuncao = () => {
    if (editandoFuncao) {
      return;
    }

    setModalEditarFuncaoAberto(false);
    setFuncaoSelecionada(null);
    setNomeFuncao("");
    setDescricaoFuncao("");
  };

  const handleEditarFuncao = async (e) => {
    e.preventDefault();

    if (!nomeFuncao.trim()) {
      setErrorFuncoes("O nome da função é obrigatório.");
      return;
    }

    if (!funcaoSelecionada?._id) {
      setErrorFuncoes("Função não encontrada.");
      return;
    }

    setEditandoFuncao(true);
    setErrorFuncoes("");

    try {
      await axios.put(
        `${API}/organizacoes/${id}/funcoes/${funcaoSelecionada._id}`,
        {
          nome: nomeFuncao.trim(),
          descricao: descricaoFuncao.trim() || undefined,
        },
        getConfig()
      );

      fecharModalEditarFuncao();
      await carregarFuncoes();
    } catch (error) {
      console.error("Erro ao editar função:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorFuncoes(
        error.response?.data?.mensagem ||
          "Não foi possível editar a função."
      );
    } finally {
      setEditandoFuncao(false);
    }
  };

  const handleExcluirFuncao = (funcao) => {
    setFuncaoParaExcluir(funcao);
    setErrorFuncoes("");
  };

  const confirmarExclusaoFuncao = async () => {
    if (!funcaoParaExcluir?._id) {
      return;
    }

    setExcluindoFuncao(true);
    setErrorFuncoes("");

    try {
      await axios.delete(
        `${API}/organizacoes/${id}/funcoes/${funcaoParaExcluir._id}`,
        getConfig()
      );

      setFuncaoParaExcluir(null);
      await carregarFuncoes();
    } catch (error) {
      console.error("Erro ao excluir função:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorFuncoes(
        error.response?.data?.mensagem ||
          "Não foi possível excluir a função."
      );
    } finally {
      setExcluindoFuncao(false);
    }
  };

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

  const handleRemoverMembro = (membro) => {
    setMembroParaExcluir(membro);
    setErrorMembros("");
  };

  const confirmarRemocaoMembro = async () => {
    if (!membroParaExcluir?._id) {
      return;
    }

    setExcluindoMembro(true);
    setErrorMembros("");

    try {
      await axios.delete(
        `${API}/organizacoes/${id}/membros/${membroParaExcluir._id}`,
        getConfig()
      );

      setMembroParaExcluir(null);

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
    } finally {
      setExcluindoMembro(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#111111]">
        <header className="sticky top-0 z-30 border-b-2 border-[#111111] bg-white/95 backdrop-blur-[10px]">
          <div className="mx-auto flex h-[74px] w-[min(1160px,calc(100%-40px))] items-center justify-between gap-5">
            <button
              type="button"
              onClick={() => navigate("/main")}
              className="flex cursor-pointer items-center gap-[10px] border-0 bg-transparent p-0 font-['Space_Grotesk',Arial,sans-serif] text-[18px] font-bold tracking-[-0.04em] text-[#111111]"
            >
              <span className="relative grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-lg border-2 border-[#111111] before:absolute before:left-[5px] before:top-[5px] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#ff6b5f] after:absolute after:bottom-[5px] after:right-[5px] after:h-[7px] after:w-[7px] after:rounded-full after:bg-[#b7dc58]" />

              <span>Job Rotation</span>
            </button>

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
                title={usuario?.nome || "Usuário"}
              >
                {obterIniciais(usuario?.nome)}
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
                  {saindo ? "Saindo..." : "Sair"}
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
      <header className="sticky top-0 z-30 border-b-2 border-[#111111] bg-white/95 backdrop-blur-[10px]">
        <div className="mx-auto flex h-[74px] w-[min(1160px,calc(100%-40px))] items-center justify-between gap-5">
          <button
            type="button"
            onClick={() => navigate("/main")}
            className="flex cursor-pointer items-center gap-[10px] border-0 bg-transparent p-0 font-['Space_Grotesk',Arial,sans-serif] text-[18px] font-bold tracking-[-0.04em] text-[#111111]"
          >
            <span className="relative grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-lg border-2 border-[#111111] before:absolute before:left-[5px] before:top-[5px] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#ff6b5f] after:absolute after:bottom-[5px] after:right-[5px] after:h-[7px] after:w-[7px] after:rounded-full after:bg-[#b7dc58]" />

            <span>Job Rotation</span>
          </button>

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
              title={usuario?.nome || "Usuário"}
            >
              {obterIniciais(usuario?.nome)}
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
                {saindo ? "Saindo..." : "Sair"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-[min(1160px,calc(100%-40px))] py-10 sm:py-14">
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

              <div className="pt-8">
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
                        <div className="hidden grid-cols-[1fr_180px_180px] border-b-2 border-[#111111] bg-[#f8f7f4] px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] sm:grid">
                          <span>Membro</span>
                          <span>Perfil</span>
                          <span>Ações</span>
                        </div>

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
                                onClick={() =>
                                  abrirModalEditar(membro)
                                }
                                className="cursor-pointer text-sm font-bold underline underline-offset-4 hover:no-underline"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoverMembro(membro)
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
                        <div className="hidden grid-cols-[1fr_2fr_180px] border-b-2 border-[#111111] bg-[#f8f7f4] px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] sm:grid">
                          <span>Função</span>
                          <span>Descrição</span>
                          <span>Ações</span>
                        </div>

                        {funcoes.map((funcao) => (
                          <div
                            key={funcao._id}
                            className="grid gap-4 border-b border-[#deded9] px-5 py-5 last:border-b-0 sm:grid-cols-[1fr_2fr_180px] sm:items-center"
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

                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={() =>
                                  abrirModalEditarFuncao(funcao)
                                }
                                className="cursor-pointer text-sm font-bold underline underline-offset-4 hover:no-underline"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleExcluirFuncao(funcao)
                                }
                                className="cursor-pointer text-sm font-bold text-[#b9362d] underline underline-offset-4 hover:no-underline"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {abaAtiva === "rodizios" && (
                  <section>
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-3xl font-bold tracking-[-0.04em]">
                          Olá, {usuario?.nome || "você"}!
                        </h2>

                        <p className="mt-2 text-sm text-[#686864]">
                          Sua função atual é{" "}
                          {loadingMinhaRotacao ? (
                            <span>consultando...</span>
                          ) : errorMinhaRotacao ? (
                            <span className="font-medium text-[#b9362d]">
                              indisponível
                            </span>
                          ) : (
                            <strong className="font-bold text-[#111111]">
                              {obterMinhasFuncoes()}
                            </strong>
                          )}
                          .
                        </p>

                        {errorMinhaRotacao && (
                          <p className="mt-1 text-sm text-[#b9362d]">
                            {errorMinhaRotacao}
                          </p>
                        )}
                      </div>

                      {usuarioPodeGerenciarRodizios && (
                        <button
                          type="button"
                          onClick={abrirModalAgendarRodizio}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
                        >
                          + Criar rodízio
                        </button>
                      )}
                    </div>

                    {errorRodizios && (
                      <div className="mb-5 rounded-[12px] border-2 border-[#ff6b5f] bg-[#fff1ef] px-4 py-3 text-sm font-medium text-[#b9362d]">
                        {errorRodizios}
                      </div>
                    )}

                    {loadingRodizios ? (
                      <div className="rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4] p-8 text-center">
                        <p className="font-semibold text-[#686864]">
                          Carregando rodízios...
                        </p>
                      </div>
                    ) : rodizios.length === 0 ? (
                      <div className="rounded-[18px] border-2 border-[#111111] bg-[#f8f7f4] p-8 sm:p-10">
                        <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#111111] bg-[#8eb9ff] text-xl font-bold">
                          ↻
                        </div>

                        <h3 className="mt-5 font-['Space_Grotesk',Arial,sans-serif] text-2xl font-bold tracking-[-0.04em]">
                          Nenhum rodízio
                        </h3>

                        <p className="mt-2 max-w-[550px] text-sm leading-relaxed text-[#686864]">
                          Ainda não há rotações cadastradas nesta organização.
                        </p>

                        {usuarioPodeGerenciarRodizios && (
                          <button
                            type="button"
                            onClick={abrirModalAgendarRodizio}
                            className="mt-6 min-h-11 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
                          >
                            + Criar rodízio
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid gap-5">
                        {rodizios.map((rodizio) => (
                          <article
                            key={rodizio._id}
                            className="overflow-hidden rounded-[18px] border-2 border-[#111111]"
                          >
                            <div className="flex flex-col gap-4 bg-[#f8f7f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#686864]">
                                  {rodizio.ciclo || "Mensal"} ·{" "}
                                  {formatarPeriodo(
                                    rodizio.dataInicio,
                                    rodizio.dataFim
                                  )}
                                </p>
                              </div>

                              {usuarioPodeGerenciarRodizios && (
                                <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setErrorRotacionarRodizio("");
                                    setRodizioParaRotacionar(rodizio);
                                  }}
                                  disabled={
                                    rotacionandoRodizioId ===
                                    rodizio._id
                                  }
                                  className="min-h-10 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#b7dc58] px-4 text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {rotacionandoRodizioId ===
                                  rodizio._id
                                    ? "Rotacionando..."
                                    : "↻ Rotacionar"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirDetalhesRodizio(
                                      rodizio._id
                                    )
                                  }
                                  disabled={loadingRodizioDetalhe}
                                  className="min-h-10 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-4 text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Ver detalhes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setErrorExcluirRodizio("");
                                    setRodizioParaExcluir(rodizio);
                                  }}
                                  disabled={
                                    excluindoRodizioId === rodizio._id
                                  }
                                  className="min-h-10 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#ff6b5f] px-4 text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Excluir
                                </button>
                                </div>
                              )}
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[420px] border-collapse">
                                <thead>
                                  <tr className="border-y border-[#deded9] bg-white text-left text-xs font-bold uppercase tracking-[0.08em] text-[#686864]">
                                    <th className="w-1/2 px-5 py-3">
                                      Função
                                    </th>
                                    <th className="w-1/2 px-5 py-3">
                                      Membro
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {rodizio.atribuicoes?.length ? (
                                    rodizio.atribuicoes.map(
                                      (atribuicao) => (
                                        <tr
                                          key={atribuicao._id}
                                          className="border-b border-[#deded9] last:border-b-0"
                                        >
                                          <td className="px-5 py-3 text-sm font-semibold">
                                            {atribuicao.funcao
                                              ?.nome || "—"}
                                          </td>
                                          <td className="px-5 py-3 text-sm font-semibold">
                                            {atribuicao.membro
                                              ?.usuario?.nome ||
                                              atribuicao.membro
                                                ?.nome ||
                                              atribuicao.membro
                                                ?.usuario
                                                ?.email ||
                                              "—"}
                                          </td>
                                        </tr>
                                      )
                                    )
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="2"
                                        className="px-5 py-4 text-sm text-[#686864]"
                                      >
                                        Nenhum membro ou função associado.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            </section>
          </>
        )}
      </main>

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

      {membroParaExcluir && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 px-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !excluindoMembro
            ) {
              setMembroParaExcluir(null);
              setErrorMembros("");
            }
          }}
        >
          <div className="w-full max-w-[500px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
                Remover membro
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Remover este
                <br />
                membro?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                Deseja realmente remover{" "}
                <strong className="font-bold text-[#111111]">
                  {membroParaExcluir.usuario?.nome ||
                    membroParaExcluir.nome ||
                    membroParaExcluir.usuario?.email ||
                    membroParaExcluir.email ||
                    "este membro"}
                </strong>{" "}
                da organização?
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[#b9362d]">
                Essa ação removerá o membro desta organização.
              </p>
            </div>

            {errorMembros && (
              <div className="mb-5 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                {errorMembros}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={excluindoMembro}
                onClick={() => {
                  setMembroParaExcluir(null);
                  setErrorMembros("");
                }}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarRemocaoMembro}
                disabled={excluindoMembro}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#ff6b5f] px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {excluindoMembro
                  ? "Removendo..."
                  : "Remover membro"}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {modalEditarFuncaoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 px-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              fecharModalEditarFuncao();
            }
          }}
        >
          <div className="w-full max-w-[500px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffd84d]" />
                Editar função
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Edite a
                <br />
                função.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                Atualize o nome e a descrição desta função.
              </p>
            </div>

            <form onSubmit={handleEditarFuncao}>
              <label
                htmlFor="nome-funcao-editada"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Nome
              </label>

              <input
                id="nome-funcao-editada"
                type="text"
                value={nomeFuncao}
                onChange={(e) => {
                  setNomeFuncao(e.target.value);
                  setErrorFuncoes("");
                }}
                autoFocus
                className="w-full border-0 border-b-2 border-[#deded9] bg-transparent px-0 py-3 text-[15px] text-[#111111] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#111111]"
              />

              <label
                htmlFor="descricao-funcao-editada"
                className="mb-2 mt-6 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Descrição
              </label>

              <textarea
                id="descricao-funcao-editada"
                value={descricaoFuncao}
                onChange={(e) => {
                  setDescricaoFuncao(e.target.value);
                  setErrorFuncoes("");
                }}
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
                  onClick={fecharModalEditarFuncao}
                  disabled={editandoFuncao}
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={editandoFuncao}
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editandoFuncao
                    ? "Salvando..."
                    : "Salvar alterações →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {funcaoParaExcluir && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 px-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !excluindoFuncao
            ) {
              setFuncaoParaExcluir(null);
              setErrorFuncoes("");
            }
          }}
        >
          <div className="w-full max-w-[500px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
                Excluir função
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Excluir esta
                <br />
                função?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                Deseja realmente excluir {" "}
                <strong className="font-bold text-[#111111]">
                  {funcaoParaExcluir.nome || "esta função"}
                </strong>
                ?
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[#b9362d]">
                Essa ação removerá a função da organização.
              </p>
            </div>

            {errorFuncoes && (
              <div className="mb-5 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                {errorFuncoes}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={excluindoFuncao}
                onClick={() => {
                  setFuncaoParaExcluir(null);
                  setErrorFuncoes("");
                }}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusaoFuncao}
                disabled={excluindoFuncao}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#ff6b5f] px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {excluindoFuncao
                  ? "Excluindo..."
                  : "Excluir função"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAgendarRodizioAberto &&
        usuarioPodeGerenciarRodizios && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111111]/50 px-5 py-8 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              fecharModalAgendarRodizio();
            }
          }}
        >
          <div className="w-full max-w-[560px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8eb9ff]" />
                Novo rodízio
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Crie uma
                <br />
                rotação.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#686864]">
                Defina o ciclo e o período. Membros e funções não são selecionados nesta etapa.
              </p>
            </div>

            <form onSubmit={handleAgendarRodizio}>
              <label
                htmlFor="ciclo-rodizio"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
              >
                Ciclo
              </label>

              <select
                id="ciclo-rodizio"
                value={cicloRodizio}
                onChange={(e) => {
                  setCicloRodizio(e.target.value);
                  setErrorRodizios("");
                }}
                className="w-full cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none"
              >
                <option value="Diário">
                  Diário
                </option>

                <option value="Semanal">
                  Semanal
                </option>

                <option value="Quinzenal">
                  Quinzenal
                </option>

                <option value="Mensal">
                  Mensal
                </option>

                <option value="Anual">
                  Anual
                </option>
              </select>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="data-inicio-rodizio"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
                  >
                    Data de início
                  </label>

                  <input
                    id="data-inicio-rodizio"
                    type="datetime-local"
                    value={dataInicioRodizio}
                    onChange={(e) => {
                      setDataInicioRodizio(
                        e.target.value
                      );
                      setErrorRodizios("");
                    }}
                    className="w-full cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="data-fim-rodizio"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
                  >
                    Data de término
                  </label>

                  <input
                    id="data-fim-rodizio"
                    type="datetime-local"
                    value={dataFimRodizio}
                    onChange={(e) => {
                      setDataFimRodizio(
                        e.target.value
                      );
                      setErrorRodizios("");
                    }}
                    className="w-full cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              {errorRodizios && (
                <div className="mt-5 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                  {errorRodizios}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModalAgendarRodizio}
                  disabled={agendandoRodizio}
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={agendandoRodizio}
                  className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {agendandoRodizio
                    ? "Criando..."
                    : "Criar rodízio →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rodizioParaRotacionar && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#111111]/50 px-5 py-8 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !rotacionandoRodizioId
            ) {
              setRodizioParaRotacionar(null);
              setErrorRotacionarRodizio("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-rotacao-titulo"
            className="w-full max-w-[480px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8"
          >
            <div className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b7dc58]" />
              Rotação manual
            </div>

            <h2
              id="confirmar-rotacao-titulo"
              className="font-['Space_Grotesk',Arial,sans-serif] text-3xl font-bold tracking-[-0.04em]"
            >
              Rotacionar este rodízio?
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-[#686864]">
              Tem certeza que deseja rotacionar? Cada pessoa avançará para a próxima função na ordem da tabela. Lembre-se que o rodízio atualiza automáticamente de acordo como ciclo definido.
            </p>

            {errorRotacionarRodizio && (
              <div className="mt-5 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                {errorRotacionarRodizio}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRodizioParaRotacionar(null);
                  setErrorRotacionarRodizio("");
                }}
                disabled={Boolean(rotacionandoRodizioId)}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarRotacaoManual}
                disabled={Boolean(rotacionandoRodizioId)}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#b7dc58] px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rotacionandoRodizioId
                  ? "Rotacionando..."
                  : "Sim, rotacionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rodizioParaExcluir && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#111111]/50 px-5 py-8 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !excluindoRodizioId
            ) {
              setRodizioParaExcluir(null);
              setErrorExcluirRodizio("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-exclusao-rodizio-titulo"
            className="w-full max-w-[480px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8"
          >
            <div className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
              Excluir rodízio
            </div>

            <h2
              id="confirmar-exclusao-rodizio-titulo"
              className="font-['Space_Grotesk',Arial,sans-serif] text-3xl font-bold tracking-[-0.04em]"
            >
              Excluir este rodízio?
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-[#686864]">
              Esta ação excluirá permanentemente o rodízio, incluindo suas
              linhas, membros e funções associadas. Deseja continuar?
            </p>

            {errorExcluirRodizio && (
              <div className="mt-5 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                {errorExcluirRodizio}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRodizioParaExcluir(null);
                  setErrorExcluirRodizio("");
                }}
                disabled={Boolean(excluindoRodizioId)}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusaoRodizio}
                disabled={Boolean(excluindoRodizioId)}
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#ff6b5f] px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {excluindoRodizioId
                  ? "Excluindo..."
                  : "Sim, excluir rodízio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rodizioSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111111]/50 px-5 py-8 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !alterandoAtribuicoes &&
              !salvandoDetalhesRodizio
            ) {
              setRodizioSelecionado(null);
              setErrorAtribuicoes("");
              setErrorDetalhesRodizio("");
            }
          }}
        >
          <div className="w-full max-w-[760px] rounded-[24px] border-2 border-[#111111] bg-white p-7 shadow-[10px_12px_0_#111111] sm:p-8">
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8eb9ff]" />
                Detalhes do rodízio
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold leading-[0.95] tracking-[-0.055em]">
                Rotação
                <br />
                agendada.
              </h2>
            </div>

            <div className="grid gap-5">
              <section className="overflow-hidden rounded-[14px] border-2 border-[#111111]">
                <div className="flex flex-col gap-3 border-b-2 border-[#111111] bg-[#f8f7f4] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-['Space_Grotesk',Arial,sans-serif] text-xl font-bold">
                      Pessoas e funções
                    </h3>

                    <p className="mt-1 text-sm text-[#686864]">
                      Adicione linhas e escolha os valores. Membros e funções podem se repetir.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={adicionarLinhaAtribuicao}
                    disabled={alterandoAtribuicoes}
                    className="min-h-10 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    + Adicionar linha
                  </button>
                </div>

                {errorAtribuicoes && (
                  <div className="m-4 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d]">
                    {errorAtribuicoes}
                  </div>
                )}

                {rodizioSelecionado.atribuicoes?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr className="border-b border-[#deded9] text-left text-xs font-bold uppercase tracking-[0.08em] text-[#686864]">
                          <th className="px-4 py-3">Função</th>
                          <th className="px-4 py-3">Membro</th>
                          <th className="w-[130px] px-4 py-3">Ação</th>
                        </tr>
                      </thead>

                      <tbody>
                        {rodizioSelecionado.atribuicoes.map(
                          (atribuicao) => (
                            <tr
                              key={atribuicao._id}
                              className="border-b border-[#deded9] last:border-b-0"
                            >
                              <td className="px-4 py-3">
                                <select
                                  aria-label="Função da linha"
                                  value={
                                    atribuicao.funcao?._id ||
                                    atribuicao.funcao ||
                                    ""
                                  }
                                  disabled={alterandoAtribuicoes}
                                  onChange={(e) =>
                                    atualizarCelulaAtribuicao(
                                      atribuicao._id,
                                      "funcaoId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full cursor-pointer rounded-[8px] border-2 border-[#111111] bg-white px-3 py-2 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <option value="">
                                    Sem função
                                  </option>

                                  {funcoes.map((funcao) => (
                                    <option
                                      key={funcao._id}
                                      value={funcao._id}
                                    >
                                      {funcao.nome}
                                    </option>
                                  ))}
                                </select>
                                {atribuicao.funcao && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      atualizarCelulaAtribuicao(
                                        atribuicao._id,
                                        "funcaoId",
                                        ""
                                      )
                                    }
                                    disabled={alterandoAtribuicoes}
                                    className="mt-2 cursor-pointer text-xs font-bold text-[#b9362d] underline underline-offset-4 hover:no-underline disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Remover função
                                  </button>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <select
                                  aria-label="Membro da linha"
                                  value={
                                    atribuicao.membro?._id ||
                                    atribuicao.membro ||
                                    ""
                                  }
                                  disabled={alterandoAtribuicoes}
                                  onChange={(e) =>
                                    atualizarCelulaAtribuicao(
                                      atribuicao._id,
                                      "membroId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full cursor-pointer rounded-[8px] border-2 border-[#111111] bg-white px-3 py-2 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <option value="">
                                    Sem membro
                                  </option>

                                  {membros.map((membro) => (
                                    <option
                                      key={membro._id}
                                      value={membro._id}
                                    >
                                      {membro.usuario?.nome ||
                                        membro.nome ||
                                        membro.usuario
                                          ?.email ||
                                        membro.email ||
                                        "Usuário"}
                                    </option>
                                  ))}
                                </select>
                                {atribuicao.membro && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      atualizarCelulaAtribuicao(
                                        atribuicao._id,
                                        "membroId",
                                        ""
                                      )
                                    }
                                    disabled={alterandoAtribuicoes}
                                    className="mt-2 cursor-pointer text-xs font-bold text-[#b9362d] underline underline-offset-4 hover:no-underline disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Remover membro
                                  </button>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removerLinhaAtribuicao(
                                      atribuicao._id
                                    )
                                  }
                                  disabled={alterandoAtribuicoes}
                                  className="cursor-pointer text-sm font-bold text-[#b9362d] underline underline-offset-4 hover:no-underline disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Remover linha
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-4 py-5 text-sm text-[#686864]">
                    Ainda não há linhas. Adicione uma para começar a montar o rodízio.
                  </p>
                )}
              </section>

              <form
                id="editar-detalhes-rodizio"
                onSubmit={salvarDetalhesRodizio}
                className="grid gap-4 sm:grid-cols-3"
              >
                <div>
                  <label
                    htmlFor="ciclo-rodizio-editado"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
                  >
                    Tipo do ciclo
                  </label>

                  <select
                    id="ciclo-rodizio-editado"
                    value={cicloEditado}
                    onChange={(e) =>
                      setCicloEditado(e.target.value)
                    }
                    disabled={salvandoDetalhesRodizio}
                    className="w-full cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="Diário">Diário</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Quinzenal">Quinzenal</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="data-inicio-rodizio-editada"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
                  >
                    Data de início
                  </label>

                  <input
                    id="data-inicio-rodizio-editada"
                    type="datetime-local"
                    value={dataInicioEditada}
                    onChange={(e) =>
                      setDataInicioEditada(e.target.value)
                    }
                    disabled={salvandoDetalhesRodizio}
                    className="w-full rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="data-fim-rodizio-editada"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em]"
                  >
                    Data de término
                  </label>

                  <input
                    id="data-fim-rodizio-editada"
                    type="datetime-local"
                    value={dataFimEditada}
                    onChange={(e) =>
                      setDataFimEditada(e.target.value)
                    }
                    disabled={salvandoDetalhesRodizio}
                    className="w-full rounded-[9px] border-2 border-[#111111] bg-white px-3 py-3 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {errorDetalhesRodizio && (
                  <div className="rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-sm font-medium text-[#b9362d] sm:col-span-3">
                    {errorDetalhesRodizio}
                  </div>
                )}
              </form>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRodizioSelecionado(null);
                  setErrorAtribuicoes("");
                  setErrorDetalhesRodizio("");
                }}
                disabled={
                  alterandoAtribuicoes ||
                  salvandoDetalhesRodizio
                }
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-white px-5 font-bold text-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111]"
              >
                Fechar
              </button>
              <button
                type="submit"
                form="editar-detalhes-rodizio"
                disabled={
                  salvandoDetalhesRodizio ||
                  alterandoAtribuicoes
                }
                className="min-h-12 cursor-pointer rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvandoDetalhesRodizio
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}