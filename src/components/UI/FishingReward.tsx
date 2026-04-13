/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FishingItem, Rarity } from '../../data/gameData';
import { Sparkles } from 'lucide-react';

interface FishingRewardProps {
  reward: FishingItem;
  onClose: () => void;
}

const FishingReward: React.FC<FishingRewardProps> = ({ reward, onClose }) => {
  const getRarityLabel = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON: return 'Comum';
      case Rarity.RARE: return 'Raro';
      case Rarity.EPIC: return 'Épico';
      case Rarity.LEGENDARY: return 'Lendário';
      default: return '';
    }
  };

  const getRarityGlow = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON: return 'shadow-[0_0_30px_rgba(255,255,255,0.2)]';
      case Rarity.RARE: return 'shadow-[0_0_40px_rgba(59,130,246,0.4)]';
      case Rarity.EPIC: return 'shadow-[0_0_50px_rgba(168,85,247,0.5)]';
      case Rarity.LEGENDARY: return 'shadow-[0_0_60px_rgba(234,179,8,0.6)]';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
        className="relative flex flex-col items-center"
      >
        {/* Shine Effect */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center opacity-20"
        >
          <div className="w-[500px] h-[500px] bg-gradient-to-r from-transparent via-white to-transparent blur-3xl" />
        </motion.div>

        {/* Item Icon */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className={`w-48 h-48 bg-white/10 rounded-[40px] border border-white/20 flex items-center justify-center text-9xl mb-8 relative z-10 ${getRarityGlow(reward.rarity)}`}
        >
          <span className="drop-shadow-2xl">{reward.icon}</span>
          
          {/* Water Splash Visual */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 2], opacity: [0, 0.5, 0] }}
            transition={{ duration: 1 }}
            className="absolute inset-0 border-4 border-blue-400 rounded-full"
          />
        </motion.div>

        {/* Item Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: reward.color }} />
            <span className="uppercase font-black tracking-[0.3em] text-xs" style={{ color: reward.color }}>
              {getRarityLabel(reward.rarity)}
            </span>
            <Sparkles className="w-5 h-5" style={{ color: reward.color }} />
          </div>
          
          <h2 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic drop-shadow-lg">
            {reward.name}
          </h2>
          
          <p className="text-white/50 font-medium mb-12 max-w-xs mx-auto">
            {reward.description}
          </p>

          <button
            onClick={onClose}
            className="bg-white text-black font-black px-12 py-4 rounded-2xl text-xl uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all transform active:scale-95 pointer-events-auto"
          >
            Continuar
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FishingReward;
