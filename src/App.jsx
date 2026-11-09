import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Float, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const HOTSPOTS = {
  desk: { label: 'Writing desk', short: 'Desk', location: 'East wall', icon: '⌁' },
  painting: { label: 'The brass portrait', short: 'Portrait', location: 'North wall', icon: '◈' },
  chest: { label: 'Locked chest', short: 'Chest', location: 'South wall', icon: '▣' },
  bookshelf: { label: 'Bookcase', short: 'Bookcase', location: 'West wall', icon: '≡' },
  door: { label: 'The exit door', short: 'Exit', location: 'South-east wall', icon: '↗' },
  key: { label: 'The last key', short: 'Last key', location: 'Haunted chamber', icon: '⚿' },
  haunted: { label: 'The haunted chamber', short: 'Chamber', location: 'Beyond the study', icon: '☩' },
  cross: { label: 'The Christian cross', short: 'Cross', location: 'First floor', icon: '☩' },
  weapons: { label: 'The weapons rack', short: 'Weapons', location: 'First floor', icon: '⚔' },
  groundBody: { label: 'The fallen body', short: 'Body', location: 'Ground floor', icon: '†' },
  groundClue: { label: 'Blood-marked clues', short: 'Clues', location: 'Ground floor', icon: '⌁' },
  secondBody: { label: 'The silent body', short: 'Body', location: 'Second floor', icon: '†' },
  secondCross: { label: 'The high cross inscription', short: 'Inscription', location: 'Second floor', icon: '☩' },
}

const ROOM_TARGETS = [
  { id: 'painting', position: [0, -4.55] },
  { id: 'desk', position: [4.55, -3.55] },
  { id: 'chest', position: [1.95, 3.65] },
]
const ROOM_TASKS = [
  { id: 'painting', floor: 'First floor', text: 'Inspect the brass portrait' },
  { id: 'desk', floor: 'First floor', text: 'Search the writing desk' },
  { id: 'chest', floor: 'First floor', text: 'Open the ironbound chest' },
]
const HAUNTED_TASKS = [
  { id: 'cross', floor: 'First floor', text: 'Press the hidden button', action: 'Press the hidden button', actionText: 'A panel opens behind the cross and reveals a crimson gem.', reward: 1, position: [0, -6.1], radius: 0.9 },
  { id: 'weapons', floor: 'First floor', text: 'Break open the weapons crate', action: 'Break open the crate', actionText: 'The splintered crate contains a violet gem.', reward: 1, position: [6.9, -6.05], radius: 0.9 },
  { id: 'groundBody', floor: 'Ground floor', text: 'Open the evidence file', action: 'Open the evidence file', actionText: 'A bloodstained file folds around an amber gem.', reward: 1, position: [-5.4, 1.8], radius: 0.9 },
  { id: 'groundClue', floor: 'Ground floor', text: 'Unlock the blood-marked cabinet', action: 'Open the old cabinet', actionText: 'Inside the cabinet, a green gem glows beside the clues.', reward: 1, position: [5.6, -4.2], radius: 0.85 },
  { id: 'secondBody', floor: 'Second floor', text: 'Open the coat file', action: 'Open the coat file', actionText: 'The hidden pocket holds a blue gem.', reward: 1, position: [3.6, 3.2], radius: 0.9 },
  { id: 'secondCross', floor: 'Second floor', text: 'Break the stone panel', action: 'Break the stone panel', actionText: 'Behind the inscription is a final white gem.', reward: 1, position: [5.2, -6.1], radius: 0.9 },
]
const GEM_REQUIREMENT = 6
const GEM_POSITIONS = {
  cross: [0, 2.05, -6.48],
  weapons: [6.9, 1.65, -6.42],
  groundBody: [-5.4, -4.18, 1.8],
  groundClue: [5.6, -4.24, -4.2],
  secondBody: [3.6, 5.65, 3.2],
  secondCross: [5.2, 8.25, -6.48],
}


function Map({ selected, discovered, onSelect }) {
  return (
    <section className="map-panel">
      <div className="map-heading">
        <div>
          <p className="eyebrow">Floor plan / 01</p>
          <h2>North study</h2>
        </div>
        <div className="map-legend"><span className="legend-dot" /> You are here <span className="legend-line" /> Search area</div>
      </div>
      <div className="map-canvas">
        <svg className="floor-plan" viewBox="0 0 920 166" role="img" aria-label="Map of the North study">
          <defs>
            <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#31504a" strokeWidth="0.6" opacity=".43" />
            </pattern>
          </defs>
          <rect width="920" height="166" fill="url(#grid)" />
          <path className="room-outline" d="M110 22 H798 V142 H110 Z" />
          <path className="inner-wall" d="M254 22 V142 M640 22 V54 M640 96 V142" />
          <path className="door-gap" d="M640 54 V96" />
          <path className="window-line" d="M412 22 V31 M455 22 V31 M498 22 V31" />
          <path className="rug-line" d="M330 57 Q480 39 630 57 V116 Q480 135 330 116 Z" />
          <rect className="map-furniture" x="145" y="45" width="70" height="75" rx="3" />
          <rect className="map-furniture" x="710" y="46" width="52" height="75" rx="3" />
          <rect className="map-furniture" x="340" y="36" width="130" height="14" rx="2" />
          <path className="map-furniture" d="M705 22 V50 H775 V22" />
          <g className="map-labels"><text x="158" y="138">BOOKCASE</text><text x="351" y="31">PORTRAIT</text><text x="710" y="137">DESK</text><text x="654" y="83">EXIT</text></g>
          <MapMarker id="bookshelf" x="180" y="82" selected={selected} discovered={discovered} onSelect={onSelect} />
          <MapMarker id="painting" x="405" y="67" selected={selected} discovered={discovered} onSelect={onSelect} />
          <MapMarker id="chest" x="550" y="114" selected={selected} discovered={discovered} onSelect={onSelect} />
          <MapMarker id="desk" x="736" y="84" selected={selected} discovered={discovered} onSelect={onSelect} />
          <MapMarker id="door" x="640" y="75" selected={selected} discovered={discovered} onSelect={onSelect} />

          <circle className="player-pulse" cx="493" cy="85" r="6" />
          <circle className="player-dot" cx="493" cy="85" r="3" />
        </svg>
        <span className="map-note">N ↑</span>
      </div>
    </section>
  )
}

function MapMarker({ id, x, y, selected, discovered, onSelect }) {
  const active = selected === id
  return (
    <g className={`map-marker ${active ? 'active' : ''} ${discovered.includes(id) ? 'found' : ''}`} onClick={() => onSelect(id)}>
      <circle cx={x} cy={y} r="14" className="marker-halo" />
      <circle cx={x} cy={y} r="5" className="marker-core" />
      {discovered.includes(id) && <path className="marker-check" d={`M${x - 3} ${y} l2 2 4 -5`} />}
    </g>
  )
}

function FirstPersonController({ targets, found, onDiscover, onApproach, onLeave, onBlocked, canDiscover = () => true, hauntedRoom = false }) {
  const player = useRef(new THREE.Vector3(0, 1.65, 0))
  const keys = useRef({})
  const blockedTarget = useRef(null)
  const nearbyTarget = useRef(null)
  const yaw = useRef(0)
  const cameraYaw = useRef(0)
  const velocity = useRef(new THREE.Vector3())
  const { camera, gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    camera.position.set(0, 1.65, 0)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(-0.08, 0, 0)

    const lockMouse = () => {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.()
    }
    const look = (event) => {
      if (document.pointerLockElement !== canvas) return
      yaw.current -= event.movementX * 0.0025
      if (yaw.current > Math.PI || yaw.current < -Math.PI) yaw.current = THREE.MathUtils.euclideanModulo(yaw.current + Math.PI, Math.PI * 2) - Math.PI
    }
    const down = (event) => {
      const key = event.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault()
        keys.current[key] = true
      }
    }
    const up = (event) => { keys.current[event.key.toLowerCase()] = false }

    canvas.addEventListener('click', lockMouse)
    document.addEventListener('mousemove', look)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      canvas.removeEventListener('click', lockMouse)
      document.removeEventListener('mousemove', look)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [camera, gl])

  useFrame((_, delta) => {
    const currentKeys = keys.current
    const forwardInput = (currentKeys.arrowup || currentKeys.w ? 1 : 0) - (currentKeys.arrowdown || currentKeys.s ? 1 : 0)
    const strafeInput = (currentKeys.arrowright || currentKeys.d ? 1 : 0) - (currentKeys.arrowleft || currentKeys.a ? 1 : 0)
    const smoothFactor = 1 - Math.exp(-12 * delta)
    cameraYaw.current = THREE.MathUtils.lerp(cameraYaw.current, yaw.current, smoothFactor)
    camera.rotation.set(-0.08, cameraYaw.current, 0)

    const forward = new THREE.Vector3(-Math.sin(cameraYaw.current), 0, -Math.cos(cameraYaw.current))
    const right = new THREE.Vector3(Math.cos(cameraYaw.current), 0, -Math.sin(cameraYaw.current))
    const desired = forward.multiplyScalar(forwardInput * 3.6).add(right.multiplyScalar(strafeInput * 4.2))
    if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(strafeInput !== 0 && forwardInput === 0 ? 4.2 : 3.6)
    velocity.current.lerp(desired, 1 - Math.exp(-22 * delta))
    const step = Math.min(delta, 0.05)
    const xLimit = hauntedRoom ? 10 : 6.05
    const zLimit = hauntedRoom ? 6.45 : 4.45
    player.current.x = THREE.MathUtils.clamp(player.current.x + velocity.current.x * step, -xLimit, xLimit)
    player.current.z = THREE.MathUtils.clamp(player.current.z + velocity.current.z * step, -zLimit, zLimit)

    if (hauntedRoom) {
      const stairProgress = THREE.MathUtils.clamp((player.current.x + 8.2) / 4.3, 0, 1)
      const lowerStairs = Math.abs(player.current.z - 3.05) < 1.05 && player.current.x > -8.7 && player.current.x < -3.7
      const upperStairs = Math.abs(player.current.z + 3.05) < 1.05 && player.current.x > -8.7 && player.current.x < -3.7
      let targetHeight = player.current.y
      if (lowerStairs) targetHeight = 1.65 - stairProgress * 4.8
      if (upperStairs) targetHeight = 1.65 + stairProgress * 5
      if (!lowerStairs && !upperStairs && player.current.x > -3.7) {
        targetHeight = player.current.y > 4 ? 6.65 : player.current.y < -2 ? -3.05 : 1.65
      }
      player.current.y = THREE.MathUtils.damp(player.current.y, targetHeight, 14, delta)
    } else {
      player.current.y = 1.65
    }

    camera.position.set(player.current.x, player.current.y, player.current.z)
    const currentFloor = hauntedRoom ? (player.current.y < -1 ? 'Ground floor' : player.current.y > 4 ? 'Second floor' : 'First floor') : 'First floor'
    targets.forEach(({ id, position, radius = 1.45, floor }) => {
      if (floor && floor !== currentFloor) return
      const nearby = Math.hypot(player.current.x - position[0], player.current.z - position[1]) < radius
      if (!nearby) {
        if (blockedTarget.current === id) blockedTarget.current = null
        if (nearbyTarget.current === id) {
          nearbyTarget.current = null
          onLeave?.(id)
        }
        return
      }
      if (found.includes(id)) return
      if (canDiscover(id)) {
        blockedTarget.current = null
        if (nearbyTarget.current !== id) {
          nearbyTarget.current = id
          if (hauntedRoom) onApproach?.(id)
          else onDiscover(id)
        }
      } else if (blockedTarget.current !== id) {
        blockedTarget.current = id
        onBlocked?.(id)
      }
    })
  })

  return null
}

