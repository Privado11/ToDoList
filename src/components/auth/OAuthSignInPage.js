import * as React from "react";
import { AppProvider, SignInPage } from "@toolpad/core";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Button,
  Link,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Visibility, VisibilityOff, AccountCircle } from "@mui/icons-material";
import "../../styles/OAuthSignInPage.css";
import { useAuth } from "../context/AuthContext";

// Proveedores de autenticación
const providers = [
  { id: "credentials", name: "Email and Password" },
  { id: "google", name: "Google" },
  { id: "facebook", name: "Facebook" },
];

// Tema personalizado
const theme = createTheme({
  typography: {
    h5: { fontSize: "2rem" },
    body1: { fontSize: "1.25rem" },
    body2: { fontSize: "1.25rem" },
  },
  components: {
    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: "1.25rem" },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "1.25rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1976d2",
          },
        },
        notchedOutline: { borderColor: "#ccc" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1.25rem",
          padding: "12px 24px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        wrapper: { fontSize: "1.3rem" },
      },
    },
  },
});



// Enlace para registrarse
function SignUpLink() {
  return (
    <Link href="/" variant="body2">
      Sign up
    </Link>
  );
}

// Enlace para recuperar contraseña
function ForgotPasswordLink() {
  return (
    <Link href="/" variant="body2">
      Forgot password?
    </Link>
  );
}



const OAuthSignInPage = () => {
  const { signInWithGoogle, signInWithFacebook, user } = useAuth();

  const signIn = async (provider) => {
    try {
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
        <SignInPage
          signIn={signIn}
          providers={providers}
          slots={{
            signUpLink: SignUpLink,
            forgotPasswordLink: ForgotPasswordLink,
          }}
        />
      </AppProvider>
    </ThemeProvider>
  );
};

export default OAuthSignInPage;
