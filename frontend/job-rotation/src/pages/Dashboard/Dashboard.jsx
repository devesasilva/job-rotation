import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // redireciona se não logado
    }
  }, [navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rodizios, setRodizios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRodizios = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/rodizios/listar');
        const data = await response.json();
        setRodizios(data);
      } catch (err) {
        setError('Erro ao carregar os rodízios. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchRodizios();
  }, []);

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <Header />

      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <aside className={`sidebar bg-white shadow-sm ${sidebarOpen ? 'd-block' : 'd-none d-lg-block'}`} style={{ width: '250px' }}>
          <nav className="p-4">
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <a
                  className="nav-link active d-flex align-items-center"
                  href="#"
                  style={{
                    color: '#8B5CF6',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <span className="me-2">📊</span>
                  Dashboard
                </a>
              </li>
              {/* Outros links */}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow-1 p-4" style={{ backgroundColor: '#F8FAFC' }}>
          <div className="container-fluid">
            {/* Page Title */}
            <header className="row mb-4">
              <div className="col">
                <h1 className="text-dark fw-bold">Dashboard</h1>
                <p className="text-muted">Bem-vindo de volta! Aqui está um resumo dos rodízios ativos.</p>
              </div>
            </header>

            {loading ? (
              <div className="text-center">Carregando...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
                {rodizios.length === 0 ? (
                  <p>Nenhum rodízio encontrado.</p>
                ) : (
                  rodizios.map((rodizio) => (
                    <div key={rodizio._id} className="card mb-4 shadow-sm" style={{ borderRadius: '15px' }}>
                      <div className="card-body">
                        <h3 className="card-title">{rodizio.nome}</h3>
                        <p className="text-muted">{rodizio.descricao}</p>

                        <h5>Setor</h5>
                        <p><strong>{rodizio.setor.nome}</strong>: {rodizio.setor.descricao}</p>

                        <h5>Membros</h5>
                        <ul>
                          {rodizio.membros.map(({ usuario, funcao, _id }) => (
                            <li key={_id}>
                              {usuario.nome} ({usuario.email}) - <em>{funcao}</em>
                            </li>
                          ))}
                        </ul>

                        <h5>Necessidades</h5>
                        <ul>
                          {rodizio.necessidades.map(({ habilidade, formacao, quantidade, _id }) => (
                            <li key={_id}>
                              {habilidade} ({formacao}) - Quantidade: {quantidade}
                            </li>
                          ))}
                        </ul>

                        <p>
                          <strong>Período:</strong> {new Date(rodizio.dataInicio).toLocaleDateString()} até {new Date(rodizio.dataFim).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
