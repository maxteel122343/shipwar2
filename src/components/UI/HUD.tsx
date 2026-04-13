/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Timer, Heart, Shield, Zap, Sword, Fish, Target, Anchor, Activity, Settings, Volume2, VolumeX, Bot, BotOff, X } from 'lucide-react';
import { Player, ShipClass, BASE_STATS } from '../../data/gameData';

interface HUDProps {
  player: Player | null;
  getStats: (p: Player) => any;
  leaderboard: Player[];
  timeLeft: number;
  onStart: (name: string, shipClass: ShipClass) => void;
  onSelectItem: (index: number) => void;
  upgradeAttribute: (attr: 'hp' | 'speed' | 'damage') => void;
  power: number;
  angle: number;
  botsEnabled: boolean;
  setBotsEnabled: (val: boolean) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

const HUD: React.FC<HUDProps> = ({
  player,
  getStats,
  leaderboard,
  timeLeft,
  onStart,
  onSelectItem,
  upgradeAttribute,
  power,
  angle,
  botsEnabled,
  setBotsEnabled,
  isMuted,
  setIsMuted
}) => {
  const [name, setName] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState<ShipClass>(ShipClass.BALANCED);
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        onSelectItem(num - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectItem]);

  if (!player) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-50 p-4">
        <div className="bg-white/5 p-12 rounded-[40px] border border-white/10 w-full max-w-2xl text-center shadow-2xl">
          <h1 className="text-6xl font-black text-white mb-2 tracking-tighter uppercase italic">Warship Evolution</h1>
          <p className="text-white/40 mb-12 font-medium tracking-widest uppercase text-xs">Dominate the high seas</p>
          
          <div className="space-y-8">
            <input
              type="text"
              placeholder="ENTER SHIP NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-2xl text-center font-black tracking-widest focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/10"
            />

