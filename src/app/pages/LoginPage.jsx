import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, LogIn, UserPlus, Building2, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { createEntrepreneurRequest, loginRequest } from '../utils/api';
import { saveSession } from '../utils/session';

const cardClass =
  'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(27,58,95,0.12)]';
const accentButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)] disabled:cursor-not-allowed disabled:opacity-70';
const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#152E4D] hover:shadow-[0_4px_12px_rgba(27,58,95,0.25)] disabled:cursor-not-allowed disabled:opacity-70';
const outlineButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]';
const smallOutlineButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius)] border-2 border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]';
const fieldClass =
  'w-full rounded-r-[var(--radius)] border border-l-0 border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]';
const iconWrapClass =
  'flex items-center justify-center rounded-l-[var(--radius)] border border-r-0 border-[var(--border)] bg-[var(--card)] px-4';
const labelClass = 'mb-2 block font-semibold text-[var(--foreground)]';
const alertBaseClass = 'mt-4 rounded-[var(--radius)] border px-4 py-3 text-sm';

const initialRequestForm = {
  nombre: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  direccion: '',
  telefono: '',
  correo: '',
};

function Field({ icon: Icon, id, label, type = 'text', value, onChange, placeholder, required = true }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="flex">
        <span className={iconWrapClass}>
          <Icon size={18} color="var(--muted-foreground)" />
        </span>
        <input
          type={type}
          className={fieldClass}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
    </div>
  );
}

