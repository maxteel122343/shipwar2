/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import WarshipGame from './components/WarshipGame';
import HUD from './components/UI/HUD';
import DeathScreen from './components/UI/DeathScreen';
import FishingMinigame from './components/UI/FishingMinigame';
import FishingReward from './components/UI/FishingReward';
import { useGameStore } from './hooks/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy } from 'lucide-react';

export default function App() {
  const store = useGameStore();

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <WarshipGame 
        player={store.player}
        getStats={store.getStats}
        items={store.items}
        onKill={store.addKill}
        onCollectItem={store.collectItem}
        onDeath={store.handleDeath}
        isMatchOver={store.isMatchOver}
        isFishing={store.isFishing}
        onStartFishing={store.startFishing}
        onUseItem={store.useSelectedItem}
        power={store.power}
        angle={store.angle}
        onUpdatePower={store.setPower}
        onUpdateAngle={store.setAngle}
        isDead={store.isDead}
        timeLeft={store.timeLeft}
        botsEnabled={store.botsEnabled}
        isMuted={store.isMuted}
        previewMode={!store.player}
      />

      <HUD 
        player={store.player}
        getStats={store.getStats}
        leaderboard={store.leaderboard}
        timeLeft={store.timeLeft}
        onStart={store.startMatch}
        onSelectItem={store.selectItem}
        upgradeAttribute={store.upgradeAttribute}
        power={store.power}
        angle={store.angle}
        botsEnabled={store.botsEnabled}
        setBotsEnabled={store.setBotsEnabled}
        isMuted={store.isMuted}
        setIsMuted={store.setIsMuted}
      />

      <AnimatePresence>
        {store.isDead && (
          <DeathScreen onRespawn={store.respawn} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {store.isFishing && (
          <FishingMinigame onFinish={store.finishFishing} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {store.fishingReward && (
          <FishingReward 
            reward={store.fishingReward} 
            onClose={store.closeReward} 
          />
        )}
      </AnimatePresence>

      {/* Match Over Modal */}
      <AnimatePresence>
        {store.isMatchOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-[200]"
          >
            <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] w-full max-w-lg text-center shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="bg-yellow-400/20 p-6 rounded-full">
                  <Trophy className="text-yellow-400 w-16 h-16" />
                </div>
              </div>
              
              <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase italic">Match Over!</h2>
              <p className="text-white/50 mb-8 font-medium">The battle has ended.</p>

              <div className="bg-white/5 rounded-2xl p-6 mb-12">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                  <span className="text-white/50 uppercase font-bold text-xs">Winner</span>
                  <span className="text-yellow-400 font-black text-xl">{store.leaderboard[0]?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 uppercase font-bold text-xs">Your Kills</span>
                  <span className="text-white font-black text-xl">{store.player?.kills}</span>
                </div>
              </div>

              <button
                onClick={store.restartGame}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl text-2xl uppercase tracking-widest transition-all transform active:scale-95"
              >
                New Match
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
