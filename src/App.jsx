import React, { useEffect } from "react";
import { AppRouter } from "./routes/AppRouter";
import { CartProvider } from "./shared/context/CartContext";
import CartDrawer from "./features/landing/components/CartDrawer";
import { ToastHost } from "./shared/ui/ToastHost";
import { authService } from "./features/auth/authService";
import { usePermissionsSync } from "./hooks/usePermissionsSync";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "red", color: "white" }}>
          <h1>Error in React App!</h1>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  usePermissionsSync(); // 🔄 Sincronizar permisos cada 30 segundos

  useEffect(() => {
    const user = authService.getCurrentUser();
    const token = sessionStorage.getItem("syspharma_token");

    // Recargar permisos para mantener la sesión sincronizada con la base de datos
    if (token && user) {
      authService.recargarPermisos();
    }
  }, []);

  return (
    <ErrorBoundary>
      <CartProvider>
        <div className="app-container">
          <AppRouter />
          <ToastHost />
          <CartDrawer />
        </div>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;