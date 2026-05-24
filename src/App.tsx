import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LotesForm } from './components/LotesForm';
import { VentasForm } from './components/VentasForm';
import { Busqueda } from './components/Busqueda';
import { CamionesForm } from './components/CamionesForm';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'lotes':
        return <LotesForm />;
      case 'ventas':
        return <VentasForm />;
      case 'busqueda':
        return <Busqueda />;
      case 'camiones':
        return <CamionesForm />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
