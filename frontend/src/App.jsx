import { useState, useEffect } from 'react';
import './App.css'; // Lembre-se de colar aquele CSS de Fintech aqui depois!

function App() {
  const [valor, setValor] = useState('');
  const [cupom, setCupom] = useState('0');
  const [tipoCliente, setTipoCliente] = useState('Normal');
  const [historico, setHistorico] = useState([]);
  const [resultadoAtual, setResultadoAtual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [atualizarLista, setAtualizarLista] = useState(0);

  // URL centralizada para facilitar a troca para a nuvem
  const API_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const response = await fetch(`${API_URL}/api/historico`);
        const data = await response.json();
        setHistorico(data);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      }
    };
    carregarHistorico();
  }, [atualizarLista]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/cashback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          valor: parseFloat(valor), 
          cupom: parseFloat(cupom),
          tipo_cliente: tipoCliente 
        })
      });
      
      const data = await response.json();
      setResultadoAtual(data);
      setValor('');
      setCupom('0');
      setAtualizarLista(prev => prev + 1); 
    } catch (error) {
      console.error("Erro ao calcular cashback:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Cashback Fintech</h1>
        <p>Simule seu retorno financeiro com precisão.</p>
      </header>

      <main className="main-content">
        <div className="card form-card">
          <h2>Nova Simulação</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Valor da Compra Original (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0.1"
                value={valor} 
                onChange={(e) => setValor(e.target.value)} 
                placeholder="Ex: 150.00" 
                required 
              />
            </div>

            <div className="input-group">
              <label>Cupom de Desconto</label>
              <select value={cupom} onChange={(e) => setCupom(e.target.value)}>
                <option value="0">Sem cupom</option>
                <option value="5">5% de desconto</option>
                <option value="10">10% de desconto</option>
                <option value="15">15% de desconto</option>
                <option value="20">20% de desconto</option>
              </select>
            </div>

            <div className="input-group">
              <label>Tipo de Cliente</label>
              <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)}>
                <option value="Normal">Normal</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Calculando...' : 'Calcular Cashback'}
            </button>
          </form>

          {resultadoAtual !== null && (
            <div className="result-box">
              <h3>Resumo da Compra</h3>
              <p>Valor Final (c/ desconto): {formatarMoeda(resultadoAtual.valor_final)}</p>
              <h3 style={{ marginTop: '10px' }}>Você ganhou</h3>
              <span className="cashback-value">{formatarMoeda(resultadoAtual.cashback)}</span>
            </div>
          )}
        </div>

        <div className="card history-card">
          <h2>Seu Histórico</h2>
          {historico.length === 0 ? (
            <p className="empty-state">Nenhuma simulação realizada ainda.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Valor (Final)</th>
                    <th>Cashback</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`badge ${item.tipo_cliente.toLowerCase()}`}>
                          {item.tipo_cliente}
                        </span>
                      </td>
                      <td>{formatarMoeda(item.valor_compra)}</td>
                      <td className="highlight">{formatarMoeda(item.valor_cashback)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;