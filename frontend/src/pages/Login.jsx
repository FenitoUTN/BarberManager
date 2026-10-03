import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, MotionConfig } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { ScissorsIcon } from '../components/BarberIcons';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Input from '../components/ui/Input';

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
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen bg-canvas">
        {/* Panel izquierdo - Branding. Vive sobre tinta, igual que el sidebar. */}
        <div className="relative hidden overflow-hidden bg-ink lg:flex lg:w-1/2 items-center justify-center">
          <div className="brand-weave absolute inset-0" />

          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brass/40 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brass/40 to-transparent" />
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-brass/30 to-transparent" />

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
              className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-brass/40 bg-brass/10 shadow-raised"
            >
              <ScissorsIcon className="h-12 w-12 text-brass" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-display text-5xl font-bold text-on-ink"
            >
              Kenneth&apos;s
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-1 text-sm font-medium uppercase tracking-[0.35em] text-brass"
            >
              Barber Shop
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="my-8 h-px w-48 bg-gradient-to-r from-transparent via-brass/60 to-transparent"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="max-w-xs text-sm leading-relaxed text-on-ink-muted"
            >
              Donde el estilo se encuentra con la tradición. Reservá tu cita y viví la experiencia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-10 flex items-center gap-6 text-on-ink-muted"
            >
              <div className="flex flex-col items-center">
                <span className="font-display text-2xl text-brass tabular">5+</span>
                <span className="mt-1 text-2xs">Años</span>
              </div>
              <div className="h-8 w-px bg-on-ink/20" />
              <div className="flex flex-col items-center">
                <span className="font-display text-2xl text-brass tabular">500+</span>
                <span className="mt-1 text-2xs">Clientes</span>
              </div>
              <div className="h-8 w-px bg-on-ink/20" />
              <div className="flex flex-col items-center">
                <span className="font-display text-2xl text-brass tabular">4.9</span>
                <span className="mt-1 text-2xs">Rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Puntos decorativos: no portan información, por eso quedan fuera del flujo. */}
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-16 h-2 w-2 rounded-full bg-brass/40"
          />
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-32 right-20 h-3 w-3 rounded-full bg-brass/30"
          />
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/3 right-12 h-1.5 w-1.5 rounded-full bg-brass/35"
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
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-brass/40 bg-brass-soft">
                <ScissorsIcon className="h-8 w-8 text-brass" />
              </div>
              <h1 className="font-display text-3xl text-ink">Kenneth&apos;s</h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-brass">
                Barber Shop
              </p>
            </motion.div>

            <div className="mb-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="font-display text-3xl text-ink"
              >
                Bienvenido
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-2 text-sm text-ink-muted"
              >
                Ingresá a tu cuenta para gestionar tus citas
              </motion.p>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <Field label="Correo electrónico" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </Field>

              <Field label="Contraseña" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" loading={submitting} fullWidth>
                {submitting ? 'Ingresando' : 'Iniciar sesión'}
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-line" />
                <span className="text-2xs text-ink-subtle">o</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <p className="text-center text-sm text-ink-muted">
                ¿No tenés cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-brand underline decoration-brand-line underline-offset-4 transition-colors duration-(--duration-fast) ease-out hover:text-brand-deep hover:decoration-brand"
                >
                  Registrate gratis
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default Login;
