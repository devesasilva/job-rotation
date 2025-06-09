import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Importa o useNavigate
import './Header.css';
import '../../assets/style/login.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // inicializa o hook

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (item) => {
    if (item === 'Sair') {
      // Remove o token e redireciona para login
      localStorage.removeItem('token');
      navigate('/login');
    }else if (item === 'Cadastro'){
      //
      navigate('/register')
    }
     else {
      alert(`Navegando para: ${item}`);
      setTimeout(() => setIsMenuOpen(false), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={`sidebar ${isMenuOpen ? 'active' : ''}`}>
        <ul className="sidebar-menu">
          <li><a href="#" onClick={() => handleMenuItemClick('Perfil')}>👤 Meu Perfil</a></li>
          <li><a href="#" onClick={() => handleMenuItemClick('Cadastro')}>⚙️ Cadastro</a></li>
          <li><a href="#" onClick={() => handleMenuItemClick('Histórico')}>📊 Histórico de Rotações</a></li>
          <li><a href="#" onClick={() => handleMenuItemClick('Ajuda')}>❓ Ajuda</a></li>
          <li><a href="#" onClick={() => handleMenuItemClick('Sobre')}>ℹ️ Sobre</a></li>
          <li><a href="#" onClick={() => handleMenuItemClick('Sair')} className="exit-item">🚪 Sair</a></li>
        </ul>
      </div>

      {/* Header */}
      <div className="header">
        <div className="logo">
          JOB ROTATION
          <div className="refresh-icon" />
        </div>
        <div 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <div className="menu-line" />
          <div className="menu-line" />
          <div className="menu-line" />
        </div>
      </div>
    </>
  );
};

export default Header;
