import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../axios-client.js';
import { Chart, registerables } from 'chart.js';

export default function Estatisticas() {
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState('Todos');
  const [userNames, setUserNames] = useState([]);
  const [barbeiroUsers, setBarbeiroUsers] = useState([]);
  const [marcacaos, setMarcacaos] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    getUsers();
    getMarcacaos();
  }, []);

  const getUsers = () => {
    setLoading(true);
    axiosClient
      .get('/users?tipo=Barbeiro')
      .then(({ data }) => {
        setLoading(false);
        const barbeiroUsers = data.data.filter(user => user.tipo === 'Barbeiro');
        const names = barbeiroUsers.map(user => user.name);
        setUsersList(names);
        setUserNames(names);
        setBarbeiroUsers(barbeiroUsers);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getMarcacaos = () => {
    setLoading(true);
    axiosClient
      .get('/marcacaos')
      .then(({ data }) => {
        setLoading(false);
        setMarcacaos(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const filteredUsers = selectedUser === 'Todos' ? barbeiroUsers : barbeiroUsers.filter(user => user.name === selectedUser);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const labels = filteredUsers.map(user => user.name);
      const data = filteredUsers.map(user =>
        (marcacaos.filter(marcacao => marcacao.idBarbeiro === user.id && marcacao.estado === 'Concluído').length / marcacaos.filter(marcacao => marcacao.estado === 'Concluído').length) * 100
      );      

      // Registrar o tipo de gráfico "doughnut" manualmente
      Chart.register(...registerables);

      // Verificar se há um gráfico existente e destruí-lo
      const existingChart = Chart.getChart(ctx);
      if (existingChart) {
        existingChart.destroy();
      }

      const backgroundColors = barbeiroUsers.map((_, index) => `hsl(${(index * 360) / barbeiroUsers.length}, 70%, 50%)`);

      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'My Dataset',
              data: data,
              backgroundColor: backgroundColors,
            },
          ],
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = labels[context.dataIndex];
                  const percentage = data[context.dataIndex];
                  return `${label}: ${percentage.toFixed(2)}%`;
                },
              },
            },
          },
        },
      });;
    }
  }, [filteredUsers, marcacaos]);

  return (
    <div style={{ marginLeft: '100px', marginRight: '100px' }}>
      <h2>Estatísticas</h2>
      <br />
      <div className="card-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="card">
          <h4>Barbeiros</h4>
          <select className="btn-marcacao1" style={{ textAlign: 'center' }} value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
            <option value="Todos">Todos</option>
            {userNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>

          <div className="card animated fadeInDown">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Barbeiro</th>
                  <th>Marcações concluídas</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{marcacaos.filter(marcacao => marcacao.idBarbeiro === user.id && marcacao.estado === 'Concluído').length}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', marginTop:'100px', marginBottom:'100px' }}>
          <div style={{ width: '400px', height: '400px' }}>
            <canvas ref={chartRef}></canvas>
          </div>
          </div>
        </div>
        <div className="card">
          <h4>Produtos</h4>
        </div>
      </div>
    </div>
  );
}
