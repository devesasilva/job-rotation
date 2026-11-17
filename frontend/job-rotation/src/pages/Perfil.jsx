import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  obterAvatar,
  cadastrarAvatar,
  substituirAvatar,
  excluirAvatar,
} from "../services/avatarService";

const API = import.meta.env.VITE_BACKEND_API || "http://localhost:3000";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Perfil() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Foto persistida e prévia
  const [avatarPersistido, setAvatarPersistido] = useState(null); // { avatarUrl, contentType, size, updatedAt }
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Status do Azure Blob Storage
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageReason, setStorageReason] = useState("");

  // Modais e feedbacks
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  // Logout
  const [saindo, setSaindo] = useState(false);

  // Cleanup de object URL ao desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    setLoading(true);
    setMensagemErro("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // 1. Carrega dados do usuário
      const usuarioRes = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuario(usuarioRes.data);

      // 2. Carrega foto de perfil e status do Azure
      try {
        const avatarRes = await obterAvatar();
        setAvatarPersistido(avatarRes.avatar || null);
        setStorageAvailable(avatarRes.storageAvailable !== false);
        setStorageReason(avatarRes.storageReason || "");
      } catch (err) {
        if (err.response?.status === 503) {
          setStorageAvailable(false);
          setStorageReason(
            err.response?.data?.mensagem ||
              "Armazenamento de fotos temporariamente indisponível."
          );
        } else {
          console.warn("Não foi possível obter dados do avatar:", err);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setMensagemErro(
        error.response?.data?.mensagem || "Não foi possível carregar o perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  const renovarSasUrl = async () => {
    try {
      const avatarRes = await obterAvatar();
      if (avatarRes.avatar?.avatarUrl) {
        setAvatarPersistido(avatarRes.avatar);
      }
    } catch (err) {
      console.warn("Falha ao renovar URL SAS do avatar:", err);
    }
  };

  const obterIniciais = (nome = "") => {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return "?";
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMensagemErro("");
    setMensagemSucesso("");

    // Validação imediata no navegador
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMensagemErro("Formato não suportado. Por favor, envie uma imagem JPEG, PNG ou WebP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMensagemErro("A imagem selecionada excede o limite máximo permitido de 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setArquivoSelecionado(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelarSelecao = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setArquivoSelecionado(null);
    setPreviewUrl(null);
    setMensagemErro("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSalvarFoto = async () => {
    if (!arquivoSelecionado) return;
    if (!storageAvailable) {
      setMensagemErro("O serviço de fotos está desabilitado no momento.");
      return;
    }

    setSaving(true);
    setMensagemErro("");
    setMensagemSucesso("");

    try {
      let resultado;
      const temFotoPrevia = Boolean(avatarPersistido && (avatarPersistido.avatarUrl || avatarPersistido.contentType));

      try {
        if (temFotoPrevia) {
          resultado = await substituirAvatar(arquivoSelecionado);
        } else {
          resultado = await cadastrarAvatar(arquivoSelecionado);
        }
      } catch (reqError) {
        // Se tentou POST e deu 409 (já existe foto no banco), faz fallback para PUT
        if (reqError.response?.status === 409) {
          resultado = await substituirAvatar(arquivoSelecionado);
        } else if (reqError.response?.status === 404) {
          // Se tentou PUT e deu 404 (não existe foto no banco), faz fallback para POST
          resultado = await cadastrarAvatar(arquivoSelecionado);
        } else {
          throw reqError;
        }
      }

      setAvatarPersistido(resultado.avatar || resultado);
      setMensagemSucesso("Foto de perfil atualizada com sucesso!");
      handleCancelarSelecao();
    } catch (error) {
      const msg =
        error.response?.data?.mensagem ||
        "Não foi possível salvar a foto de perfil.";
      setMensagemErro(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    setDeleting(true);
    setMensagemErro("");
    setMensagemSucesso("");

    try {
      await excluirAvatar();
      setAvatarPersistido(null);
      handleCancelarSelecao();
      setModalExcluirAberto(false);
      setMensagemSucesso("Foto de perfil removida com sucesso!");
    } catch (error) {
      setMensagemErro(
        error.response?.data?.mensagem || "Não foi possível remover a foto."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    if (saindo) return;
    setSaindo(true);

    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API}/auth/logout`,
          {},
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fotoExibida = previewUrl || avatarPersistido?.avatarUrl;

  return (
    <div className="min-h-screen bg-[#f3f0e6] text-[#111111]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b-2 border-[#111111] bg-white/95 backdrop-blur-[10px]">
        <div className="mx-auto flex h-[72px] w-[min(1160px,calc(100%-40px))] items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/main")}
              className="flex items-center gap-2 rounded-[9px] border-2 border-[#111111] bg-white px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#111111]"
              title="Voltar para Minhas Organizações"
            >
              ← Painel
            </button>
            <span className="font-['Space_Grotesk',Arial,sans-serif] text-base font-bold tracking-tight sm:text-lg">
              JOB ROTATION
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[#111111]">
                {usuario?.nome || "Usuário"}
              </p>
              <p className="text-[11px] text-[#686864]">{usuario?.email}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={saindo}
              title="Sair da conta"
              className="flex h-[38px] cursor-pointer items-center gap-2 rounded-[9px] border-2 border-[#111111] bg-white px-3 text-xs font-bold text-[#b9362d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff1ef] hover:shadow-[2px_2px_0_#111111] disabled:opacity-60"
            >
              {saindo ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto w-[min(800px,calc(100%-40px))] py-10 sm:py-14">
        {/* TÍTULO */}
        <section className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffd84d]" />
            Configurações da conta
          </div>

          <h1 className="font-['Space_Grotesk',Arial,sans-serif] text-[clamp(32px,5vw,52px)] font-bold leading-tight tracking-[-0.04em]">
            Meu Perfil.
          </h1>
          <p className="mt-2 text-base text-[#686864]">
            Gerencie sua foto de perfil armazenada de forma segura na nuvem.
          </p>
        </section>

        {/* FEEDBACK DE SUCESSO */}
        {mensagemSucesso && (
          <div
            role="alert"
            className="mb-6 rounded-[12px] border-2 border-[#111111] bg-[#dff5b5] px-4 py-3 text-sm font-bold text-[#111111] shadow-[4px_4px_0_#111111]"
          >
            ✓ {mensagemSucesso}
          </div>
        )}

        {/* FEEDBACK DE ERRO */}
        {mensagemErro && (
          <div
            role="alert"
            className="mb-6 rounded-[12px] border-2 border-[#ff6b5f] bg-[#fff1ef] px-4 py-3 text-sm font-medium text-[#b9362d]"
          >
            ✕ {mensagemErro}
          </div>
        )}

        {/* AVISO DE STORAGE DESABILITADO */}
        {!storageAvailable && (
          <div
            role="alert"
            className="mb-6 rounded-[14px] border-2 border-[#111111] bg-[#ffe082] p-4 text-[#111111] shadow-[4px_4px_0_#111111]"
          >
            <div>
              <p className="font-bold">Armazenamento em nuvem temporariamente indisponível</p>
              <p className="mt-1 text-xs text-[#424242]">
                {storageReason ||
                  "A conexão com o Azure Blob Storage não está configurada ou está offline. O envio e a alteração de fotos de perfil foram desabilitados temporariamente."}
              </p>
            </div>
          </div>
        )}

        {/* CARD PRINCIPAL */}
        <div className="rounded-[18px] border-2 border-[#111111] bg-white p-6 shadow-[5px_5px_0_#111111] sm:p-8">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <p className="font-semibold text-[#686864]">Carregando dados do perfil...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              {/* ÁREA DA FOTO / AVATAR */}
              <div className="flex flex-col items-center gap-4 sm:flex-shrink-0">
                <div className="relative">
                  {fotoExibida ? (
                    <img
                      src={fotoExibida}
                      alt={`Foto de perfil de ${usuario?.nome || "usuário"}`}
                      onError={renovarSasUrl}
                      className="h-32 w-32 rounded-full border-4 border-[#111111] object-cover shadow-[4px_4px_0_#111111]"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={`Avatar com iniciais de ${usuario?.nome || "usuário"}`}
                      className="grid h-32 w-32 place-items-center rounded-full border-4 border-[#111111] bg-[#ffd84d] font-['Space_Grotesk',Arial,sans-serif] text-4xl font-bold shadow-[4px_4px_0_#111111]"
                    >
                      {obterIniciais(usuario?.nome)}
                    </div>
                  )}

                  {previewUrl && (
                    <span className="absolute -bottom-2 -right-2 rounded-full border-2 border-[#111111] bg-[#ff6b5f] px-2 py-0.5 text-[10px] font-bold text-white shadow-[2px_2px_0_#111111]">
                      Prévia
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-[#686864]">
                    {previewUrl
                      ? "Prévia selecionada"
                      : avatarPersistido?.avatarUrl
                      ? "Foto ativa salva no Azure"
                      : "Sem foto cadastrada"}
                  </p>
                  {avatarPersistido?.updatedAt && !previewUrl && (
                    <p className="text-[10px] text-[#9e9e9e]">
                      Atualizada em:{" "}
                      {new Date(avatarPersistido.updatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>

              {/* CONTROLES E FORMULÁRIO */}
              <div className="flex flex-1 flex-col gap-5">
                <div>
                  <h2 className="font-['Space_Grotesk',Arial,sans-serif] text-xl font-bold">
                    {usuario?.nome || "Usuário"}
                  </h2>
                  <p className="text-sm text-[#686864]">{usuario?.email}</p>
                </div>

                <hr className="border-t-2 border-[#f0f0ed]" />

                {/* SELETOR DE IMAGEM */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="avatar-file-input"
                    className="text-xs font-bold uppercase tracking-wider text-[#111111]"
                  >
                    Selecionar nova imagem
                  </label>

                  <input
                    id="avatar-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={!storageAvailable || saving || deleting}
                    onChange={handleFileChange}
                    className="block w-full cursor-pointer text-xs text-[#686864] file:mr-4 file:rounded-[9px] file:border-2 file:border-[#111111] file:bg-[#ffd84d] file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#111111] hover:file:bg-[#ffe270] disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <p className="text-[11px] text-[#686864]">
                    Formatos aceitos: <strong>JPEG, PNG ou WebP</strong>. Tamanho máximo:{" "}
                    <strong>5 MB</strong>.
                  </p>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {/* SALVAR */}
                  {previewUrl && (
                    <>
                      <button
                        type="button"
                        onClick={handleSalvarFoto}
                        disabled={saving || !storageAvailable}
                        className="flex items-center gap-2 rounded-[10px] border-2 border-[#111111] bg-[#dff5b5] px-4 py-2 text-xs font-bold text-[#111111] shadow-[3px_3px_0_#111111] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
                            Enviando para Azure...
                          </>
                        ) : (
                          <>Salvar foto</>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelarSelecao}
                        disabled={saving}
                        className="rounded-[10px] border-2 border-[#111111] bg-white px-4 py-2 text-xs font-bold text-[#111111] shadow-[3px_3px_0_#111111] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {/* REMOVER FOTO */}
                  {!previewUrl && avatarPersistido?.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setModalExcluirAberto(true)}
                      disabled={deleting || !storageAvailable}
                      className="rounded-[10px] border-2 border-[#ff6b5f] bg-[#fff1ef] px-4 py-2 text-xs font-bold text-[#b9362d] shadow-[3px_3px_0_#ff6b5f] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffe4e1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleting ? "Removendo..." : "Remover foto"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {modalExcluirAberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-excluir"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
        >
          <div className="w-full max-w-[420px] rounded-[18px] border-2 border-[#111111] bg-white p-6 shadow-[6px_6px_0_#111111]">
            <h3
              id="titulo-modal-excluir"
              className="font-['Space_Grotesk',Arial,sans-serif] text-lg font-bold text-[#111111]"
            >
              Remover foto de perfil?
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-[#686864]">
              Esta ação excluirá permanentemente o arquivo do Azure Blob Storage e sua conta
              voltará a exibir o avatar com suas iniciais. Deseja continuar?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalExcluirAberto(false)}
                disabled={deleting}
                className="rounded-[9px] border-2 border-[#111111] bg-white px-4 py-2 text-xs font-bold text-[#111111] shadow-[2px_2px_0_#111111] hover:-translate-y-0.5 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmarExclusao}
                disabled={deleting}
                className="rounded-[9px] border-2 border-[#111111] bg-[#ff6b5f] px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0_#111111] hover:-translate-y-0.5 disabled:opacity-50"
              >
                {deleting ? "Excluindo..." : "Sim, remover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
