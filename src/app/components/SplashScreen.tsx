import { useEffect } from "react";
import { motion } from "motion/react";

interface Props { onComplete: () => void; }

export function SplashScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{ background: "#0F0E47" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-[#272757] rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
          <span className="text-white text-3xl font-black">Q</span>
        </div>
        <p className="text-white text-2xl font-bold mb-8">QuizMind AI</p>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-[#1A1952] rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full rounded-full bg-[#505081]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </div>

        <p className="text-[#8686AC] text-sm">Empowering educators with AI</p>
      </motion.div>
    </motion.div>
  );
}
