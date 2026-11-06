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
}

const ROUND_TARGETS = [
  [
    { id: 'painting', position: [0, -4.55] },
    { id: 'desk', position: [4.55, -3.55] },
    { id: 'chest', position: [1.95, 3.65] },
  ],
  [
    { id: 'bookshelf', position: [-5.65, -3.8] },
    { id: 'door', position: [6.05, -1.9] },
    { id: 'desk', position: [4.55, -3.55] },
  ],
]

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

function FirstPersonController({ targets, found, onDiscover }) {
  const player = useRef(new THREE.Vector3(0, 1.65, 0))
  const keys = useRef({})
  const yaw = useRef(0)
  const { camera, gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const maxYaw = Math.PI * 0.42 // About 151 degrees total; the player cannot spin all the way around.
    camera.position.set(0, 1.65, 0)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(-0.08, 0, 0)

    const lockMouse = () => {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.()
    }
    const look = (event) => {
      if (document.pointerLockElement !== canvas) return
      yaw.current = THREE.MathUtils.clamp(yaw.current - event.movementX * 0.0025, -maxYaw, maxYaw)
      camera.rotation.set(-0.08, yaw.current, 0)
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
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current))
    const direction = forward.multiplyScalar(forwardInput).add(right.multiplyScalar(strafeInput))

    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(Math.min(delta, 0.05) * 3.2)
      player.current.x = THREE.MathUtils.clamp(player.current.x + direction.x, -6.05, 6.05)
      player.current.z = THREE.MathUtils.clamp(player.current.z + direction.z, -4.55, 4.45)
    }

    camera.position.set(player.current.x, 1.65, player.current.z)
    targets.forEach(({ id, position }) => {
      if (!found.includes(id) && Math.hypot(player.current.x - position[0], player.current.z - position[1]) < 1.45) {
        onDiscover(id)
      }
    })
  })

  return null
}

function Room({ onSelect, selected, chestOpened, won, targets, found, onDiscover }) {
  const interactive = (id) => ({
    onClick: (event) => { event.stopPropagation(); onSelect(id) },
    onPointerOver: (event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' },
    onPointerOut: () => { document.body.style.cursor = 'default' },
  })
  return (
    <Canvas shadows camera={{ position: [0, 1.65, 0], fov: 74 }} dpr={[1, 1.6]}>
      <color attach="background" args={['#172522']} />
      <fog attach="fog" args={['#172522', 12, 24]} />
      <ambientLight intensity={0.48} color="#b9d6c9" />
      <spotLight position={[-2, 8, 3]} angle={0.45} penumbra={0.75} intensity={70} color="#f4d3a0" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[4, 2.4, -2]} intensity={18} distance={9} color="#f6b967" />
      <RoomLighting />

      <RoomShell />
      <Rug />
      <Bookcase {...interactive('bookshelf')} />
      <Painting {...interactive('painting')} selected={selected === 'painting'} />
      <Desk {...interactive('desk')} selected={selected === 'desk'} />
      <Chest {...interactive('chest')} opened={chestOpened} selected={selected === 'chest'} />
      <ExitDoor {...interactive('door')} open={won} />
      <Plant />
      <BrokenObjects />
      <WanderingRat path={[[-4.8, 2.8], [-2.4, 2.8], [-1.2, 0.8], [-3.5, -0.5]]} speed={0.48} phase={0.2} />
      <WanderingRat path={[[4.8, 2.8], [2.6, 1.9], [3.2, -0.8], [5.4, -2.5]]} speed={0.34} phase={1.8} scale={0.82} />
      <FirstPersonController targets={targets} found={found} onDiscover={onDiscover} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={14} blur={2.2} far={5} />
    </Canvas>
  )
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
    <mesh ref={bulb} position={[0, 0, 0.15]}><sphereGeometry args={[0.13, 14, 10]} /><meshStandardMaterial color="#f6c477" emissive={color} emissiveIntensity={1.5} /></mesh>
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
    <mesh position={[-0.13, 0.18, 0]} castShadow><boxGeometry args={[0.08, 3.7, 1.92]} /><meshStandardMaterial color={open ? '#b98b50' : '#3c4b45'} emissive={open ? '#8c572d' : '#000000'} emissiveIntensity={open ? 0.65 : 0} /></mesh>
    <mesh position={[-0.2, 0, 0.72]}><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color="#d5a956" metalness={0.7} /></mesh>
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
}

