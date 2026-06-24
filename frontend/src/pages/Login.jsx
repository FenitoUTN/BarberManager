import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { ScissorsIcon } from '../components/BarberIcons';

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
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Panel izquierdo - Branding */}
      <div className="hidden relative overflow-hidden lg:flex lg:w-1/2 items-center justify-center bg-[#0c0c0c]">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #c9a96e 0, #c9a96e 1px, transparent 0, transparent 50%)',
          backgroundSize: '24px 24px',
        }} />

        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-gold-500/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center px-12 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 100 }}
            className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold-500/30 bg-gold-400/5 shadow-[0_0_60px_rgba(201,169,110,0.1)]"
          >
            <ScissorsIcon className="h-12 w-12 text-gold-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-serif text-5xl font-bold text-gold-400"
          >
            Kenneth&apos;s
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-1 text-sm font-medium uppercase tracking-[0.35em] text-gold-600"
          >
            Barber Shop
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="my-8 h-px w-48 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="max-w-xs text-sm leading-relaxed text-neutral-500"
          >
            Donde el estilo se encuentra con la tradicion. Reserva tu cita y vive la experiencia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-10 flex items-center gap-6 text-neutral-600"
          >
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl text-gold-400">5+</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest">Anos</span>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl text-gold-400">500+</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest">Clientes</span>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl text-gold-400">4.9</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest">Rating</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-16 h-2 w-2 rounded-full bg-gold-500/20"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-32 right-20 h-3 w-3 rounded-full bg-gold-500/10"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/3 right-12 h-1.5 w-1.5 rounded-full bg-gold-500/15"
        />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Logo mobile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-col items-center lg:hidden"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/30 bg-gold-400/5">
              <ScissorsIcon className="h-8 w-8 text-gold-400" />
            </div>
            <h1 className="font-serif text-3xl text-gold-400">Kenneth&apos;s</h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-gold-600">Barber Shop</p>
          </motion.div>

          <div className="mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="font-serif text-3xl text-white"
            >
              Bienvenido
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-2 text-sm text-neutral-500"
            >
              Ingresa a tu cuenta para gestionar tus citas
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Correo electronico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-300 focus:border-gold-500/50 focus:bg-neutral-900 focus:shadow-[0_0_20px_rgba(201,169,110,0.05)]"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Contrasena
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-300 focus:border-gold-500/50 focus:bg-neutral-900 focus:shadow-[0_0_20px_rgba(201,169,110,0.05)]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 py-3.5 text-sm font-bold uppercase tracking-wider text-black shadow-lg shadow-gold-500/10 transition-all duration-300 hover:shadow-gold-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Ingresando...' : 'Iniciar sesion'}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-800" />
              <span className="text-xs text-neutral-600">o</span>
              <div className="h-px flex-1 bg-neutral-800" />
            </div>

            <p className="text-center text-sm text-neutral-500">
              No tienes cuenta?{' '}
              <Link to="/register" className="font-semibold text-gold-400 transition-colors hover:text-gold-300">
                Registrate gratis
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
