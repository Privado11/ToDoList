import React, { useState } from "react";
import { AppProvider, SignInPage } from "@toolpad/core";
import { useTheme, ThemeProvider } from "@mui/material/styles";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Link } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import "../../styles/OAuthSignInPage.css";

const providers = [
  { id: "credentials", name: "Email and Password" },
  { id: "google", name: "Google" },
  { id: "facebook", name: "Facebook" },
];

function SignUpLink() {
  return (
    <Link href="/" variant="body2">
      Sign up
    </Link>
  );
}

function ForgotPasswordLink() {
  return (
    <Link href="/" variant="body2">
      Forgot password?
    </Link>
  );
}

const OAuthSignInPage = () => {
  const { signInWithGoogle, signInWithFacebook, user } = useAuth();
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const signIn = async (provider) => {
    try {
      if (!captchaToken) {
        setError("Please complete the captcha.");
        return;
      }

      console.log(`Iniciando sesión con ${provider.name}...`);
      if (provider.id === "google") await signInWithGoogle();
      if (provider.id === "facebook") await signInWithFacebook();
      console.log(`Sesión iniciada con éxito usando ${provider.name}`);
      console.log("Usuario:", user);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <div className="oauth-signin-container">
          {" "}
          <SignInPage signIn={signIn} providers={providers} />
          <div className="register">
            <span>
              Need an account? <a href="/signup">Sign Up</a>{" "}
            </span>
          </div>
          <div className="captcha">
            <HCaptcha
              sitekey="054036b2-e3e0-4f7e-b022-e4201422b476"
              onVerify={(token) => setCaptchaToken(token)}
              onError={() => setError("Captcha error. Please try again.")}
            />
          </div>
          {error && <p>{error}</p>}
        </div>
      </AppProvider>
    </ThemeProvider>
  );
};

export default OAuthSignInPage;
