import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, LogIn, UserPlus, Building2, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { changeMyPasswordRequest, createEntrepreneurRequest, createPasswordResetRequest, loginRequest } from '../utils/api';
import { saveSession, updateSessionUser, clearSession } from '../utils/session';

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

const initialPasswordRequestForm = {
  nombre: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  direccion: '',
  telefono: '',
  correo: '',
};

const initialPasswordResetForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
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
  const [passwordResetVisible, setPasswordResetVisible] = useState(false);
  const [passwordResetForm, setPasswordResetForm] = useState(initialPasswordResetForm);
  const [passwordResetError, setPasswordResetError] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordRequestVisible, setPasswordRequestVisible] = useState(false);
  const [passwordRequestForm, setPasswordRequestForm] = useState(initialPasswordRequestForm);
  const [passwordRequestError, setPasswordRequestError] = useState('');
  const [passwordRequestSuccess, setPasswordRequestSuccess] = useState('');
  const [passwordRequestLoading, setPasswordRequestLoading] = useState(false);
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

  const updatePasswordResetField = (field) => (event) => {
    setPasswordResetForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setPasswordResetError('');
  };

  const updatePasswordRequestField = (field) => (event) => {
    setPasswordRequestForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setPasswordRequestError('');
    setPasswordRequestSuccess('');
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

      if (session?.user?.rol === 'entrepreneur' && session?.user?.mustChangePassword) {
        setPasswordResetForm({
          currentPassword: password,
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordResetError('');
        setPasswordResetVisible(true);
        return;
      }

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

  const handleFirstPasswordChange = async (event) => {
    event.preventDefault();
    setPasswordResetError('');

    if (!passwordResetForm.currentPassword.trim() || !passwordResetForm.newPassword.trim() || !passwordResetForm.confirmPassword.trim()) {
      setPasswordResetError('Debes completar todos los campos para continuar.');
      return;
    }

    if (passwordResetForm.newPassword !== passwordResetForm.confirmPassword) {
      setPasswordResetError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setPasswordResetLoading(true);

    try {
      await changeMyPasswordRequest({
        currentPassword: passwordResetForm.currentPassword,
        newPassword: passwordResetForm.newPassword,
      });

      updateSessionUser({ mustChangePassword: false });
      setPasswordResetVisible(false);
      setPasswordResetForm(initialPasswordResetForm);
      navigate('/dashboard');
    } catch (error) {
      setPasswordResetError(error.message || 'No fue posible actualizar la contraseña.');
    } finally {
      setPasswordResetLoading(false);
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

  const handlePasswordRequest = async (event) => {
    event.preventDefault();
    setPasswordRequestError('');
    setPasswordRequestSuccess('');
    setPasswordRequestLoading(true);

    try {
      await createPasswordResetRequest({
        nombre: passwordRequestForm.nombre.trim(),
        tipoDocumento: passwordRequestForm.tipoDocumento.trim(),
        numeroDocumento: passwordRequestForm.numeroDocumento.trim(),
        direccion: passwordRequestForm.direccion.trim(),
        telefono: passwordRequestForm.telefono.trim(),
        correo: passwordRequestForm.correo.trim(),
      });

      setPasswordRequestSuccess(
        'La solicitud fue enviada correctamente. Administración revisará los datos registrados y te ayudará a restablecer la contraseña.',
      );
      setPasswordRequestForm(initialPasswordRequestForm);
      setPasswordRequestVisible(false);
    } catch (error) {
      setPasswordRequestError(error.message || 'No se pudo enviar la solicitud de cambio de contraseña.');
    } finally {
      setPasswordRequestLoading(false);
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
                <div className="flex flex-col items-center gap-3">
                  <div>
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

                  <div>
                    <p className="mb-2 text-sm text-[var(--muted-foreground)]">¿Necesitas restablecer tu contraseña inicial?</p>
                    <button
                      className={smallOutlineButtonClass}
                      type="button"
                      onClick={() => {
                        setPasswordRequestVisible(true);
                        setPasswordRequestError('');
                        setPasswordRequestSuccess('');
                      }}
                    >
                      Solicitar cambio de contraseña
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>

      {passwordResetVisible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[640px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-5">
              <h3 className="mb-2">Actualiza tu contraseña</h3>
              <p className="m-0 text-sm leading-6 text-[var(--muted-foreground)]">
                Es tu primer ingreso. Para continuar al panel de emprendedor debes cambiar la contraseña inicial entregada por el administrador.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleFirstPasswordChange}>
              <Field
                icon={Lock}
                id="current-password"
                label="Contraseña actual"
                type="password"
                value={passwordResetForm.currentPassword}
                onChange={updatePasswordResetField('currentPassword')}
                placeholder="Ingresa la contraseña inicial"
              />

              <div className="group relative">
                <Field
                  icon={Lock}
                  id="new-password"
                  label="Nueva contraseña"
                  type="password"
                  value={passwordResetForm.newPassword}
                  onChange={updatePasswordResetField('newPassword')}
                  placeholder="Crea tu nueva contraseña"
                />
                <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden max-w-[420px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-xs leading-5 text-[var(--muted-foreground)] shadow-[0_10px_30px_rgba(15,23,42,0.12)] group-hover:block group-focus-within:block">
                  La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.
                </div>
              </div>

              <Field
                icon={Lock}
                id="confirm-password"
                label="Confirmar nueva contraseña"
                type="password"
                value={passwordResetForm.confirmPassword}
                onChange={updatePasswordResetField('confirmPassword')}
                placeholder="Escribe nuevamente la nueva contraseña"
              />

              {passwordResetError ? (
                <div className={`${alertBaseClass} border-red-200 bg-red-50 text-red-700`}>{passwordResetError}</div>
              ) : null}

              <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  className={outlineButtonClass}
                  onClick={() => {
                    setPasswordResetVisible(false);
                    setPasswordResetForm(initialPasswordResetForm);
                    clearSession();
                    navigate('/');
                  }}
                  disabled={passwordResetLoading}
                >
                  Salir
                </button>
                <button type="submit" className={accentButtonClass} disabled={passwordResetLoading}>
                  {passwordResetLoading ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {passwordRequestVisible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[720px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="mb-2">Solicitar cambio de contraseña</h3>
                <p className="m-0 text-sm leading-6 text-[var(--muted-foreground)]">
                  Diligencia los datos con los que fue creada tu cuenta para enviar la solicitud a administración.
                </p>
              </div>
              <button
                type="button"
                className={outlineButtonClass}
                onClick={() => {
                  setPasswordRequestVisible(false);
                  setPasswordRequestForm(initialPasswordRequestForm);
                  setPasswordRequestError('');
                }}
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handlePasswordRequest} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  icon={User}
                  id="password-request-name"
                  label="Nombre completo"
                  value={passwordRequestForm.nombre}
                  onChange={updatePasswordRequestField('nombre')}
                  placeholder="Nombre del emprendedor"
                />
                <Field
                  icon={Mail}
                  id="password-request-email"
                  label="Correo electrónico"
                  type="email"
                  value={passwordRequestForm.correo}
                  onChange={updatePasswordRequestField('correo')}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div>
                  <label htmlFor="password-request-document-type" className={labelClass}>
                    Tipo de documento
                  </label>
                  <select
                    id="password-request-document-type"
                    className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]"
                    value={passwordRequestForm.tipoDocumento}
                    onChange={updatePasswordRequestField('tipoDocumento')}
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
                  id="password-request-document-number"
                  label="Número de documento"
                  value={passwordRequestForm.numeroDocumento}
                  onChange={updatePasswordRequestField('numeroDocumento')}
                  placeholder="Ingresa tu número de documento"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  icon={Phone}
                  id="password-request-phone"
                  label="Teléfono"
                  value={passwordRequestForm.telefono}
                  onChange={updatePasswordRequestField('telefono')}
                  placeholder="Número de contacto"
                />
                <Field
                  icon={MapPin}
                  id="password-request-address"
                  label="Dirección"
                  value={passwordRequestForm.direccion}
                  onChange={updatePasswordRequestField('direccion')}
                  placeholder="Dirección registrada"
                />
              </div>

              {passwordRequestError ? (
                <div className={`${alertBaseClass} border-red-200 bg-red-50 text-red-700`}>
                  {passwordRequestError}
                </div>
              ) : null}

              {passwordRequestSuccess ? (
                <div className={`${alertBaseClass} border-emerald-200 bg-emerald-50 text-emerald-700`}>
                  {passwordRequestSuccess}
                </div>
              ) : null}

              <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  className={outlineButtonClass}
                  onClick={() => {
                    setPasswordRequestVisible(false);
                    setPasswordRequestForm(initialPasswordRequestForm);
                    setPasswordRequestError('');
                    setPasswordRequestSuccess('');
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className={accentButtonClass} disabled={passwordRequestLoading}>
                  {passwordRequestLoading ? 'Enviando solicitud...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
