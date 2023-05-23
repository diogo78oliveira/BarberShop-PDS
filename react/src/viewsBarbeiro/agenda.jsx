import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import emailjs from 'emailjs-com';
import { parseISO, format } from 'date-fns';

export default function Agenda() {
  const [marcacaos, setMarcacao] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState({});
  const { setNotification } = useStateContext();
  const { id } = useParams();

  const getCliente = (marcacoes) => {
    const clienteIds = [...new Set(marcacoes.map((marcacao) => marcacao.idCliente))];
    const promises = clienteIds.map((id) => axiosClient.get(`/users/${id}`));
    Promise.all(promises)
      .then((responses) => {
        const newClientes = {};
        responses.forEach((response) => {
          newClientes[response.data.id] = response.data.name;
        });
        setClientes(newClientes);
      })
      .catch(() => {
        setClientes({});
      });
  };

  const getMarcacoes = () => {
    setLoading(true);
    axiosClient
      .get("/marcacaos")
      .then(({ data }) => {
        setLoading(false);
        setMarcacao(data.data);
        getCliente(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getMarcacoes();
  }, []);

  const concluirMarcacao = (marcacao) => {
    axiosClient
      .put(`/marcacaos/${marcacao.id}`, { estado: "Concluído" })
      .then(() => {
        setNotification("Marcação concluída com sucesso");
        getMarcacoes();
      })
      .catch(() => {
        setNotification("Ocorreu um erro ao concluir a marcação");
      });
  };

  const onDeleteClick = (marcacao) => {
    if (!window.confirm("Tem a certeza de que deseja cancelar esta marcação?")) {
      return;
    }
  
    axiosClient
      .delete(`/marcacaos/${marcacao.id}`)
      .then(() => {
        setNotification("Marcação cancelada com sucesso");
        getMarcacoes();
  
        axiosClient.get(`/users/${marcacao.idCliente}`)
          .then(response => {
            const clientEmail = response.data.email;
  
            axiosClient.get(`/users/${marcacao.idBarbeiro}`)
              .then(response => {
                const nomeBarbeiro = response.data.name;
  
                const templateParams = {
                  to_email: clientEmail,
                  subject: "Marcação cancelada",
                  message: `A sua marcação para o serviço ${marcacao.servico} com o barbeiro ${nomeBarbeiro} para o dia ${format(parseISO(marcacao.data), 'dd/MM/yyyy \'às\' HH:mm')} foi cancelada.`,
                };
  
                emailjs.send('service_hgpw1ul', 'template_hjgwdwc', templateParams, '19c0R-gO8pAzmZ2sf')
                  .then((result) => {
                    console.log(result.text);
                  })
                  .catch((error) => {
                    console.log(error.text);
                  });
              })
              .catch(err => console.log(err));
  
          })
          .catch(err => console.log(err));
      })
      .catch(() => {
        setNotification("Ocorreu um erro ao cancelar a marcação");
      });
  };
  

  return (
    <div style={{ marginLeft: "100px", marginRight: "100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>As suas marcações</h2>
      </div>
      &nbsp;
      <div className="card-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        {marcacaos
          .filter((marcacao) => marcacao.idBarbeiro === Number(id) && marcacao.estado === "Ativo")
          .map((marcacao) => (
            <div key={marcacao.id} className="card animated fadeInDown" style={{ padding: "10px", borderRadius: "10px", position: "relative", height:'150px' }}>
              <div style={{ marginBottom: "10px" }}>{`${marcacao.id} - ${clientes[marcacao.idCliente] || "-"}`}</div>
              <div style={{ fontSize: "18px", marginTop: "10px" }}>{marcacao.servico}</div>
              <div style={{ fontSize: "18px", marginTop: "10px" }}>{marcacao.custo} €</div>
              <div style={{ fontSize: "18px", marginTop: "10px" }}>{new Date(marcacao.data).toLocaleString("pt-PT", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}</div>
              <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
                <button onClick={() => concluirMarcacao(marcacao)} className="btn-add" style={{ marginRight: "10px" }}>
                  Concluir
                </button>
                <button onClick={() => onDeleteClick(marcacao)} className="btn-delete">
                  Cancelar
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