function App() {
  const [round, setRound] = useState(1)
  const [selected, setSelected] = useState('painting')
  const [found, setFound] = useState([])
  const [roundComplete, setRoundComplete] = useState(false)
  const [message, setMessage] = useState('')
  const [seconds, setSeconds] = useState(18 * 60 + 42)

  const targets = ROUND_TARGETS[(round - 1) % ROUND_TARGETS.length]
  const clue = CLUES[selected]

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value > 0 ? value - 1 : 0), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (found.length !== 3) return undefined
    setRoundComplete(true)
    const nextRound = window.setTimeout(() => {
      setRound((value) => value + 1)
      setFound([])
      setSelected('painting')
      setMessage('New room loaded. Find the next three objects.')
      setRoundComplete(false)
    }, 2600)
    return () => window.clearTimeout(nextRound)
  }, [found.length])

  const time = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`, [seconds])

  const selectObject = (id) => {
    setSelected(id)
    setMessage('')
  }

  const discoverObject = (id) => {
    setSelected(id)
    setMessage(`${HOTSPOTS[id].label} found. Keep moving to locate the other objects.`)
    setFound((items) => items.includes(id) ? items : [...items, id])
  }

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><div><p className="brand-kicker">A QUIET PLACE TO</p><h1>ESCAPE</h1></div></div>
      <div className="game-title"><span>CASE 014 · ROUND {String(round).padStart(2, '0')}</span><strong>THE LAST ROOM</strong></div>
      <div className="top-status"><div className="timer"><span className="timer-dot" />{time}</div><div className="progress"><span>OBJECTS</span><b>{found.length} / 3</b><i><em style={{ width: `${found.length / 3 * 100}%` }} /></i></div></div>
    </header>

    <Map selected={selected} discovered={found} onSelect={selectObject} />

    <section className="game-layout">
      <div className="scene-wrap">
        <div className="scene-toolbar"><span className="live-dot" /> LIVE VIEW <span className="toolbar-divider" /> FIRST-PERSON POV <span className="toolbar-right">ROUND {String(round).padStart(2, '0')} · MOUSE LOOK</span></div>
        <div className="scene-frame"><Room onSelect={selectObject} selected={selected} chestOpened={false} won={roundComplete} targets={targets} found={found} onDiscover={discoverObject} /><div className="fps-crosshair" aria-hidden="true"><span /></div><div className="fps-hint">CLICK TO LOOK LEFT / RIGHT <span>·</span> WASD / ARROWS TO MOVE</div>{roundComplete && <div className="win-banner"><span className="win-icon">✦</span><div><p>ROUND COMPLETE</p><strong>Next room loading…</strong></div><span className="round-loader">● ● ●</span></div>}</div>
        <div className="scene-caption"><span>First-person view. Click the room and look left or right, then walk close to all three objects.</span><span className="coordinates">FPS POV <b>●</b> POINTER LOCK</span></div>
      </div>

      <aside className="clue-panel">
        <div className="panel-top"><p className="eyebrow">Investigation log</p><span className="panel-count">{found.length.toString().padStart(2, '0')} FOUND</span></div>
        <div className="object-heading"><span className="object-icon">{HOTSPOTS[selected].icon}</span><div><p>{HOTSPOTS[selected].location}</p><h2>{HOTSPOTS[selected].label}</h2></div></div>
        <div className="clue-copy"><p>{clue.text}</p></div>
        {message && <div className="feedback"><span>✓</span>{message}</div>}
        <div className="action-button movement-tip"><span className="key-cap">↑</span><span className="key-cap">↓</span><span className="key-cap">←</span><span className="key-cap">→</span><strong>Move toward the object</strong></div>
        <div className="inventory"><div className="inventory-head"><span>Round {round} objectives</span><span>{found.length} / 03</span></div><div className="inventory-items">{targets.map((target) => <div className={`inventory-item ${found.includes(target.id) ? 'collected' : 'locked'}`} key={target.id}><span>{found.includes(target.id) ? '✓' : '·'}</span><div><b>{HOTSPOTS[target.id].short}</b><small>{found.includes(target.id) ? 'Located' : 'Not located'}</small></div></div>)}</div></div>
        <div className="hint-footer"><span className="hint-bulb">✧</span><span><b>How to play</b> Click the scene to capture the mouse. Look left or right, move with WASD, and get close enough to register a find.</span></div>
      </aside>
    </section>
  </main>
}

export default App