function Room({ onSelect, selected, chestOpened, won, hauntedRoom, targets, found, onDiscover, onApproach, onLeave, canDiscover, onBlocked }) {
  const interactive = (id) => ({
    onClick: (event) => { event.stopPropagation(); onSelect(id) },
    onPointerOver: (event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' },
    onPointerOut: () => { document.body.style.cursor = 'default' },
  })
  return (
    <Canvas key={hauntedRoom ? 'haunted-room' : 'study-room'} shadows camera={{ position: [0, 1.65, 0], fov: 74 }} dpr={[1, 1.6]}>
      <color attach="background" args={[hauntedRoom ? '#120f15' : '#172522']} />
      <fog attach="fog" args={[hauntedRoom ? '#120f15' : '#172522', hauntedRoom ? 18 : 12, hauntedRoom ? 45 : 24]} />
      <ambientLight intensity={hauntedRoom ? 0.72 : 0.48} color={hauntedRoom ? '#c5bfd0' : '#b9d6c9'} />
      <hemisphereLight skyColor={hauntedRoom ? '#d9d4ff' : '#b9d6c9'} groundColor={hauntedRoom ? '#3b2834' : '#263b36'} intensity={hauntedRoom ? 0.9 : 0.35} />
      <directionalLight position={[0, 13, 1]} intensity={hauntedRoom ? 2.4 : 0.8} color={hauntedRoom ? '#e0dcff' : '#f4d3a0'} />
      <spotLight position={[-2, 8, 3]} angle={0.45} penumbra={0.75} intensity={hauntedRoom ? 42 : 70} color={hauntedRoom ? '#c4b8df' : '#f4d3a0'} castShadow shadow-mapSize={[1024, 1024]} />
      <FloorAudio hauntedRoom={hauntedRoom} />
      {hauntedRoom ? <HauntedRoomContents found={found} /> : <>
        <pointLight position={[4, 2.4, -2]} intensity={18} distance={9} color="#f6b967" />
        <RoomLighting />
        <RoomShell />
        <Rug />
        <Bookcase {...interactive('bookshelf')} />
        <Painting {...interactive('painting')} selected={selected === 'painting'} />
        <Desk {...interactive('desk')} selected={selected === 'desk'} />
        <Chest {...interactive('chest')} opened={chestOpened} selected={selected === 'chest'} />
        <ExitDoor {...interactive('door')} open />
        <Plant />
        <BrokenObjects />
        <WanderingRat path={[[-4.8, 2.8], [-2.4, 2.8], [-1.2, 0.8], [-3.5, -0.5]]} speed={0.48} phase={0.2} />
        <WanderingRat path={[[4.8, 2.8], [2.6, 1.9], [3.2, -0.8], [5.4, -2.5]]} speed={0.34} phase={1.8} scale={0.82} />
      </>}
      <FirstPersonController key={hauntedRoom ? 'haunted-controller' : 'study-controller'} targets={targets} found={found} onDiscover={onDiscover} onApproach={onApproach} onLeave={onLeave} canDiscover={canDiscover} onBlocked={onBlocked} hauntedRoom={hauntedRoom} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.46} scale={hauntedRoom ? 22 : 14} blur={2.2} far={hauntedRoom ? 10 : 5} />
    </Canvas>
  )
}

function FloorAudio({ hauntedRoom }) {
  const { camera, gl } = useThree()
  const audio = useRef(null)

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return undefined
    const canvas = gl.domElement
    let disposed = false

    const makeNoiseBuffer = (context) => {
      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
      const data = buffer.getChannelData(0)
      for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1
      return buffer
    }

    const startAudio = () => {
      if (disposed) return
      if (audio.current) {
        audio.current.context.resume()
        return
      }
      const context = new AudioContextClass()
      const master = context.createGain()
      master.gain.value = 0.16
      master.connect(context.destination)
      const noiseBuffer = makeNoiseBuffer(context)
      const definitions = hauntedRoom
        ? [
            { frequency: 86, type: 'sawtooth', noiseFilter: 900, base: 0.045 },
            { frequency: 38, type: 'triangle', noiseFilter: 260, base: 0.07 },
            { frequency: 178, type: 'sine', noiseFilter: 1800, base: 0.038 },
          ]
        : [{ frequency: 72, type: 'sine', noiseFilter: 700, base: 0.04 }]
      const layers = definitions.map((definition) => {
        const oscillator = context.createOscillator()
        oscillator.type = definition.type
        oscillator.frequency.value = definition.frequency
        const toneGain = context.createGain()
        toneGain.gain.value = 0
        oscillator.connect(toneGain).connect(master)
        oscillator.start()

        const noise = context.createBufferSource()
        noise.buffer = noiseBuffer
        noise.loop = true
        const filter = context.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = definition.noiseFilter
        const noiseGain = context.createGain()
        noiseGain.gain.value = 0
        noise.connect(filter).connect(noiseGain).connect(master)
        noise.start()
        return { oscillator, toneGain, noiseGain, base: definition.base }
      })
      audio.current = { context, layers, nextPulse: 0 }
      context.resume()
    }

    canvas.addEventListener('pointerdown', startAudio)
    window.addEventListener('keydown', startAudio)
    return () => {
      disposed = true
      canvas.removeEventListener('pointerdown', startAudio)
      window.removeEventListener('keydown', startAudio)
      if (audio.current) {
        audio.current.layers.forEach(({ oscillator, noiseGain }) => {
          oscillator.stop()
          noiseGain.disconnect()
        })
        audio.current.context.close()
        audio.current = null
      }
    }
  }, [gl, hauntedRoom])

  useFrame(() => {
    const activeAudio = audio.current
    if (!activeAudio) return
    const { context, layers } = activeAudio
    const floorIndex = hauntedRoom ? (camera.position.y < -1 ? 1 : camera.position.y > 4 ? 2 : 0) : 0
    layers.forEach((layer, index) => {
      const target = index === floorIndex ? layer.base : 0.004
      layer.toneGain.gain.setTargetAtTime(target, context.currentTime, 0.5)
      layer.noiseGain.gain.setTargetAtTime(target * 0.65, context.currentTime, 0.5)
    })
  })

  return null
}

function HauntedRoomContents({ found }) {
  return <>
    <HauntedRoomShell />
    <ThreeStoreyStairs />
    <HauntedLighting />
    <HauntedRoomProps found={found} />
    <HiddenKeyCabinet position={[7.2, 5.18, -4.6]} />
    <KeyClues floorY={-4.62} />
    <KeyClues floorY={5.02} />
    <FinalKey position={[7.2, 6.25, -4.35]} hidden />
  </>
}

function HauntedLighting() {
  return <>
    <HauntedLantern position={[-1.5, -2.25, -4.5]} color="#ff8c55" intensity={13} />
    <HauntedLantern position={[6.6, -2.25, 3.8]} color="#b96aff" intensity={10} unstable phase={1.2} />
    <HauntedLantern position={[-1.5, 2.55, -4.5]} color="#f0a35d" intensity={16} />
    <HauntedLantern position={[6.6, 2.55, 3.8]} color="#8d9cff" intensity={14} unstable phase={2.4} />
    <HauntedLantern position={[-1.5, 7.55, -4.5]} color="#9b8cff" intensity={18} />
    <HauntedLantern position={[6.6, 7.55, 3.8]} color="#ff705b" intensity={13} unstable phase={3.6} />
    <pointLight position={[0, -2.2, 0]} color="#d98675" intensity={34} distance={16} decay={1} />
    <pointLight position={[0, 2.7, 0]} color="#d8b8d2" intensity={42} distance={17} decay={1} />
    <pointLight position={[0, 7.5, 0]} color="#aeb8ff" intensity={46} distance={17} decay={1} />
    <pointLight position={[-7, -2.3, 3]} color="#f0b07a" intensity={22} distance={10} decay={1} />
    <pointLight position={[-7, 2.6, -3]} color="#efc17d" intensity={24} distance={10} decay={1} />
    <pointLight position={[-7, 7.4, 3]} color="#c8c5ff" intensity={28} distance={10} decay={1} />
  </>
}

