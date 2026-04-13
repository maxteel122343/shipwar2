/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FishingMinigameProps {
  onFinish: (success: boolean) => void;
}

const FishingMinigame: React.FC<FishingMinigameProps> = ({ onFinish }) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const speed = 2.5;
  const targetZone = { start: 40, end: 60 };
  const requestRef = useRef<number>(null);

  const update = () => {
    setPosition((prev) => {
      let next = prev + direction * speed;
      if (next >= 100) {
        setDirection(-1);
        next = 100;
      } else if (next <= 0) {
        setDirection(1);
        next = 0;
      }
      return next;
    });
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [direction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') {
        const success = position >= targetZone.start && position <= targetZone.end;
        onFinish(success);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, onFinish]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[150] pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-black/60 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md text-center shadow-2xl"
      >
        <h3 className="text-white font-black uppercase tracking-widest mb-6 italic text-2xl">Pescaria em Andamento...</h3>
        
        <div className="relative h-8 bg-white/10 rounded-full overflow-hidden border border-white/10 mb-6">
          {/* Target Zone */}
          <div 
            className="absolute h-full bg-blue-500/50 border-x border-blue-400"
            style={{ left: `${targetZone.start}%`, width: `${targetZone.end - targetZone.start}%` }}
          />
          
          {/* Moving Indicator */}
          <motion.div 
            className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] rounded-full"
            style={{ left: `${position}%` }}
          />
        </div>

        <p className="text-white/50 text-xs font-bold uppercase tracking-widest animate-pulse">
          Pressione <span className="text-white bg-white/10 px-2 py-1 rounded">E</span> para fisgar!
        </p>
      </motion.div>
    </div>
  );
};

export default FishingMinigame;
