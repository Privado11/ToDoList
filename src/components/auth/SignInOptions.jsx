import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const providers = [
  { id: 1, name: "Google" },
  { id: 2, name: "Facebook" },
  { id: 3, name: "Guest" },
];

function SignInOptions({ changeToPasswordScreen }) {
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState("");

  const handleSignIn = async (provider) => {
    try {
      if (provider.id === 1) await signInWithGoogle();
      if (provider.id === 2) await signInWithFacebook();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    changeToPasswordScreen(email); 
  };

  return (
    <div className="signin-container">
      {providers.map((provider) => (
        <button
          key={provider.id}
          className="signin-button"
          onClick={() => handleSignIn(provider)}
        >
          <img
            src={`https://www.${provider.name}.com/favicon.ico`}
            alt={provider.name}
          />
          Sign In {provider.id !== 3 ? "With" : "As"} {provider.name}
        </button>
      ))}

      <div className="divider">
        <span className="divider-text">or</span>
      </div>

      <form className="signin-form" onSubmit={handleEmailSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="submit-button">
          Next
        </button>
      </form>
    </div>
  );
}

export { SignInOptions };
