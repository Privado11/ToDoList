import React from "react";
import waveImg from "../../../assets/wave.png";
import "../../../styles/Header.css";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { useAuthLogic } from "@/components/hooks/useAuth";

function Header({user}) {
   const { signOut } = useAuthLogic(); 
   const navigate = useNavigate();

   const handleLogout = async () => {
     try {
       await signOut();
       navigate("/login");
     } catch (error) {
       console.error("Error al cerrar sesión:", error.message);
     }
   };
  
  return (
    <header>
      <div>
        <div className="welcome">
          <p>
            Welcome!
            <img src={waveImg} alt="wave" />
          </p>
          <h2>{user?.user_metadata?.full_name || "Guest"}</h2>
        </div>
      </div>

      <button onClick={handleLogout} className="logout-button">
        {<IoIosLogOut />}
      </button>
    </header>
  );
}

export { Header };
