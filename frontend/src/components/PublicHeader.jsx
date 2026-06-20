import { useNavigate } from "react-router-dom";
import logo from "../assets/sunrise.png";

const PublicHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      <header className="public-header">
        {/* LEFT - LOGO */}
        <div className="header-left">
          <img
            src="./auth-website/frontend/src/assets/sunrise_logo2.png"
            alt="Sunrise Agri Products"
            className="logo"
            onClick={() => navigate("/")}
          />
        </div>

        {/* CENTER - TITLE */}
        <div className="header-center">
          <h2>Our Company Reviews</h2>
        </div>

        {/* RIGHT - AUTH BUTTONS */}
        <div className="header-right">
          <button
            className="login-btn"
            onClick={() => navigate("/auth/select-role?type=login")}
          >
            Login
          </button>

          <button
            className="signup-btn"
            onClick={() => navigate("/auth/select-role?type=signup")}
          >
            Signup
          </button>
        </div>
      </header>

      <style>{`

      .public-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:12px 20px;
        background:#ffffff;
        box-shadow:0 2px 6px rgba(0,0,0,0.08);
        position:sticky;
        top:0;
        z-index:100;
      }

      .header-left{
        display:flex;
        align-items:center;
      }

      .logo{
        height:50px;
        cursor:pointer;
      }

      .header-center{
        flex:1;
        text-align:center;
      }

      .header-center h2{
        font-size:20px;
        color:#2c3e50;
      }

      .header-right{
        display:flex;
        gap:10px;
      }

      .login-btn{
        padding:8px 18px;
        border-radius:6px;
        border:1px solid #007bff;
        background:white;
        color:#007bff;
        cursor:pointer;
      }

      .signup-btn{
        padding:8px 18px;
        border-radius:6px;
        border:none;
        background:#28a745;
        color:white;
        cursor:pointer;
      }

      .login-btn:hover{
        background:#007bff;
        color:white;
      }

      .signup-btn:hover{
        background:#218838;
      }

      /* MOBILE */

      @media(max-width:768px){

        .header-center h2{
          font-size:16px;
        }

        .logo{
          height:40px;
        }

        .login-btn,
        .signup-btn{
          padding:6px 12px;
          font-size:12px;
        }

      }

      `}</style>
    </>
  );
};

export default PublicHeader;