function HauntedLantern({ position, color, intensity, unstable = false, phase = 0 }) {
  const light = useRef()
  const bulb = useRef()

  useFrame(({ clock }) => {
    if (!unstable || !light.current) return
    const t = clock.elapsedTime + phase
    const flicker = Math.sin(t * 8) * 0.12 + Math.sin(t * 19) * 0.08
    const blink = Math.sin(t * 1.8) > -0.35 ? 1 : 0.18
    const brightness = Math.max(0.08, blink * (0.82 + flicker))
    light.current.intensity = intensity * brightness
    if (bulb.current) bulb.current.emissiveIntensity = 0.4 + brightness * 1.8
  })

  return <group position={position}>
    <mesh castShadow><cylinderGeometry args={[0.2, 0.2, 0.48, 10]} /><meshStandardMaterial color="#302329" metalness={0.65} roughness={0.35} /></mesh>
    <mesh position={[0, -0.03, 0]}><sphereGeometry args={[0.13, 12, 10]} /><meshStandardMaterial ref={bulb} color="#ffd18a" emissive={color} emissiveIntensity={1.5} /></mesh>
    <mesh position={[0, -0.31, 0]}><coneGeometry args={[0.35, 0.18, 8]} /><meshStandardMaterial color="#3a272c" metalness={0.5} /></mesh>
    <pointLight ref={light} color={color} intensity={intensity} distance={7} decay={1.5} />
  </group>
}

function HauntedRoomShell() {
  return <>
    <FloorSlab y={-4.82} color="#211a20" />
    <FloorSlab y={0.02} color="#2b2029" />
    <FloorSlab y={5.02} color="#241c27" />
    <mesh receiveShadow position={[0, 3.5, -7]}><boxGeometry args={[22, 14.2, 0.2]} /><meshStandardMaterial color="#241c27" roughness={0.95} /></mesh>
    <mesh receiveShadow position={[-10.9, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[14, 14.2, 0.2]} /><meshStandardMaterial color="#1b1720" roughness={0.95} /></mesh>
    <mesh receiveShadow position={[10.9, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[14, 14.2, 0.2]} /><meshStandardMaterial color="#1b1720" roughness={0.95} /></mesh>
    <mesh position={[0, 8.1, 0]}><boxGeometry args={[22, 0.16, 14]} /><meshStandardMaterial color="#120f15" roughness={1} /></mesh>
    {[-8, -4, 0, 4, 8].map((x) => <mesh key={x} position={[x, 3.4, -6.84]}><boxGeometry args={[0.24, 6.7, 0.18]} /><meshStandardMaterial color="#473040" roughness={0.8} /></mesh>)}
  </>
}

function FloorSlab({ y, color }) {
  return <>
    <mesh receiveShadow position={[3.9, y, 0]}><boxGeometry args={[14.2, 0.3, 14]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
    <mesh receiveShadow position={[-6.15, y, -5.35]}><boxGeometry args={[6.3, 0.3, 3.3]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
    <mesh receiveShadow position={[-6.15, y, 0]}><boxGeometry args={[6.3, 0.3, 4.3]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
    <mesh receiveShadow position={[-6.15, y, 5.35]}><boxGeometry args={[6.3, 0.3, 3.3]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
  </>
}

function ThreeStoreyStairs() {
  const lowerSteps = Array.from({ length: 10 }, (_, index) => {
    // Keep the underside level with the ground floor so each tread descends
    // toward it, instead of leaving all of the tread tops at first-floor height.
    const height = 4.58 - index * 0.47
    return <mesh key={`lower-${index}`} position={[-8.4 + index * 0.5, -4.82 + height / 2, 3.05]} castShadow><boxGeometry args={[0.52, height, 1.7]} /><meshStandardMaterial color={index % 2 ? '#3c2929' : '#5a3932'} roughness={0.95} /></mesh>
  })
  const upperSteps = Array.from({ length: 10 }, (_, index) => {
    const height = 0.45 + index * 0.5
    return <mesh key={`upper-${index}`} position={[-8.4 + index * 0.5, height / 2, -3.05]} castShadow><boxGeometry args={[0.52, height, 1.7]} /><meshStandardMaterial color={index % 2 ? '#4b3031' : '#694239'} roughness={0.92} /></mesh>
  })

  return <group>
    {lowerSteps}
    {upperSteps}
    <SteelRail startX={-8.7} endX={-3.55} startY={0.62} endY={-3.9} z={2.05} />
    <SteelRail startX={-8.7} endX={-3.55} startY={0.62} endY={-3.9} z={4.05} />
    <SteelStringer startX={-8.55} endX={-3.55} startY={-0.28} endY={-4.45} z={2.05} />
    <SteelStringer startX={-8.55} endX={-3.55} startY={-0.28} endY={-4.45} z={4.05} />
    <SteelRail startX={-8.7} endX={-3.55} startY={1.52} endY={6.0} z={-4.05} />
    <SteelRail startX={-8.7} endX={-3.55} startY={1.52} endY={6.0} z={-2.05} />
    {[-7.7, -6.5, -5.3, -4.1].map((x, index) => <StairBlinker key={`lower-light-${x}`} position={[x, -0.15 - (x + 8.2) * 0.95, 2.02]} color="#ff765c" phase={index * 0.7} />)}
    {[-7.7, -6.5, -5.3, -4.1].map((x, index) => <StairBlinker key={`upper-light-${x}`} position={[x, 0.35 + (x + 8.2) * 0.95, -4.02]} color="#8f9dff" phase={index * 0.7 + 1} />)}
    <mesh position={[-3.25, 0.12, 3.05]}><boxGeometry args={[0.45, 0.24, 2.2]} /><meshStandardMaterial color="#6d4740" roughness={0.8} /></mesh>
    <mesh position={[-3.25, 5.12, -3.05]}><boxGeometry args={[0.45, 0.24, 2.2]} /><meshStandardMaterial color="#6d4740" roughness={0.8} /></mesh>
  </group>
}

function SteelRail({ startX, endX, startY, endY, z }) {
  const dx = endX - startX
  const dy = endY - startY
  const length = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx)
  const posts = Array.from({ length: 5 }, (_, index) => {
    const t = index / 4
    const x = THREE.MathUtils.lerp(startX, endX, t)
    const y = THREE.MathUtils.lerp(startY, endY, t)
    const stepTop = y - 1.05
    return <mesh key={index} position={[x, stepTop + 0.53, z]} castShadow><boxGeometry args={[0.09, 1.06, 0.09]} /><meshStandardMaterial color="#aeb8bb" metalness={0.9} roughness={0.2} /></mesh>
  })
  return <group>
    <mesh position={[(startX + endX) / 2, (startY + endY) / 2, z]} rotation={[0, 0, angle]} castShadow><boxGeometry args={[length, 0.11, 0.11]} /><meshStandardMaterial color="#aeb8bb" metalness={0.9} roughness={0.2} /></mesh>
    {posts}
  </group>
}

function SteelStringer({ startX, endX, startY, endY, z }) {
  const length = Math.hypot(endX - startX, endY - startY)
  const angle = Math.atan2(endY - startY, endX - startX)
  return <mesh position={[(startX + endX) / 2, (startY + endY) / 2, z]} rotation={[0, 0, angle]} castShadow><boxGeometry args={[length, 0.18, 0.18]} /><meshStandardMaterial color="#788387" metalness={0.92} roughness={0.2} /></mesh>
}

function StairBlinker({ position, color, phase = 0 }) {
  const light = useRef()
  const bulb = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase
    const brightness = Math.sin(t * 3.2) > -0.15 ? 1 : 0.08
    if (light.current) light.current.intensity = 8 * brightness
    if (bulb.current) bulb.current.emissiveIntensity = 0.25 + brightness * 2
  })
  return <group position={position}>
    <mesh><sphereGeometry args={[0.1, 12, 8]} /><meshStandardMaterial ref={bulb} color="#ffe0a4" emissive={color} emissiveIntensity={1.5} /></mesh>
    <pointLight ref={light} color={color} intensity={8} distance={3.5} decay={1.2} />
  </group>
}

function HauntedRoomProps({ found }) {
  return <>
    <HauntedTaskProps found={found} />
    <HauntedCross position={[0, 3.4, -6.82]} scale={1.35} />
    <HauntedCross position={[-6.5, 2.5, -6.78]} scale={0.72} rotation={[0, 0.15, 0]} />
    <HauntedCross position={[5.2, 7.7, -6.78]} scale={0.9} rotation={[0, -0.12, 0]} />
    <HauntedCross position={[-5.8, -1.45, -6.78]} scale={0.8} rotation={[0, 0.18, 0]} />
    <BrokenPicture position={[-4.2, 2.4, -6.82]} rotation={[0, 0.08, 0]} />
    <BrokenPicture position={[-4.2, 7.35, -6.82]} rotation={[0, -0.08, 0]} />
    <BrokenPicture position={[4.3, -1.65, -6.82]} rotation={[0, 0.12, 0]} />
    <SpiderWeb position={[-7.8, 3.25, -6.7]} scale={1.1} />
    <SpiderWeb position={[8.4, 3.4, -6.7]} scale={0.8} />
    <SpiderWeb position={[-7.9, 6.9, -6.7]} scale={0.9} />
    <BrokenFurniture position={[-3.6, 0, 4.5]} />
    <BrokenFurniture position={[-3.6, 5, 4.5]} />
    <RitualTable position={[0, 0, -4.55]} />
    <WeaponRack position={[6.9, 0, -6.55]} />
    <WeaponRack position={[6.9, 5, -6.55]} />
    <OldGun position={[6.2, 1.18, -6.35]} rotation={[0, 0, 0.06]} />
    <OldGun position={[7.35, 1.12, -6.34]} rotation={[0, 0, -0.08]} />
    <OldGun position={[6.25, 6.18, -6.35]} rotation={[0, 0, 0.06]} />
    <DeadBody position={[-6.2, 0, 1.8]} rotation={[0, -0.5, 0.12]} />
    <DeadBody position={[3.9, 0, 3.2]} rotation={[0, 1.1, -0.08]} pale />
    <DeadBody position={[-2.8, 0, -1.3]} rotation={[0, -1.6, 0.18]} />
    <DeadBody position={[-5.4, -4.65, 1.8]} rotation={[0, 0.6, 0.12]} />
    <DeadBody position={[3.6, 5, 2.2]} rotation={[0, -1.1, -0.08]} pale />
    <pointLight position={[0, 2.2, -4.3]} color="#c24646" intensity={5} distance={6} />
    <pointLight position={[6.8, 2.6, -6.1]} color="#7565b8" intensity={4} distance={5} />
    <pointLight position={[-6, 1.8, 1.5]} color="#9e4e48" intensity={3} distance={5} />
  </>
}

function HauntedTaskProps({ found }) {
  return <>
    <mesh position={[0, 2.05, -6.55]} castShadow><boxGeometry args={[0.34, 0.22, 0.12]} /><meshStandardMaterial color="#8c3237" emissive="#5d171f" emissiveIntensity={0.5} /></mesh>
    <mesh position={[6.9, 0.62, -5.82]} castShadow><boxGeometry args={[1.15, 0.95, 0.9]} /><meshStandardMaterial color="#4b302b" roughness={0.95} /></mesh>
    <mesh position={[-5.4, -4.12, 1.8]} rotation={[0.08, -0.25, 0.12]} castShadow><boxGeometry args={[0.62, 0.08, 0.42]} /><meshStandardMaterial color="#a77d67" roughness={0.85} /></mesh>
    <mesh position={[5.6, -4.22, -4.18]} castShadow><boxGeometry args={[0.72, 0.6, 0.34]} /><meshStandardMaterial color="#563431" roughness={0.88} /></mesh>
    <mesh position={[3.6, 5.58, 3.2]} rotation={[0, 0.35, -0.1]} castShadow><boxGeometry args={[0.62, 0.08, 0.42]} /><meshStandardMaterial color="#7e91a7" roughness={0.85} /></mesh>
    <mesh position={[5.2, 8.22, -6.55]} castShadow><boxGeometry args={[0.9, 0.14, 0.08]} /><meshStandardMaterial color="#766a85" roughness={0.9} /></mesh>
    {HAUNTED_TASKS.map((task) => found.includes(task.id) && <TaskGem key={task.id} position={GEM_POSITIONS[task.id]} />)}
  </>
}

function TaskGem({ position }) {
  return <group position={position}>
    <mesh rotation={[0.35, 0.6, 0.2]} castShadow><octahedronGeometry args={[0.2, 0]} /><meshStandardMaterial color="#c7f0ff" emissive="#55b7d8" emissiveIntensity={1.5} metalness={0.45} roughness={0.16} /></mesh>
    <pointLight color="#70dfff" intensity={1.8} distance={2.4} decay={2} />
  </group>
}

function BrokenPicture({ position, rotation = [0, 0, 0] }) {
  return <group position={position} rotation={rotation}>
    <mesh castShadow><boxGeometry args={[1.9, 1.45, 0.12]} /><meshStandardMaterial color="#5b3b32" roughness={0.85} /></mesh>
    <mesh position={[0, 0, 0.08]}><planeGeometry args={[1.58, 1.12]} /><meshStandardMaterial color="#24202a" roughness={0.95} /></mesh>
    <mesh position={[-0.22, 0.2, 0.12]} rotation={[0, 0, -0.6]}><boxGeometry args={[0.035, 0.8, 0.025]} /><meshStandardMaterial color="#a28782" emissive="#4d2837" emissiveIntensity={0.25} /></mesh>
    <mesh position={[0.2, -0.18, 0.12]} rotation={[0, 0, 0.8]}><boxGeometry args={[0.035, 0.65, 0.025]} /><meshStandardMaterial color="#a28782" emissive="#4d2837" emissiveIntensity={0.25} /></mesh>
  </group>
}

function SpiderWeb({ position, scale = 1 }) {
  return <group position={position} scale={scale}>
    <mesh rotation={[0, 0, 0]}><boxGeometry args={[1.9, 0.025, 0.025]} /><meshBasicMaterial color="#b7aebb" transparent opacity={0.5} /></mesh>
    <mesh rotation={[0, 0, 0.42]}><boxGeometry args={[1.7, 0.025, 0.025]} /><meshBasicMaterial color="#b7aebb" transparent opacity={0.45} /></mesh>
    <mesh rotation={[0, 0, -0.42]}><boxGeometry args={[1.7, 0.025, 0.025]} /><meshBasicMaterial color="#b7aebb" transparent opacity={0.45} /></mesh>
    <mesh rotation={[0, 0, 1.12]}><boxGeometry args={[1.45, 0.025, 0.025]} /><meshBasicMaterial color="#b7aebb" transparent opacity={0.4} /></mesh>
    <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0.25]}><boxGeometry args={[1.2, 0.02, 0.02]} /><meshBasicMaterial color="#b7aebb" transparent opacity={0.38} /></mesh>
  </group>
}

function BrokenFurniture({ position }) {
  return <group position={position} rotation={[0, -0.12, 0]}>
    <mesh position={[0, 0.75, 0]} castShadow><boxGeometry args={[1.8, 0.16, 0.75]} /><meshStandardMaterial color="#493029" roughness={0.9} /></mesh>
    <mesh position={[-0.75, 0.25, 0]} castShadow><boxGeometry args={[0.14, 0.95, 0.58]} /><meshStandardMaterial color="#38262a" roughness={0.9} /></mesh>
    <mesh position={[0.7, 0.3, 0]} rotation={[0, 0, 0.35]} castShadow><boxGeometry args={[0.14, 1.05, 0.58]} /><meshStandardMaterial color="#38262a" roughness={0.9} /></mesh>
    <mesh position={[0, 0.36, -0.34]} rotation={[0.2, 0, 0.7]} castShadow><boxGeometry args={[1.3, 0.12, 0.14]} /><meshStandardMaterial color="#70453b" roughness={0.9} /></mesh>
  </group>
}

function HauntedCross({ position, scale = 1, rotation = [0, 0, 0] }) {
  return <group position={position} scale={scale} rotation={rotation}>
    <mesh castShadow><boxGeometry args={[0.28, 3.4, 0.22]} /><meshStandardMaterial color="#543832" roughness={0.9} /></mesh>
    <mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[1.85, 0.3, 0.22]} /><meshStandardMaterial color="#543832" roughness={0.9} /></mesh>
    <mesh position={[0, 0.55, 0.13]}><boxGeometry args={[0.08, 1.2, 0.025]} /><meshStandardMaterial color="#bd8c64" emissive="#48232b" emissiveIntensity={0.25} /></mesh>
  </group>
}

