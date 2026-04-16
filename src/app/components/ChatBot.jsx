import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ChatBot.css";

const FAQS = [
  {
    keywords: ["horario", "hora", "atienden", "atencion"],
    question: "¿Cuál es el horario de atención?",
    answer: [
      "Nuestro horario de atención es de lunes a viernes de **8:00 a 18:00 hs**.",
      "Atendemos de lunes a viernes entre **8:00 y 18:00 horas**.",
      "Puedes contactarnos en horario laboral: **8:00 a 18:00 hs**, de lunes a viernes."
    ]
  },
  {
    keywords: ["donde", "ubicacion", "direccion", "queda"],
    question: "¿Dónde están ubicados?",
    answer: [
      "Estamos ubicados en **Av. Principal 123**, Ciudad, País.",
      "Nuestra sede está en **Av. Principal 123** 📍",
      "Puedes encontrarnos en **Av. Principal 123**, en la ciudad."
    ]
  },
  {
    keywords: ["contacto", "telefono", "correo", "email", "soporte"],
    question: "¿Cómo puedo contactar soporte?",
    answer: [
      "Puedes escribir a **info@soledadconecta.gov.co** o llamar al **+57 300 123 4567**.",
      "Nuestro correo es **info@soledadconecta.gov.co** 📧 y también puedes llamar al **+57 300 123 4567**.",
      "Puedes contactarnos por email o teléfono: **+57 300 123 4567**."
    ]
  },
  {
    keywords: ["tiempo", "tarda", "demora", "cuanto"],
    question: "¿Cuánto tarda el servicio?",
    answer: [
      "El proceso normalmente no supera las **48 horas hábiles**.",
      "Por lo general tarda menos de **48 horas hábiles**.",
      "En la mayoría de los casos se resuelve en **48 horas hábiles**."
    ]
  },
  {
    keywords: ["cita", "agendar", "agenda"],
    question: "¿Cómo puedo agendar una cita?",
    answer: [
      "Puedes agendar desde nuestra **página web** o por teléfono.",
      "La cita se agenda fácilmente en nuestra web o llamando 📞",
      "Puedes reservar tu cita en línea o vía telefónica."
    ]
  }
];

// Markdown básico
function renderMarkdown(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function TypingIndicator() {
  return (
    <span className="chatbot-typing">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </span>
  );
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "¡Hola! Soy tu asistente virtual 🤖 ¿Cómo te llamas?" }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, isBotTyping]);

  // Normalizar texto
  const normalize = (text) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Buscar mejor FAQ (FIX)
  const findBestFAQ = (text) => {
    const clean = normalize(text);
    const words = clean.split(/\s+/);

    let bestMatch = null;
    let maxScore = 0;

    FAQS.forEach(faq => {
      let score = 0;
      faq.keywords.forEach(k => {
        if (words.includes(k)) score++;
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = faq;
      }
    });

    return maxScore > 0 ? bestMatch : null;
  };

  // Obtener respuesta aleatoria
  const getAnswer = (faq) => {
    if (!faq) return null;
    if (Array.isArray(faq.answer)) {
      const idx = Math.floor(Math.random() * faq.answer.length);
      return faq.answer[idx];
    }
    return faq.answer;
  };

  // Enviar mensaje
  const handleSend = (text) => {
    if (!text.trim() || isBotTyping) return;

    setMessages(msgs => [...msgs, { from: "user", text }]);
    setInput("");
    setIsBotTyping(true);

    if (step === 0) {
      setTimeout(() => {
        setName(text);
        setMessages(msgs => [
          ...msgs,
          {
            from: "bot",
            text: `¡Mucho gusto, ${text}! 😊 ¿En qué puedo ayudarte?`
          }
        ]);
        setStep(1);
        setIsBotTyping(false);
      }, 900);
    } else {
      const faq = findBestFAQ(text);

      setTimeout(() => {
        setMessages(msgs => [
          ...msgs,
          {
            from: "bot",
            text: faq
              ? `${name ? name + ", " : ""}${getAnswer(faq)}`
              : "No estoy seguro de eso 🫣<br/>Puedes intentar con las opciones rápidas de abajo 👇"
          }
        ]);
        setIsBotTyping(false);
      }, 1000);
    }
  };

  // Click FAQ
  const handleFAQClick = (faq) => {
    if (isBotTyping) return;

    setMessages(msgs => [
      ...msgs,
      { from: "user", text: faq.question }
    ]);

    setIsBotTyping(true);

    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        {
          from: "bot",
          text: `${name ? name + ", " : ""}${getAnswer(faq)}`
        }
      ]);
      setIsBotTyping(false);
    }, 800);
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            className="chatbot-bubble"
            onClick={() => setOpen(true)}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            💬
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-avatar">🤖</div>
              <div className="header-title-group">
                <span className="header-title">Asistente Virtual</span>
                <div className="header-status-row">
                  <span className="online-dot" />
                  <span className="online-label">En línea</span>
                </div>
              </div>
              <button className="chatbot-close" onClick={() => setOpen(false)}>×</button>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.text + i}
                  className={`chatbot-msg chatbot-msg-${msg.from}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {renderMarkdown(msg.text)}
                </motion.div>
              ))}
              {isBotTyping && (
                <div className="chatbot-msg chatbot-msg-bot">
                  <TypingIndicator />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chatbot-footer">
              {step === 1 && (
                <div className="chatbot-faq-btns">
                  {FAQS.map((faq, i) => (
                    <button
                      key={faq.question}
                      className="chatbot-faq-btn"
                      onClick={() => handleFAQClick(faq)}
                      disabled={isBotTyping}
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="chatbot-form"
              >
                <input
                  type="text"
                  placeholder={step === 0 ? "Escribe tu nombre..." : "Escribe tu mensaje..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="chatbot-input"
                  disabled={isBotTyping}
                />
                <button
                  type="submit"
                  className="chatbot-send"
                  disabled={isBotTyping || !input.trim()}
                >
                  Enviar
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBot;