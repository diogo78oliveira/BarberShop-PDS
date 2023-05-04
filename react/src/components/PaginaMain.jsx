import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client.js";
import { useEffect } from "react";

export default function PaginaMain() {
  const { user, token, setUser, setToken, notification } = useStateContext();

  if (!token) {
    return <Navigate to="/login" />;
  }

  const onLogout = (ev) => {
    ev.preventDefault();

    axiosClient.post("/logout").then(() => {
      setUser({});
      setToken(null);
    });
  };

  useEffect(() => {
    axiosClient.get("/user").then(({ data }) => {
      setUser(data);
    });
  }, []);

  // Only return the page if the user is of tipo "admin"
  if (user.tipo == "admin") {
    return (
      <div id="defaultLayout">
        <aside>
          <Link to="/users">Barbeiros</Link>
          <Link to="/stock">Stock</Link>
          <Link to="/pedidos">Pedidos</Link>
          <Link to="/estatisticas">Estatísticas</Link>
        </aside>
        <div className="content">
          <header>
          <div>
      <img
        src="../src/img/IPCA-BarberShop.png"
        alt="Imagem de login"
        className="imagem-login"
        style={{ width: '170px', height: '90px'}}
      />
    </div>
  
            <div>
              
              {user.name} &nbsp; &nbsp;
              <a onClick={onLogout} className="btn-logout" href="#">
                Terminar sessão
              </a>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
          {notification && (
            <div className="notification">{notification}</div>
          )}
        </div>
      </div>
    );


  } else if (user.tipo == "Barbeiro") {

    return (
      <div id="defaultLayout">
        <aside>
          <Link to="/agenda">Marcações</Link>
         
        </aside>
        <div className="content">
          <header>
          <div>
      <img
        src="../src/img/IPCA-BarberShop.png"
        alt="Imagem de login"
        className="imagem-login"
        style={{ width: '170px', height: '90px'}}
      />
    </div>
  
            <div>
              {user.name} &nbsp; &nbsp;
              <a onClick={onLogout} className="btn-logout" href="#">
                Terminar sessão
              </a>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
          {notification && (
            <div className="notification">{notification}</div>
          )}
        </div>
      </div>
    );


  } else if (user.tipo == "Cliente") {

    return (
      <div id="defaultLayout">
        <aside>
          <Link to="/paginainicial">Página Inicial</Link>
          <Link to="/marcacoes">Marcações</Link>
          <Link to="/produtos">Produtos</Link>
          <Link to="/contactos">Contactos</Link>
         
         
        </aside>
        <div className="content">
          <header>
          <div>
      <img
        src="../src/img/IPCA-BarberShop.png"
        alt="Imagem de login"
        className="imagem-login"
        style={{ width: '170px', height: '90px'}}
      />
    </div>
  
            <div>
              {user.name} &nbsp; &nbsp;
              <a onClick={onLogout} className="btn-logout" href="#">
                Terminar sessão
              </a>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
          {notification && (
            <div className="notification">{notification}</div>
          )}
        </div>
      </div>
    );

  }
  }

  