function RitualTable({ position }) {
  return <group position={position}>
    <mesh position={[0, 1.05, 0]} castShadow><boxGeometry args={[3.5, 0.22, 1.35]} /><meshStandardMaterial color="#4d302a" roughness={0.85} /></mesh>
    {[-1.35, 1.35].map((x) => <mesh key={x} position={[x, 0.5, 0]} castShadow><boxGeometry args={[0.2, 1.05, 0.95]} /><meshStandardMaterial color="#34231f" roughness={0.9} /></mesh>)}
    <mesh position={[0, 1.22, 0]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.85, 0.05, 0.32]} /><meshStandardMaterial color="#7a2632" emissive="#310f18" emissiveIntensity={0.35} /></mesh>
    <RitualKnife position={[0.5, 1.22, 0.1]} rotation={[0.08, 0.2, -0.1]} />
    <mesh position={[-0.7, 1.33, 0]}><cylinderGeometry args={[0.13, 0.13, 0.24, 12]} /><meshStandardMaterial color="#d0a158" emissive="#8f4c2e" emissiveIntensity={0.8} /></mesh>
    <pointLight position={[-0.7, 1.5, 0]} color="#e18b4b" intensity={2.5} distance={3} />
  </group>
}

function RitualKnife({ position, rotation }) {
  return <group position={position} rotation={rotation}>
    <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.13, 0.75, 4]} /><meshStandardMaterial color="#b8c4c2" metalness={0.85} roughness={0.18} emissive="#35424a" emissiveIntensity={0.25} /></mesh>
    <mesh position={[0, 0, -0.24]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.11, 0.42, 10]} /><meshStandardMaterial color="#422621" roughness={0.75} /></mesh>
  </group>
}

function WeaponRack({ position }) {
  return <group position={position} rotation={[0, Math.PI / 2, 0]}>
    <mesh position={[0, 1.35, 0]} castShadow><boxGeometry args={[2.2, 0.16, 0.18]} /><meshStandardMaterial color="#5a3b2c" roughness={0.85} /></mesh>
    <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[2.2, 0.16, 0.18]} /><meshStandardMaterial color="#5a3b2c" roughness={0.85} /></mesh>
    {[-0.85, 0, 0.85].map((x) => <mesh key={x} position={[x, 0.8, 0]} castShadow><boxGeometry args={[0.14, 1.35, 0.14]} /><meshStandardMaterial color="#453029" roughness={0.85} /></mesh>)}
  </group>
}

function OldGun({ position, rotation }) {
  return <group position={position} rotation={rotation}>
    <mesh position={[0, 0, 0.58]}><boxGeometry args={[0.12, 0.12, 1.35]} /><meshStandardMaterial color="#758084" metalness={0.75} roughness={0.3} /></mesh>
    <mesh position={[0, -0.06, -0.3]} rotation={[0.15, 0, 0]}><boxGeometry args={[0.2, 0.24, 0.62]} /><meshStandardMaterial color="#3c2724" roughness={0.75} /></mesh>
    <mesh position={[0, -0.17, -0.68]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.14, 0.38, 0.2]} /><meshStandardMaterial color="#2c2020" roughness={0.8} /></mesh>
  </group>
}

function RoomLighting() {
  return <>
    <CeilingLamp position={[-4.2, 5.72, -1.9]} color="#f7d49b" intensity={7} />
    <CeilingLamp position={[0, 5.72, -2.4]} color="#ffdca7" intensity={8} />
    <CeilingLamp position={[4.2, 5.72, -1.4]} color="#e9b4ff" intensity={5} />
    <WallSconce position={[-3.8, 4.25, -5.03]} color="#ffc078" phase={0.5} />
    <WallSconce position={[0, 4.25, -5.03]} color="#ffcf83" phase={2.2} unstable />
    <WallSconce position={[3.8, 4.25, -5.03]} color="#c3d8ff" phase={4.1} />
  </>
}

