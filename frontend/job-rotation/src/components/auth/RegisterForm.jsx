import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_API;

function UnderlineInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#111111]"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border-0 border-b-2 border-[#deded9] bg-transparent px-0 py-3 text-[15px] text-[#111111] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#111111]"
      />
    </div>
  );
}

export default function RegisterForm() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nome || !email || !senha) {
      setErrorMsg("Preencha nome, email e senha.");
      return;
    }

    setLoading(true);

    try {
      const url = `${API}/auth/register`;

      console.log("POST ->", url);

      const res = await axios.post(
        url,
        { nome, email, senha },
        { withCredentials: true }
      );

      console.log("Resposta do servidor:", res.status, res.data);

      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      navigate("/login");
    } catch (err) {
      console.error("Erro no cadastro (axios):", err);

      if (err.response) {
        setErrorMsg(
          err.response?.data?.mensagem ||
            err.response?.data?.message ||
            "Erro no servidor."
        );
      } else if (err.request) {
        setErrorMsg(
          "Sem resposta do servidor. Verifique a URL e se o servidor está no ar."
        );
      } else {
        setErrorMsg("Erro ao tentar conectar: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pt-1">
      <UnderlineInput
        id="nome"
        label="Nome"
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu nome completo"
      />

      <UnderlineInput
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
      />

      <UnderlineInput
        id="senha"
        label="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="********"
      />

      {errorMsg && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-[#ff6b5f] bg-[#fff1ef] px-3 py-2 text-center text-sm font-medium text-[#b9362d]"
        >
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-[9px] border-2 border-[#111111] bg-[#111111] px-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {loading ? "Cadastrando..." : "Criar minha conta →"}
      </button>

      <p className="mt-5 text-center text-sm text-[#686864]">
        Já tem uma conta?{" "}
        <Link
          to="/login"
          className="font-bold text-[#111111] underline decoration-[#ffd84d] decoration-2 underline-offset-4 transition-colors hover:text-[#686864]"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}