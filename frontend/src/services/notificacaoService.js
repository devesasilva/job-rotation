import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API;

const getConfig = () => {
  const token = localStorage.getItem("token");

  return {
    withCredentials: true,
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  };
};

export const listarNotificacoes = (
  pagina = 1,
  limite = 20,
  naoLidas = false
) =>
  axios.get(
    `${API}/api/notificacoes`,
    {
      ...getConfig(),
      params: {
        pagina,
        limite,
        naoLidas: naoLidas ? "true" : undefined,
      },
    }
  ).then((response) => response.data);

export const contarNaoLidas = () =>
  axios.get(
    `${API}/api/notificacoes/nao-lidas`,
    getConfig()
  ).then((response) => response.data.total);

export const marcarNotificacaoComoLida = (id) =>
  axios.patch(
    `${API}/api/notificacoes/${id}/lida`,
    {},
    getConfig()
  ).then((response) => response.data);

export const marcarTodasNotificacoesComoLidas = () =>
  axios.patch(
    `${API}/api/notificacoes/lidas`,
    {},
    getConfig()
  ).then((response) => response.data);

export const limparTodasNotificacoes = () =>
  axios.delete(
    `${API}/api/notificacoes`,
    getConfig()
  ).then((response) => response.data);

export const criarStreamNotificacoes = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  return new EventSource(
    `${API}/api/notificacoes/stream?token=${encodeURIComponent(token)}`
  );
};