function CeilingLamp({ position, color, intensity }) {
  return <group position={position}>
    <mesh castShadow><cylinderGeometry args={[0.06, 0.06, 0.45, 10]} /><meshStandardMaterial color="#34251f" metalness={0.5} /></mesh>
    <mesh position={[0, -0.3, 0]} castShadow><sphereGeometry args={[0.2, 16, 10]} /><meshStandardMaterial color="#e4b56c" emissive={color} emissiveIntensity={0.8} /></mesh>
    <pointLight position={[0, -0.34, 0]} color={color} intensity={intensity} distance={7} decay={2} />
  </group>
}

function WallSconce({ position, color, phase = 0, unstable = false }) {
  const light = useRef()
  const bulb = useRef()

  useFrame(({ clock }) => {
    if (!unstable || !light.current) return
    const elapsed = clock.elapsedTime + phase
    const sharpFlicker = Math.sin(elapsed * 9) * 0.1 + Math.sin(elapsed * 21) * 0.08
    const blink = Math.sin(elapsed * 2.1) > -0.2 ? 1 : 0.08
    const brightness = Math.max(0.04, blink * (0.78 + sharpFlicker))
    light.current.intensity = 8 * brightness
    if (bulb.current) bulb.current.emissiveIntensity = 0.25 + brightness * 1.5
  })

  return <group position={position}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><boxGeometry args={[0.65, 0.16, 0.24]} /><meshStandardMaterial color="#60442e" metalness={0.55} roughness={0.35} /></mesh>
    <mesh position={[0, 0, 0.15]}><sphereGeometry args={[0.13, 14, 10]} /><meshStandardMaterial ref={bulb} color="#f6c477" emissive={color} emissiveIntensity={1.5} /></mesh>
    <pointLight ref={light} position={[0, 0, 0.22]} color={color} intensity={unstable ? 8 : 5} distance={5.5} decay={2} />
  </group>
}

function BrokenObjects() {
  return <>
    <BrokenMirror />
    <BrokenChair />
    <BrokenVase />
  </>
}

function BrokenMirror() {
  return <group position={[-6.77, 2.45, -1.15]} rotation={[0, Math.PI / 2, 0]}>
    <mesh castShadow><boxGeometry args={[1.55, 2.05, 0.12]} /><meshStandardMaterial color="#76502f" metalness={0.65} roughness={0.35} /></mesh>
    <mesh position={[0, 0, 0.08]}><boxGeometry args={[1.3, 1.8, 0.025]} /><meshStandardMaterial color="#243d3b" roughness={0.25} metalness={0.25} /></mesh>
    <mesh position={[0, 0.42, 0.105]} rotation={[0, 0, -0.5]}><boxGeometry args={[0.035, 0.9, 0.02]} /><meshStandardMaterial color="#b6c8b8" emissive="#789887" emissiveIntensity={0.35} /></mesh>
    <mesh position={[-0.22, -0.28, 0.105]} rotation={[0, 0, 0.75]}><boxGeometry args={[0.03, 0.65, 0.02]} /><meshStandardMaterial color="#b6c8b8" emissive="#789887" emissiveIntensity={0.35} /></mesh>
    <mesh position={[0.2, -0.42, 0.105]} rotation={[0, 0, -1.1]}><boxGeometry args={[0.03, 0.55, 0.02]} /><meshStandardMaterial color="#b6c8b8" emissive="#789887" emissiveIntensity={0.35} /></mesh>
  </group>
}

function BrokenChair() {
  return <group position={[3.35, 0.04, 1.45]} rotation={[0, -0.25, 0.04]}>
    <mesh position={[0, 1.1, 0]} castShadow><boxGeometry args={[1.35, 0.16, 1.18]} /><meshStandardMaterial color="#68452f" roughness={0.8} /></mesh>
    <mesh position={[0, 1.82, 0.42]} rotation={[-0.12, 0, 0]} castShadow><boxGeometry args={[1.25, 1.45, 0.14]} /><meshStandardMaterial color="#5a3c2d" roughness={0.8} /></mesh>
    {[-0.48, 0.48].map((x) => <mesh key={`front-${x}`} position={[x, 0.52, 0.38]} rotation={[0.08, 0, x * 0.05]} castShadow><boxGeometry args={[0.14, 1.1, 0.14]} /><meshStandardMaterial color="#4c3327" /></mesh>)}
    <mesh position={[0.48, 0.5, -0.38]} rotation={[0.52, 0, -0.2]} castShadow><boxGeometry args={[0.14, 1.2, 0.14]} /><meshStandardMaterial color="#4c3327" /></mesh>
    <mesh position={[-0.46, 0.28, -0.38]} rotation={[1.02, 0, 0.2]} castShadow><boxGeometry args={[0.16, 0.8, 0.16]} /><meshStandardMaterial color="#4c3327" /></mesh>
    <mesh position={[-0.85, 0.08, 0.05]} rotation={[0.2, 0.4, 0.5]} castShadow><boxGeometry args={[0.22, 0.18, 0.5]} /><meshStandardMaterial color="#9a6240" /></mesh>
  </group>
}

function BrokenVase() {
  return <group position={[-2.8, 0.08, 2.35]}>
    <mesh position={[0, 0.2, 0]} rotation={[0, 0, -0.25]} castShadow><coneGeometry args={[0.3, 0.5, 7]} /><meshStandardMaterial color="#986044" roughness={0.75} /></mesh>
    <mesh position={[-0.4, 0.08, 0.12]} rotation={[0.1, 0.2, 0.3]} castShadow><dodecahedronGeometry args={[0.12, 0]} /><meshStandardMaterial color="#b87851" roughness={0.8} /></mesh>
    <mesh position={[0.35, 0.07, -0.12]} rotation={[-0.2, 0.1, -0.5]} castShadow><dodecahedronGeometry args={[0.1, 0]} /><meshStandardMaterial color="#b87851" roughness={0.8} /></mesh>
  </group>
}

function WanderingRat({ path, speed, phase = 0, scale = 1 }) {
  const rat = useRef()
  const tail = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.12, -0.2),
    new THREE.Vector3(-0.18, 0.08, -0.46),
    new THREE.Vector3(0.08, 0.06, -0.68),
  ]), [])

  useFrame(({ clock }) => {
    if (!rat.current) return
    const progress = (clock.elapsedTime * speed + phase) % path.length
    const index = Math.floor(progress)
    const blend = progress - index
    const current = path[index]
    const next = path[(index + 1) % path.length]
    const x = THREE.MathUtils.lerp(current[0], next[0], blend)
    const z = THREE.MathUtils.lerp(current[1], next[1], blend)
    rat.current.position.set(x, 0.17 + Math.sin(clock.elapsedTime * 12 + phase) * 0.025, z)
    rat.current.rotation.y = Math.atan2(next[0] - current[0], next[1] - current[1])
  })

  return <group ref={rat} scale={scale}>
    <mesh position={[0, 0.12, 0]} castShadow><sphereGeometry args={[0.22, 14, 10]} /><meshStandardMaterial color="#443b38" roughness={0.95} /></mesh>
    <mesh position={[0, 0.15, 0.25]} castShadow><sphereGeometry args={[0.16, 14, 10]} /><meshStandardMaterial color="#514541" roughness={0.95} /></mesh>
    <mesh position={[-0.1, 0.29, 0.24]} castShadow><sphereGeometry args={[0.07, 10, 8]} /><meshStandardMaterial color="#73534e" /></mesh>
    <mesh position={[0.1, 0.29, 0.24]} castShadow><sphereGeometry args={[0.07, 10, 8]} /><meshStandardMaterial color="#73534e" /></mesh>
    <mesh position={[-0.06, 0.18, 0.39]}><sphereGeometry args={[0.025, 8, 8]} /><meshBasicMaterial color="#e6c67a" /></mesh>
    <mesh position={[0.06, 0.18, 0.39]}><sphereGeometry args={[0.025, 8, 8]} /><meshBasicMaterial color="#e6c67a" /></mesh>
    <mesh><tubeGeometry args={[tail, 12, 0.022, 6, false]} /><meshBasicMaterial color="#765850" /></mesh>
  </group>
}

function HauntedStaircase() {
  const upperSteps = Array.from({ length: 9 }, (_, index) => {
    const height = 0.34 + index * 0.59
    return <mesh key={`up-${index}`} position={[6.65 + index * 0.56, height / 2, -1.9]} castShadow><boxGeometry args={[0.68, height, 1.35]} /><meshStandardMaterial color={index % 2 ? '#493027' : '#62402f'} roughness={0.92} /></mesh>
  })
  const lowerSteps = Array.from({ length: 9 }, (_, index) => {
    const top = -0.34 - index * 0.59
    return <mesh key={`down-${index}`} position={[6.65 + index * 0.56, top / 2, 1.25]} castShadow><boxGeometry args={[0.68, Math.abs(top), 1.35]} /><meshStandardMaterial color={index % 2 ? '#3d2925' : '#51352b'} roughness={0.95} /></mesh>
  })

  return <group>
    <mesh position={[10.7, -0.12, -4.25]} receiveShadow><boxGeometry args={[8, 0.18, 1.5]} /><meshStandardMaterial color="#1b2926" roughness={1} /></mesh>
    <mesh position={[10.7, -0.12, -0.45]} receiveShadow><boxGeometry args={[8, 0.18, 1.05]} /><meshStandardMaterial color="#1b2926" roughness={1} /></mesh>
    <mesh position={[10.7, -0.12, 3.55]} receiveShadow><boxGeometry args={[8, 0.18, 2.9]} /><meshStandardMaterial color="#1b2926" roughness={1} /></mesh>
    <mesh position={[11.7, -4.82, 0.7]} receiveShadow><boxGeometry args={[6.1, 0.3, 7.4]} /><meshStandardMaterial color="#182522" roughness={1} /></mesh>
    <mesh position={[11.7, 5.18, -0.45]} receiveShadow><boxGeometry args={[6.1, 0.3, 7.4]} /><meshStandardMaterial color="#202d29" roughness={1} /></mesh>
    <mesh position={[11.7, 8.1, -0.45]}><boxGeometry args={[6.1, 0.18, 7.4]} /><meshStandardMaterial color="#151e1c" roughness={1} /></mesh>
    {upperSteps}
    {lowerSteps}
    <mesh position={[11.7, 0.05, 2.65]} castShadow><boxGeometry args={[5.7, 0.16, 0.16]} /><meshStandardMaterial color="#34231f" /></mesh>
    <mesh position={[11.7, 5.32, 2.65]} castShadow><boxGeometry args={[5.7, 0.16, 0.16]} /><meshStandardMaterial color="#34231f" /></mesh>
    <mesh position={[11.7, -4.65, 2.65]} castShadow><boxGeometry args={[5.7, 0.16, 0.16]} /><meshStandardMaterial color="#34231f" /></mesh>
    <mesh position={[11.7, 2.5, -3.6]}><boxGeometry args={[5.8, 5.2, 0.12]} /><meshStandardMaterial color="#263732" transparent opacity={0.55} /></mesh>
    <pointLight position={[10.8, 0.8, -1.9]} color="#e18454" intensity={5} distance={5} />
    <pointLight position={[12.2, 5.9, -0.5]} color="#8f9dff" intensity={6} distance={6} />
    <pointLight position={[12, -3.8, 0.4]} color="#a84f4b" intensity={5} distance={6} />
    <FinalKey position={[12.4, -4.28, -0.8]} />
    <DeadBody position={[8.5, 0, 2.55]} rotation={[0, -0.7, 0.08]} />
    <DeadBody position={[12.4, 5.18, 1.2]} rotation={[0, 1.2, -0.05]} pale />
    <DeadBody position={[12.4, -4.65, -0.8]} rotation={[0, -0.2, 0.12]} />
  </group>
}

