import { lazy, Suspense, Component } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import RouteFallback from './components/RouteFallback';
import Button from './components/ui/Button';

// Cada página se descarga sólo cuando se visita su ruta. Antes las 16 entraban en un
// único chunk de ~506 kB que TODOS los usuarios pagaban completos, incluyendo la
// biblioteca de animación, que sólo usan Login y Register.
//
// AuthProvider, ProtectedRoute y Layout siguen siendo imports estáticos a propósito: son
// el armazón, se necesitan en el primer render y no tiene sentido descargarlos aparte.
//
// El Suspense va dentro de cada ruta y no rodeando <Routes>. Si envolviera el árbol
// entero, cada navegación borraría el Layout completo y se vería un parpadeo a pantalla
// completa en lugar de cargar sólo el contenido.
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClientList = lazy(() => import('./pages/clients/ClientList'));
const ClientForm = lazy(() => import('./pages/clients/ClientForm'));
const ClientProfile = lazy(() => import('./pages/clients/ClientProfile'));
const Agenda = lazy(() => import('./pages/appointments/Agenda'));
const ServiceList = lazy(() => import('./pages/services/ServiceList'));
const ServiceForm = lazy(() => import('./pages/services/ServiceForm'));
const Availability = lazy(() => import('./pages/availability/Availability'));
const ProductList = lazy(() => import('./pages/products/ProductList'));
const ProductForm = lazy(() => import('./pages/products/ProductForm'));
const ApartadoList = lazy(() => import('./pages/apartados/ApartadoList'));
const ApartadoForm = lazy(() => import('./pages/apartados/ApartadoForm'));
const ApartadoDetail = lazy(() => import('./pages/apartados/ApartadoDetail'));
const Reports = lazy(() => import('./pages/reports/Reports'));

// El code-splitting introduce un modo de falla que antes no existía: si se despliega una
// versión nueva, un cliente con el index.html viejo en caché pide un chunk que ya no
// existe y la descarga falla. Sin este borde la pantalla queda en blanco para siempre,
// sin un solo mensaje. Recargar resuelve el caso porque trae el index.html nuevo.
class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Fallo al cargar un módulo de la aplicación:', error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <h2 className="font-display text-lg text-ink">
          No se pudo cargar esta sección
        </h2>
        <p className="max-w-md text-sm text-ink-muted">
          Puede ser que la aplicación se haya actualizado mientras tenías esta pestaña
          abierta. Recargarla debería resolverlo.
        </p>
        <Button onClick={() => window.location.reload()}>
          Recargar la aplicación
        </Button>
      </div>
    );
  }
}

function lazyPage(PageComponent) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <PageComponent />
      </Suspense>
    </RouteErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={lazyPage(Login)} />
        <Route path="/register" element={lazyPage(Register)} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={lazyPage(Dashboard)} />
            <Route path="/agenda" element={lazyPage(Agenda)} />
            <Route path="/servicios" element={lazyPage(ServiceList)} />
            <Route path="/productos" element={lazyPage(ProductList)} />
            <Route path="/apartados" element={lazyPage(ApartadoList)} />
            <Route path="/apartados/:id" element={lazyPage(ApartadoDetail)} />

            <Route path="/clientes/:id" element={lazyPage(ClientProfile)} />

            <Route element={<ProtectedRoute allowedRoles={['admin', 'barbero']} />}>
              <Route path="/clientes" element={lazyPage(ClientList)} />
              <Route path="/clientes/nuevo" element={lazyPage(ClientForm)} />
              <Route path="/clientes/:id/editar" element={lazyPage(ClientForm)} />
              <Route path="/disponibilidad" element={lazyPage(Availability)} />
              <Route path="/servicios/nuevo" element={lazyPage(ServiceForm)} />
              <Route path="/servicios/:id/editar" element={lazyPage(ServiceForm)} />
              <Route path="/productos/nuevo" element={lazyPage(ProductForm)} />
              <Route path="/productos/:id/editar" element={lazyPage(ProductForm)} />
              <Route path="/apartados/nuevo" element={lazyPage(ApartadoForm)} />
              <Route path="/reportes" element={lazyPage(Reports)} />
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