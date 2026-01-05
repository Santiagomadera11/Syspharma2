import React from 'react';
import { AppRouter } from './routes/AppRouter';

function App() {
  return (
    <div className="app-container">
      {/* Aquí cargamos todo el sistema de rutas */}
      <AppRouter />
    </div>
  );
}

export default App;