function HiddenKeyCabinet({ position }) {
  return <group position={position}>
    <mesh position={[0, 0.9, 0.28]} castShadow><boxGeometry args={[1.9, 1.8, 0.18]} /><meshStandardMaterial color="#332326" roughness={0.92} /></mesh>
    <mesh position={[-0.82, 0.02, 0.02]} castShadow><boxGeometry args={[0.18, 1.65, 0.82]} /><meshStandardMaterial color="#563431" roughness={0.85} /></mesh>
    <mesh position={[0.82, 0.02, 0.02]} castShadow><boxGeometry args={[0.18, 1.65, 0.82]} /><meshStandardMaterial color="#563431" roughness={0.85} /></mesh>
    <mesh position={[0, 1.73, 0.02]} castShadow><boxGeometry args={[1.9, 0.16, 0.82]} /><meshStandardMaterial color="#563431" roughness={0.85} /></mesh>
    <mesh position={[0, -0.72, 0.02]} castShadow><boxGeometry args={[1.9, 0.16, 0.82]} /><meshStandardMaterial color="#563431" roughness={0.85} /></mesh>
    <mesh position={[0, 0.45, -0.33]}><boxGeometry args={[1.35, 0.08, 0.06]} /><meshStandardMaterial color="#171216" roughness={1} /></mesh>
    <mesh position={[0.55, 0.2, -0.4]}><sphereGeometry args={[0.06, 10, 8]} /><meshStandardMaterial color="#6f4d38" emissive="#40252b" emissiveIntensity={0.4} /></mesh>
  </group>
}

function KeyClues({ floorY = -4.62 }) {
  return <group>
    {[[2.6, -4.1, 0.1], [4.1, -4.28, -0.18], [5.55, -4.42, 0.08]].map(([x, z, rotation]) => <mesh key={x} position={[x, floorY, z]} rotation={[-Math.PI / 2, 0, rotation]}><boxGeometry args={[0.6, 0.2, 0.025]} /><meshStandardMaterial color="#54252e" emissive="#241018" emissiveIntensity={0.18} roughness={1} /></mesh>)}
    <mesh position={[5.85, floorY + 0.09, -4.58]} rotation={[-Math.PI / 2, 0, -0.08]}><planeGeometry args={[0.48, 0.34]} /><meshStandardMaterial color="#9c795d" roughness={0.9} /></mesh>
    <mesh position={[5.85, floorY + 0.28, -4.58]}><pointLight color="#d58a62" intensity={0.45} distance={1.8} />
    </mesh>
  </group>
}

function FinalKey({ position, hidden = false }) {
  const key = useRef()
  useFrame(({ clock }) => {
    if (!key.current) return
    key.current.position.y = hidden ? 0 : Math.sin(clock.elapsedTime * 2.5) * 0.14
    key.current.rotation.y = hidden ? 0.15 : clock.elapsedTime * 1.6
  })

  return <group ref={key} position={position}>
    <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.16, 0.045, 10, 20]} /><meshStandardMaterial color="#b99b58" emissive="#6b4829" emissiveIntensity={hidden ? 0.28 : 1.4} metalness={0.75} roughness={0.2} /></mesh>
    <mesh position={[0.22, 0, 0]}><boxGeometry args={[0.42, 0.06, 0.06]} /><meshStandardMaterial color="#b99b58" emissive="#6b4829" emissiveIntensity={hidden ? 0.28 : 1.4} metalness={0.75} roughness={0.2} /></mesh>
    <mesh position={[0.42, -0.08, 0]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.08, 0.25, 0.06]} /><meshStandardMaterial color="#b99b58" metalness={0.75} roughness={0.2} /></mesh>
    <pointLight color="#ffc66c" intensity={hidden ? 0.15 : 3} distance={hidden ? 0.8 : 3} />
  </group>
}

function DeadBody({ position, rotation, pale = false }) {
  const cloth = pale ? '#8d958c' : '#423b3a'
  return <group position={position} rotation={rotation}>
    <mesh position={[0, 0.28, 0]} castShadow><boxGeometry args={[0.58, 0.3, 1.45]} /><meshStandardMaterial color={cloth} roughness={1} /></mesh>
    <mesh position={[0, 0.34, 0.98]} castShadow><sphereGeometry args={[0.27, 14, 10]} /><meshStandardMaterial color="#9b7966" roughness={1} /></mesh>
    <mesh position={[-0.45, 0.28, 0.2]} rotation={[0, 0, -0.15]} castShadow><boxGeometry args={[0.14, 0.14, 1.1]} /><meshStandardMaterial color={cloth} roughness={1} /></mesh>
    <mesh position={[0.45, 0.28, 0.2]} rotation={[0, 0, 0.22]} castShadow><boxGeometry args={[0.14, 0.14, 1.1]} /><meshStandardMaterial color={cloth} roughness={1} /></mesh>
    <mesh position={[-0.19, 0.25, -1.02]} rotation={[0, 0, -0.08]} castShadow><boxGeometry args={[0.18, 0.18, 1.05]} /><meshStandardMaterial color="#30282a" roughness={1} /></mesh>
    <mesh position={[0.19, 0.25, -1.02]} rotation={[0, 0, 0.08]} castShadow><boxGeometry args={[0.18, 0.18, 1.05]} /><meshStandardMaterial color="#30282a" roughness={1} /></mesh>
    <mesh position={[0, 0.51, 0.52]} rotation={[0, 0, 0.18]}><boxGeometry args={[0.28, 0.035, 0.32]} /><meshStandardMaterial color="#6b282b" emissive="#3a1013" emissiveIntensity={0.3} /></mesh>
  </group>
}

function HauntedStairs() {
  const key = useRef()
  useFrame(({ clock }) => {
    if (!key.current) return
    key.current.position.y = 2.35 + Math.sin(clock.elapsedTime * 2.5) * 0.12
    key.current.rotation.y = clock.elapsedTime * 1.6
  })

  return <group position={[1.7, 0, -1.3]}>
    <mesh position={[0, 0.18, 0]} rotation={[0, 0.12, 0]} castShadow><boxGeometry args={[2.2, 0.3, 0.85]} /><meshStandardMaterial color="#4a3028" roughness={0.9} /></mesh>
    {Array.from({ length: 7 }, (_, index) => <mesh key={index} position={[0, 0.28 + index * 0.31, -index * 0.42]} rotation={[0, 0.12, 0]} castShadow><boxGeometry args={[2.2 - index * 0.1, 0.28, 0.82]} /><meshStandardMaterial color={index % 2 ? '#5b3d2f' : '#704935'} roughness={0.82} /></mesh>)}
    <mesh position={[-1.02, 1.45, -1.05]} rotation={[0, 0.12, 0.08]} castShadow><boxGeometry args={[0.16, 3.05, 0.16]} /><meshStandardMaterial color="#35231f" roughness={0.7} /></mesh>
    <mesh position={[1.02, 1.45, -1.05]} rotation={[0, 0.12, -0.08]} castShadow><boxGeometry args={[0.16, 3.05, 0.16]} /><meshStandardMaterial color="#35231f" roughness={0.7} /></mesh>
    <mesh position={[0, 2.35, -2.72]} rotation={[0, 0.12, 0]} castShadow><boxGeometry args={[2.1, 0.18, 1.5]} /><meshStandardMaterial color="#30211d" roughness={0.9} /></mesh>
    <pointLight position={[0, 2.2, -1.1]} color="#c56d45" intensity={4} distance={4} />
    <group ref={key} position={[0, 2.35, -1.35]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.16, 0.045, 10, 20]} /><meshStandardMaterial color="#e3bd61" emissive="#b8782f" emissiveIntensity={1.2} metalness={0.75} roughness={0.2} /></mesh>
      <mesh position={[0.22, 0, 0]}><boxGeometry args={[0.42, 0.06, 0.06]} /><meshStandardMaterial color="#e3bd61" emissive="#b8782f" emissiveIntensity={1.2} metalness={0.75} roughness={0.2} /></mesh>
      <mesh position={[0.42, -0.08, 0]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.08, 0.25, 0.06]} /><meshStandardMaterial color="#e3bd61" metalness={0.75} roughness={0.2} /></mesh>
      <pointLight color="#ffc66c" intensity={2.4} distance={2.6} />
    </group>
  </group>
}

function RoomShell() {
  return <>
    <mesh receiveShadow position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14, 11]} /><meshStandardMaterial color="#263b36" roughness={0.9} /></mesh>
    <mesh receiveShadow position={[0, 3.1, -5.2]}><boxGeometry args={[14, 6.5, 0.18]} /><meshStandardMaterial color="#2e4540" roughness={0.85} /></mesh>
    <mesh receiveShadow position={[-6.9, 3.1, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[10.4, 6.5, 0.18]} /><meshStandardMaterial color="#263c38" roughness={0.85} /></mesh>
    <mesh position={[0, 6.2, 0]} rotation={[0, 0, 0]}><boxGeometry args={[14, 0.16, 10.5]} /><meshStandardMaterial color="#1d302d" roughness={1} /></mesh>
    <mesh position={[0, 3.8, -5.08]}><boxGeometry args={[13.9, 0.05, 0.02]} /><meshStandardMaterial color="#d09a55" emissive="#6c4424" emissiveIntensity={0.2} /></mesh>
    <mesh position={[-6.78, 3.8, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[10.2, 0.05, 0.02]} /><meshStandardMaterial color="#d09a55" /></mesh>
  </>
}

function Rug() {
  return <mesh position={[0, 0.015, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[5.9, 4.1]} /><meshStandardMaterial color="#8b4e3e" roughness={1} /></mesh>
}

function Bookcase(props) {
  return <group position={[-5.65, 1.65, -3.8]} {...props}>
    <RoundedBox args={[1.5, 3.15, 0.48]} radius={0.05} smoothness={3} castShadow><meshStandardMaterial color="#54382b" roughness={0.75} /></RoundedBox>
    {[0.9, 0.05, -0.8].map((y) => <mesh key={y} position={[0, y, -0.27]} castShadow><boxGeometry args={[1.3, 0.08, 0.72]} /><meshStandardMaterial color="#b37b4d" /></mesh>)}
    {[-0.37, -0.1, 0.2, 0.48].map((x, i) => <mesh key={x} position={[x, 0.56, -0.28]} rotation={[0, 0, i % 2 ? -0.03 : 0.03]} castShadow><boxGeometry args={[0.18, 0.62 + (i % 2) * 0.1, 0.24]} /><meshStandardMaterial color={['#d29b57', '#6d8c7a', '#b95845', '#c6bb88'][i]} /></mesh>)}
    {[-0.35, -0.1, 0.2, 0.47].map((x, i) => <mesh key={x} position={[x, -0.43, -0.28]} castShadow><boxGeometry args={[0.2, 0.7, 0.23]} /><meshStandardMaterial color={['#9b5a4b', '#c4a05b', '#688477', '#b87953'][i]} /></mesh>)}
  </group>
}

function Painting({ selected, ...props }) {
  return <group position={[0, 2.75, -5.02]} {...props}>
    <mesh castShadow><boxGeometry args={[2.75, 2.15, 0.18]} /><meshStandardMaterial color="#a8753f" metalness={0.65} roughness={0.3} /></mesh>
    <mesh position={[0, 0, 0.11]}><planeGeometry args={[2.35, 1.75]} /><meshStandardMaterial color="#3b5450" roughness={0.9} /></mesh>
    <mesh position={[0, -0.1, 0.2]}><circleGeometry args={[0.58, 32]} /><meshStandardMaterial color="#ad7257" roughness={0.9} /></mesh>
    <mesh position={[0, -0.03, 0.23]}><coneGeometry args={[0.45, 0.95, 4]} /><meshStandardMaterial color="#273934" roughness={0.85} /></mesh>
    <mesh position={[0, -1.14, 0.16]}><boxGeometry args={[1.25, 0.18, 0.09]} /><meshStandardMaterial color="#d8b26a" metalness={0.5} roughness={0.35} /></mesh>
    {selected && <mesh position={[0, 0, 0.3]}><planeGeometry args={[2.9, 2.3]} /><meshBasicMaterial color="#d9b56d" transparent opacity={0.08} side={THREE.DoubleSide} /></mesh>}
  </group>
}

function Desk({ selected, ...props }) {
  return <group position={[4.55, 0, -3.55]} {...props}>
    <mesh position={[0, 1.25, 0]} castShadow><boxGeometry args={[2.45, 0.2, 1.05]} /><meshStandardMaterial color="#6e4932" roughness={0.65} /></mesh>
    {[-0.92, 0.92].map((x) => <mesh key={x} position={[x, 0.6, 0]} castShadow><boxGeometry args={[0.18, 1.3, 0.8]} /><meshStandardMaterial color="#513627" /></mesh>)}
    <mesh position={[0, 1.62, -0.2]} castShadow><boxGeometry args={[0.85, 0.6, 0.5]} /><meshStandardMaterial color="#3e2a22" /></mesh>
    <mesh position={[0, 1.95, 0.12]} castShadow><cylinderGeometry args={[0.18, 0.18, 0.42, 24]} /><meshStandardMaterial color="#b99455" metalness={0.6} /></mesh>
    <mesh position={[0, 2.18, 0.12]} castShadow><sphereGeometry args={[0.35, 20, 12]} /><meshStandardMaterial color="#e2b66d" emissive="#cc762f" emissiveIntensity={0.45} /></mesh>
    {selected && <pointLight position={[0, 2, 0]} color="#ffbd67" intensity={4} distance={3} />}
  </group>
}

function Chest({ opened, selected, ...props }) {
  return <group position={[1.95, 0.48, 3.65]} {...props}>
    <RoundedBox args={[2.2, 0.85, 1.25]} radius={0.12} smoothness={3} castShadow><meshStandardMaterial color="#604331" roughness={0.6} /></RoundedBox>
    <mesh position={[0, 0.52, 0]} rotation={[opened ? -0.25 : 0, 0, 0]} castShadow><boxGeometry args={[2.22, 0.18, 1.26]} /><meshStandardMaterial color="#7c5537" roughness={0.56} /></mesh>
    <mesh position={[0, 0.38, -0.64]} castShadow><boxGeometry args={[0.3, 0.38, 0.09]} /><meshStandardMaterial color="#d09b4e" metalness={0.75} roughness={0.28} /></mesh>
    {opened && <Float speed={3} rotationIntensity={0.1} floatIntensity={0.25}><mesh position={[0, 1.12, 0]} castShadow><boxGeometry args={[0.55, 0.1, 0.22]} /><meshStandardMaterial color="#d7b15f" metalness={0.8} roughness={0.18} /></mesh></Float>}
    {selected && <pointLight position={[0, 1, 0]} color="#f1bb65" intensity={3} distance={2.5} />}
  </group>
}

function ExitDoor({ open, ...props }) {
  return <group position={[6.72, 2.1, -1.9]} {...props}>
    <mesh castShadow><boxGeometry args={[0.22, 4.3, 2.45]} /><meshStandardMaterial color="#52382f" roughness={0.7} /></mesh>
    <group position={[-0.13, 0.18, 0]} rotation={[0, open ? -1.15 : 0, 0]}>
      <mesh castShadow><boxGeometry args={[0.08, 3.7, 1.92]} /><meshStandardMaterial color={open ? '#b98b50' : '#3c4b45'} emissive={open ? '#8c572d' : '#000000'} emissiveIntensity={open ? 0.65 : 0} /></mesh>
      <mesh position={[-0.07, -0.18, 0.72]}><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color="#d5a956" metalness={0.7} /></mesh>
    </group>
    {open && <pointLight position={[-0.3, 1.5, 0]} color="#ffbb66" intensity={8} distance={4} />}
  </group>
}

function Plant() {
  return <group position={[-4.7, 0.02, 3.8]}>
    <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.48, 0.32, 0.86, 20]} /><meshStandardMaterial color="#ad7049" roughness={0.75} /></mesh>
    {[[-0.35, 1.25, 0], [0.25, 1.45, 0.05], [0, 1.75, -0.1], [0.48, 1.85, 0.05]].map(([x, y, z], i) => <mesh key={i} position={[x, y, z]} rotation={[0.2, i, i % 2 ? -0.3 : 0.3]} castShadow><sphereGeometry args={[0.38, 16, 12]} /><meshStandardMaterial color={i % 2 ? '#63816c' : '#426b59'} roughness={0.85} /></mesh>)}
  </group>
}

const CLUES = {
  desk: { title: 'A drawer with no handle', text: 'A thin scratch traces the underside of the desk. Something has been pulled out recently.', action: 'Search underneath', actionText: 'You find a torn note: “What has pages but never speaks?” The answer may matter later.' },
  painting: { title: 'The brass portrait', text: 'The eyes are fixed on the room. A small brass plate below the frame reads: “The first lock remembers 7 · 3 · 1.”', action: 'Memorize the sequence', actionText: 'Sequence logged: 731. It feels like a combination.' },
  bookshelf: { title: 'A wall of quiet books', text: 'Most spines are dust-covered. One book is warm to the touch, but its title is written in a language you do not recognize.', action: 'Pull the warm book', actionText: 'A click echoes from somewhere near the chest.' },
  chest: { title: 'The ironbound chest', text: 'Three brass dials wait below the lid. The combination is the only way to open it.', action: 'Enter combination' },
  door: { title: 'The exit', text: 'A heavy door with a keyhole shaped like a crescent moon. There is no handle on this side.', action: 'Try the door' },
  key: { title: 'The last key', text: 'A cold brass key waits in the new chamber. Search beyond the Christian cross and the weapons rack.', action: 'Take the key' },
  haunted: { title: 'The haunted chamber', text: 'The walls are covered in crosses. A ritual table, old weapons and silent bodies fill the darkness. Find the final key.', action: 'Explore the chamber' },
  cross: { text: 'The cross has fresh scratches beneath it. Press the hidden button to open a panel and claim the gem inside.', action: 'Press the hidden button' },
  weapons: { text: 'A battered crate is wedged beside the weapons rack. Break it open to search for a gem.', action: 'Break open the crate' },
  groundBody: { text: 'The body is cold, but an evidence file is tucked beneath its hand. Open it to find what was hidden.', action: 'Open the evidence file' },
  groundClue: { text: 'Three faded marks stop beside an old cabinet. Unlock it to reveal the gem beside the final clue.', action: 'Open the old cabinet' },
  secondBody: { text: 'A silent figure lies beneath the blue light. A sealed coat file contains something valuable.', action: 'Open the coat file' },
  secondCross: { text: 'The high inscription hides a thin stone panel. Break it to expose the last gem.', action: 'Break the stone panel' },
}

