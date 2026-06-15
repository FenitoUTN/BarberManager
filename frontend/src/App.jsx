import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientForm from './pages/clients/ClientForm';
import ClientProfile from './pages/clients/ClientProfile';
import Agenda from './pages/appointments/Agenda';
import ServiceList from './pages/services/ServiceList';
import Availability from './pages/availability/Availability';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ApartadoList from './pages/apartados/ApartadoList';
import ApartadoForm from './pages/apartados/ApartadoForm';
import ApartadoDetail from './pages/apartados/ApartadoDetail';
import Reports from './pages/reports/Reports';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/servicios" element={<ServiceList />} />
            <Route path="/productos" element={<ProductList />} />
            <Route path="/apartados" element={<ApartadoList />} />
            <Route path="/apartados/:id" element={<ApartadoDetail />} />

            <Route path="/clientes/:id" element={<ClientProfile />} />

            <Route element={<ProtectedRoute allowedRoles={['admin', 'barbero']} />}>
              <Route path="/clientes" element={<ClientList />} />
              <Route path="/clientes/nuevo" element={<ClientForm />} />
              <Route path="/clientes/:id/editar" element={<ClientForm />} />
              <Route path="/disponibilidad" element={<Availability />} />
              <Route path="/productos/nuevo" element={<ProductForm />} />
              <Route path="/productos/:id/editar" element={<ProductForm />} />
              <Route path="/apartados/nuevo" element={<ApartadoForm />} />
              <Route path="/reportes" element={<Reports />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
