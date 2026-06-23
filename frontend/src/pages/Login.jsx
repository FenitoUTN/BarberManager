import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ScissorsIcon, GoldDivider } from '../components/BarberIcons';

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
      setError(err.response?.data?.message || 'No fue posible iniciar sesion');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0c0c] px-4">
      <div className="w-full max-w-sm rounded-xl border border-gold-800/30 bg-[#141414] p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold-600/40 bg-gold-400/10">
            <ScissorsIcon className="h-7 w-7 text-gold-400" />
          </div>
          <h1 className="font-serif text-2xl text-gold-400">BarberManager</h1>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            Kenneth&apos;s Barber
          </p>
          <GoldDivider className="mt-5 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Correo electronico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-neutral-700/50 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-700/50 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg border border-gold-600/60 bg-gold-600/20 py-2.5 text-sm font-semibold uppercase tracking-wider text-gold-400 transition hover:bg-gold-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Ingresando...' : 'Iniciar sesion'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-gold-400 hover:text-gold-300">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