function App() {
  const [selected, setSelected] = useState('painting')
  const [found, setFound] = useState([])
  const [roomComplete, setRoomComplete] = useState(false)
  const [hauntedRoom, setHauntedRoom] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [showWinBanner, setShowWinBanner] = useState(false)
  const [nearbyTask, setNearbyTask] = useState(null)
  const [gems, setGems] = useState(0)
  const [message, setMessage] = useState('Find the portrait, desk and chest to open the next room.')
  const [seconds, setSeconds] = useState(18 * 60 + 42)

  const targets = hauntedRoom ? [...HAUNTED_TASKS, { id: 'key', floor: 'Second floor', position: [7.2, -4.35], radius: 0.62 }] : ROOM_TARGETS
  const clue = CLUES[selected] || CLUES.painting

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value > 0 ? value - 1 : 0), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (hauntedRoom || found.length !== 3) return undefined
    setRoomComplete(true)
    const transition = window.setTimeout(() => {
      setHauntedRoom(true)
      setFound([])
      setSelected('haunted')
      setMessage('The study is complete. A larger haunted chamber has opened beyond the wall.')
      setRoomComplete(false)
    }, 2200)
    return () => window.clearTimeout(transition)
  }, [found.length, hauntedRoom])

  const time = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`, [seconds])

  const isTaskUnlocked = (id) => {
    if (!hauntedRoom) return true
    if (id === 'key') return gems >= GEM_REQUIREMENT
    const task = HAUNTED_TASKS.find((item) => item.id === id)
    if (!task) return true
    const floors = ['First floor', 'Ground floor', 'Second floor']
    const taskFloor = floors.indexOf(task.floor)
    return HAUNTED_TASKS.filter((item) => floors.indexOf(item.floor) < taskFloor).every((item) => found.includes(item.id))
  }

  const selectObject = (id) => {
    setSelected(id)
    setMessage('')
  }

  const approachObject = (id) => {
    setSelected(id)
    setNearbyTask(id)
    if (id === 'key') {
      setMessage(isTaskUnlocked(id) ? `The final key is within reach. Take it with ${GEM_REQUIREMENT} gems.` : `The key is sealed. Find ${GEM_REQUIREMENT} gems before taking it.`)
      return
    }
    const task = HAUNTED_TASKS.find((item) => item.id === id)
    if (task && !found.includes(id)) setMessage(`${task.action} is ready. Use the action button to continue.`)
  }

  const leaveObject = (id) => {
    setNearbyTask((current) => current === id ? null : current)
  }

  const discoverObject = (id) => {
    setSelected(id)
    if (id === 'key') {
      setFound((items) => items.includes(id) ? items : [...items, id])
      setMessage('You found the final key. The house falls silent.')
      setGameWon(true)
      setShowWinBanner(true)
      window.setTimeout(() => setShowWinBanner(false), 4500)
      return
    }
    setFound((items) => items.includes(id) ? items : [...items, id])
    setMessage(`${HOTSPOTS[id].label} completed. Keep searching this floor.`)
  }

  const completeTask = (id) => {
    if (!hauntedRoom || nearbyTask !== id || found.includes(id) || !isTaskUnlocked(id)) return
    if (id === 'key') {
      setFound((items) => items.includes(id) ? items : [...items, id])
      setMessage('You found the final key. The house falls silent.')
      setGameWon(true)
      setShowWinBanner(true)
      setNearbyTask(null)
      window.setTimeout(() => setShowWinBanner(false), 4500)
      return
    }
    const task = HAUNTED_TASKS.find((item) => item.id === id)
    if (!task) return
    setFound((items) => items.includes(id) ? items : [...items, id])
    setGems((count) => count + task.reward)
    setNearbyTask(null)
    setMessage(`${task.actionText} You now have ${gems + task.reward} of ${GEM_REQUIREMENT} gems.`)
  }

  const onBlocked = (id) => {
    setSelected(id)
    setNearbyTask(id)
    if (id === 'key') {
      setMessage(`The key is sealed. You need ${GEM_REQUIREMENT} gems to open it; you have ${gems}.`)
      return
    }
    const task = HAUNTED_TASKS.find((item) => item.id === id)
    setMessage(`This task is locked. Complete the earlier floor tasks before searching the ${task?.floor || 'next'} area.`)
  }

  const visibleTasks = hauntedRoom ? HAUNTED_TASKS : ROOM_TASKS
  const selectedTask = HAUNTED_TASKS.find((task) => task.id === selected)
  const actionAvailable = hauntedRoom && nearbyTask === selected && !found.includes(selected) && isTaskUnlocked(selected)
  const taskFloors = hauntedRoom ? ['First floor', 'Ground floor', 'Second floor'] : ['First floor']
  const taskTotal = hauntedRoom ? HAUNTED_TASKS.length + 1 : ROOM_TASKS.length

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><div><p className="brand-kicker">A QUIET PLACE TO</p><h1>ESCAPE</h1></div></div>
      <div className="game-title"><span>CASE 014 · {hauntedRoom ? 'HAUNTED CHAMBER' : 'THE STUDY'}</span><strong>{hauntedRoom ? 'THE LAST ROOM' : 'THE LAST ROOM'}</strong></div>
      <div className="top-status"><div className="timer"><span className="timer-dot" />{time}</div>{hauntedRoom && <div className="gem-counter"><span>◇</span><b>{gems} / {GEM_REQUIREMENT}</b><small>GEMS</small></div>}<div className="progress"><span>{hauntedRoom ? 'HOUSE TASKS' : 'ROOM TASKS'}</span><b>{found.length} / {taskTotal}</b><i><em style={{ width: `${found.length / taskTotal * 100}%` }} /></i></div></div>
    </header>

    <Map selected={selected} discovered={found} onSelect={selectObject} />

    <section className="game-layout">
      <div className="scene-wrap">
        <div className="scene-toolbar"><span className="live-dot" /> LIVE VIEW <span className="toolbar-divider" /> FIRST-PERSON POV <span className="toolbar-right">{hauntedRoom ? 'HAUNTED CHAMBER' : 'ONE ROOM · MOUSE LOOK'}</span></div>
        <div className="scene-frame"><Room onSelect={selectObject} selected={selected} chestOpened={false} won={gameWon} hauntedRoom={hauntedRoom} targets={targets} found={found} onDiscover={discoverObject} onApproach={approachObject} onLeave={leaveObject} canDiscover={isTaskUnlocked} onBlocked={onBlocked} /><div className="fps-crosshair" aria-hidden="true"><span /></div><div className="fps-hint">CLICK TO LOOK 360° LEFT / RIGHT <span>·</span> A / D OR ← / → TO STRAFE <span>·</span> W / S TO WALK</div>{roomComplete && <div className="win-banner"><span className="win-icon">✦</span><div><p>THREE TASKS COMPLETE</p><strong>The haunted chamber is opening…</strong></div><span className="round-loader">● ● ●</span></div>}{showWinBanner && <div className="win-banner final-win"><span className="win-icon">⚿</span><div><p>FINAL KEY FOUND</p><strong>The house falls silent.</strong></div></div>}</div>
        <div className="scene-caption"><span>{hauntedRoom ? 'The new chamber has three floors. Walk to the left stairwell: front stairs descend, back stairs rise.' : 'One focused room. Find the portrait, desk and chest, then the next chamber will open.'}</span><span className="coordinates">FPS POV <b>●</b> POINTER LOCK</span></div>
      </div>

      <aside className="clue-panel">
        <div className="panel-top"><p className="eyebrow">Investigation log</p><span className="panel-count">{found.length.toString().padStart(2, '0')} / {taskTotal.toString().padStart(2, '0')}</span></div>
        <div className="object-heading"><span className="object-icon">{HOTSPOTS[selected].icon}</span><div><p>{HOTSPOTS[selected].location}</p><h2>{HOTSPOTS[selected].label}</h2></div></div>
        <div className="clue-copy"><p>{clue.text}</p></div>
        {hauntedRoom && <button className="action-button task-action" type="button" disabled={!actionAvailable} onClick={() => completeTask(selected)}>{found.includes(selected) ? 'Task completed' : selected === 'key' ? 'Take the final key' : selectedTask?.action || 'Move closer to interact'}<span>↗</span></button>}
        {message && <div className="feedback"><span>✓</span>{message}</div>}
        <div className="action-button movement-tip"><span className="key-cap">↑</span><span className="key-cap">↓</span><span className="key-cap">←</span><span className="key-cap">→</span><strong>Move toward the object</strong></div>
        <div className="inventory"><div className="inventory-head"><span>{hauntedRoom ? 'Haunted chamber' : 'Room objectives'}</span><span>{hauntedRoom ? `${gems} / ${GEM_REQUIREMENT} GEMS` : '3 TASKS'}</span></div><div className="floor-objectives">{taskFloors.map((floor) => <div className="floor-objective" key={floor}><div className="floor-objective-head"><b>{floor}</b><small>{hauntedRoom ? `${visibleTasks.filter((task) => task.floor === floor && found.includes(task.id)).length} / ${visibleTasks.filter((task) => task.floor === floor).length}` : '3 TASKS'}</small></div>{visibleTasks.filter((task) => task.floor === floor).map((task) => <div className={`floor-task ${found.includes(task.id) ? 'completed' : ''} ${!isTaskUnlocked(task.id) ? 'locked' : ''}`} key={task.id}><span>{found.includes(task.id) ? '✓' : '·'}</span>{task.text}</div>)}</div>)}{hauntedRoom && <div className={`floor-objective final-objective ${found.includes('key') ? 'completed' : ''}`}><div className="floor-objective-head"><b>Final goal</b><small>{found.includes('key') ? 'FOUND' : 'HIDDEN'}</small></div><div className={`floor-task ${!isTaskUnlocked('key') ? 'locked' : ''}`}><span>{found.includes('key') ? '✓' : '·'}</span>Find the last key inside the cabinet ({GEM_REQUIREMENT} gems)</div></div>}</div></div>
        <div className="hint-footer"><span className="hint-bulb">✧</span><span><b>How to play</b> Click the scene to capture the mouse. Look left or right, move with WASD, then get close and use the task button to claim each gem.</span></div>
      </aside>
    </section>
  </main>
}

export default App
