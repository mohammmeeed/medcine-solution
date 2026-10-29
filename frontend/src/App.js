import React, { Component } from "react";
import Markup from "./jsx";

import "./css/style.css";
import "./css/modern-cabinet-ui.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "20px", fontFamily: "sans-serif" }}>
          <div style={{ maxWidth: "480px", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <h4 style={{ color: "#0f2b48", fontWeight: 700, marginBottom: "10px" }}>Session actualisée</h4>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
              Une modification DOM externe (traducteur ou extension) a été neutralisée.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                padding: "12px 24px",
                background: "#1e60d5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Recharger l'interface
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <Markup />
    </ErrorBoundary>
  );
};

export default App;
