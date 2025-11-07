// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || '/';

function UnderlineInput({ id, label, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-b-2 focus:border-gray-500 outline-none py-2 placeholder:text-gray-300 text-gray-700"
      />
    </div>
  );
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !senha) {
      setErrorMsg('Preencha email e senha.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}api/auth/login`, { email, senha }, { withCredentials: true });
      // Se seu backend retorna token:
      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      // opcional: salvar user
      // localStorage.setItem('user', JSON.stringify(res.data.user || null));
      navigate('/index');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pt-2">
      <div className="mb-4">
        <UnderlineInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="meuemail@example.com"
        />
        <UnderlineInput
          id="senha"
          label="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="********"
        />
      </div>

      {errorMsg && <div className="text-center text-sm text-red-600 mb-4">{errorMsg}</div>}

      <div className="mb-6 flex justify-between items-center">
        <a href="#" className="text-sm text-gray-400 hover:underline">Esqueci a senha</a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#07020d] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:opacity-95 transition disabled:opacity-60"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}