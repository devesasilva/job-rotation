import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmacao: ''
  });
  
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      // Aplicar máscara do CPF
      let maskedValue = value.replace(/\D/g, '');
      maskedValue = maskedValue.replace(/(\d{3})(\d)/, '$1.$2');
      maskedValue = maskedValue.replace(/(\d{3})(\d)/, '$1.$2');
      maskedValue = maskedValue.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      
      setFormData(prev => ({
        ...prev,
        [name]: maskedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxToggle = () => {
    setIsTermsChecked(!isTermsChecked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { nome, sobrenome, cpf, email, senha, confirmacao } = formData;
    
    // Validações
    if (!nome || !sobrenome || !cpf || !email || !senha || !confirmacao) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    
    if (senha !== confirmacao) {
      alert('As senhas não coincidem!');
      return;
    }
    
    if (!isTermsChecked) {
      alert('Você deve concordar com os termos!');
      return;
    }
    
    // Simular cadastro bem-sucedido
    alert(`Conta criada com sucesso!\nBem-vindo(a), ${nome} ${sobrenome}!`);
    
    // Limpar formulário após sucesso
    setFormData({
      nome: '',
      sobrenome: '',
      cpf: '',
      email: '',
      senha: '',
      confirmacao: ''
    });
    setIsTermsChecked(false);
  };

  // Efeitos visuais nos inputs
  useEffect(() => {
    const inputs = document.querySelectorAll('.form-input');
    
    const handleFocus = (e) => {
      e.target.parentElement.style.transform = 'scale(1.02)';
    };
    
    const handleBlur = (e) => {
      e.target.parentElement.style.transform = 'scale(1)';
    };
    
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    });
    
    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      });
    };
  }, []);

  return (
    <div className="app-container">
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <Header />

      <div className="main-content">
        <div className="card">
          <h2 className="card-title">Criar uma conta</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-floating with-icon mb-3">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Digite seu Nome"
              />
              <label htmlFor="nome">Nome</label>
            </div>
            <div className="form-floating with-icon mb-3">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="text"
                id="sobrenome"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Digite seu Nome"
              />
              <label htmlFor="sobrenome">Sobrenome</label>
            </div>
            <div className="form-floating with-icon mb-3">
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="000.000.000-00"
                maxLength="14"
                required
                className="form-control"
              />
              <label htmlFor="cpf">CPF</label>
            </div>
            <div className="form-floating with-icon mb-3">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-control"
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="form-floating with-icon mb-3">
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                required
                className="form-control"
              />
              <label htmlFor="senha">Senha</label>
            </div>
            <div className="form-floating with-icon mb-3">
              <input
                type="password"
                id="confirmacao"
                name="confirmacao"
                value={formData.confirmacao}
                onChange={handleInputChange}
                required
                className="form-control"
              />
              <label htmlFor="confirmacao">Confirmação de Senha</label>
            </div>
           
            <div className="checkbox-container">
              <div 
                className={`checkbox ${isTermsChecked ? 'checked' : ''}`}
                onClick={handleCheckboxToggle}
              />
              <label className="checkbox-label" onClick={handleCheckboxToggle}>
                Eu concordo com os <a href="#" className="terms-link">termos</a>
              </label>
            </div>

            <button type="submit" className="btn-primary">
              REGISTRAR
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;