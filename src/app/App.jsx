
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { AppRouter } from './AppRouter';
import soledadLogo from './assets/soledad-logo.png';
import ChatBot from './components/ChatBot';

function IntroOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--ivory)]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        animate={{
          opacity: 1,
          scale: [0.9, 1.04, 1],
          filter: ['blur(10px)', 'blur(0px)', 'blur(0px)'],
        }}
        transition={{ duration: 1.15, ease: 'easeInOut' }}
      >
        <motion.img
          src={soledadLogo}
          alt="Soledad Conecta"
          className="h-28 w-auto object-contain sm:h-32 md:h-36"
          initial={{ y: 18 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
        <motion.div
          className="mt-5 h-1.5 rounded-full bg-[var(--accent)]"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 112, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.35, ease: 'easeOut' }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowIntro(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <AnimatePresence>{showIntro ? <IntroOverlay /> : null}</AnimatePresence>
      <AppRouter />
        <ChatBot />
    </>
  );
}
