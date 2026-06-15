import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarberPoleIcon, FlameDivider, FlameIcon } from '../components/BarberIcons';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blood-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
      <FlameIcon className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 text-blood-900/30" />
      <FlameIcon className="pointer-events-none absolute -right-12 top-0 h-72 w-72 rotate-12 text-gold-900/20" />

      <div className="relative w-full max-w-sm rounded-2xl border border-gold-900/40 bg-neutral-950 p-8 shadow-2xl shadow-black/60">
        <div className="h-1 -mx-8 -mt-8 mb-6 rounded-t-2xl barber-stripes" />
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-600 bg-black shadow-lg shadow-black/60">
            <BarberPoleIcon className="h-10 w-10 text-blood-500" />
          </div>
          <h1 className="font-gothic text-3xl text-gold-400 text-glow-gold">BarberManager</h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-blood-400">
            Kenneth's Barber
          </p>
          <FlameDivider className="mt-4 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gradient-to-r from-blood-700 to-gold-700 py-2.5 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-black/50 transition hover:from-blood-600 hover:to-gold-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-gold-500 hover:text-gold-400">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
