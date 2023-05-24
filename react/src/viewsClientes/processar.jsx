import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import { useNavigate } from "react-router-dom";


export default function Processar() {
  const [carrinho, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setNotification } = useStateContext();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [metodoEnvio, setMetodoEnvio] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const totalSteps = 3;
  const [morada, setMorada] = useState("");
  const [nif, setNif] = useState("");

  const getCarrinho = () => {
    setLoading(true);
    axiosClient
      .get('/carrinhos')
      .then(({ data }) => {
        setLoading(false);
        setUsers(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };


  const [showAdditionalStep, setShowAdditionalStep] = useState(false);

  useEffect(() => {
    getCarrinho();
  }, []);

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleMetodoEnvioChange = (event) => {
    setMetodoEnvio(event.target.value);
    setShowAdditionalStep(event.target.value === "method1"); // "method1" represents Domiciliario
  };

  const handleMetodoPagamentoChange = (event) => {
    setMetodoPagamento(event.target.value);
  };

  

  

  const renderStep1 = () => {
    const onUpdateSubmit = (event) => {
      event.preventDefault();
  
      // Filter the carrinhos based on the condition (estado = "carrinho" and idCliente matches the current user)
      const filteredCarrinhos = carrinho.filter(
        (carrinho) => carrinho.estado === "carrinho" && carrinho.idCliente === Number(id)
      );
  
      // Update the morada and nif for each filtered carrinho
      filteredCarrinhos.forEach((carrinho) => {
        // Update the morada and nif values for the current carrinho
        carrinho.morada = morada;
        carrinho.nif = nif;
  
        // Send the updated carrinho data to the server for storage or further processing
        axiosClient.put(`/carrinhos/${carrinho.id}`, carrinho)
          .then(() => {
            setNotification('Carrinho atualizado com sucesso');
          })
          .catch((error) => {
            console.log('Error updating carrinho:', error);
          });
      });
      

    }
    return (
      <div>
        <h3>Envio</h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>
            <input
              type="radio"
              name="deliverMethod"
              value="method1"
              checked={metodoEnvio === "method1"}
              onChange={handleMetodoEnvioChange}
            />{" "}
            Domiciliário
          </label>
          <label>
            <input
              type="radio"
              name="deliverMethod"
              value="method2"
              checked={metodoEnvio === "method2"}
              onChange={handleMetodoEnvioChange}
            />{" "}
            Na Loja
          </label>
        </div>
  
        {showAdditionalStep && (
          <form onSubmit={onUpdateSubmit}>
          <div>
            <label htmlFor="morada">Morada:</label>
            <input
              type="text"
              id="morada"
              name="morada"
              value={morada}
              onChange={(e) => setMorada(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="nif">NIF:</label>
            <input
              type="text"
              id="nif"
              name="nif"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-finalizar">Guardar dados</button>
        </form>
        )}
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div>
        <h3>Pagamento</h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="method1"
              checked={metodoPagamento === "method1"}
              onChange={handleMetodoPagamentoChange}
            />{" "}
            Visa
            <img
              src="../src/img/visa.png"
              alt="Carrinho"
              width="30"
              height="23"
              className="image-with-border"
            />
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="method2"
              checked={metodoPagamento === "method2"}
              onChange={handleMetodoPagamentoChange}
            />{" "}
            MasterCard
            <img
              src="../src/img/mastercard.png"
              alt="Carrinho"
              width="30"
              height="23"
              className="image-with-border"
            />
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="method3"
              checked={metodoPagamento === "method3"}
              onChange={handleMetodoPagamentoChange}
            />{" "}
            Multibanco
            <img
              src="../src/img/multibanco.png"
              alt="Carrinho"
              width="30"
              height="23"
              className="image-with-border"
            />
          </label>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const filteredCarrinho = carrinho.filter((carrinho) => carrinho.idCliente === Number(id));
  
    return (
      <div>
        <h3>Pagina de rever o pedido</h3>
        <h3>O botao de finalizar compra simula como se ele tivesse pago e muda o estado na db de "carrinho" para "encomenda"</h3>
       
      </div>
    );
  };

  const renderSteps = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  const renderNextButton = () => {
    if (currentStep < totalSteps) {
      return (
        <button onClick={handleNextStep} className="btn-finalizar">
          Próximo
        </button>
      );
    }
    return null;
  };

  const renderPreviousButton = () => {
    if (currentStep > 1) {
      return (
        <button onClick={handlePreviousStep} className="btn-finalizar" style={{marginRight: "10px"}}>
          Anterior
        </button>
      );
    }
    return null;
  };

  const navigate = useNavigate();

  const handleFinalizarEncomenda = (event) => {
    event.preventDefault();

    // Filter the carrinhos based on the condition (estado = "carrinho" and idCliente matches the current user)
    const filteredCarrinhos = carrinho.filter(
      (carrinho) => carrinho.estado === "carrinho" && carrinho.idCliente === Number(id)
    );

    // Update the morada and nif for each filtered carrinho
    filteredCarrinhos.forEach((carrinho) => {
      // Update the morada and nif values for the current carrinho
      carrinho.estado = "Pago";
      
      // Send the updated carrinho data to the server for storage or further processing
      axiosClient.put(`/carrinhos/${carrinho.id}`, carrinho)
        .then(() => {
          setNotification('Carrinho atualizado com sucesso');
          navigate(`/carrinho/${id}`);
        })
        .catch((error) => {
          console.log('Error updating carrinho:', error);
        });
    });
    

  }
  
  const renderFinishButton = () => {
    if (currentStep === totalSteps) {
      return (
        <button className="btn-finalizar" onClick={handleFinalizarEncomenda}>
          Finalizar Encomenda
        </button>
      );
    }
    return null;
  };

  return (
    
    <div>
      
      <h1>Processar Encomenda</h1>
      <div className="progress-bar">
        <div className="steps">
          <div className={`step ${currentStep === 1 ? "active" : ""}`}></div>
          <div className={`step ${currentStep === 2 ? "active" : ""}`}></div>
          <div className={`step ${currentStep === 3 ? "active" : ""}`}></div>
        </div>
      </div>
      <div className="form-container">{renderSteps()}</div>
      <div className="button-container">
        {renderPreviousButton()}
        {renderNextButton()}
        {renderFinishButton()}
      </div>
    </div>
  );
}

