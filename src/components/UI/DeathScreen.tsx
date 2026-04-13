/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface DeathScreenProps {
  onRespawn: () => void;
}

const DeathScreen: React.FC<DeathScreenProps> = ({ onRespawn }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-[100]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 p-12 rounded-[40px] w-full max-w-lg text-center shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/20 p-6 rounded-full">
            <AlertTriangle className="text-red-500 w-16 h-16" />
          </div>
        </div>
        
        <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase italic">You Sunk!</h2>
        <p className="text-white/50 mb-12 font-medium">Your ship was destroyed in battle.</p>

        {/* Mock AdMob Ad */}
        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 mb-12 relative overflow-hidden group">
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[8px] font-black px-1 rounded uppercase">Ad</div>
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl">W</div>
            <div>
              <h3 className="text-white font-bold text-sm">Warship Tycoon</h3>
              <p className="text-white/50 text-[10px]">Build your own naval empire!</p>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full" />
                ))}
              </div>
            </div>
          </div>
          <button className="w-full mt-4 bg-white text-black font-black py-2 rounded-lg text-xs uppercase tracking-widest group-hover:bg-yellow-400 transition-colors">
            Install Now
          </button>
        </div>

        <button
          onClick={onRespawn}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl text-2xl uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-4"
        >
          <RefreshCcw size={32} />
          Respawn Now
        </button>
      </motion.div>
    </div>
  );
};

export default DeathScreen;
