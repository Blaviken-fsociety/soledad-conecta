import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  MessageSquare,
  AlertCircle,
  FileText,
  Lightbulb,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
} from 'lucide-react';

import { createPqrsRequest } from '../utils/api';

const requestTypes = [
  {
    type: 'petition',
    backendType: 'PETICION',
    icon: FileText,
    label: 'Petición',
    description: 'Solicitudes de información o servicios',
    color: 'var(--primary)',
  },
  {
    type: 'complaint',
    backendType: 'QUEJA',
    icon: MessageSquare,
    label: 'Queja',
    description: 'Manifestaciones de inconformidad',
    color: '#DC2626',
  },
  {
    type: 'claim',
    backendType: 'RECLAMO',
    icon: AlertCircle,
    label: 'Reclamo',
    description: 'Insatisfacción frente a un servicio',
    color: '#F59E0B',
  },
  {
    type: 'suggestion',
    backendType: 'SUGERENCIA',
    icon: Lightbulb,
    label: 'Sugerencia',
    description: 'Ideas para mejorar el servicio',
    color: 'var(--accent)',
  },
];

const cardClass =
  'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(27,58,95,0.12)]';
const fieldClass =
  'w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]';
const labelClass = 'mb-2 block font-semibold text-[var(--foreground)]';
const accentButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
const outlineButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius)] border-2 border-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const buildRadicado = (id) => `PQR-${String(id).padStart(6, '0')}`;

