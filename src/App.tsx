import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Billing from './pages/Billing';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Salaries from './pages/Salaries';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import { useAppStore } from './store/useAppStore';

const Login = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-3xl font-black text-center mb-6 tracking-tighter text-primary-600 uppercase italic">
        BHUMIKA GARMENTS
      </h2>
      <div className="space-y-4">
        <div className="text-center text-sm text-slate-500 mb-4">Admin Dashboard Login</div>
        <button 
          onClick={() => window.location.href = '/'} 
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
        >
          Enter Shop Dashboard
        </button>
      </div>
    </div>
  </div>
);

function App() {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/salaries" element={<Salaries />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
