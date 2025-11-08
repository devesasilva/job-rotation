import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_BACKEND_API_URL;

function UnderlineInput({ id, label, type = 'text', value, onChange, placeholder }) {
    return (
        <div className="mb-6">
            <label htmlFor={id} className="block text-sm text-slate-950 mb-1 font-semibold">{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-b-2 focus:border-gray-500 outline-none py-2 placeholder:text-gray-400 text-gray-700"
            />
        </div>
    );
}

export default function RegisterForm() {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!nome || !email || !senha) {
            setErrorMsg('Preencha nome, email e senha.');
            return;
        }

        setLoading(true);
        try {
            const url = `${API}/auth/register`;
            console.log('POST ->', url);

            const res = await axios.post(url, { nome, email, senha }, { withCredentials: true });
            console.log('Resposta do servidor:', res.status, res.data);

            if (res?.data?.token) {
                localStorage.setItem('token', res.data.token);
            }

            navigate('/login');
        } catch (err) {
            console.error('Erro no login (axios):', err);
            if (err.response) {
                setErrorMsg(err.response?.data?.mensagem || err.response?.data?.message || 'Erro no servidor.');
            } else if (err.request) {
                setErrorMsg('Sem resposta do servidor. Verifique a URL e se o servidor está no ar.');
            } else {
                setErrorMsg('Erro ao tentar conectar: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="pt-2">
            <div className="mb-4">
                <UnderlineInput id="nome" label="Nome" type="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Meu nome completo" />
                <UnderlineInput id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="meuemail@example.com" />
                <UnderlineInput id="senha" label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="********" />
            </div>

            {errorMsg && <div className="text-center text-sm text-red-600 mb-4">{errorMsg}</div>}

            <button type="submit" disabled={loading} className="w-full bg-[#07020d] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-gray-800 cursor-pointer transition disabled:opacity-60">
                {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
        </form>
    );
}