export function ContactPage() {
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentRequestType = useMemo(
    () => requestTypes.find((item) => item.type === selectedType) || null,
    [selectedType],
  );

  const resetForm = () => {
    setFormData(initialForm);
    setSelectedType(null);
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentRequestType) {
      setErrorMessage('Selecciona un tipo de solicitud antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const createdItem = await createPqrsRequest({
        tipo: currentRequestType.backendType,
        nombre: formData.name,
        correo: formData.email,
        telefono: formData.phone,
        asunto: formData.subject,
        mensaje: formData.message,
      });

      setSubmittedId(buildRadicado(createdItem?.id || 0));
      setSubmitted(true);
      setFormData(initialForm);
      setSelectedType(null);
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen w-full bg-[var(--ivory)]">
      <section className="w-full bg-[var(--primary)] px-6 py-12 text-[var(--primary-foreground)] lg:px-8">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="mb-4 text-[var(--white)]">PQR - Peticiones, Quejas y Reclamos</h1>
            <p className="mx-auto max-w-[700px] text-lg text-[rgba(255,255,255,0.9)]">
              Tu opinión es importante. Envía tu solicitud y el equipo administrador podrá revisarla
              directamente en el panel institucional.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="grid w-full grid-cols-1 gap-6 px-6 py-16 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:px-8">
        <div>
          {!submitted ? (
            <>
              {!selectedType ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`${cardClass} mb-6`}>
                    <h2 className="mb-6">Selecciona el tipo de solicitud</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {requestTypes.map((type, index) => (
                        <motion.div
                          key={type.type}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                        >
                          <button
                            type="button"
                            className="w-full cursor-pointer rounded-[var(--radius)] border-2 bg-[var(--card)] p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(27,58,95,0.12)]"
                            style={{ borderColor: type.color }}
                            onClick={() => setSelectedType(type.type)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius)]"
                                style={{ backgroundColor: type.color }}
                              >
                                <type.icon size={24} color="var(--white)" />
                              </div>
                              <div>
                                <h3 className="mb-1 text-xl">{type.label}</h3>
                                <p className="mb-0 text-[var(--muted-foreground)]">{type.description}</p>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className={cardClass} style={{ backgroundColor: 'var(--secondary)' }}>
                    <h3 className="mb-4 text-lg">Información importante</h3>
                    <ul className="m-0 list-disc pl-6 leading-[1.8]">
                      <li>La información queda registrada en el panel del administrador.</li>
                      <li>Recibirás un número de radicado para hacer seguimiento.</li>
                      <li>El correo y el asunto ayudan a priorizar y responder mejor tu caso.</li>
                      <li>Los campos marcados con (*) son obligatorios.</li>
                    </ul>
                  </div>
                </motion.div>
              ) : null}

              {selectedType ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={cardClass}>
                    <div className="mb-6 flex items-center gap-3 border-b-2 border-[var(--border)] pb-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)]"
                        style={{ backgroundColor: currentRequestType?.color }}
                      >
                        {currentRequestType ? <currentRequestType.icon size={24} color="var(--white)" /> : null}
                      </div>
                      <div>
                        <h2 className="m-0">{currentRequestType?.label}</h2>
                        <p className="m-0 text-[var(--muted-foreground)]">{currentRequestType?.description}</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="name" className={labelClass}>
                            Nombre completo *
                          </label>
                          <input
                            type="text"
                            className={fieldClass}
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Juan Pérez"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className={labelClass}>
                            Correo electrónico *
                          </label>
                          <input
                            type="email"
                            className={fieldClass}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="juan@ejemplo.com"
                          />
                        </div>

                        <div>
                          <label htmlFor="phone" className={labelClass}>
                            Telefono
                          </label>
                          <input
                            type="tel"
                            className={fieldClass}
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="57 300 123 4567"
                          />
                        </div>

                        <div>
                          <label htmlFor="subject" className={labelClass}>
                            Asunto *
                          </label>
                          <input
                            type="text"
                            className={fieldClass}
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            placeholder="Breve descripcion del caso"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="message" className={labelClass}>
                            Mensaje *
                          </label>
                          <textarea
                            className={`${fieldClass} min-h-[168px]`}
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={6}
                            placeholder="Describe detalladamente tu solicitud..."
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                      </div>

                      {errorMessage ? (
                        <div className="rounded-[var(--radius)] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
                          {errorMessage}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button type="submit" className={accentButtonClass} disabled={isSubmitting}>
                          <Send size={18} />
                          {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                        </button>
                        <button type="button" onClick={resetForm} className={outlineButtonClass}>
                          Volver
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              ) : null}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`${cardClass} p-8 text-center sm:p-10`}>
                <div
                  className="mx-auto mb-8 flex h-[100px] w-[100px] items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <CheckCircle size={60} color="var(--accent-foreground)" />
                </div>
                <h2 className="mb-4">Solicitud enviada</h2>
                <p className="mb-4 text-lg text-[var(--muted-foreground)]">
                  Tu informacion ya fue registrada y esta disponible para revision en el panel del administrador.
                </p>
                <div className="mb-6 rounded-[var(--radius)] p-6" style={{ backgroundColor: 'var(--secondary)' }}>
                  <p className="mb-2 font-semibold">Numero de radicado</p>
                  <p
                    className="mb-0 text-2xl font-bold text-[var(--primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {submittedId}
                  </p>
                </div>
                <p className="mb-6 text-[var(--muted-foreground)]">
                  Recibiras respuesta en tu correo una vez el caso sea revisado por el equipo institucional.
                </p>
                <button
                  type="button"
                  className={outlineButtonClass}
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedId('');
                    resetForm();
                  }}
                >
                  Enviar otra solicitud
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`${cardClass} mb-6`}>
              <h3 className="mb-6">Canales de contacto</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)]"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <Phone size={20} color="var(--accent-foreground)" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-base">Telefono</h4>
                    <p className="mb-0 text-[var(--muted-foreground)]">
                      57 300 123 4567
                      <br />
                      Lun - Vie: 8:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)]"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Mail size={20} color="var(--primary-foreground)" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-base">Correo</h4>
                    <p className="mb-0 break-words text-[var(--muted-foreground)]">info@soledadconecta.gov.co</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)]"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <MapPin size={20} color="var(--accent-foreground)" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-base">Ubicacion</h4>
                    <p className="mb-0 text-[var(--muted-foreground)]">
                      Alcaldia Municipal
                      <br />
                      Soledad, Atlantico
                      <br />
                      Colombia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-[var(--radius)] border border-[var(--border)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <h3 className="mb-4 text-[var(--white)]">Horarios de atencion</h3>
              <div className="leading-[1.8] text-[rgba(255,255,255,0.9)]">
                <p className="mb-2">
                  <strong>Lunes a Viernes:</strong>
                  <br />
                  8:00 AM - 12:00 PM
                  <br />
                  2:00 PM - 5:00 PM
                </p>
                <p className="mb-0">
                  <strong>Sabados, Domingos y Festivos:</strong>
                  <br />
                  Cerrado
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
