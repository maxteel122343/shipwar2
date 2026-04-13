/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ShipClass {
  LIGHT = 'LIGHT',
  HEAVY = 'HEAVY',
  BALANCED = 'BALANCED'
}

export interface ShipStats {
  level: number;
  maxHealth: number;
  damage: number;
  speed: number;
  maneuverability: number;
  weight: number;
  precision: number;
  firepower: number;
  energy: number;
  inventoryCapacity: number;
  armor: number;
  fireRate: number;
  range: number;
  knockback: number;
  size: number;
  expToNext: number;
}

export const BASE_STATS: Record<ShipClass, Omit<ShipStats, 'level' | 'expToNext'>> = {
  [ShipClass.LIGHT]: {
    maxHealth: 300,
    damage: 15,
    speed: 12,
    maneuverability: 0.05,
    weight: 0.5,
    precision: 0.95,
    firepower: 10,
    energy: 150,
    inventoryCapacity: 3,
    armor: 5,
    fireRate: 0.5,
    range: 150,
    knockback: 2,
    size: 0.8,
  },
  [ShipClass.HEAVY]: {
    maxHealth: 800,
    damage: 40,
    speed: 6,
    maneuverability: 0.02,
    weight: 1.5,
    precision: 0.7,
    firepower: 30,
    energy: 100,
    inventoryCapacity: 4,
    armor: 25,
    fireRate: 1.5,
    range: 300,
    knockback: 8,
    size: 1.5,
  },
  [ShipClass.BALANCED]: {
    maxHealth: 500,
    damage: 25,
    speed: 9,
    maneuverability: 0.035,
    weight: 1.0,
    precision: 0.85,
    firepower: 20,
    energy: 120,
    inventoryCapacity: 5,
    armor: 15,
    fireRate: 1.0,
    range: 220,
    knockback: 5,
    size: 1.1,
  }
};

export interface Player {
  id: string;
  name: string;
  shipClass: ShipClass;
  kills: number;
  deaths: number;
  level: number;
  health: number;
  energy: number;
  isBot: boolean;
  fishCollected: number;
  inventory: FishingItem[];
  selectedItemIndex: number;
  upgrades: {
    hp: number;
    speed: number;
    damage: number;
  };
}

export enum ItemType {
  FISH = 'FISH',
  HEALTH = 'HEALTH',
  BOOST = 'BOOST'
}

export interface GameItem {
  id: string;
  type: ItemType;
  position: { x: number; z: number };
  collected: boolean;
}

export enum Rarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum ItemEffect {
  NONE = 'NONE',
  STUN = 'STUN',
  SLOW = 'SLOW',
  CRITICAL = 'CRITICAL'
}

export interface FishingItem {
  id: string;
  name: string;
  rarity: Rarity;
  icon: string;
  color: string;
  description: string;
  damage: number;
  effect: ItemEffect;
}

export const FISHING_REWARDS: FishingItem[] = [
  { id: 'fish_common', name: 'Peixe Comum', rarity: Rarity.COMMON, icon: '🐟', color: '#ffffff', description: 'Um peixe bem normal.', damage: 20, effect: ItemEffect.NONE },
  { id: 'fish_rare', name: 'Peixe Raro', rarity: Rarity.RARE, icon: '🐠', color: '#3b82f6', description: 'Brilha um pouco no escuro.', damage: 40, effect: ItemEffect.CRITICAL },
  { id: 'boot_old', name: 'Bota Velha', rarity: Rarity.COMMON, icon: '👢', color: '#94a3b8', description: 'Alguém perdeu isso faz tempo...', damage: 30, effect: ItemEffect.STUN },
  { id: 'treasure_chest', name: 'Baú de Tesouro', rarity: Rarity.EPIC, icon: '📦', color: '#a855f7', description: 'O que será que tem dentro?', damage: 100, effect: ItemEffect.NONE },
  { id: 'diamond_gem', name: 'Diamante Lendário', rarity: Rarity.LEGENDARY, icon: '💎', color: '#eab308', description: 'O brilho é cegante!', damage: 200, effect: ItemEffect.NONE },
  { id: 'tire_old', name: 'Pneu Furado', rarity: Rarity.COMMON, icon: '⭕', color: '#475569', description: 'Como isso veio parar aqui?', damage: 25, effect: ItemEffect.SLOW },
  { id: 'golden_fish', name: 'Peixe Dourado', rarity: Rarity.LEGENDARY, icon: '✨', color: '#eab308', description: 'Dizem que realiza desejos.', damage: 150, effect: ItemEffect.CRITICAL },
];
