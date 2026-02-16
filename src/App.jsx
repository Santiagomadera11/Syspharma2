import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { CartProvider } from './shared/context/CartContext';
import CartDrawer from './features/landing/components/CartDrawer';

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
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <div className="app-container">
          {/* Aquí cargamos todo el sistema de rutas */}
          <AppRouter />
          <CartDrawer />
        </div>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
