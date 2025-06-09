import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/style/login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setsenha] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        senha: senha, // O backend espera "senha", então use este nome
      });
        
      // Salvar token no localStorage para futuras requisições protegidas
      localStorage.setItem('token', response.data.token);
      navigate('/index');
      alert('Login realizado com sucesso!');
    } catch (error) {
      alert('Erro no login: ' + (error.response?.data?.mensagem || 'Erro desconhecido'), console);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header-section">
          <h1 className="header-title">
            JOB ROTATION <i className="fas fa-sync-alt refresh-icon"></i>
          </h1>
        </div>

        <div className="welcome-section">
          <div className="welcome-text">Olá, bem-vindo(a) de volta!</div>
        </div>

        <div className="form-section">
          <form id="loginForm" onSubmit={handleSubmit}>
            <div className="form-floating with-icon mb-3">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
                placeholder="Digite seu e-mail"
              />
              <label htmlFor="email">Digite seu e-mail</label>
            </div>

            <div className="form-floating with-icon mb-3">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="senha"
                id="senha"
                value={senha}
                onChange={(e) => setsenha(e.target.value)}
                required
                className="form-control"
                placeholder="Digite sua senha"
              />
              <label htmlFor="senha">Digite sua senha</label>
            </div>

            <a href="#" className="forgot-senha">Esqueci senha</a>

            <button type="submit" className="login-btn">LOGIN</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;