export function LoginPage() {
  const [loginType, setLoginType] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [requestFormVisible, setRequestFormVisible] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const navigate = useNavigate();

  const loginTitle = useMemo(() => {
    if (loginType === 'admin') return 'Acceso Administrativo';
    if (loginType === 'entrepreneur') return 'Acceso Emprendedor';
    return '';
  }, [loginType]);

  const updateRequestField = (field) => (event) => {
    setRequestForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const resetRequestFeedback = () => {
    setRequestError('');
    setRequestSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const session = await loginRequest({
        correo: email.trim(),
        password,
        rol: loginType,
      });

      saveSession(session);

      if (session?.user?.rol === 'admin') {
        navigate('/admin');
        return;
      }

      if (session?.user?.rol === 'entrepreneur') {
        navigate('/dashboard');
        return;
      }

      navigate('/');
    } catch (error) {
      setLoginError(error.message || 'No fue posible iniciar sesión con esas credenciales.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleEntrepreneurRequest = async (event) => {
    event.preventDefault();
    resetRequestFeedback();
    setRequestLoading(true);

    try {
      await createEntrepreneurRequest({
        nombre: requestForm.nombre.trim(),
        tipoDocumento: requestForm.tipoDocumento.trim(),
        numeroDocumento: requestForm.numeroDocumento.trim(),
        direccion: requestForm.direccion.trim(),
        telefono: requestForm.telefono.trim(),
        correo: requestForm.correo.trim(),
      });

      setRequestSuccess(
        'Tu solicitud fue enviada correctamente. El administrador revisará la información y te contactará cuando sea aprobada.',
      );
      setRequestForm(initialRequestForm);
      setRequestFormVisible(false);
    } catch (error) {
      setRequestError(error.message || 'No se pudo enviar la solicitud en este momento.');
    } finally {
      setRequestLoading(false);
    }
  };

  if (!loginType) {
    return (
      <div className="flex min-h-screen items-center bg-[var(--ivory)] px-6 py-8 lg:px-8">
        <div className="w-full">
          <div className="mb-8 flex justify-end">
            <Link to="/" className={outlineButtonClass}>
              Volver al portal
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4">Inicio de sesión</h1>
            <p className="text-lg text-[var(--muted-foreground)]">
              Selecciona el tipo de cuenta con el que deseas ingresar.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-[1100px] grid-cols-1 justify-center gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div
                className={`${cardClass} flex h-full cursor-pointer flex-col items-center text-center`}
                onClick={() => {
                  setLoginError('');
                  setLoginType('entrepreneur');
                }}
              >
                <div
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <User size={40} color="var(--accent-foreground)" />
                </div>
                <h2 className="mb-4">Emprendedor</h2>
                <p className="mb-6 text-[1.0625rem] text-[var(--muted-foreground)]">
                  Accede a tu panel para gestionar tu emprendimiento, productos y revisar el estado de tus publicaciones.
                </p>
                <div className={`${accentButtonClass} mt-auto w-full`}>Continuar como emprendedor</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              <div
                className={`${cardClass} flex h-full cursor-pointer flex-col items-center text-center`}
                onClick={() => {
                  setLoginError('');
                  setLoginType('admin');
                }}
              >
                <div
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Building2 size={40} color="var(--primary-foreground)" />
                </div>
                <h2 className="mb-4">Administrador</h2>
                <p className="mb-6 text-[1.0625rem] text-[var(--muted-foreground)]">
                  Panel institucional para aprobar solicitudes, administrar usuarios y moderar el contenido del portal.
                </p>
                <div className={`${primaryButtonClass} mt-auto w-full`}>Continuar como administrador</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <div className={`${cardClass} mx-auto max-w-[720px] text-center`}>
              <h3 className="mb-4 text-xl">¿Eres un nuevo emprendedor?</h3>
              <p className="mb-6 text-[var(--muted-foreground)]">
                Registra tu solicitud para que el equipo institucional valide tu información y habilite tu acceso al portal.
              </p>

              <div className="flex flex-col items-center gap-4">
                <button
                  className={outlineButtonClass}
                  onClick={() => {
                    resetRequestFeedback();
                    setRequestFormVisible((current) => !current);
                  }}
                  type="button"
                >
                  <UserPlus size={20} />
                  Solicitar registro
                </button>

                {requestError ? (
                  <div className={`${alertBaseClass} w-full max-w-[560px] border-red-200 bg-red-50 text-red-700`}>
                    {requestError}
                  </div>
                ) : null}

                {requestSuccess ? (
                  <div className={`${alertBaseClass} w-full max-w-[560px] border-emerald-200 bg-emerald-50 text-emerald-700`}>
                    {requestSuccess}
                  </div>
                ) : null}
              </div>

              {requestFormVisible ? (
                <form onSubmit={handleEntrepreneurRequest} className="mt-8 space-y-4 text-left">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      icon={User}
                      id="request-name"
                      label="Nombre completo"
                      value={requestForm.nombre}
                      onChange={updateRequestField('nombre')}
                      placeholder="Nombre del solicitante"
                    />
                    <Field
                      icon={Mail}
                      id="request-email"
                      label="Correo electrónico"
                      type="email"
                      value={requestForm.correo}
                      onChange={updateRequestField('correo')}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                    <div>
                      <label htmlFor="request-document-type" className={labelClass}>
                        Tipo de documento
                      </label>
                      <select
                        id="request-document-type"
                        className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]"
                        value={requestForm.tipoDocumento}
                        onChange={updateRequestField('tipoDocumento')}
                        required
                      >
                        <option value="CC">CC</option>
                        <option value="CE">CE</option>
                        <option value="NIT">NIT</option>
                        <option value="TI">TI</option>
                      </select>
                    </div>
                    <Field
                      icon={CreditCard}
                      id="request-document-number"
                      label="Número de documento"
                      value={requestForm.numeroDocumento}
                      onChange={updateRequestField('numeroDocumento')}
                      placeholder="Ingresa tu número de documento"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      icon={Phone}
                      id="request-phone"
                      label="Teléfono"
                      value={requestForm.telefono}
                      onChange={updateRequestField('telefono')}
                      placeholder="Número de contacto"
                    />
                    <Field
                      icon={MapPin}
                      id="request-address"
                      label="Dirección"
                      value={requestForm.direccion}
                      onChange={updateRequestField('direccion')}
                      placeholder="Dirección del emprendimiento"
                    />
                  </div>

                  <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
                    <button
                      type="button"
                      className={smallOutlineButtonClass}
                      onClick={() => setRequestFormVisible(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className={accentButtonClass} disabled={requestLoading}>
                      <UserPlus size={18} />
                      {requestLoading ? 'Enviando solicitud...' : 'Enviar solicitud'}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center bg-[var(--ivory)] px-6 py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[620px]">
        <div className="mb-8 flex justify-end">
          <Link to="/" className={outlineButtonClass}>
            Volver al portal
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={cardClass}>
            <div className="mb-6 text-center">
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: loginType === 'admin' ? 'var(--primary)' : 'var(--accent)' }}
              >
                {loginType === 'admin' ? (
                  <Building2 size={40} color="var(--primary-foreground)" />
                ) : (
                  <User size={40} color="var(--accent-foreground)" />
                )}
              </div>
              <h2 className="mb-2">{loginTitle}</h2>
              <p className="text-[var(--muted-foreground)]">Ingresa tus credenciales reales para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Field
                icon={Mail}
                id="email"
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />

              <Field
                icon={Lock}
                id="password"
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />

              {loginError ? (
                <div className={`${alertBaseClass} border-red-200 bg-red-50 text-red-700`}>{loginError}</div>
              ) : null}

              <button
                type="submit"
                className={`${loginType === 'admin' ? primaryButtonClass : accentButtonClass} w-full`}
                disabled={loginLoading}
              >
                <LogIn size={20} />
                {loginLoading ? 'Validando acceso...' : 'Iniciar sesión'}
              </button>

              <button type="button" onClick={() => setLoginType(null)} className={`${outlineButtonClass} w-full`}>
                Volver
              </button>
            </form>

            {loginType === 'entrepreneur' ? (
              <div className="mt-6 text-center">
                <p className="mb-2 text-sm text-[var(--muted-foreground)]">¿Aún no tienes cuenta aprobada?</p>
                <button
                  className={smallOutlineButtonClass}
                  type="button"
                  onClick={() => {
                    setLoginType(null);
                    setRequestFormVisible(true);
                    resetRequestFeedback();
                  }}
                >
                  Solicitar registro
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