            <div className="grid grid-cols-3 gap-4">
              {Object.values(ShipClass).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedClass(sc)}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    selectedClass === sc 
                      ? 'bg-blue-600/20 border-blue-500 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className={`text-xs font-black tracking-widest uppercase ${selectedClass === sc ? 'text-blue-400' : 'text-white/40'}`}>
                    {sc}
                  </span>
                  <div className="text-[10px] text-white/30 space-y-1">
                    <p>HP: {BASE_STATS[sc].maxHealth}</p>
                    <p>SPD: {BASE_STATS[sc].speed}</p>
                    <p>ATK: {BASE_STATS[sc].damage}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => name && onStart(name, selectedClass)}
              disabled={!name}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/10 text-white font-black py-8 rounded-3xl text-3xl uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl"
            >
              Start Battle
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = getStats(player);
  const progress = ((player.kills + player.fishCollected / 5) % 2) * 50;

  return (
    <div className="fixed inset-0 pointer-events-none p-8 z-10 flex flex-col justify-between">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[60] pointer-events-auto">
          <div className="bg-black/80 border border-white/10 p-8 rounded-[32px] w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter italic">Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${botsEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'}`}>
                    {botsEnabled ? <Bot size={20} /> : <BotOff size={20} />}
                  </div>
                  <span className="text-white font-bold uppercase tracking-widest text-xs">Bots Enabled</span>
                </div>
                <button 
                  onClick={() => setBotsEnabled(!botsEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${botsEnabled ? 'bg-blue-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${botsEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${!isMuted ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/40'}`}>
                    {!isMuted ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <span className="text-white font-bold uppercase tracking-widest text-xs">Sound</span>
                </div>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-6 rounded-full transition-all relative ${!isMuted ? 'bg-yellow-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!isMuted ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Left: Stats & Level */}
        <div className="flex flex-col gap-4">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-8 shadow-2xl pointer-events-auto">
            <button 
              onClick={() => setShowSettings(true)}
              className="bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all text-white/60 hover:text-white"
            >
              <Settings size={24} />
            </button>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400/20 p-2 rounded-lg">
                <Timer className="text-yellow-400 w-6 h-6" />
              </div>
              <span className="text-white font-mono text-3xl font-black tracking-tighter">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="bg-cyan-400/20 p-2 rounded-lg">
                <Fish className="text-cyan-400 w-6 h-6" />
              </div>
              <span className="text-white font-mono text-3xl font-black tracking-tighter">{player.fishCollected}</span>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 w-80 shadow-2xl">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Ship Class</span>
                <span className="text-blue-400 font-black text-lg italic uppercase">{player.shipClass}</span>
              </div>
              <div className="text-right">
                <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Level {player.level}</span>
                <p className="text-white font-black text-xl">{player.kills} KILLS</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest">
                <span>Health</span>
                <span>{Math.round(player.health)} / {Math.round(stats.maxHealth)}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
                  style={{ width: `${(player.health / stats.maxHealth) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest">
                <span>Energy</span>
                <span>{Math.round(player.energy)} / {Math.round(stats.maxEnergy)}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                  style={{ width: `${(player.energy / stats.maxEnergy) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <StatItem icon={<Shield size={14}/>} value={Math.round(stats.armor)} label="Armor" color="text-slate-400" />
              <StatItem icon={<Sword size={14}/>} value={Math.round(stats.damage)} label="Damage" color="text-red-400" />
              <StatItem icon={<Zap size={14}/>} value={stats.speed.toFixed(1)} label="Speed" color="text-yellow-400" />
              <StatItem icon={<Target size={14}/>} value={`${Math.round(stats.precision * 100)}%`} label="Precision" color="text-green-400" />
            </div>
          </div>

          {/* Upgrades */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-80 shadow-2xl pointer-events-auto">
            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Upgrades (10 Fish)</h3>
            <div className="grid grid-cols-3 gap-2">
              <UpgradeBtn icon={<Heart size={16}/>} label="HP" onClick={() => upgradeAttribute('hp')} disabled={player.fishCollected < 10} />
              <UpgradeBtn icon={<Zap size={16}/>} label="SPD" onClick={() => upgradeAttribute('speed')} disabled={player.fishCollected < 10} />
              <UpgradeBtn icon={<Sword size={16}/>} label="ATK" onClick={() => upgradeAttribute('damage')} disabled={player.fishCollected < 10} />
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-72 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="bg-yellow-400/20 p-2 rounded-lg">
              <Trophy className="text-yellow-400 w-5 h-5" />
            </div>
            <h2 className="text-white font-black uppercase tracking-[0.2em] text-xs">Leaderboard</h2>
          </div>
          <div className="flex flex-col gap-4">
            {leaderboard.map((p, i) => (
              <div key={p.id} className={`flex justify-between items-center ${p.id === 'player' ? 'bg-blue-600/20 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                <div className="flex items-center gap-3 truncate">
                  <span className={`font-mono text-[10px] w-4 ${i < 3 ? 'text-yellow-400 font-bold' : 'opacity-30'}`}>{i + 1}</span>
                  <div className="flex flex-col truncate">
                    <span className={`truncate text-sm font-bold ${p.id === 'player' ? 'text-blue-400' : 'text-white/80'}`}>{p.name}</span>
                    <span className="text-[8px] text-white/20 uppercase font-black">{p.shipClass}</span>
                  </div>
                </div>
                <span className="font-mono text-white font-bold">{p.kills}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Inventory & Controls */}
      <div className="flex flex-col items-center gap-8">
        {/* Shooting Parameters Display */}
        <div className="flex gap-12 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[32px] px-12 py-6 pointer-events-auto shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Fire Power</span>
            <div className="flex items-center gap-4">
              <div className="w-48 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-100 shadow-[0_0_15px_rgba(234,179,8,0.4)]" 
                  style={{ width: `${power}%` }}
                />
              </div>
              <span className="text-white font-mono font-black text-xl w-12">{Math.round(power)}</span>
            </div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Attack Angle</span>
            <div className="flex items-center gap-4">
              <div className="w-48 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-100 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                  style={{ width: `${(angle / 60) * 100}%` }}
                />
              </div>
              <span className="text-white font-mono font-black text-xl w-12">{Math.round(angle)}°</span>
            </div>
          </div>
        </div>

        {/* Inventory Slots */}
        <div className="flex gap-4 pointer-events-auto">
          {Array.from({ length: stats.inventoryCapacity }).map((_, i) => {
            const item = player.inventory[i];
            const isSelected = player.selectedItemIndex === i;
            return (
              <div 
                key={i}
                onClick={() => onSelectItem(i)}
                className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center text-4xl transition-all cursor-pointer relative group ${
                  isSelected 
                    ? 'bg-blue-600/30 border-blue-400 scale-110 shadow-[0_0_30px_rgba(59,130,246,0.4)]' 
                    : 'bg-black/60 border-white/5 hover:border-white/20'
                }`}
              >
                <span className="absolute top-2 left-3 text-[10px] font-black text-white/20">{i + 1}</span>
                {item ? (
                  <span className="drop-shadow-2xl transform group-hover:scale-110 transition-transform">{item.icon}</span>
                ) : (
                  <div className="w-3 h-3 bg-white/5 rounded-full" />
                )}
                {item && isSelected && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <div className="flex flex-col items-center">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                      <span className="text-white/40 text-[8px] uppercase font-bold">{item.rarity}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls Help */}
        <div className="bg-black/40 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/5 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] flex gap-10 shadow-2xl">
          <div className="flex items-center gap-2"><Anchor size={12}/> WASD MOVE</div>
          <div className="flex items-center gap-2"><Activity size={12}/> CLICK SHOOT</div>
          <div className="flex items-center gap-2 text-blue-400"><Fish size={12}/> E FISHING</div>
          <div className="flex items-center gap-2 text-yellow-400"><Target size={12}/> 1-5 ITEMS</div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, value, label, color }: { icon: React.ReactNode, value: string | number, label: string, color: string }) => (
  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
    <div className={`${color} bg-white/5 p-2 rounded-lg`}>{icon}</div>
    <div className="flex flex-col">
      <span className="text-[8px] text-white/20 uppercase font-black leading-none tracking-widest mb-1">{label}</span>
      <span className="text-white text-sm font-black leading-tight">{value}</span>
    </div>
  </div>
);

const UpgradeBtn = ({ icon, label, onClick, disabled }: { icon: React.ReactNode, label: string, onClick: () => void, disabled: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
      disabled 
        ? 'bg-white/5 border-transparent opacity-20' 
        : 'bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20 hover:border-blue-500'
    }`}
  >
    <div className={disabled ? 'text-white' : 'text-blue-400'}>{icon}</div>
    <span className="text-[8px] font-black text-white uppercase tracking-widest">{label}</span>
  </button>
);

export default HUD;
