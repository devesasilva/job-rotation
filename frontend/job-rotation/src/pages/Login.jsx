import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:3001/auth/login',
                { email, senha },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            localStorage.setItem('token', response.data.token);
            navigate('/nomequalquer');
        } catch (error) {
            let errorMessage = 'Erro no login';

            if (error.response) {
                errorMessage = error.response.data.mensagem ||
                    error.response.data.message ||
                    `Erro ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'Servidor não respondeu. Verifique sua conexão.';
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-lg" style={{ width: '400px' }}>
                <h2 className="text-center mb-3">JOB ROTATION</h2>
                <p className="text-center">Olá, bem-vindo(a) de volta!</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Digite seu e-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-control"
                            placeholder="Digite seu e-mail"
                            autoComplete="username"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Digite sua senha</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            className="form-control"
                            placeholder="Digite sua senha"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'CARREGANDO...' : 'LOGIN'}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <a href="/esqueci-senha" className="text-decoration-none">Esqueci senha</a>
                </div>
            </div>
        </div>
    );
}

export default Login;