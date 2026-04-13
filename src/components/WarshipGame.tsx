/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import * as TWEEN from '@tweenjs/tween.js';
import { Player, ShipClass, GameItem, ItemType, FishingItem, ItemEffect } from '../data/gameData';

interface WarshipGameProps {
  player: Player | null;
  getStats: (p: Player) => any;
  items: GameItem[];
  onKill: () => void;
  onCollectItem: (id: string) => void;
  onDeath: () => void;
  isMatchOver: boolean;
  isFishing: boolean;
  onStartFishing: () => void;
  onUseItem: () => FishingItem | null;
  power: number;
  angle: number;
  onUpdatePower: (val: number | ((prev: number) => number)) => void;
  onUpdateAngle: (val: number) => void;
  isDead: boolean;
  timeLeft: number;
  botsEnabled: boolean;
  isMuted: boolean;
  previewMode?: boolean;
}

const WarshipGame: React.FC<WarshipGameProps> = ({
  player,
  getStats,
  items,
  onKill,
  onCollectItem,
  onDeath,
  isMatchOver,
  isFishing,
  onStartFishing,
  onUseItem,
  power,
  angle,
  onUpdatePower,
  onUpdateAngle,
  isDead,
  timeLeft,
  botsEnabled,
  isMuted,
  previewMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shipRef = useRef<THREE.Group | null>(null);
  const enemiesRef = useRef<THREE.Group[]>([]);
  const itemsRef = useRef<{ [key: string]: THREE.Group }>({});
  const bulletsRef = useRef<THREE.Mesh[]>([]);
  const thrownItemsRef = useRef<THREE.Group[]>([]);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);
  const stormRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Group[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Physics state
  const velocity = useRef(new THREE.Vector3());
  const rotationVelocity = useRef(0);
  const screenShake = useRef(0);

  // Procedural Ship Generator
  const createProceduralShip = (seed: number, size: number = 1) => {
    const group = new THREE.Group();
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Random Palette
    const palettes = [
      { wood: 0x5d4037, accent: 0x212121, sail: 0xffffff }, // Classic
      { wood: 0x3e2723, accent: 0xbf360c, sail: 0x212121 }, // Pirate
      { wood: 0x4e342e, accent: 0x1565c0, sail: 0xe0e0e0 }, // Royal
      { wood: 0x212121, accent: 0x455a64, sail: 0x37474f }, // Ghost
    ];
    const palette = palettes[Math.floor(rng() * palettes.length)];

    // 1. Hull
    const hullType = Math.floor(rng() * 3); // 0: Wide, 1: Long, 2: Compact
    let hullWidth, hullHeight, hullDepth;
    if (hullType === 0) { hullWidth = 4 * size; hullHeight = 1.5 * size; hullDepth = 6 * size; }
    else if (hullType === 1) { hullWidth = 2 * size; hullHeight = 1.2 * size; hullDepth = 9 * size; }
    else { hullWidth = 3 * size; hullHeight = 1.8 * size; hullDepth = 5 * size; }

    const hullGeo = new THREE.BoxGeometry(hullWidth, hullHeight, hullDepth);
    const hullMat = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.8 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = hullHeight / 2;
    group.add(hull);

    // Add "Burning" state to userData
    group.userData.isBurning = false;
    group.userData.burnParticles = [];

    // 2. Deck details (Barrels, Crates)
    const detailCount = 3 + Math.floor(rng() * 5);
    for (let i = 0; i < detailCount; i++) {
      const isBarrel = rng() > 0.5;
      const detailGeo = isBarrel ? new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8) : new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const detailMat = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.9 });
      const detail = new THREE.Mesh(detailGeo, detailMat);
      detail.position.set(
        (rng() - 0.5) * hullWidth * 0.7,
        hullHeight / 2 + (isBarrel ? 0.4 : 0.3),
        (rng() - 0.5) * hullDepth * 0.7
      );
      group.add(detail);
    }

    // 3. Masts & Sails
    const mastCount = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < mastCount; i++) {
      const mastHeight = 4 + rng() * 4;
      const mastGeo = new THREE.CylinderGeometry(0.15, 0.2, mastHeight, 8);
      const mast = new THREE.Mesh(mastGeo, hullMat);
      const zPos = (i - (mastCount - 1) / 2) * (hullDepth * 0.3);
      mast.position.set(0, hullHeight / 2 + mastHeight / 2, zPos);
      group.add(mast);

      // Sails
      const sailType = Math.floor(rng() * 3);
      const sailWidth = 3 + rng() * 2;
      const sailHeight = 2 + rng() * 2;
      const sailGeo = new THREE.PlaneGeometry(sailWidth, sailHeight, 4, 4);
      
      // Curvature
      const pos = sailGeo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const x = pos.getX(j);
        pos.setZ(j, Math.sin((x / sailWidth) * Math.PI) * 0.5);
      }
      
      const sailMat = new THREE.MeshStandardMaterial({ 
        color: palette.sail, 
        side: THREE.DoubleSide,
      });
      
      const sail = new THREE.Mesh(sailGeo, sailMat);
      sail.position.set(0, mast.position.y + 1, zPos + 0.2);
      group.add(sail);

      // Crow's nest
      const nestGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.4, 8, 1, true);
      const nest = new THREE.Mesh(nestGeo, hullMat);
      nest.position.set(0, mast.position.y + mastHeight / 2 - 0.5, zPos);
      group.add(nest);
    }

    // 4. Cannons
    const cannonType = Math.floor(rng() * 2); // 0: Single, 1: Double
    const cannonCount = 2 + Math.floor(rng() * 4);
    for (let i = 0; i < cannonCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const zPos = (Math.floor(i / 2) - 1) * 1.5;
      
      const createCannon = (offset: number) => {
        const cannonGeo = new THREE.CylinderGeometry(0.2, 0.25, 1, 8);
        const cannonMat = new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.8, roughness: 0.2 });
        const cannon = new THREE.Mesh(cannonGeo, cannonMat);
        cannon.rotation.z = Math.PI / 2 * side;
        cannon.position.set(
          (hullWidth / 2) * side,
          hullHeight / 4 + offset,
          zPos
        );
        group.add(cannon);
      };

      createCannon(0);
      if (cannonType === 1) createCannon(0.4);
    }

    // 5. Flags, Lanterns & Ropes
    const flagGeo = new THREE.PlaneGeometry(0.8, 0.5);
    const flagMat = new THREE.MeshStandardMaterial({ color: palette.accent, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0, 8, -hullDepth / 2);
    group.add(flag);

    // Lanterns
    const lanternCount = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < lanternCount; i++) {
      const lanternGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
      const lanternMat = new THREE.MeshStandardMaterial({ 
        color: 0xffaa00, 
        emissive: 0xffaa00, 
        emissiveIntensity: 2 
      });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(
        (rng() - 0.5) * hullWidth * 0.8,
        hullHeight / 2 + 1,
        (rng() - 0.5) * hullDepth * 0.8
      );
      group.add(lantern);
      
      // Add a small light point for lanterns in preview mode
      if (previewMode) {
        const pLight = new THREE.PointLight(0xffaa00, 0.5, 5);
        pLight.position.copy(lantern.position);
        group.add(pLight);
      }
    }

    // Ropes (Simple Lines)
    const ropeMat = new THREE.LineBasicMaterial({ color: 0x3e2723 });
    for (let i = 0; i < mastCount; i++) {
      const zPos = (i - (mastCount - 1) / 2) * (hullDepth * 0.3);
      const ropePoints = [
        new THREE.Vector3(-hullWidth/2, 0, zPos),
        new THREE.Vector3(0, 6, zPos),
        new THREE.Vector3(hullWidth/2, 0, zPos)
      ];
      const ropeGeo = new THREE.BufferGeometry().setFromPoints(ropePoints);
      const rope = new THREE.Line(ropeGeo, ropeMat);
      group.add(rope);
    }

    return group;
  };

  // Visual Effects Helpers
  const createParticle = (scene: THREE.Scene, type: 'explosion' | 'smoke' | 'fire' | 'splash' | 'debris', pos: THREE.Vector3, color: number, size: number = 1) => {
    const group = new THREE.Group();
    group.position.copy(pos);
    
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    
    if (type === 'explosion' || type === 'fire') {
      geometry = new THREE.IcosahedronGeometry(size, 0);
      material = new THREE.MeshStandardMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 2,
        transparent: true,
        opacity: 1
      });
    } else if (type === 'smoke') {
      geometry = new THREE.SphereGeometry(size, 8, 8);
      material = new THREE.MeshStandardMaterial({ 
        color: 0x888888, 
        transparent: true, 
        opacity: 0.6 
      });
    } else if (type === 'splash') {
      geometry = new THREE.TorusGeometry(size, 0.2, 8, 16);
      material = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
      group.rotation.x = Math.PI / 2;
    } else {
      // Debris
      geometry = new THREE.BoxGeometry(size, size, size);
      material = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    
    group.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 0.5
    );
    if (type === 'splash') group.userData.velocity.set(0, 0.1, 0);
    
    group.userData.life = 1.0;
    group.userData.decay = 0.02 + Math.random() * 0.03;
    group.userData.type = type;
    
    scene.add(group);
    particlesRef.current.push(group);
  };

  const triggerExplosion = (scene: THREE.Scene, pos: THREE.Vector3, scale: number = 1) => {
    // Fire burst
    for (let i = 0; i < 8; i++) {
      createParticle(scene, 'explosion', pos, 0xffaa00, 2 * scale);
    }
    // Smoke
    for (let i = 0; i < 5; i++) {
      createParticle(scene, 'smoke', pos, 0x888888, 3 * scale);
    }
    // Debris
    for (let i = 0; i < 10; i++) {
      createParticle(scene, 'debris', pos, 0x5d4037, 0.5 * scale);
    }
  };

  const triggerMuzzleFlash = (scene: THREE.Scene, pos: THREE.Vector3, dir: THREE.Vector3) => {
    const flashPos = pos.clone().add(dir.clone().multiplyScalar(2));
    createParticle(scene, 'fire', flashPos, 0xffff00, 1);
    for (let i = 0; i < 3; i++) {
      createParticle(scene, 'smoke', flashPos, 0x444444, 1.5);
    }
  };

  const triggerSplash = (scene: THREE.Scene, pos: THREE.Vector3) => {
    createParticle(scene, 'splash', new THREE.Vector3(pos.x, 0.1, pos.z), 0xffffff, 2);
    for (let i = 0; i < 5; i++) {
      createParticle(scene, 'smoke', pos, 0xffffff, 0.5);
    }
  };

  useEffect(() => {
    if (!botsEnabled && sceneRef.current && !previewMode) {
      enemiesRef.current.forEach(enemy => sceneRef.current?.remove(enemy));
      enemiesRef.current = [];
    }
  }, [botsEnabled, previewMode]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Clear old refs to prevent ghost collisions
    enemiesRef.current.forEach(enemy => scene.remove(enemy));
    enemiesRef.current = [];
    bulletsRef.current.forEach(bullet => scene.remove(bullet));
    bulletsRef.current = [];
    thrownItemsRef.current.forEach(item => scene.remove(item));
    thrownItemsRef.current = [];

    // Trajectory Preview Line
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    const lineGeo = new THREE.BufferGeometry();
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
    trajectoryLineRef.current = line;

    // Water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x00aaff, // Brighter blue
      distortionScale: 3.7,
    });
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Sky
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const sun = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(85); // Lower sun for cinematic look
    const theta = THREE.MathUtils.degToRad(180);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(-10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    if (previewMode) {
      // Show 4 ships side by side
      for (let i = 0; i < 4; i++) {
        const ship = createProceduralShip(i * 12345, 1.5);
        ship.position.set((i - 1.5) * 25, 0, 0);
        scene.add(ship);
      }
      camera.position.set(0, 20, 60);
      camera.lookAt(0, 0, 0);
    } else if (player) {
      // Storm Ring
      const stormGeo = new THREE.RingGeometry(1000, 1010, 64);
      const stormMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const storm = new THREE.Mesh(stormGeo, stormMat);
      storm.rotation.x = -Math.PI / 2;
      storm.position.y = 1;
      scene.add(storm);
      stormRef.current = storm;

      const createItem = (type: ItemType) => {
        const group = new THREE.Group();
        let color = 0xffffff;
        let geometry: THREE.BufferGeometry = new THREE.BoxGeometry(2, 2, 2);

        if (type === ItemType.FISH) {
          color = 0x00ffff;
          geometry = new THREE.SphereGeometry(1.5, 8, 8);
        } else if (type === ItemType.HEALTH) {
          color = 0xff0000;
          geometry = new THREE.BoxGeometry(2, 2, 2);
        } else if (type === ItemType.BOOST) {
          color = 0xffff00;
          geometry = new THREE.OctahedronGeometry(2);
        }

        const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
        const mesh = new THREE.Mesh(geometry, mat);
        group.add(mesh);
        return group;
      };

      const stats = getStats(player);
      const ship = createProceduralShip(player.id === 'player' ? 999 : 0, stats.size);
      scene.add(ship);
      shipRef.current = ship;

      // Items
      items.forEach(item => {
        if (!item.collected) {
          const itemObj = createItem(item.type);
          itemObj.position.set(item.position.x, 0, item.position.z);
          scene.add(itemObj);
          itemsRef.current[item.id] = itemObj;
        }
      });

      // Enemies (Bots)
      if (botsEnabled) {
        for (let i = 0; i < 15; i++) {
          const botClass = [ShipClass.LIGHT, ShipClass.HEAVY, ShipClass.BALANCED][Math.floor(Math.random() * 3)];
          const enemy = createProceduralShip(i * 100, 1 + Math.random() * 2);
          
          // Spawn protection: Don't spawn bots near (0,0,0)
          let spawnX, spawnZ;
          do {
            spawnX = (Math.random() - 0.5) * 1500;
            spawnZ = (Math.random() - 0.5) * 1500;
          } while (Math.sqrt(spawnX * spawnX + spawnZ * spawnZ) < 200);
          
          enemy.position.set(spawnX, 0, spawnZ);
          enemy.userData.shipClass = botClass;
          scene.add(enemy);
          enemiesRef.current.push(enemy);
        }
      }
    }

    // Input
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyE' && !isFishing && !previewMode) onStartFishing();
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;
    
    const handleWheel = (e: WheelEvent) => {
      if (previewMode) return;
      onUpdatePower(prev => Math.max(5, Math.min(100, prev + e.deltaY * -0.05)));
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (previewMode) return;
      const h = window.innerHeight;
      const targetAngle = ((h - e.clientY) / h) * 60;
      onUpdateAngle(targetAngle);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('mousemove', handleMouseMove);

    // Shooting
    const handleAction = () => {
      if (!shipRef.current || isMatchOver || isFishing || isDead || previewMode) return;

      const stats = getStats(player!);
      const item = onUseItem();
      const rad = THREE.MathUtils.degToRad(angle);
      
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(shipRef.current.quaternion);
      
      // Precision dispersion
      const dispersion = (1 - stats.precision) * 0.2;
      const spread = new THREE.Vector3(
        (Math.random() - 0.5) * dispersion,
        (Math.random() - 0.5) * dispersion,
        (Math.random() - 0.5) * dispersion
      );

      const launchDir = new THREE.Vector3()
        .copy(forward)
        .multiplyScalar(Math.cos(rad))
        .add(new THREE.Vector3(0, Math.sin(rad), 0))
        .add(spread)
        .normalize();

      const initialVelocity = launchDir.multiplyScalar(power * 0.15);

      // Recoil
      velocity.current.add(forward.clone().multiplyScalar(-stats.knockback * 0.1));
      screenShake.current = stats.knockback * 0.2;

      // Muzzle Flash
      triggerMuzzleFlash(sceneRef.current!, shipRef.current.position.clone().add(new THREE.Vector3(0, 3, 0)), forward);

      if (item) {
        const createFishingItemModel = (item: FishingItem) => {
          const group = new THREE.Group();
          const color = new THREE.Color(item.color);
          let geometry: THREE.BufferGeometry;

          if (item.icon === '🐟' || item.icon === '🐠' || item.icon === '✨') {
            geometry = new THREE.SphereGeometry(1.5, 8, 8);
          } else if (item.icon === '👢') {
            geometry = new THREE.BoxGeometry(1, 2, 1.5);
          } else if (item.icon === '📦') {
            geometry = new THREE.BoxGeometry(2, 2, 2);
          } else if (item.icon === '💎') {
            geometry = new THREE.OctahedronGeometry(2);
          } else {
            geometry = new THREE.TorusGeometry(1, 0.4, 8, 16);
          }

          const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
          const mesh = new THREE.Mesh(geometry, mat);
          group.add(mesh);
          return group;
        };

        const itemModel = createFishingItemModel(item);
        itemModel.position.copy(shipRef.current.position).add(new THREE.Vector3(0, 5, 0));
        itemModel.userData.velocity = initialVelocity;
        itemModel.userData.gravity = -0.006;
        itemModel.userData.rotationSpeed = new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1);
        itemModel.userData.itemData = item;
        scene.add(itemModel);
        thrownItemsRef.current.push(itemModel);
        
        setTimeout(() => {
          scene.remove(itemModel);
          thrownItemsRef.current = thrownItemsRef.current.filter(i => i !== itemModel);
        }, 5000);
      } else {
        const bulletGeo = new THREE.SphereGeometry(0.6 * stats.size);
        const bulletMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 2 });
        const bullet = new THREE.Mesh(bulletGeo, bulletMat);
        bullet.position.copy(shipRef.current.position).add(new THREE.Vector3(0, 3, 0));
        bullet.userData.velocity = initialVelocity.clone().multiplyScalar(1.8);
        bullet.userData.gravity = -0.006;
        bullet.userData.damage = stats.damage;
        scene.add(bullet);
        bulletsRef.current.push(bullet);
        
        setTimeout(() => {
          scene.remove(bullet);
          bulletsRef.current = bulletsRef.current.filter(b => b !== bullet);
        }, 5000);
      }
    };
    window.addEventListener('mousedown', handleAction);

    // Animation Loop
    let lastTime = performance.now();
    let animationFrameId: number;
    
    const animate = () => {
      if (isMatchOver) return;
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      TWEEN.update();

      if (previewMode) {
        // Just rock the ships in preview
        scene.children.forEach(child => {
          if (child instanceof THREE.Group) {
            child.position.y = Math.sin(now * 0.001 + child.position.x * 0.1) * 0.5;
            child.rotation.x = Math.sin(now * 0.0005) * 0.02;
            child.rotation.z = Math.cos(now * 0.0005) * 0.02;
          }
        });
      } else if (player && shipRef.current && !isDead) {
        const stats = getStats(player);
        // Physics-based Movement
        if (!isFishing) {
          const accel = stats.speed * 0.05;
          const friction = 0.98;
          
          if (keys.current['KeyW']) velocity.current.add(new THREE.Vector3(0, 0, -accel).applyQuaternion(shipRef.current.quaternion));
          if (keys.current['KeyS']) velocity.current.add(new THREE.Vector3(0, 0, accel).applyQuaternion(shipRef.current.quaternion));
          
          const turnSpeed = stats.maneuverability;
          if (keys.current['KeyA']) rotationVelocity.current += turnSpeed;
          if (keys.current['KeyD']) rotationVelocity.current -= turnSpeed;
          
          shipRef.current.position.add(velocity.current);
          shipRef.current.rotation.y += rotationVelocity.current;
          
          velocity.current.multiplyScalar(friction);
          rotationVelocity.current *= 0.9;
        }

        // Waves / Rocking
        const waveTime = now * 0.001;
        shipRef.current.position.y = Math.sin(waveTime + shipRef.current.position.x * 0.05) * 0.5;
        shipRef.current.rotation.x = Math.sin(waveTime * 0.5) * 0.02;
        shipRef.current.rotation.z = Math.cos(waveTime * 0.5) * 0.02;

        // Camera Follow with Shake
        const offset = new THREE.Vector3(0, 25 * stats.size, 50 * stats.size);
        offset.applyQuaternion(shipRef.current.quaternion);
        
        const shake = new THREE.Vector3(
          (Math.random() - 0.5) * screenShake.current,
          (Math.random() - 0.5) * screenShake.current,
          (Math.random() - 0.5) * screenShake.current
        );
        
        camera.position.copy(shipRef.current.position).add(offset).add(shake);
        camera.lookAt(shipRef.current.position);
        screenShake.current *= 0.9;

        shipRef.current.scale.setScalar(stats.size);

        // Burning effect for player
        if (player.health < stats.maxHealth * 0.4 && Math.random() < 0.1) {
          createParticle(scene, 'smoke', shipRef.current.position.clone().add(new THREE.Vector3(0, 5, 0)), 0x333333, 1.2);
          if (Math.random() < 0.05) {
            createParticle(scene, 'fire', shipRef.current.position.clone().add(new THREE.Vector3((Math.random()-0.5)*5, 2, (Math.random()-0.5)*5)), 0xff4400, 0.5);
          }
        }

        // Storm Logic
        const stormRadius = 1000 - (180 - timeLeft) * 5;
        if (stormRef.current) {
          stormRef.current.scale.setScalar(stormRadius / 1000);
          const distToCenter = shipRef.current.position.length();
          if (distToCenter > stormRadius && !isDead) {
            // Damage from storm
            if (Math.random() < 0.1) onDeath();
          }
        }

        // Trajectory Preview
        if (trajectoryLineRef.current && !isFishing) {
          const points: THREE.Vector3[] = [];
          const rad = THREE.MathUtils.degToRad(angle);
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(shipRef.current.quaternion);
          const launchDir = new THREE.Vector3().copy(forward).multiplyScalar(Math.cos(rad)).add(new THREE.Vector3(0, Math.sin(rad), 0)).normalize();
          const v0 = launchDir.multiplyScalar(power * 0.15);
          const g = -0.006;
          const startPos = shipRef.current.position.clone().add(new THREE.Vector3(0, 3, 0));

          for (let t = 0; t < 100; t++) {
            const p = new THREE.Vector3(v0.x * t, v0.y * t + 0.5 * g * t * t, v0.z * t).add(startPos);
            points.push(p);
            if (p.y < 0) break;
          }
          if (trajectoryLineRef.current.geometry) {
            trajectoryLineRef.current.geometry.dispose();
          }
          trajectoryLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(points);
          trajectoryLineRef.current.visible = true;
        }

        // Update Bullets
        bulletsRef.current.forEach(bullet => {
          bullet.position.add(bullet.userData.velocity);
          bullet.userData.velocity.y += bullet.userData.gravity;
          
          if (bullet.position.y < 0) {
            triggerSplash(scene, bullet.position);
            scene.remove(bullet);
            bulletsRef.current = bulletsRef.current.filter(b => b !== bullet);
            return;
          }

          enemiesRef.current.forEach(enemy => {
            if (bullet.position.distanceTo(enemy.position) < 10 * enemy.scale.x) {
              triggerExplosion(scene, bullet.position, enemy.scale.x);
              scene.remove(bullet);
              bulletsRef.current = bulletsRef.current.filter(b => b !== bullet);
              enemy.position.set((Math.random() - 0.5) * 1500, 0, (Math.random() - 0.5) * 1500);
              onKill();
              screenShake.current = 2;
            }
          });
        });

        // Update Particles
        particlesRef.current.forEach((p, index) => {
          p.position.add(p.userData.velocity);
          p.userData.life -= p.userData.decay;
          
          if (p.userData.type === 'smoke' || p.userData.type === 'explosion' || p.userData.type === 'fire') {
            p.scale.setScalar(p.userData.life * 2);
            p.userData.velocity.y += 0.01; // Smoke rises
          } else if (p.userData.type === 'splash') {
            p.scale.setScalar(1 + (1 - p.userData.life) * 4);
          } else if (p.userData.type === 'debris') {
            p.userData.velocity.y -= 0.02; // Gravity for debris
            p.rotation.x += 0.1;
            p.rotation.z += 0.1;
          }

          const mesh = p.children[0] as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.opacity = p.userData.life;

          if (p.userData.life <= 0) {
            scene.remove(p);
            particlesRef.current.splice(index, 1);
          }
        });

        // Update Enemies
        enemiesRef.current.forEach(enemy => {
          const isStunned = enemy.userData.stunned && enemy.userData.stunned > Date.now();
          if (!isStunned) {
            enemy.translateZ(-1);
            if (Math.random() < 0.01) enemy.rotation.y += (Math.random() - 0.5) * 0.5;
            
            // Randomly trigger burning smoke for enemies
            if (Math.random() < 0.05) {
              createParticle(scene, 'smoke', enemy.position.clone().add(new THREE.Vector3(0, 5, 0)), 0x444444, 1);
            }

            if (shipRef.current && enemy.position.distanceTo(shipRef.current.position) < 8 * stats.size && !isDead) {
              onDeath();
            }
          }
        });
      }

      water.material.uniforms['time'].value += dt;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      particlesRef.current.forEach(p => scene.remove(p));
      particlesRef.current = [];
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleAction);
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, [player?.id, player?.shipClass, isMatchOver, isFishing, power, angle, isDead, previewMode, botsEnabled]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default WarshipGame;
