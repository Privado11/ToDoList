import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./ToastContext";
import { TodoProvider } from "./TodoContext";

export const CombinedProviders = ({ children }) => (
  <AuthProvider>
    <ToastProvider>
      <TodoProvider>{children}</TodoProvider>
    </ToastProvider>
  </AuthProvider>
);
