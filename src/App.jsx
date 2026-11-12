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
  hammer: { label: 'The iron hammer', short: 'Hammer', location: 'First floor', icon: '⚒' },
  weapon: { label: 'The rack weapon', short: 'Weapon', location: 'First floor', icon: '⚔' },
  guardDog: { label: 'The guard bulldog', short: 'Bulldog', location: 'First floor', icon: '🐕' },
  guardDog2: { label: 'The second guard bulldog', short: 'Bulldog', location: 'First floor', icon: '🐕' },
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
  { id: 'guardDog', floor: 'First floor', text: 'Calm the guard bulldog', action: 'Calm the bulldog', actionText: 'The bulldog relaxes and wags its tail. The first-floor route is clear.', reward: 0, position: [-1.6, 5.1], radius: 1.5 },
  { id: 'cross', floor: 'First floor', text: 'Press the hidden button', action: 'Press the hidden button', actionText: 'A panel opens behind the cross and reveals a crimson gem.', reward: 1, requiresHammer: true, requiresTask: 'guardDog', position: [0, -6.1], radius: 0.9 },
  { id: 'weapons', floor: 'First floor', text: 'Break open the weapons crate', action: 'Break open the crate', actionText: 'The splintered crate contains a violet gem.', reward: 1, requiresHammer: true, requiresTask: 'guardDog', position: [6.9, -6.05], radius: 0.9 },
  { id: 'groundBody', floor: 'Ground floor', text: 'Open the evidence file', action: 'Open the evidence file', actionText: 'A bloodstained file folds around an amber gem.', reward: 1, position: [-5.4, 1.8], radius: 0.9 },
  { id: 'groundClue', floor: 'Ground floor', text: 'Unlock the blood-marked cabinet', action: 'Open the old cabinet', actionText: 'Inside the cabinet, a green gem glows beside the clues.', reward: 1, position: [5.6, -4.2], radius: 0.85 },
  { id: 'secondBody', floor: 'Second floor', text: 'Open the coat file', action: 'Open the coat file', actionText: 'The hidden pocket holds a blue gem.', reward: 1, position: [3.6, 3.2], radius: 0.9 },
  { id: 'secondCross', floor: 'Second floor', text: 'Break the stone panel', action: 'Break the stone panel', actionText: 'Behind the inscription is a final white gem.', reward: 1, requiresHammer: true, position: [5.2, -6.1], radius: 0.9 },
]
const HAMMER_TARGET = { id: 'hammer', floor: 'First floor', position: [2.8, -1.55], radius: 0.9 }
const SECOND_DOG_TARGET = { id: 'guardDog2', floor: 'First floor', position: [7.8, 5.1], radius: 1.5 }
const WEAPON_TARGET = { id: 'weapon', floor: 'First floor', position: [6.9, -5.72], radius: 1.1 }
const DOG_HAZARDS = [
  { position: [-3.4, 0.18, 5.7], path: [[-3.4, 5.7], [-0.4, 5.7], [-0.4, 4.55], [-3.4, 4.55]], speed: 0.52, anchor: [-1.6, 0.18, 6.75], phase: 0.4 },
  { position: [5.3, 0.18, 5.6], path: [[5.3, 5.6], [8.8, 5.6], [8.8, 4.45], [5.3, 4.45]], speed: 0.46, anchor: [7.8, 0.18, 6.75], phase: 1.8 },
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

function FirstPersonController({ targets, found, collected = [], onDiscover, onApproach, onLeave, onBlocked, onShoot, onReload, onAim, onFloorChange, onJump, canDiscover = () => true, hauntedRoom = false, paused = false, sensitivity = 1, aiming = false }) {
  const player = useRef(new THREE.Vector3(0, 1.65, 0))
  const keys = useRef({})
  const blockedTarget = useRef(null)
  const nearbyTarget = useRef(null)
  const stairMode = useRef(null)
  const lastFloor = useRef(null)
  const yaw = useRef(0)
  const pitch = useRef(-0.08)
  const cameraYaw = useRef(0)
  const cameraPitch = useRef(-0.08)
  const velocity = useRef(new THREE.Vector3())
  const jumpOffset = useRef(0)
  const jumpVelocity = useRef(0)
  const grounded = useRef(true)
  const { camera, gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    camera.position.set(0, 1.65, 0)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(-0.08, 0, 0)

    const lockMouse = () => {
      if (paused || document.pointerLockElement === canvas) return
      try {
        const request = canvas.requestPointerLock?.()
        // Browsers can reject a request during the short handoff after unlock.
        // Consume that expected rejection so it cannot trigger the fatal overlay.
        request?.catch?.(() => {})
      } catch {
        // Pointer lock is optional; normal keyboard movement remains available.
      }
    }
    const fire = () => {
      if (!paused) {
        const direction = new THREE.Vector3()
        camera.getWorldDirection(direction)
        onShoot?.({ position: player.current.clone(), yaw: cameraYaw.current, pitch: cameraPitch.current, direction })
      }
    }
    const look = (event) => {
      if (document.pointerLockElement !== canvas) return
      if (paused) return
      const lookScale = 0.0025 * sensitivity * (aiming ? 0.45 : 1)
      yaw.current -= event.movementX * lookScale
      if (aiming) pitch.current = THREE.MathUtils.clamp(pitch.current - event.movementY * lookScale, -1.15, 0.95)
      if (yaw.current > Math.PI || yaw.current < -Math.PI) yaw.current = THREE.MathUtils.euclideanModulo(yaw.current + Math.PI, Math.PI * 2) - Math.PI
    }
    const down = (event) => {
      const key = event.key.toLowerCase()
      if (key === 'shift') onAim?.(true)
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault()
        keys.current[key] = true
      }
      if (key === 'f' || key === ' ') {
        event.preventDefault()
        fire()
      }
      if (key === 'r') {
        event.preventDefault()
        onReload?.()
      }
      if (key === 'j' && !event.repeat && grounded.current && !paused) {
        event.preventDefault()
        jumpVelocity.current = 5.2
        grounded.current = false
        onJump?.('jump')
      }
    }
    const up = (event) => {
      const key = event.key.toLowerCase()
      keys.current[key] = false
      if (key === 'shift') onAim?.(false)
    }
    const mouseDown = (event) => {
      if (event.button === 2) {
        event.preventDefault()
        if (!paused) onAim?.(true)
      }
      if (!paused && event.button === 0 && document.pointerLockElement === canvas) fire()
    }
    const mouseUp = (event) => {
      if (event.button === 2) onAim?.(false)
    }
    const contextMenu = (event) => event.preventDefault()

    canvas.addEventListener('click', lockMouse)
    canvas.addEventListener('mousedown', mouseDown)
    canvas.addEventListener('mouseup', mouseUp)
    canvas.addEventListener('contextmenu', contextMenu)
    document.addEventListener('mousemove', look)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      canvas.removeEventListener('click', lockMouse)
      canvas.removeEventListener('mousedown', mouseDown)
      canvas.removeEventListener('mouseup', mouseUp)
      canvas.removeEventListener('contextmenu', contextMenu)
      document.removeEventListener('mousemove', look)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [camera, gl, onAim, onFloorChange, onJump, onReload, onShoot, paused, sensitivity, aiming])

  useFrame((_, delta) => {
    if (paused) {
      velocity.current.set(0, 0, 0)
      return
    }
    const currentKeys = keys.current
    const forwardInput = (currentKeys.arrowup || currentKeys.w ? 1 : 0) - (currentKeys.arrowdown || currentKeys.s ? 1 : 0)
    const strafeInput = (currentKeys.arrowright || currentKeys.d ? 1 : 0) - (currentKeys.arrowleft || currentKeys.a ? 1 : 0)
    const smoothFactor = 1 - Math.exp(-12 * delta)
    cameraYaw.current = THREE.MathUtils.lerp(cameraYaw.current, yaw.current, smoothFactor)
    const targetPitch = aiming ? pitch.current : -0.08
    cameraPitch.current = THREE.MathUtils.lerp(cameraPitch.current, targetPitch, smoothFactor)
    camera.rotation.set(cameraPitch.current, cameraYaw.current, 0)

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
      const lowerStairZone = Math.abs(player.current.z - 3.05) < 1.05 && player.current.x > -8.7 && player.current.x < -3.7
      const upperStairZone = Math.abs(player.current.z + 3.05) < 1.05 && player.current.x > -8.7 && player.current.x < -3.7
      if (!lowerStairZone && !upperStairZone) stairMode.current = null
      if (stairMode.current === null) {
        // The lower staircase connects only the ground and first floors. The
        // second-floor landing above it is capped, so do not let the player
        // fall onto the lower stairwell from above.
        if (lowerStairZone) stairMode.current = player.current.y > 4 ? 'blocked' : 'lower'
        // The upper staircase is not present on the ground floor, so keep that opening closed there.
        if (upperStairZone) stairMode.current = player.current.y > -1 ? 'upper' : 'blocked'
      }
      const lowerStairs = lowerStairZone && stairMode.current === 'lower'
      const upperStairs = upperStairZone && stairMode.current === 'upper'
      let targetHeight = player.current.y
      if (lowerStairs) targetHeight = 1.65 - stairProgress * 4.8
      if (upperStairs) targetHeight = 1.65 + stairProgress * 5
      if (!lowerStairs && !upperStairs && player.current.x > -3.7) {
        targetHeight = player.current.y > 4 ? 6.65 : player.current.y < -2 ? -3.05 : 1.65
      }
      player.current.y = THREE.MathUtils.damp(player.current.y, targetHeight, 14, delta)
      const canJump = !lowerStairs && !upperStairs
      if (!canJump) {
        jumpOffset.current = 0
        jumpVelocity.current = 0
        grounded.current = false
      } else {
        grounded.current = jumpOffset.current <= 0.001 && jumpVelocity.current === 0
      }
    } else {
      player.current.y = 1.65
      grounded.current = jumpOffset.current <= 0.001 && jumpVelocity.current === 0
    }

    if (grounded.current || jumpVelocity.current !== 0 || jumpOffset.current > 0) {
      const wasAirborne = jumpOffset.current > 0
      jumpVelocity.current -= 16 * step
      jumpOffset.current = Math.max(0, jumpOffset.current + jumpVelocity.current * step)
      if (jumpOffset.current === 0 && jumpVelocity.current < 0) {
        jumpVelocity.current = 0
        grounded.current = true
        if (wasAirborne) onJump?.('land')
      }
      player.current.y += jumpOffset.current
    }

    camera.position.set(player.current.x, player.current.y, player.current.z)
    const currentFloor = hauntedRoom ? (player.current.y < -1 ? 'Ground floor' : player.current.y > 5.8 ? 'Second floor' : 'First floor') : 'First floor'
    if (currentFloor !== lastFloor.current) {
      lastFloor.current = currentFloor
      onFloorChange?.(currentFloor)
    }
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
      if (found.includes(id) || collected.includes(id)) return
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

function Room({ onSelect, selected, chestOpened, won, hauntedRoom, targets, found, collected, onDiscover, onApproach, onLeave, canDiscover, onBlocked, onShoot, onReload, onAim, onFloorChange, onJump, hasHammer, hasGun, equipped, aiming, hammerSwing, shot, reloading, ammo, enemiesDefeated, droppedItems, paused, sensitivity, lowQuality, audioSettings, muted, reduceMotion, shotImpacts, sleepingDogs, combatActive, onEnemyAttack, cameraShake = 0, health = 100, gems = 0 }) {
  const interactive = (id) => ({
    onClick: (event) => { event.stopPropagation(); onSelect(id) },
    onPointerOver: (event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' },
    onPointerOut: () => { document.body.style.cursor = 'default' },
  })
  return (
    <Canvas key={hauntedRoom ? 'haunted-room' : 'study-room'} shadows={!lowQuality} camera={{ position: [0, 1.65, 0], fov: 74 }} dpr={lowQuality ? [0.7, 1] : [1, 1.6]}>
      <color attach="background" args={[hauntedRoom ? '#120f15' : '#172522']} />
      <fog attach="fog" args={[hauntedRoom ? '#120f15' : '#172522', hauntedRoom ? 18 : 12, hauntedRoom ? 45 : 24]} />
      <ambientLight intensity={hauntedRoom ? 0.72 : 0.48} color={hauntedRoom ? '#c5bfd0' : '#b9d6c9'} />
      <hemisphereLight skyColor={hauntedRoom ? '#d9d4ff' : '#b9d6c9'} groundColor={hauntedRoom ? '#3b2834' : '#263b36'} intensity={hauntedRoom ? 0.9 : 0.35} />
      <directionalLight position={[0, 13, 1]} intensity={hauntedRoom ? 2.4 : 0.8} color={hauntedRoom ? '#e0dcff' : '#f4d3a0'} />
      <spotLight position={[-2, 8, 3]} angle={0.45} penumbra={0.75} intensity={hauntedRoom ? 42 : 70} color={hauntedRoom ? '#c4b8df' : '#f4d3a0'} castShadow shadow-mapSize={[1024, 1024]} />
      <FloorAudio hauntedRoom={hauntedRoom} audioSettings={audioSettings} muted={muted || paused} />
      <FootstepAudio hauntedRoom={hauntedRoom} audioSettings={audioSettings} muted={muted || paused} />
      <HeartbeatAudio active={hauntedRoom && (combatActive || health < 40)} critical={health < 40} audioSettings={audioSettings} muted={muted || paused} />
      {hauntedRoom ? <HauntedRoomContents found={found} hasHammer={hasHammer} hasGun={hasGun} enemiesDefeated={enemiesDefeated} gems={gems} droppedItems={droppedItems} audioSettings={audioSettings} muted={muted || paused} sleepingDogs={sleepingDogs} combatActive={combatActive} onEnemyAttack={onEnemyAttack} /> : <>
        <pointLight position={[4, 2.4, -2]} intensity={18} distance={9} color="#f6b967" />
        <RoomLighting />
        <RoomShell />
        <Rug />
        <Bookcase {...interactive('bookshelf')} />
        <Painting {...interactive('painting')} selected={selected === 'painting'} />
        <Desk {...interactive('desk')} selected={selected === 'desk'} />
        <Chest {...interactive('chest')} opened={chestOpened} selected={selected === 'chest'} />
        <ExitDoor open={false} />
        <Plant />
        <BrokenObjects />
        <StudyRats />
      </>}
      <FirstPersonController key={hauntedRoom ? 'haunted-controller' : 'study-controller'} targets={targets} found={found} collected={collected} onDiscover={onDiscover} onApproach={onApproach} onLeave={onLeave} canDiscover={canDiscover} onBlocked={onBlocked} onShoot={onShoot} onReload={onReload} onAim={onAim} onFloorChange={onFloorChange} onJump={onJump} hauntedRoom={hauntedRoom} paused={paused} sensitivity={sensitivity} aiming={aiming} />
      <CameraShake token={cameraShake} reduceMotion={reduceMotion} />
      <HammerHand active={hauntedRoom && equipped === 'hammer'} swing={hammerSwing} />
      <GunHand active={hauntedRoom && equipped === 'weapon'} shot={shot} reloading={reloading} reduceMotion={reduceMotion} aiming={aiming} />
      <ShotImpactEffects impacts={shotImpacts} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.46} scale={hauntedRoom ? 22 : 14} blur={2.2} far={hauntedRoom ? 10 : 5} />
    </Canvas>
  )
}

function CameraShake({ token = 0, reduceMotion = false }) {
  const started = useRef(-10)
  const lastToken = useRef(token)
  const { camera } = useThree()

  useFrame(({ clock }) => {
    if (token !== lastToken.current) {
      lastToken.current = token
      started.current = clock.elapsedTime
    }
    const elapsed = clock.elapsedTime - started.current
    if (elapsed < 0 || elapsed > 0.35) return
    const strength = (reduceMotion ? 0.018 : 0.055) * (1 - elapsed / 0.35)
    camera.position.x += Math.sin(elapsed * 70) * strength
    camera.position.y += Math.cos(elapsed * 54) * strength * 0.65
  })

  return null
}

function HammerHand({ active, swing = 0 }) {
  const hand = useRef()
  const lastSwing = useRef(swing)
  const swingStarted = useRef(-10)
  const { camera } = useThree()
  const basePosition = new THREE.Vector3(0.5, -0.42, -0.92)
  const baseRotation = [0.16, -0.16, -0.3]
  const animatedPosition = useRef(basePosition.clone())

  useFrame(({ clock }) => {
    if (!hand.current) return
    if (swing !== lastSwing.current) {
      lastSwing.current = swing
      swingStarted.current = clock.elapsedTime
    }
    const elapsedSinceSwing = clock.elapsedTime - swingStarted.current
    const progress = swingStarted.current >= 0 && elapsedSinceSwing < 0.62 ? THREE.MathUtils.clamp(elapsedSinceSwing / 0.62, 0, 1) : 0
    const windup = THREE.MathUtils.clamp(progress / 0.28, 0, 1)
    const hit = progress < 0.28 ? 0 : 1 - THREE.MathUtils.clamp((progress - 0.28) / 0.5, 0, 1)
    animatedPosition.current.set(basePosition.x - windup * 0.13 + hit * 0.16, basePosition.y + windup * 0.18 - hit * 0.2, basePosition.z + windup * 0.08 + hit * 0.12)
    const offset = animatedPosition.current.clone().applyQuaternion(camera.quaternion)
    hand.current.position.copy(camera.position).add(offset)
    hand.current.quaternion.copy(camera.quaternion)
    hand.current.rotateX(baseRotation[0] - windup * 0.35 + hit * 0.55)
    hand.current.rotateY(baseRotation[1] + windup * 0.18)
    hand.current.rotateZ(baseRotation[2] + windup * 0.55 - hit * 2.4)
  })

  return <group ref={hand} visible={active} renderOrder={20}>
    <mesh position={[0.08, -0.43, 0.08]} rotation={[0.26, 0, -0.2]} renderOrder={20}><cylinderGeometry args={[0.15, 0.18, 0.92, 10]} /><meshStandardMaterial color="#6f4638" roughness={0.8} depthTest={false} /></mesh>
    <mesh position={[0, -0.1, 0]} renderOrder={20}><sphereGeometry args={[0.2, 14, 10]} /><meshStandardMaterial color="#a87562" roughness={0.9} depthTest={false} /></mesh>
    <mesh position={[0, 0.22, 0]} renderOrder={20}><boxGeometry args={[0.78, 0.24, 0.22]} /><meshStandardMaterial color="#7c878a" emissive="#39484e" emissiveIntensity={0.42} metalness={0.85} roughness={0.2} depthTest={false} /></mesh>
    <mesh position={[0, 0.22, 0.13]} renderOrder={20}><boxGeometry args={[0.42, 0.09, 0.06]} /><meshStandardMaterial color="#b6c0c0" metalness={0.9} roughness={0.16} depthTest={false} /></mesh>
  </group>
}

function GunHand({ active, shot = 0, reloading = false, reduceMotion = false, aiming = false }) {
  const gun = useRef()
  const muzzle = useRef()
  const lastShot = useRef(shot)
  const lastReloading = useRef(reloading)
  const shotStarted = useRef(-10)
  const reloadStarted = useRef(-10)
  const { camera } = useThree()
  const basePosition = new THREE.Vector3(0.46, -0.38, -0.9)
  const animatedPosition = useRef(basePosition.clone())

  useFrame(({ clock }) => {
    if (!gun.current) return
    if (shot !== lastShot.current) {
      lastShot.current = shot
      shotStarted.current = clock.elapsedTime
    }
    if (reloading && !lastReloading.current) reloadStarted.current = clock.elapsedTime
    lastReloading.current = reloading
    const elapsed = clock.elapsedTime - shotStarted.current
    const progress = shotStarted.current >= 0 && elapsed < 0.3 ? THREE.MathUtils.clamp(elapsed / 0.3, 0, 1) : 0
    const motionScale = reduceMotion ? 0.35 : 1
    const aimFactor = aiming ? 1 : 0
    const recoil = Math.sin(progress * Math.PI) * motionScale
    const reloadElapsed = clock.elapsedTime - reloadStarted.current
    const reloadProgress = reloadStarted.current >= 0 && reloadElapsed < 0.9 ? THREE.MathUtils.clamp(reloadElapsed / 0.9, 0, 1) : 0
    const reloadDip = Math.sin(reloadProgress * Math.PI)
    animatedPosition.current.set(basePosition.x - aimFactor * 0.18 - recoil * 0.1, basePosition.y + aimFactor * 0.08 + recoil * 0.03 - reloadDip * 0.3, basePosition.z + aimFactor * 0.22 + recoil * 0.16 + reloadDip * 0.1)
    gun.current.position.copy(camera.position).add(animatedPosition.current.clone().applyQuaternion(camera.quaternion))
    gun.current.quaternion.copy(camera.quaternion)
    gun.current.rotateX(-0.08 - aimFactor * 0.04 + recoil * 0.16 + reloadDip * 0.5)
    gun.current.rotateY(-0.12)
    gun.current.rotateZ(-0.28 - reloadDip * 0.7)
    if (muzzle.current) muzzle.current.visible = progress > 0 && progress < 0.4
  })

  return <group ref={gun} visible={active} renderOrder={20}>
    <mesh position={[0.08, -0.25, 0.08]} rotation={[0.1, 0, -0.18]} renderOrder={20}><boxGeometry args={[0.22, 0.56, 0.2]} /><meshStandardMaterial color="#4a2d28" roughness={0.8} depthTest={false} /></mesh>
    <mesh position={[0, 0.12, 0]} renderOrder={20}><boxGeometry args={[0.16, 0.18, 0.82]} /><meshStandardMaterial color="#7d8789" metalness={0.9} roughness={0.2} depthTest={false} /></mesh>
    <mesh position={[0, -0.04, -0.32]} renderOrder={20}><boxGeometry args={[0.24, 0.1, 0.2]} /><meshStandardMaterial color="#556063" metalness={0.8} roughness={0.22} depthTest={false} /></mesh>
    <mesh position={[-0.12, -0.08, 0]} renderOrder={20}><sphereGeometry args={[0.18, 12, 10]} /><meshStandardMaterial color="#a87562" roughness={0.9} depthTest={false} /></mesh>
    <mesh ref={muzzle} position={[0, 0.13, -0.48]} renderOrder={21}><coneGeometry args={[0.13, 0.3, 8]} /><meshBasicMaterial color="#ffd36b" transparent opacity={0.9} depthTest={false} /></mesh>
  </group>
}

function ShotImpactEffects({ impacts = [] }) {
  return <group renderOrder={60}>
    {impacts.map((impact) => {
      const rotation = impact.surface === 'x+' ? [0, Math.PI / 2, 0] : impact.surface === 'x-' ? [0, -Math.PI / 2, 0] : impact.surface === 'z+' ? [0, Math.PI, 0] : [0, 0, 0]
      const offset = impact.surface === 'x+' ? [-0.035, 0, 0] : impact.surface === 'x-' ? [0.035, 0, 0] : impact.surface === 'z+' ? [0, 0, -0.035] : [0, 0, 0.035]
      const position = [impact.position[0] + offset[0], impact.position[1] + offset[1], impact.position[2] + offset[2]]
      return <group key={impact.id} position={position} rotation={rotation} renderOrder={60}>
        <mesh position={[0, 0, 0.01]} renderOrder={61}><circleGeometry args={[impact.type === 'wood' ? 0.16 : 0.11, 16]} /><meshBasicMaterial color={impact.type === 'wood' ? '#40251f' : '#08090c'} depthTest={false} depthWrite={false} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, 0.012]} renderOrder={62}><ringGeometry args={[impact.type === 'wood' ? 0.17 : 0.12, impact.type === 'wood' ? 0.2 : 0.14, 16]} /><meshBasicMaterial color="#8b5141" transparent opacity={0.8} depthTest={false} depthWrite={false} side={THREE.DoubleSide} /></mesh>
        {impact.type === 'wood' && <>{[-1, 0, 1].map((splinter) => <mesh key={splinter} position={[splinter * 0.14, splinter * 0.09, 0.025]} rotation={[0, 0, splinter * 0.35]} renderOrder={63}><boxGeometry args={[0.2, 0.045, 0.045]} /><meshBasicMaterial color="#c08755" depthTest={false} /></mesh>)}</>}
      </group>
    })}
  </group>
}

function GunPickup({ position }) {
  const gun = useRef()
  useFrame(({ clock }) => {
    if (!gun.current) return
    gun.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2.1) * 0.12
    gun.current.rotation.y = clock.elapsedTime * 1.5
    gun.current.rotation.z = Math.sin(clock.elapsedTime * 1.4) * 0.08
  })

  return <group ref={gun} position={position}>
    <mesh position={[0, 0, 0.35]} castShadow><boxGeometry args={[0.16, 0.18, 0.9]} /><meshStandardMaterial color="#858f91" metalness={0.9} roughness={0.2} /></mesh>
    <mesh position={[0, -0.22, -0.18]} rotation={[0.12, 0, -0.18]} castShadow><boxGeometry args={[0.2, 0.52, 0.2]} /><meshStandardMaterial color="#51322b" roughness={0.8} /></mesh>
    <mesh position={[0, 0.02, -0.18]}><boxGeometry args={[0.24, 0.12, 0.2]} /><meshStandardMaterial color="#5a6567" metalness={0.85} roughness={0.22} /></mesh>
    <pointLight color="#e4b26d" intensity={1.5} distance={2.5} decay={2} />
  </group>
}

function DroppedEquipment({ id, position }) {
  return id === 'hammer' ? <HauntedHammer position={position} /> : <GunPickup position={position} />
}

function SecondFloorThreats({ defeatedCount = 0, combatActive = false, onAttack }) {
  return <>
    {defeatedCount > 0 ? <>
      <DeathStain position={[2.1, 5.19, -1.8]} />
      <DeadBody position={[2.1, 5.18, -1.8]} rotation={[0, 0.35, 0]} />
    </> : <ArmedFigure position={[2.1, 5.18, -1.8]} rotation={[0, 0.35, 0]} patrol={[[2.1, -1.8], [2.9, -1.8], [2.9, -0.8], [2.1, -0.8]]} speed={0.28} combatActive={combatActive} approachSpeed={0.58} approachOffset={[-1.35, 0]} onAttack={onAttack} />}
    {defeatedCount > 1 ? <>
      <DeathStain position={[4.9, 5.19, 1.6]} scale={0.82} />
      <DeadBody position={[4.9, 5.18, 1.6]} rotation={[0, -1.1, 0]} pale />
    </> : <ArmedFigure position={[4.9, 5.18, 1.6]} rotation={[0, -1.1, 0]} pale patrol={[[4.9, 1.6], [5.8, 1.6], [5.8, 2.7], [4.9, 2.7]]} speed={0.24} phase={1.4} combatActive={combatActive} approachSpeed={0.5} approachOffset={[1.35, 0]} onAttack={onAttack} />}
  </>
}

function DeathStain({ position, scale = 1 }) {
  return <group position={position} scale={scale}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.58, 24]} /><meshBasicMaterial color="#6f222b" transparent opacity={0.72} depthWrite={false} /></mesh>
    {[[0.42, 0.2, 0.11], [-0.48, -0.14, 0.08], [0.2, -0.42, 0.07], [-0.18, 0.5, 0.06]].map(([x, z, radius]) => <mesh key={`${x}-${z}`} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[radius, 12]} /><meshBasicMaterial color="#8d2930" transparent opacity={0.78} depthWrite={false} /></mesh>)}
  </group>
}

function ArmedFigure({ position, rotation = [0, 0, 0], pale = false, patrol = [], speed = 0.3, phase = 0, combatActive = false, approachSpeed = 0.6, approachOffset = [0, 0], onAttack }) {
  const figure = useRef()
  const weapon = useRef()
  const muzzle = useRef()
  const limbs = useRef([])
  const nextAttack = useRef(0)
  const attackStarted = useRef(-10)
  const attackHit = useRef(false)
  const { camera } = useThree()
  useFrame(({ clock }, delta) => {
    if (!figure.current) return
    const t = clock.elapsedTime + position[0] + phase
    const firing = !combatActive && Math.sin(t * 0.72) > 0.965
    const routePosition = patrol.length > 1 ? (clock.elapsedTime * speed + phase) % patrol.length : 0
    const segment = Math.floor(routePosition)
    const progress = routePosition - segment
    const from = patrol.length > 1 ? patrol[segment] : [position[0], position[2]]
    const to = patrol.length > 1 ? patrol[(segment + 1) % patrol.length] : from
    let x = patrol.length > 1 ? THREE.MathUtils.lerp(from[0], to[0], progress) : position[0]
    let z = patrol.length > 1 ? THREE.MathUtils.lerp(from[1], to[1], progress) : position[2]
    let moving = patrol.length > 1 && Math.hypot(to[0] - from[0], to[1] - from[1]) > 0
    let patrolRotation = moving ? Math.atan2(to[0] - from[0], to[1] - from[1]) : rotation[1]
    let attacking = false

    if (combatActive && camera.position.y > 4) {
      // Follow the player's current position using a radial stopping point.
      // A fixed left/right offset caused the old patrol target to pull the
      // gunmen backward whenever the player crossed their path.
      const currentX = figure.current.position.x
      const currentZ = figure.current.position.z
      const toPlayerX = camera.position.x - currentX
      const toPlayerZ = camera.position.z - currentZ
      const distance = Math.hypot(toPlayerX, toPlayerZ)
      const directionX = distance > 0.001 ? toPlayerX / distance : 0
      const directionZ = distance > 0.001 ? toPlayerZ / distance : 1
      const keepDistance = 1.62
      const targetX = THREE.MathUtils.clamp(camera.position.x - directionX * keepDistance, -8.55, 8.55)
      const targetZ = THREE.MathUtils.clamp(camera.position.z - directionZ * keepDistance, -6.05, 6.05)
      x = currentX
      z = currentZ
      const attackInProgress = attackStarted.current >= 0 && clock.elapsedTime - attackStarted.current < 0.85
      if (distance > keepDistance && !attackInProgress) {
        x = THREE.MathUtils.damp(currentX, targetX, approachSpeed, delta)
        z = THREE.MathUtils.damp(currentZ, targetZ, approachSpeed, delta)
        moving = Math.hypot(targetX - currentX, targetZ - currentZ) > 0.05
      } else {
        moving = false
      }
      if (distance <= 1.82 && clock.elapsedTime >= nextAttack.current && attackStarted.current < 0) {
        nextAttack.current = clock.elapsedTime + 1.65
        attackStarted.current = clock.elapsedTime
        attackHit.current = false
      }
      if (distance <= 1.82) moving = false
      const attackProgress = THREE.MathUtils.clamp((clock.elapsedTime - attackStarted.current) / 0.85, 0, 1)
      attacking = attackStarted.current >= 0 && attackProgress < 1
      if (attackStarted.current >= 0 && attackProgress >= 1) attackStarted.current = -10
      if (attacking && attackProgress >= 0.35 && attackProgress <= 0.62 && !attackHit.current) {
        attackHit.current = true
        onAttack?.()
      }
      patrolRotation = Math.atan2(toPlayerX, toPlayerZ)
    }

    const walkingCycle = moving ? Math.sin(clock.elapsedTime * 7.5 + phase) * 0.35 : 0
    figure.current.position.set(x, position[1] + Math.sin(clock.elapsedTime * 1.4 + position[0]) * 0.025, z)
    figure.current.rotation.y = patrolRotation
    figure.current.rotation.z = Math.sin(clock.elapsedTime * 1.2 + position[2]) * 0.035
    if (limbs.current[0]) limbs.current[0].rotation.x = walkingCycle
    if (limbs.current[1]) limbs.current[1].rotation.x = -walkingCycle
    if (limbs.current[2]) limbs.current[2].rotation.x = -walkingCycle
    if (limbs.current[3]) limbs.current[3].rotation.x = walkingCycle
    if (weapon.current) {
      const attackProgress = THREE.MathUtils.clamp((clock.elapsedTime - attackStarted.current) / 0.85, 0, 1)
      const slash = attacking ? Math.sin(attackProgress * Math.PI) * 1.8 : 0
      weapon.current.rotation.z = -0.05 + Math.sin(t * 0.9) * 0.035 + (firing ? -0.15 : 0) - slash
      weapon.current.position.y = 1.15 + (firing ? -0.06 : 0) - (attacking ? Math.sin(attackProgress * Math.PI) * 0.18 : 0)
    }
    if (muzzle.current) muzzle.current.visible = firing
  })
  const cloth = pale ? '#747887' : '#272129'
  return <group ref={figure} position={position} rotation={rotation}>
    <mesh position={[0, 1.1, 0]} castShadow><boxGeometry args={[0.6, 1.45, 0.34]} /><meshStandardMaterial color={cloth} roughness={0.98} /></mesh>
    <mesh position={[0, 2.05, 0]} castShadow><sphereGeometry args={[0.29, 14, 10]} /><meshStandardMaterial color={pale ? '#9b9291' : '#4a3d43'} roughness={0.98} /></mesh>
    <mesh ref={(node) => { limbs.current[0] = node }} position={[0.44, 1.1, -0.05]} rotation={[0, 0.2, -0.25]} castShadow><boxGeometry args={[0.13, 1.1, 0.13]} /><meshStandardMaterial color={cloth} roughness={0.98} /></mesh>
    <mesh ref={(node) => { limbs.current[1] = node }} position={[-0.44, 1.1, 0.05]} rotation={[0, 0.1, 0.25]} castShadow><boxGeometry args={[0.13, 1.1, 0.13]} /><meshStandardMaterial color={cloth} roughness={0.98} /></mesh>
    <group ref={weapon} position={[0.5, 1.15, -0.2]} rotation={[Math.PI / 2, 0, 0.05]}>
      <mesh position={[0, 0, 0.28]} castShadow><boxGeometry args={[0.12, 0.12, 0.92]} /><meshStandardMaterial color="#a9b4b5" emissive="#263437" emissiveIntensity={0.2} metalness={0.9} roughness={0.18} /></mesh>
      <mesh position={[0, 0, -0.27]} castShadow><boxGeometry args={[0.12, 0.18, 0.28]} /><meshStandardMaterial color="#51332b" roughness={0.82} /></mesh>
      <mesh position={[0, 0, -0.12]} castShadow><boxGeometry args={[0.38, 0.07, 0.1]} /><meshStandardMaterial color="#c19a5b" metalness={0.65} roughness={0.3} /></mesh>
    </group>
    <mesh ref={muzzle} position={[0.5, 1.15, -0.68]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.1, 0.22, 8]} /><meshBasicMaterial color="#ffb45e" transparent opacity={0.9} /></mesh>
    <mesh ref={(node) => { limbs.current[2] = node }} position={[-0.18, 0.38, 0]} castShadow><boxGeometry args={[0.18, 0.75, 0.18]} /><meshStandardMaterial color="#19171d" /></mesh>
    <mesh ref={(node) => { limbs.current[3] = node }} position={[0.18, 0.38, 0]} castShadow><boxGeometry args={[0.18, 0.75, 0.18]} /><meshStandardMaterial color="#19171d" /></mesh>
  </group>
}

function FootstepAudio({ hauntedRoom, audioSettings = {}, muted = false }) {
  const { camera, gl } = useThree()
  const { ambience = 1 } = audioSettings
  const audio = useRef(null)
  const lastPosition = useRef(null)
  const distanceSinceStep = useRef(0)
  const lastStepAt = useRef(-10)
  const stepIndex = useRef(0)

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return undefined
    const canvas = gl.domElement
    let disposed = false

    const makeNoiseBuffer = (context) => {
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.18), context.sampleRate)
      const data = buffer.getChannelData(0)
      for (let index = 0; index < data.length; index += 1) {
        const fade = 1 - index / data.length
        data[index] = (Math.random() * 2 - 1) * fade
      }
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
      master.gain.value = 0.2 * Math.max(0, ambience)
      master.connect(context.destination)
      audio.current = { context, master, noiseBuffer: makeNoiseBuffer(context) }
      context.resume()
    }

    canvas.addEventListener('pointerdown', startAudio)
    window.addEventListener('keydown', startAudio)
    window.addEventListener('game-audio-unlock', startAudio)
    return () => {
      disposed = true
      canvas.removeEventListener('pointerdown', startAudio)
      window.removeEventListener('keydown', startAudio)
      window.removeEventListener('game-audio-unlock', startAudio)
      if (audio.current) {
        audio.current.context.close()
        audio.current = null
      }
    }
  }, [gl])

  useFrame(({ clock }, delta) => {
    const currentPosition = camera.position
    if (!lastPosition.current) {
      lastPosition.current = currentPosition.clone()
      return
    }

    const distance = Math.hypot(currentPosition.x - lastPosition.current.x, currentPosition.z - lastPosition.current.z)
    lastPosition.current.copy(currentPosition)
    const activeAudio = audio.current
    if (!activeAudio) {
      distanceSinceStep.current = 0
      return
    }
    if (activeAudio.context.state === 'suspended') activeAudio.context.resume()
    activeAudio.master.gain.setTargetAtTime(muted ? 0 : 0.2 * Math.max(0, ambience), activeAudio.context.currentTime, 0.05)
    if (muted || ambience <= 0) {
      distanceSinceStep.current = 0
      return
    }

    const moving = distance / Math.max(delta, 0.001) > 0.12
    if (!moving) return

    distanceSinceStep.current += distance
    const onStairs = hauntedRoom && currentPosition.x > -8.7 && currentPosition.x < -3.7 && (Math.abs(currentPosition.z - 3.05) < 1.05 || Math.abs(currentPosition.z + 3.05) < 1.05)
    const strideLength = onStairs ? 0.62 : 0.92
    const cooldown = onStairs ? 0.16 : 0.22
    if (distanceSinceStep.current < strideLength || clock.elapsedTime - lastStepAt.current < cooldown) return

    distanceSinceStep.current = 0
    lastStepAt.current = clock.elapsedTime
    const floorIndex = hauntedRoom ? (currentPosition.y < -1 ? 0 : currentPosition.y > 5.8 ? 2 : 1) : 1
    const alternatingPitch = stepIndex.current % 2 === 0 ? 1 : 0.88
    stepIndex.current += 1
    const now = activeAudio.context.currentTime
    const body = activeAudio.context.createOscillator()
    const bodyGain = activeAudio.context.createGain()
    const baseFrequency = onStairs ? 118 : [72, 82, 94][floorIndex]
    body.type = onStairs ? 'triangle' : 'sine'
    body.frequency.setValueAtTime(baseFrequency * alternatingPitch, now)
    body.frequency.exponentialRampToValueAtTime((onStairs ? 66 : 48) * alternatingPitch, now + 0.13)
    bodyGain.gain.setValueAtTime(0.001, now)
    bodyGain.gain.exponentialRampToValueAtTime(onStairs ? 0.22 : 0.16, now + 0.008)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    body.connect(bodyGain).connect(activeAudio.master)
    body.start(now)
    body.stop(now + 0.17)

    const impact = activeAudio.context.createBufferSource()
    impact.buffer = activeAudio.noiseBuffer
    const filter = activeAudio.context.createBiquadFilter()
    const impactGain = activeAudio.context.createGain()
    filter.type = 'lowpass'
    filter.frequency.value = onStairs ? 1500 : 900 + floorIndex * 180
    impactGain.gain.setValueAtTime(0.001, now)
    impactGain.gain.exponentialRampToValueAtTime(onStairs ? 0.1 : 0.07, now + 0.006)
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    impact.connect(filter).connect(impactGain).connect(activeAudio.master)
    impact.start(now)
    impact.stop(now + 0.18)
  })

  return null
}

function HeartbeatAudio({ active = false, critical = false, audioSettings = {}, muted = false }) {
  const { ambience = 1 } = audioSettings
  const { gl } = useThree()
  const audio = useRef(null)
  const nextBeat = useRef(0)

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return undefined
    let disposed = false
    const startAudio = () => {
      if (disposed) return
      if (audio.current) {
        audio.current.context.resume()
        return
      }
      const context = new AudioContextClass()
      const master = context.createGain()
      master.gain.value = 0
      master.connect(context.destination)
      audio.current = { context, master }
      context.resume()
    }
    const canvas = gl.domElement
    canvas.addEventListener('pointerdown', startAudio)
    window.addEventListener('keydown', startAudio)
    window.addEventListener('game-audio-unlock', startAudio)
    return () => {
      disposed = true
      canvas.removeEventListener('pointerdown', startAudio)
      window.removeEventListener('keydown', startAudio)
      window.removeEventListener('game-audio-unlock', startAudio)
      audio.current?.context.close()
      audio.current = null
    }
  }, [gl])

  useFrame(({ clock }) => {
    const activeAudio = audio.current
    if (!activeAudio) return
    if (activeAudio.context.state === 'suspended') activeAudio.context.resume()
    const targetGain = active && !muted ? (critical ? 0.18 : 0.1) * ambience : 0
    activeAudio.master.gain.setTargetAtTime(targetGain, activeAudio.context.currentTime, 0.08)
    if (!active || muted || ambience <= 0 || clock.elapsedTime < nextBeat.current) return
    const now = activeAudio.context.currentTime
    const oscillator = activeAudio.context.createOscillator()
    const gain = activeAudio.context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(critical ? 58 : 48, now)
    oscillator.frequency.exponentialRampToValueAtTime(critical ? 38 : 32, now + 0.16)
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(1, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    oscillator.connect(gain).connect(activeAudio.master)
    oscillator.start(now)
    oscillator.stop(now + 0.2)
    nextBeat.current = clock.elapsedTime + (critical ? 0.48 : 0.78)
  })

  return null
}

function FloorAudio({ hauntedRoom, audioSettings = {}, muted = false }) {
  const { camera, gl } = useThree()
  const { ambience = 1, music = 0.5 } = audioSettings
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
            { frequency: 110, type: 'sine', noiseFilter: 420, base: 0.018, category: 'music' },
          ]
        : [
            { frequency: 72, type: 'sine', noiseFilter: 700, base: 0.04 },
            { frequency: 98, type: 'sine', noiseFilter: 360, base: 0.014, category: 'music' },
          ]
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
        return { oscillator, toneGain, noiseGain, base: definition.base, category: definition.category || 'ambience' }
      })
      audio.current = { context, layers, nextPulse: 0 }
      context.resume()
    }

    canvas.addEventListener('pointerdown', startAudio)
    window.addEventListener('keydown', startAudio)
    window.addEventListener('game-audio-unlock', startAudio)
    return () => {
      disposed = true
      canvas.removeEventListener('pointerdown', startAudio)
      window.removeEventListener('keydown', startAudio)
      window.removeEventListener('game-audio-unlock', startAudio)
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
    const ambienceLevel = muted ? 0 : Math.max(0, ambience)
    const musicLevel = muted ? 0 : Math.max(0, music)
    layers.forEach((layer, index) => {
      const level = layer.category === 'music' ? musicLevel : ambienceLevel
      const target = index === floorIndex ? layer.base * level : 0.004 * level
      layer.toneGain.gain.setTargetAtTime(target, context.currentTime, 0.5)
      layer.noiseGain.gain.setTargetAtTime(target * 0.65, context.currentTime, 0.5)
    })
  })

  return null
}

function HauntedRoomContents({ found, hasHammer, hasGun, enemiesDefeated, gems = 0, droppedItems = [], audioSettings, muted, sleepingDogs, combatActive, onEnemyAttack }) {
  return <>
    <HauntedRoomShell />
    <ThreeStoreyStairs />
    <HauntedLighting />
    <HauntedCreatures found={found} audioSettings={audioSettings} muted={muted} sleepingDogs={sleepingDogs} />
    <SecondFloorThreats defeatedCount={enemiesDefeated} combatActive={combatActive} onAttack={onEnemyAttack} />
    <HauntedRoomProps found={found} />
    {!hasHammer && <HauntedHammer position={[HAMMER_TARGET.position[0], 1.45, HAMMER_TARGET.position[1]]} />}
    {!hasGun && <GunPickup position={[6.9, 1.5, -6.0]} />}
    {droppedItems.map((item) => <DroppedEquipment key={`${item.id}-${item.position.join('-')}`} {...item} />)}
    <HiddenKeyCabinet position={[7.2, 5.18, -4.6]} />
    <KeyClues floorY={-4.62} />
    <KeyClues floorY={5.02} />
    <FinalKey position={[7.2, 6.25, -4.35]} hidden glowing={gems >= GEM_REQUIREMENT} />
  </>
}

function HauntedHammer({ position }) {
  const hammer = useRef()
  useFrame(({ clock }) => {
    if (!hammer.current) return
    hammer.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2.4) * 0.14
    hammer.current.rotation.y = clock.elapsedTime * 1.6
    hammer.current.rotation.z = Math.sin(clock.elapsedTime * 1.7) * 0.12
  })

  return <group ref={hammer} position={position}>
    <mesh position={[0, -0.28, 0]} rotation={[0.1, 0, -0.1]} castShadow><cylinderGeometry args={[0.1, 0.13, 0.72, 12]} /><meshStandardMaterial color="#704637" roughness={0.75} /></mesh>
    <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><boxGeometry args={[0.72, 0.24, 0.22]} /><meshStandardMaterial color="#9ba5a7" emissive="#39484e" emissiveIntensity={0.35} metalness={0.85} roughness={0.2} /></mesh>
    <pointLight color="#a5e7ff" intensity={1.5} distance={2.7} decay={2} />
  </group>
}

function HauntedCreatures({ found = [], audioSettings, muted, sleepingDogs = [false, false] }) {
  return <>
    <HauntedBat position={[-5.8, -2.1, -0.8]} phase={0.2} />
    <HauntedBat position={[5.8, -1.3, 2.8]} phase={1.7} scale={0.8} />
    <HauntedBat position={[-4.2, 2.75, 2.1]} phase={2.5} scale={0.9} />
    <HauntedBat position={[6.2, 3.4, -1.5]} phase={3.8} scale={0.78} />
    <HauntedBat position={[-5.2, 7.35, -1.2]} phase={1.1} scale={0.85} />
    <HauntedBat position={[5.6, 7.9, 2.6]} phase={4.3} scale={0.72} />
    <DogBarks audioSettings={audioSettings} muted={muted} calmed={found.includes('guardDog')} />
    {DOG_HAZARDS.map((dog, index) => <GuardDog key={`dog-${index}`} {...dog} reacted={index === 0 && found.includes('guardDog')} sleeping={sleepingDogs[index]} />)}
  </>
}

function HauntedBat({ position, phase = 0, scale = 1, reacted = false }) {
  const bat = useRef()
  const leftWing = useRef()
  const rightWing = useRef()

  useFrame(({ clock }) => {
    if (!bat.current) return
    const t = clock.elapsedTime + phase
    bat.current.position.set(position[0] + Math.sin(t * 0.7) * 1.7, position[1] + Math.sin(t * 1.8) * 0.35, position[2] + Math.cos(t * 0.9) * 1.2)
    bat.current.rotation.y = Math.sin(t * 0.7) * 0.45
    bat.current.rotation.z = reacted ? Math.sin(t * 2.8) * 0.3 : 0
    const flap = Math.sin(t * (reacted ? 13 : 9)) * 0.55
    if (leftWing.current) leftWing.current.rotation.z = 0.35 + flap
    if (rightWing.current) rightWing.current.rotation.z = -0.35 - flap
  })

  return <group ref={bat} position={position} scale={scale}>
    <mesh castShadow><sphereGeometry args={[0.18, 10, 8]} /><meshStandardMaterial color="#17131c" roughness={0.95} /></mesh>
    <mesh position={[0, -0.16, 0.04]}><coneGeometry args={[0.1, 0.28, 6]} /><meshStandardMaterial color="#241926" roughness={0.95} /></mesh>
    <mesh ref={leftWing} position={[-0.36, 0, 0]} rotation={[0, 0, 0.35]} castShadow><boxGeometry args={[0.7, 0.035, 0.32]} /><meshStandardMaterial color="#2c1d30" roughness={0.9} /></mesh>
    <mesh ref={rightWing} position={[0.36, 0, 0]} rotation={[0, 0, -0.35]} castShadow><boxGeometry args={[0.7, 0.035, 0.32]} /><meshStandardMaterial color="#2c1d30" roughness={0.9} /></mesh>
    <mesh position={[-0.07, 0.03, 0.16]}><sphereGeometry args={[0.025, 8, 8]} /><meshBasicMaterial color="#d87967" /></mesh>
    <mesh position={[0.07, 0.03, 0.16]}><sphereGeometry args={[0.025, 8, 8]} /><meshBasicMaterial color="#d87967" /></mesh>
  </group>
}

function DogBarks({ audioSettings = {}, muted = false, calmed = false }) {
  const { gl, camera } = useThree()
  const { dog = 1 } = audioSettings
  const audio = useRef(null)
  const nextBark = useRef(1.2)

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return undefined
    let disposed = false
    const canvas = gl.domElement

    const startAudio = () => {
      if (disposed) return
      if (audio.current) {
        audio.current.context.resume()
        return
      }
      const context = new AudioContextClass()
      const master = context.createGain()
      master.gain.value = 0.14 * (muted ? 0 : dog)
      master.connect(context.destination)
      audio.current = { context, master }
      context.resume()
    }

    canvas.addEventListener('pointerdown', startAudio)
    window.addEventListener('keydown', startAudio)
    window.addEventListener('game-audio-unlock', startAudio)
    return () => {
      disposed = true
      canvas.removeEventListener('pointerdown', startAudio)
      window.removeEventListener('keydown', startAudio)
      window.removeEventListener('game-audio-unlock', startAudio)
      if (audio.current) {
        audio.current.context.close()
        audio.current = null
      }
    }
  }, [gl])

  useFrame(({ clock }) => {
    if (!audio.current) return
    const { context, master } = audio.current
    if (context.state === 'suspended') context.resume()
    const nearestDog = Math.min(...DOG_HAZARDS.map(({ position }) => Math.hypot(camera.position.x - position[0], camera.position.z - position[2])))
    const proximity = THREE.MathUtils.clamp(1.15 - nearestDog / 11, 0.18, 1.15)
    master.gain.setTargetAtTime(muted || calmed ? 0 : 0.14 * dog * proximity, context.currentTime, 0.08)
    if (calmed || clock.elapsedTime < nextBark.current) return
    const now = context.currentTime
    const bark = context.createOscillator()
    const filter = context.createBiquadFilter()
    const volume = context.createGain()
    bark.type = 'sawtooth'
    bark.frequency.setValueAtTime(155, now)
    bark.frequency.exponentialRampToValueAtTime(76, now + 0.17)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(980, now)
    filter.frequency.exponentialRampToValueAtTime(420, now + 0.2)
    volume.gain.setValueAtTime(0.001, now)
    volume.gain.exponentialRampToValueAtTime(1, now + 0.018)
    volume.gain.exponentialRampToValueAtTime(0.001, now + 0.24)
    bark.connect(filter).connect(volume).connect(master)
    bark.start(now)
    bark.stop(now + 0.26)
    nextBark.current = clock.elapsedTime + 5
  })

  return null
}

function GuardDog({ position, path, speed = 0.5, anchor = [position[0], position[1], position[2] + 0.9], phase = 0, reacted = false, sleeping = false }) {
  const dog = useRef()
  const head = useRef()
  const jaw = useRef()
  const tongue = useRef()
  const tail = useRef()
  const rope = useRef()
  const collar = useRef()
  const legs = useRef([])
  const collarWorld = useRef(new THREE.Vector3())
  const ropeStart = useMemo(() => new THREE.Vector3(anchor[0], 0.62, anchor[2]), [anchor])
  const ropeAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useFrame(({ clock }) => {
    if (!dog.current || !head.current || !rope.current || !collar.current) return
    const t = clock.elapsedTime + phase
    const routine = t % 15
    const eating = routine > 6.2 && routine < 9.05
    const panting = routine > 9.4 && routine < 12.1
    const barking = !reacted && ((routine > 2.45 && routine < 2.86) || (routine > 3.18 && routine < 3.62))
    const walking = !eating
    const step = Math.sin(t * 7.2) * (walking ? 0.18 : 0.025)
    const bob = Math.abs(Math.sin(t * 1.7)) * 0.025
    const routePosition = path?.length > 1 ? (clock.elapsedTime * speed + phase) % path.length : 0
    const segment = Math.floor(routePosition)
    const progress = routePosition - segment
    const from = path?.length > 1 ? path[segment] : [position[0], position[2]]
    const to = path?.length > 1 ? path[(segment + 1) % path.length] : from
    const patrolX = THREE.MathUtils.lerp(from[0], to[0], progress)
    const patrolZ = THREE.MathUtils.lerp(from[1], to[1], progress)
    const patrolRotation = Math.atan2(to[0] - from[0], to[1] - from[1])
    const dogX = eating ? position[0] : path?.length > 1 ? patrolX : position[0] + Math.sin(t * 0.46) * 0.32
    const dogZ = eating ? position[2] : path?.length > 1 ? patrolZ : position[2] + Math.cos(t * 0.38) * 0.24

    dog.current.position.set(dogX, position[1] + bob, dogZ)
    dog.current.rotation.y = eating ? 0.34 : path?.length > 1 ? patrolRotation : Math.sin(t * 0.46) * 0.28
    dog.current.rotation.z = barking ? Math.sin(t * 22) * 0.035 : reacted ? Math.sin(t * 5.5) * 0.08 : 0

    head.current.position.set(0, eating ? 0.53 : 0.62, eating ? 0.83 : 0.68)
    head.current.rotation.x = eating ? 0.52 : 0
    head.current.rotation.z = barking ? Math.sin(t * 24) * 0.035 : 0
    jaw.current.rotation.x = barking ? 0.32 + Math.abs(Math.sin(t * 20)) * 0.12 : eating ? 0.24 : panting ? 0.16 : 0.03
    tongue.current.visible = panting || barking || eating
    tongue.current.scale.y = eating ? 0.65 : panting ? 1.1 : 0.82
    tongue.current.position.z = eating ? 0.43 : 0.39
    tail.current.rotation.z = 0.2 + Math.sin(t * (barking ? 12 : reacted ? 10 : 4.5)) * (barking ? 0.26 : reacted ? 0.3 : 0.13)

    legs.current.forEach((leg, index) => {
      if (leg) leg.rotation.x = step * (index % 2 === 0 ? 1 : -1)
    })

    if (sleeping) {
      dog.current.position.set(position[0], position[1] - 0.12, position[2])
      dog.current.rotation.y = 0.35
      dog.current.rotation.z = -0.38
      dog.current.scale.y = 0.72
      head.current.position.set(0, 0.42, 0.78)
      head.current.rotation.x = 0.78
      head.current.rotation.z = 0
      jaw.current.rotation.x = 0.02
      tongue.current.visible = false
      tail.current.rotation.z = -0.5
      legs.current.forEach((leg) => { if (leg) leg.rotation.x = 0 })
    } else {
      dog.current.scale.y = 1
    }

    collar.current.getWorldPosition(collarWorld.current)
    const ropeVector = collarWorld.current.clone().sub(ropeStart)
    const ropeLength = Math.max(0.15, ropeVector.length())
    rope.current.position.copy(ropeStart).add(collarWorld.current).multiplyScalar(0.5)
    rope.current.quaternion.setFromUnitVectors(ropeAxis, ropeVector.normalize())
    rope.current.scale.set(1, ropeLength, 1)
  })

  return <group>
    <mesh position={anchor} castShadow><cylinderGeometry args={[0.09, 0.13, 0.78, 10]} /><meshStandardMaterial color="#413338" metalness={0.55} roughness={0.38} /></mesh>
    <mesh position={[anchor[0], 0.22, anchor[2]]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.28, 0.045, 8, 18]} /><meshStandardMaterial color="#8c756c" roughness={0.85} /></mesh>
    <mesh ref={rope} castShadow><cylinderGeometry args={[0.045, 0.045, 1, 8]} /><meshStandardMaterial color="#aa8776" roughness={0.92} /></mesh>
    <group ref={dog} position={position}>
      <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[0.92, 0.58, 1.2]} /><meshStandardMaterial color="#3a2529" roughness={0.92} /></mesh>
      <mesh position={[0, 0.64, -0.03]} castShadow><boxGeometry args={[1.02, 0.16, 0.9]} /><meshStandardMaterial color="#4a2b30" roughness={0.9} /></mesh>
      <group ref={head} position={[0, 0.62, 0.68]}>
        <mesh castShadow><boxGeometry args={[0.58, 0.5, 0.52]} /><meshStandardMaterial color="#4a2b30" roughness={0.9} /></mesh>
        <mesh position={[0, -0.04, 0.28]} castShadow><boxGeometry args={[0.34, 0.2, 0.2]} /><meshStandardMaterial color="#9b6455" roughness={0.88} /></mesh>
        <mesh position={[0, 0.06, 0.41]}><boxGeometry args={[0.15, 0.08, 0.08]} /><meshStandardMaterial color="#1d171b" roughness={0.75} /></mesh>
        <mesh position={[-0.15, 0.11, 0.22]}><sphereGeometry args={[0.045, 10, 8]} /><meshBasicMaterial color="#e36f66" /></mesh>
        <mesh position={[0.15, 0.11, 0.22]}><sphereGeometry args={[0.045, 10, 8]} /><meshBasicMaterial color="#e36f66" /></mesh>
        <mesh position={[-0.22, 0.25, 0]} rotation={[0, 0, -0.35]}><coneGeometry args={[0.14, 0.32, 4]} /><meshStandardMaterial color="#2a1c22" /></mesh>
        <mesh position={[0.22, 0.25, 0]} rotation={[0, 0, 0.35]}><coneGeometry args={[0.14, 0.32, 4]} /><meshStandardMaterial color="#2a1c22" /></mesh>
        <group ref={jaw} position={[0, -0.16, 0.2]}><mesh><boxGeometry args={[0.3, 0.1, 0.25]} /><meshStandardMaterial color="#6f403e" roughness={0.9} /></mesh></group>
        <mesh ref={tongue} visible={false} position={[0, -0.22, 0.39]} scale={[0.7, 0.82, 0.8]}><sphereGeometry args={[0.1, 12, 8]} /><meshStandardMaterial color="#d87270" roughness={0.76} /></mesh>
      </group>
      <mesh ref={collar} position={[0, 0.78, 0.5]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.23, 0.04, 8, 16]} /><meshStandardMaterial color="#c07a56" metalness={0.55} roughness={0.35} /></mesh>
      {[-0.29, 0.29].map((x, index) => <mesh key={`front-leg-${x}`} ref={(node) => { legs.current[index] = node }} position={[x, 0.16, 0.32]} castShadow><boxGeometry args={[0.15, 0.62, 0.17]} /><meshStandardMaterial color="#302127" /></mesh>)}
      {[-0.29, 0.29].map((x, index) => <mesh key={`back-leg-${x}`} ref={(node) => { legs.current[index + 2] = node }} position={[x, 0.16, -0.34]} castShadow><boxGeometry args={[0.15, 0.62, 0.17]} /><meshStandardMaterial color="#302127" /></mesh>)}
      <group ref={tail} position={[0, 0.65, -0.58]} rotation={[0, 0, 0.2]}><mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.09, 0.5, 8]} /><meshStandardMaterial color="#4a2b30" roughness={0.9} /></mesh></group>
    </group>
    <DogSleepMarks position={[position[0] + 0.1, position[1] + 1.2, position[2] + 0.85]} visible={sleeping} />
    <DogBowl position={[position[0] + 0.5, 0.04, position[2] + 0.62]} />
  </group>
}

function DogSleepMarks({ position, visible }) {
  return <group position={position} visible={visible}>
    {[0, 1, 2].map((index) => <group key={index} position={[index * 0.18, index * 0.18, 0]} rotation={[0, 0, -0.35]}>
      <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.22, 0.035, 0.025]} /><meshBasicMaterial color="#e7c58a" /></mesh>
      <mesh position={[0.04, 0, 0]} rotation={[0, 0, -0.9]}><boxGeometry args={[0.18, 0.035, 0.025]} /><meshBasicMaterial color="#e7c58a" /></mesh>
      <mesh position={[0, -0.12, 0]}><boxGeometry args={[0.22, 0.035, 0.025]} /><meshBasicMaterial color="#e7c58a" /></mesh>
    </group>)}
  </group>
}

function DogBowl({ position }) {
  return <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.42, 0.34, 0.16, 20]} /><meshStandardMaterial color="#6b4d43" roughness={0.7} /></mesh>
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.3, 0.23, 0.035, 20]} /><meshStandardMaterial color="#a97955" roughness={0.8} /></mesh>
    {[-0.13, 0.04, 0.16].map((x, index) => <mesh key={x} position={[x, 0.14, index % 2 ? 0.08 : -0.06]}><sphereGeometry args={[0.055, 8, 6]} /><meshStandardMaterial color={index % 2 ? '#8f4c36' : '#c27a43'} roughness={0.9} /></mesh>)}
  </group>
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
  const ceilingY = position[1] < 0 ? 0.02 : position[1] < 5 ? 5.02 : 8.1
  const wireLength = Math.max(0.18, ceilingY - position[1] - 0.28)

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
    <HangingWire length={wireLength} />
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
    <StairFloorTiles />
    <mesh receiveShadow position={[0, 3.5, -7]}><boxGeometry args={[22, 14.2, 0.2]} /><meshStandardMaterial color="#241c27" roughness={0.95} /></mesh>
    <mesh receiveShadow position={[-10.9, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[14, 14.2, 0.2]} /><meshStandardMaterial color="#1b1720" roughness={0.95} /></mesh>
    <mesh receiveShadow position={[10.9, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[14, 14.2, 0.2]} /><meshStandardMaterial color="#1b1720" roughness={0.95} /></mesh>
    <mesh position={[0, 8.1, 0]}><boxGeometry args={[22, 0.16, 14]} /><meshStandardMaterial color="#120f15" roughness={1} /></mesh>
    {[-8, -4, 0, 4, 8].map((x) => <mesh key={x} position={[x, 3.4, -6.84]}><boxGeometry args={[0.24, 6.7, 0.18]} /><meshStandardMaterial color="#473040" roughness={0.8} /></mesh>)}  </>
}

function FloorSlab({ y, color }) {
  return <>
    <mesh receiveShadow position={[3.9, y, 0]}><boxGeometry args={[14.2, 0.3, 14]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
    <mesh receiveShadow position={[-6.85, y, -5.35]}><boxGeometry args={[8.1, 0.3, 3.3]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
    <mesh receiveShadow position={[-6.85, y, 0]}><boxGeometry args={[8.1, 0.3, 4.3]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
    <mesh receiveShadow position={[-6.85, y, 5.35]}><boxGeometry args={[8.1, 0.3, 3.3]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
  </>
}

function StairFloorTiles() {
  const patches = [
    // The ground-floor upward stairwell is closed with a solid landing.
    { y: -4.82, x: -6.85, z: -2.92, width: 8.1, depth: 1.55, color: '#211a20' },
    // The lower stair only connects the ground and first floors. Cap its
    // matching opening on the second floor so the first floor cannot be seen
    // through an unused hole from above.
    { y: 5.02, x: -6.85, z: 2.92, width: 8.1, depth: 1.55, color: '#241c27' },
    // Full-width first-floor landings bridge only the wall-to-stair gaps.
    { y: 0.02, x: -9.65, z: 3.0, width: 2.5, depth: 1.55, color: '#2b2029' },
    { y: 0.02, x: -3.3, z: 3.0, width: 0.6, depth: 1.55, color: '#2b2029' },
    { y: 0.02, x: -9.65, z: -3.0, width: 2.5, depth: 1.55, color: '#2b2029' },
    { y: 0.02, x: -3.3, z: -3.0, width: 0.6, depth: 1.55, color: '#2b2029' },
  ]

  return <group>
    {patches.map((patch) => <TiledFloorPatch key={`${patch.y}-${patch.x}-${patch.z}`} {...patch} />)}
  </group>
}

function TiledFloorPatch({ y, x, z, width, depth, color }) {
  const verticalLines = Array.from({ length: Math.max(1, Math.floor(width)) }, (_, index) => -width / 2 + (index + 1) * width / (Math.floor(width) + 1))
  const horizontalLines = Array.from({ length: Math.max(1, Math.floor(depth)) }, (_, index) => -depth / 2 + (index + 1) * depth / (Math.floor(depth) + 1))
  return <group position={[x, y, z]}>
    <mesh receiveShadow><boxGeometry args={[width, 0.3, depth]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
    {verticalLines.map((line) => <mesh key={`v-${line}`} position={[line, 0.157, 0]}><boxGeometry args={[0.018, 0.012, depth]} /><meshStandardMaterial color="#71535a" roughness={1} /></mesh>)}
    {horizontalLines.map((line) => <mesh key={`h-${line}`} position={[0, 0.158, line]}><boxGeometry args={[width, 0.012, 0.018]} /><meshStandardMaterial color="#71535a" roughness={1} /></mesh>)}
  </group>
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
    <StoryNotes />
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

function StoryNotes() {
  return <>
    <StoryNote position={[-2.65, 2.25, -6.72]} accent="#9e4e48" />
    <StoryNote position={[-10.72, 2.15, 1.2]} rotation={[0, Math.PI / 2, 0]} accent="#c58a4c" />
    <StoryNote position={[4.55, 7.15, -6.72]} accent="#7565b8" />
  </>
}

function StoryNote({ position, rotation = [0, 0, 0], accent }) {
  return <group position={position} rotation={rotation}>
    <mesh castShadow><boxGeometry args={[0.92, 0.64, 0.035]} /><meshStandardMaterial color="#ad9174" roughness={0.9} /></mesh>
    <mesh position={[0, 0.17, 0.025]}><boxGeometry args={[0.68, 0.035, 0.012]} /><meshBasicMaterial color={accent} /></mesh>
    <mesh position={[0, 0.06, 0.025]}><boxGeometry args={[0.74, 0.018, 0.012]} /><meshBasicMaterial color="#493b38" /></mesh>
    <mesh position={[-0.06, -0.05, 0.025]}><boxGeometry args={[0.6, 0.018, 0.012]} /><meshBasicMaterial color="#493b38" /></mesh>
    <mesh position={[0.08, -0.15, 0.025]}><boxGeometry args={[0.46, 0.018, 0.012]} /><meshBasicMaterial color="#493b38" /></mesh>
  </group>
}

function HauntedTaskProps({ found }) {
  return <>
    <mesh position={[0, 2.05, -6.55]} castShadow><boxGeometry args={[0.34, 0.22, 0.12]} /><meshStandardMaterial color="#8c3237" emissive="#5d171f" emissiveIntensity={0.5} /></mesh>
    <SmashableCrate position={[6.9, 0.62, -5.82]} broken={found.includes('weapons')} />
    <mesh position={[-5.4, -4.12, 1.8]} rotation={[0.08, -0.25, 0.12]} castShadow><boxGeometry args={[0.62, 0.08, 0.42]} /><meshStandardMaterial color="#a77d67" roughness={0.85} /></mesh>
    <mesh position={[5.6, -4.22, -4.18]} castShadow><boxGeometry args={[0.72, 0.6, 0.34]} /><meshStandardMaterial color="#563431" roughness={0.88} /></mesh>
    <mesh position={[3.6, 5.58, 3.2]} rotation={[0, 0.35, -0.1]} castShadow><boxGeometry args={[0.62, 0.08, 0.42]} /><meshStandardMaterial color="#7e91a7" roughness={0.85} /></mesh>
    <mesh position={[5.2, 8.22, -6.55]} castShadow><boxGeometry args={[0.9, 0.14, 0.08]} /><meshStandardMaterial color="#766a85" roughness={0.9} /></mesh>
    {HAUNTED_TASKS.map((task) => task.reward > 0 && found.includes(task.id) && <TaskGem key={task.id} position={GEM_POSITIONS[task.id]} />)}
  </>
}

function TaskGem({ position }) {
  if (!position) return null
  return <group position={position}>
    <mesh rotation={[0.35, 0.6, 0.2]} castShadow><octahedronGeometry args={[0.2, 0]} /><meshStandardMaterial color="#c7f0ff" emissive="#55b7d8" emissiveIntensity={1.5} metalness={0.45} roughness={0.16} /></mesh>
    <pointLight color="#70dfff" intensity={1.8} distance={2.4} decay={2} />
  </group>
}

function SmashableCrate({ position, broken }) {
  const pieces = useRef([])
  const dust = useRef([])
  const wasBroken = useRef(false)
  const breakStarted = useRef(-10)
  const panels = [
    { position: [-0.52, 0, 0], size: [0.1, 0.86, 0.86], direction: [-0.55, 0.18, 0.02] },
    { position: [0.52, 0, 0], size: [0.1, 0.86, 0.86], direction: [0.55, 0.22, -0.04] },
    { position: [0, 0, -0.39], size: [0.94, 0.86, 0.1], direction: [-0.08, 0.24, -0.52] },
    { position: [0, 0, 0.39], size: [0.94, 0.86, 0.1], direction: [0.12, 0.28, 0.52] },
    { position: [0, 0.43, 0], size: [1.15, 0.1, 0.9], direction: [0.04, 0.68, -0.08] },
  ]

  useFrame(({ clock }) => {
    if (broken && !wasBroken.current) {
      wasBroken.current = true
      breakStarted.current = clock.elapsedTime
    }
    const progress = broken ? THREE.MathUtils.clamp((clock.elapsedTime - breakStarted.current) / 1.15, 0, 1) : 0
    const burst = 1 - Math.pow(1 - progress, 3)
    pieces.current.forEach((piece, index) => {
      if (!piece) return
      const panel = panels[index]
      piece.position.set(panel.position[0] + panel.direction[0] * burst, panel.position[1] + panel.direction[1] * burst, panel.position[2] + panel.direction[2] * burst)
      piece.rotation.set(burst * (index % 2 ? -0.75 : 0.62), burst * (index - 2) * 0.25, burst * (index % 2 ? 0.52 : -0.42))
    })
    dust.current.forEach((chip, index) => {
      if (!chip) return
      const drift = burst * (0.45 + index * 0.08)
      chip.position.set((index - 2) * 0.18 + drift * (index % 2 ? 0.7 : -0.7), 0.12 + burst * (0.35 + index * 0.05), (index % 2 ? 0.2 : -0.2) + drift * 0.25)
      chip.rotation.x = burst * (index + 1)
      chip.rotation.z = burst * (index % 2 ? -1 : 1)
    })
  })

  return <group position={position}>
    <mesh position={[0, -0.43, 0]} castShadow><boxGeometry args={[1.15, 0.1, 0.9]} /><meshStandardMaterial color="#4b302b" roughness={0.95} /></mesh>
    {panels.map((panel, index) => <mesh key={index} ref={(node) => { pieces.current[index] = node }} position={panel.position} castShadow><boxGeometry args={panel.size} /><meshStandardMaterial color={index % 2 ? '#704633' : '#5b392d'} roughness={0.9} /></mesh>)}
    {[-2, -1, 0, 1, 2].map((index) => <mesh key={`chip-${index}`} ref={(node) => { dust.current[index + 2] = node }} position={[(index) * 0.18, 0.12, index % 2 ? 0.2 : -0.2]} castShadow><boxGeometry args={[0.12, 0.08, 0.06]} /><meshStandardMaterial color="#b07b52" roughness={0.88} /></mesh>)}
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

const RACK_WEAPONS = ['sword', 'axe', 'spear', 'mace', 'crossbow']

function WeaponRack({ position }) {
  return <group position={position} rotation={[0, Math.PI / 2, 0]}>
    <mesh position={[0, 1.35, 0]} castShadow><boxGeometry args={[2.2, 0.16, 0.18]} /><meshStandardMaterial color="#5a3b2c" roughness={0.85} /></mesh>
    <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[2.2, 0.16, 0.18]} /><meshStandardMaterial color="#5a3b2c" roughness={0.85} /></mesh>
    {[-0.85, 0, 0.85].map((x) => <mesh key={x} position={[x, 0.8, 0]} castShadow><boxGeometry args={[0.14, 1.35, 0.14]} /><meshStandardMaterial color="#453029" roughness={0.85} /></mesh>)}
    {RACK_WEAPONS.map((type, index) => <RackWeapon key={type} type={type} position={[-0.8 + index * 0.4, 0.28, 0.13]} />)}
  </group>
}

function RackWeapon({ type, position }) {
  const metal = <meshStandardMaterial color="#9ba5a6" emissive="#263437" emissiveIntensity={0.25} metalness={0.88} roughness={0.2} />
  const wood = <meshStandardMaterial color="#5a3528" roughness={0.8} />
  if (type === 'sword') return <group position={position}>
    <mesh position={[0, 0.72, 0]} castShadow><boxGeometry args={[0.1, 1.15, 0.07]} />{metal}</mesh>
    <mesh position={[0, 0.1, 0]} castShadow><cylinderGeometry args={[0.055, 0.055, 0.24, 8]} />{wood}</mesh>
    <mesh position={[0, 0.36, 0]} castShadow><boxGeometry args={[0.34, 0.07, 0.1]} />{metal}</mesh>
  </group>
  if (type === 'axe') return <group position={position}>
    <mesh position={[0, 0.68, 0]} castShadow><cylinderGeometry args={[0.045, 0.06, 1.25, 8]} />{wood}</mesh>
    <mesh position={[0.12, 1.22, 0]} rotation={[0, 0, -0.15]} castShadow><boxGeometry args={[0.42, 0.26, 0.09]} />{metal}</mesh>
  </group>
  if (type === 'spear') return <group position={position}>
    <mesh position={[0, 0.72, 0]} castShadow><cylinderGeometry args={[0.035, 0.05, 1.35, 8]} />{wood}</mesh>
    <mesh position={[0, 1.48, 0]} rotation={[0, 0, Math.PI]} castShadow><coneGeometry args={[0.13, 0.42, 6]} />{metal}</mesh>
  </group>
  if (type === 'mace') return <group position={position}>
    <mesh position={[0, 0.64, 0]} castShadow><cylinderGeometry args={[0.055, 0.07, 1.1, 8]} />{wood}</mesh>
    <mesh position={[0, 1.25, 0]} castShadow><dodecahedronGeometry args={[0.2, 0]} />{metal}</mesh>
  </group>
  return <group position={position}>
    <mesh position={[0, 0.88, 0]} castShadow><boxGeometry args={[0.65, 0.1, 0.12]} />{wood}</mesh>
    <mesh position={[0, 1.13, 0]} castShadow><boxGeometry args={[0.1, 0.5, 0.08]} />{metal}</mesh>
    <mesh position={[-0.29, 1.12, 0]} rotation={[0, 0, -0.45]} castShadow><boxGeometry args={[0.08, 0.42, 0.07]} />{metal}</mesh>
    <mesh position={[0.29, 1.12, 0]} rotation={[0, 0, 0.45]} castShadow><boxGeometry args={[0.08, 0.42, 0.07]} />{metal}</mesh>
    <mesh position={[0, 0.42, 0]} castShadow><boxGeometry args={[0.12, 0.75, 0.12]} />{wood}</mesh>
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
    <HangingWire length={0.34} />
    <mesh castShadow><cylinderGeometry args={[0.06, 0.06, 0.45, 10]} /><meshStandardMaterial color="#34251f" metalness={0.5} /></mesh>
    <mesh position={[0, -0.3, 0]} castShadow><sphereGeometry args={[0.2, 16, 10]} /><meshStandardMaterial color="#e4b56c" emissive={color} emissiveIntensity={0.8} /></mesh>
    <pointLight position={[0, -0.34, 0]} color={color} intensity={intensity} distance={7} decay={2} />
  </group>
}

function HangingWire({ length = 0.3 }) {
  return <>
    <mesh position={[0, 0.28 + length / 2, 0]} castShadow><cylinderGeometry args={[0.025, 0.025, length, 8]} /><meshStandardMaterial color="#211b1b" metalness={0.35} roughness={0.78} /></mesh>
    <mesh position={[0, 0.28 + length, 0]}><cylinderGeometry args={[0.09, 0.09, 0.04, 10]} /><meshStandardMaterial color="#3b2a25" metalness={0.55} roughness={0.45} /></mesh>
  </>
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

function StudyRats({ reacted = false }) {
  return <>
    <Rat path={[[-5.15, -2.45], [-4.05, -2.45], [-4.05, -1.1], [-5.15, -1.1]]} phase={0.2} speed={reacted ? 0.3 : 0.55} scale={0.9} reacted={reacted} />
    <Rat path={[[3.1, -4.35], [5.6, -4.35], [5.6, -2.75], [3.1, -2.75]]} phase={1.8} speed={0.48} scale={0.82} />
    <Rat path={[[-1.35, 3.9], [0.7, 3.9], [0.7, 4.55], [-1.35, 4.55]]} phase={3.1} speed={0.62} scale={0.72} />
  </>
}

function Rat({ path, phase = 0, speed = 0.5, scale = 1, floorY = -0.1, reacted = false }) {
  const rat = useRef()
  const head = useRef()

  useFrame(({ clock }) => {
    if (!rat.current || path.length < 2) return
    const routePosition = (clock.elapsedTime * speed + phase) % path.length
    const segment = Math.floor(routePosition)
    const progress = routePosition - segment
    const from = path[segment]
    const to = path[(segment + 1) % path.length]
    const x = reacted ? path[0][0] : THREE.MathUtils.lerp(from[0], to[0], progress)
    const z = reacted ? path[0][1] : THREE.MathUtils.lerp(from[1], to[1], progress)
    const eatingBob = reacted ? Math.abs(Math.sin(clock.elapsedTime * 5 + phase)) * 0.025 : 0
    rat.current.position.set(x, floorY + Math.abs(Math.sin(clock.elapsedTime * (reacted ? 15 : 10) + phase)) * (reacted ? 0.04 : 0.018), z)
    rat.current.rotation.y = reacted ? Math.sin(clock.elapsedTime * 2 + phase) * 0.16 : Math.atan2(to[0] - from[0], to[1] - from[1])
    rat.current.rotation.z = reacted ? Math.sin(clock.elapsedTime * 5 + phase) * 0.12 : 0
    if (head.current) {
      head.current.position.y = 0.24 - eatingBob
      head.current.position.z = 0.32 + (reacted ? Math.sin(clock.elapsedTime * 5 + phase) * 0.035 : 0)
    }
  })

  return <group ref={rat} position={[path[0][0], floorY, path[0][1]]} scale={scale}>
    <mesh position={[0, 0.2, 0]} castShadow>
      <sphereGeometry args={[0.28, 12, 8]} />
      <meshStandardMaterial color="#473832" roughness={0.95} />
    </mesh>
    <mesh ref={head} position={[0, 0.24, 0.32]} castShadow>
      <sphereGeometry args={[0.19, 12, 8]} />
      <meshStandardMaterial color="#59423a" roughness={0.95} />
    </mesh>
    {[-0.12, 0.12].map((x) => <mesh key={`ear-${x}`} position={[x, 0.41, 0.3]} castShadow>
      <sphereGeometry args={[0.09, 10, 8]} />
      <meshStandardMaterial color="#82574d" roughness={0.9} />
    </mesh>)}
    {[-0.07, 0.07].map((x) => <mesh key={`eye-${x}`} position={[x, 0.27, 0.49]}>
      <sphereGeometry args={[0.026, 8, 8]} />
      <meshBasicMaterial color="#ef7668" />
    </mesh>)}
    <mesh position={[0, 0.23, 0.51]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color="#c67b70" roughness={0.85} />
    </mesh>
    {[-0.14, 0.14].map((x) => <mesh key={`front-leg-${x}`} position={[x, 0.06, 0.18]} castShadow>
      <boxGeometry args={[0.07, 0.18, 0.12]} />
      <meshStandardMaterial color="#382c2b" roughness={1} />
    </mesh>)}
    {[-0.14, 0.14].map((x) => <mesh key={`back-leg-${x}`} position={[x, 0.06, -0.18]} castShadow>
      <boxGeometry args={[0.07, 0.18, 0.12]} />
      <meshStandardMaterial color="#382c2b" roughness={1} />
    </mesh>)}
    <mesh position={[0, 0.18, -0.36]} rotation={[Math.PI / 2, 0.18, 0]}>
      <cylinderGeometry args={[0.025, 0.018, 0.68, 8]} />
      <meshStandardMaterial color="#a96e66" roughness={0.9} />
    </mesh>
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

function FinalKey({ position, hidden = false, glowing = false }) {
  const key = useRef()
  useFrame(({ clock }) => {
    if (!key.current) return
    key.current.position.y = hidden ? (glowing ? Math.sin(clock.elapsedTime * 2.5) * 0.14 : 0) : Math.sin(clock.elapsedTime * 2.5) * 0.14
    key.current.rotation.y = hidden ? (glowing ? clock.elapsedTime * 1.6 : 0.15) : clock.elapsedTime * 1.6
  })

  return <group ref={key} position={position}>
    <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.16, 0.045, 10, 20]} /><meshStandardMaterial color="#b99b58" emissive="#6b4829" emissiveIntensity={hidden && !glowing ? 0.28 : 1.4} metalness={0.75} roughness={0.2} /></mesh>
    <mesh position={[0.22, 0, 0]}><boxGeometry args={[0.42, 0.06, 0.06]} /><meshStandardMaterial color="#b99b58" emissive="#6b4829" emissiveIntensity={hidden && !glowing ? 0.28 : 1.4} metalness={0.75} roughness={0.2} /></mesh>
    <mesh position={[0.42, -0.08, 0]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.08, 0.25, 0.06]} /><meshStandardMaterial color="#b99b58" metalness={0.75} roughness={0.2} /></mesh>
    <pointLight color="#ffc66c" intensity={hidden && !glowing ? 0.15 : 3} distance={hidden && !glowing ? 0.8 : 3} />
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

function SealedLabel({ position }) {
  const patterns = {
    S: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  }
  const cell = 0.05
  return <group position={position} rotation={[0, -Math.PI / 2, 0]}>
    {'SEALED'.split('').map((letter, letterIndex) => patterns[letter].map((row, rowIndex) => row.split('').map((filled, columnIndex) => filled === '1' && <mesh key={`${letterIndex}-${rowIndex}-${columnIndex}`} position={[(letterIndex * 6 + columnIndex - 17.5) * cell, (3 - rowIndex) * cell, 0]}><boxGeometry args={[cell * 0.82, cell * 0.82, 0.035]} /><meshStandardMaterial color="#e18b72" emissive="#64262d" emissiveIntensity={0.8} /></mesh>)))}
  </group>
}

function ExitDoor({ open, ...props }) {
  return <group position={[6.72, 2.1, -1.9]} {...props}>
    <mesh castShadow><boxGeometry args={[0.22, 4.3, 2.45]} /><meshStandardMaterial color="#52382f" roughness={0.7} /></mesh>
    <group position={[-0.13, 0.18, 0]} rotation={[0, open ? -1.15 : 0, 0]}>
      <mesh castShadow><boxGeometry args={[0.08, 3.7, 1.92]} /><meshStandardMaterial color={open ? '#b98b50' : '#3c4b45'} emissive={open ? '#8c572d' : '#000000'} emissiveIntensity={open ? 0.65 : 0} /></mesh>
      <mesh position={[-0.07, -0.18, 0.72]}><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color="#d5a956" metalness={0.7} /></mesh>
      {!open && <>
        <mesh position={[-0.23, 0.2, 0]}><boxGeometry args={[0.12, 0.16, 2.05]} /><meshStandardMaterial color="#2a302f" metalness={0.25} roughness={0.8} /></mesh>
        <mesh position={[-0.23, -0.42, 0]}><boxGeometry args={[0.12, 0.16, 2.05]} /><meshStandardMaterial color="#2a302f" metalness={0.25} roughness={0.8} /></mesh>
        <group position={[-0.23, -0.05, 0.28]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh><torusGeometry args={[0.16, 0.045, 10, 18]} /><meshStandardMaterial color="#d5a956" emissive="#6b4829" emissiveIntensity={0.45} metalness={0.75} roughness={0.25} /></mesh>
          <mesh position={[0, -0.16, 0]}><boxGeometry args={[0.12, 0.24, 0.24]} /><meshStandardMaterial color="#d5a956" emissive="#6b4829" emissiveIntensity={0.45} metalness={0.75} roughness={0.25} /></mesh>
        </group>
        <SealedLabel position={[-0.23, 0.9, 0.13]} />
      </>}
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
  hammer: { title: 'The iron hammer', text: 'A heavy iron hammer turns slowly in the air. Pick it up before trying to break the sealed panels and crates.', action: 'Pick up the hammer' },
  weapon: { title: 'A loaded rack weapon', text: 'One of the rack weapons still has a working chamber. Take it to defend yourself on the second floor.', action: 'Take the weapon' },
  guardDog: { text: 'The tied bulldog watches you closely. Calm it to reveal a safer route through the chamber.', action: 'Calm the bulldog' },
  guardDog2: { text: 'A second bulldog guards the opposite side of the first floor. Approach it and calm this bulldog.', action: 'Calm this bulldog' },
  haunted: { title: 'The haunted chamber', text: 'The walls are covered in crosses. A ritual table, old weapons and silent bodies fill the darkness. Find the final key.', action: 'Explore the chamber' },
  cross: { text: 'The cross has fresh scratches beneath it. Press the hidden button to open a panel and claim the gem inside.', action: 'Press the hidden button' },
  weapons: { text: 'A battered crate is wedged beside the weapons rack. Break it open to search for a gem.', action: 'Break open the crate' },
  groundBody: { text: 'The body is cold, but an evidence file is tucked beneath its hand. Open it to find what was hidden.', action: 'Open the evidence file' },
  groundClue: { text: 'Three faded marks stop beside an old cabinet. Unlock it to reveal the gem beside the final clue.', action: 'Open the old cabinet' },
  secondBody: { text: 'A silent figure lies beneath the blue light. A sealed coat file contains something valuable.', action: 'Open the coat file' },
  secondCross: { text: 'The high inscription hides a thin stone panel. Break it to expose the last gem.', action: 'Break the stone panel' },
}

const BACKSTORY_CHAPTERS = [
  {
    eyebrow: 'PROLOGUE · THE PURCHASE',
    title: 'The house came with a warning',
    text: 'At dusk, you signed the deed to Northmere House. The price was strangely low, and the auction listing mentioned one condition: never stay past midnight.',
    scene: 'house',
  },
  {
    eyebrow: 'PROLOGUE · THE HANDOVER',
    title: 'A key from the previous owner',
    text: 'The estate agent avoids your eyes. “The last owner disappeared before he could leave,” she says, placing a cold brass key in your palm. “If the house asks you a question, answer it.”',
    scene: 'handoff',
  },
  {
    eyebrow: 'PROLOGUE · THE FIRST NIGHT',
    title: 'The study was waiting',
    text: 'Inside, the portrait seems to follow you. A warm book clicks somewhere in the dark, while three locked dials wait on an ironbound chest. You realize the key you were given opens only the front door.',
    scene: 'study',
  },
  {
    eyebrow: 'PROLOGUE · THE LAST ROOM',
    title: 'Something is still alive in the house',
    text: 'Behind the study, a sealed passage breathes cold air. The missing owner left a trail of gems, weapons and warnings across three floors. Find the last key before the house decides you belong to it.',
    scene: 'door',
  },
]

function BackstoryCinematic({ onComplete, hasSave = false, onResume }) {
  const [chapter, setChapter] = useState(0)
  const [handoffChoice, setHandoffChoice] = useState(null)
  const current = BACKSTORY_CHAPTERS[chapter]
  const needsHandoffChoice = current.scene === 'handoff' && !handoffChoice

  const advance = () => {
    if (needsHandoffChoice) return
    if (chapter >= BACKSTORY_CHAPTERS.length - 1) {
      onComplete()
      return
    }
    setChapter((value) => value + 1)
  }

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault()
        advance()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        onComplete()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [chapter, onComplete])

  return <div className="prologue-overlay" role="dialog" aria-modal="true" aria-labelledby="prologue-title">
    <div className="prologue-card">
      <div className="prologue-topline"><span>THE LAST ROOM</span><span>{String(chapter + 1).padStart(2, '0')} / {String(BACKSTORY_CHAPTERS.length).padStart(2, '0')}</span></div>
      <div className={`prologue-scene ${current.scene}`} aria-label={`${current.title} cinematic scene`}>
        {current.scene === 'house' && <><div className="prologue-moon" /><div className="prologue-house"><span className="house-window house-window-one" /><span className="house-window house-window-two" /><span className="house-door" /></div><div className="prologue-ground" /></>}
        {current.scene === 'handoff' && <><div className="prologue-counter" /><div className="prologue-person agent"><span className="person-head" /><span className="person-body" /><span className="person-arm person-arm-reach" /><span className="person-hand handoff-hand" /></div><div className="prologue-person player"><span className="person-head" /><span className="person-body" /><span className="person-arm player-arm-reach" /><span className="person-hand player-hand" /></div><div className="handoff-key"><span className="key-ring" /><span className="key-shaft" /><span className="key-teeth" /></div><p className="handoff-caption">“The house remembers every owner.”</p></>}
        {current.scene === 'study' && <><div className="prologue-lamp" /><div className="prologue-portrait"><span className="portrait-face" /></div><div className="prologue-desk" /><div className="prologue-chest" /><div className="prologue-shadow" /></>}
        {current.scene === 'door' && <><div className="prologue-arch" /><div className="prologue-sealed-door"><span className="sealed-symbol">✦</span><span className="sealed-crack" /></div><div className="prologue-key-glow" /></>}
      </div>
      <div className="prologue-copy"><p className="eyebrow">{current.eyebrow}</p><h2 id="prologue-title">{current.title}</h2><p>{current.text}</p>{current.scene === 'handoff' && <div className="prologue-choice"><span>What do you do?</span><button type="button" className={handoffChoice === 'ask' ? 'selected' : ''} onClick={() => setHandoffChoice('ask')}>Ask about the missing owner</button><button type="button" className={handoffChoice === 'take' ? 'selected' : ''} onClick={() => setHandoffChoice('take')}>Take the key and enter</button>{handoffChoice && <em>{handoffChoice === 'ask' ? 'The agent whispers: “He went upstairs and never came down.”' : 'You close your fingers around the key. It is warm now.'}</em>}</div>}</div>
      <div className="prologue-actions"><button className="action-button" type="button" disabled={needsHandoffChoice} onClick={advance}>{chapter === BACKSTORY_CHAPTERS.length - 1 ? 'Enter the house' : 'Continue'} <span>↵</span></button><button className="prologue-skip" type="button" onClick={onComplete}>Skip prologue <span>ESC</span></button>{hasSave && <button className="prologue-resume" type="button" onClick={onResume}>Continue saved game</button>}</div>
      <div className="prologue-progress" aria-hidden="true">{BACKSTORY_CHAPTERS.map((item, index) => <i className={index <= chapter ? 'active' : ''} key={item.scene} />)}</div>
    </div>
  </div>
}

function App() {
  const [selected, setSelected] = useState('painting')
  const [found, setFound] = useState([])
  const [roomComplete, setRoomComplete] = useState(false)
  const [hauntedRoom, setHauntedRoom] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [showWinBanner, setShowWinBanner] = useState(false)
  const [showReplayPrompt, setShowReplayPrompt] = useState(false)
  const [secretEnding, setSecretEnding] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [nearbyTask, setNearbyTask] = useState(null)
  const [hasHammer, setHasHammer] = useState(false)
  const [hasGun, setHasGun] = useState(false)
  const [equipped, setEquipped] = useState(null)
  const [droppedItems, setDroppedItems] = useState([])
  const [hammerSwing, setHammerSwing] = useState(0)
  const [cameraShake, setCameraShake] = useState(0)
  const [shot, setShot] = useState(0)
  const [aiming, setAiming] = useState(false)
  const [sleepingDogs, setSleepingDogs] = useState([false, false])
  const [shotImpacts, setShotImpacts] = useState([])
  const [ammo, setAmmo] = useState(6)
  const [reloading, setReloading] = useState(false)
  const [enemiesDefeated, setEnemiesDefeated] = useState(0)
  const [health, setHealth] = useState(100)
  const [playerDead, setPlayerDead] = useState(false)
  const [enemyAlerted, setEnemyAlerted] = useState(false)
  const [playerFloor, setPlayerFloor] = useState('First floor')
  const healthRef = useRef(100)
  const lastDamageAt = useRef(0)
  const [gems, setGems] = useState(0)
  const [message, setMessage] = useState('The exit is sealed. Find the portrait, desk and chest to open the next room.')
  const [seconds, setSeconds] = useState(18 * 60 + 42)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [paused, setPaused] = useState(true)
  const [muted, setMuted] = useState(false)
  const [lowQuality, setLowQuality] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [sensitivity, setSensitivity] = useState(1)
  const [audioSettings, setAudioSettings] = useState({ music: 0.5, ambience: 0.7, dog: 0.85, weapons: 1 })
  const soundContext = useRef(null)
  const dogSleepTimers = useRef([])
  const noticeTimer = useRef(null)
  const floorTimer = useRef(null)
  const memoryTimer = useRef(null)
  const [taskNotice, setTaskNotice] = useState(null)
  const [floorBanner, setFloorBanner] = useState(null)
  const [memoryEcho, setMemoryEcho] = useState(null)
  const [savedRun, setSavedRun] = useState(() => {
    try {
      const stored = window.localStorage.getItem('last-room-save')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const targets = hauntedRoom ? [...HAUNTED_TASKS, SECOND_DOG_TARGET, HAMMER_TARGET, WEAPON_TARGET, { id: 'key', floor: 'Second floor', position: [7.2, -4.35], radius: 0.62 }] : ROOM_TARGETS
  const collected = [...(hasHammer && equipped === 'hammer' ? ['hammer'] : []), ...(hasGun && equipped === 'weapon' ? ['weapon'] : [])]
  const clue = CLUES[selected] || CLUES.painting

  const enableAudio = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    if (!soundContext.current) soundContext.current = new AudioContextClass()
    soundContext.current.resume()
    window.dispatchEvent(new Event('game-audio-unlock'))
    setMessage('Sound enabled. Test it with the weapon sound button.')
  }

  const playWeaponSound = (type, category = 'weapons') => {
    const volumeSetting = category === 'ambience' ? audioSettings.ambience : audioSettings.weapons
    if (muted || volumeSetting <= 0) return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    if (!soundContext.current) soundContext.current = new AudioContextClass()
    const context = soundContext.current
    const schedule = () => {
      const now = context.currentTime
      const gain = context.createGain()
      const oscillator = context.createOscillator()
      const filter = context.createBiquadFilter()
      const volume = 0.3 * volumeSetting
      const profiles = {
        fire: { start: 220, end: 58, duration: 0.2, wave: 'sawtooth', level: 1.25 },
        reload: { start: 280, end: 120, duration: 0.16, wave: 'square', level: 0.7 },
        empty: { start: 130, end: 76, duration: 0.12, wave: 'square', level: 0.8 },
        hit: { start: 620, end: 150, duration: 0.16, wave: 'triangle', level: 0.95 },
        defeat: { start: 210, end: 45, duration: 0.38, wave: 'sawtooth', level: 1 },
        equip: { start: 300, end: 700, duration: 0.18, wave: 'triangle', level: 0.7 },
        pickup: { start: 360, end: 820, duration: 0.22, wave: 'sine', level: 0.75 },
        gem: { start: 520, end: 1040, duration: 0.3, wave: 'sine', level: 0.9 },
        unlock: { start: 180, end: 660, duration: 0.3, wave: 'triangle', level: 0.9 },
        alert: { start: 180, end: 520, duration: 0.24, wave: 'square', level: 0.75 },
        victory: { start: 240, end: 760, duration: 0.55, wave: 'sine', level: 1.1 },
        jump: { start: 180, end: 340, duration: 0.12, wave: 'triangle', level: 0.35 },
        land: { start: 90, end: 42, duration: 0.18, wave: 'sine', level: 0.5 },
      }
      const profile = profiles[type] || profiles.fire
      oscillator.type = profile.wave
      oscillator.frequency.setValueAtTime(profile.start, now)
      oscillator.frequency.exponentialRampToValueAtTime(profile.end, now + profile.duration)
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(type === 'fire' ? 1800 : 1100, now)
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(volume * profile.level, now + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.001, now + profile.duration)
      oscillator.connect(filter).connect(gain).connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + profile.duration + 0.03)
    }
    if (context.state === 'suspended') context.resume().then(schedule).catch(() => {})
    else schedule()
  }

  useEffect(() => {
    const unlock = () => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return
      if (!soundContext.current) soundContext.current = new AudioContextClass()
      soundContext.current.resume()
      window.dispatchEvent(new Event('game-audio-unlock'))
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value > 0 ? value - 1 : 0), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (showIntro || showReplayPrompt) return
    const snapshot = { selected, found, roomComplete, hauntedRoom, hasHammer, hasGun, equipped, droppedItems, ammo, enemiesDefeated, health, gems, seconds, playerFloor, enemyAlerted }
    try {
      window.localStorage.setItem('last-room-save', JSON.stringify(snapshot))
    } catch {
      // Saving is optional; the game remains playable if storage is unavailable.
    }
  }, [showIntro, showReplayPrompt, selected, found, roomComplete, hauntedRoom, hasHammer, hasGun, equipped, droppedItems, ammo, enemiesDefeated, health, gems, seconds, playerFloor, enemyAlerted])

  useEffect(() => {
    const allRoomTasksFound = ROOM_TASKS.every((task) => found.includes(task.id))
    if (hauntedRoom || roomComplete || !allRoomTasksFound) return undefined
    setRoomComplete(true)
    const transition = window.setTimeout(() => {
      // Switch rooms as one state transition so the first-room progress cannot
      // leave the controller or the action prompt pointing at the old scene.
      setHauntedRoom(true)
      setFound([])
      setNearbyTask(null)
      setSelected('haunted')
      setMessage('The study is complete. A larger haunted chamber has opened beyond the wall.')
      setRoomComplete(false)
    }, 2200)
    return () => window.clearTimeout(transition)
  }, [found.length, hauntedRoom])

  const time = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`, [seconds])

  useEffect(() => {
    const handlePauseKey = (event) => {
      if (event.key.toLowerCase() !== 'p') return
      if (['INPUT', 'BUTTON', 'SELECT'].includes(document.activeElement?.tagName)) return
      event.preventDefault()
      setPaused((value) => !value)
    }
    window.addEventListener('keydown', handlePauseKey)
    return () => window.removeEventListener('keydown', handlePauseKey)
  }, [])

  const showTaskNotice = (title, text, icon = '✦') => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    setTaskNotice({ title, text, icon })
    noticeTimer.current = window.setTimeout(() => setTaskNotice(null), 4200)
  }

  const showFloorBanner = (floor) => {
    if (floorTimer.current) window.clearTimeout(floorTimer.current)
    setFloorBanner(floor)
    floorTimer.current = window.setTimeout(() => setFloorBanner(null), 3000)
  }

  const showMemoryEcho = (text) => {
    if (memoryTimer.current) window.clearTimeout(memoryTimer.current)
    setMemoryEcho(text)
    memoryTimer.current = window.setTimeout(() => setMemoryEcho(null), 3600)
  }

  const beginGame = () => {
    setShowIntro(false)
    setPaused(false)
    setMessage('The brass key is cold in your hand. Search the study.')
  }

  const resumeGame = () => {
    if (!savedRun) return
    setSelected(savedRun.selected || 'painting')
    setFound(savedRun.found || [])
    setRoomComplete(Boolean(savedRun.roomComplete))
    setHauntedRoom(Boolean(savedRun.hauntedRoom))
    setHasHammer(Boolean(savedRun.hasHammer))
    setHasGun(Boolean(savedRun.hasGun))
    setEquipped(savedRun.equipped || null)
    setDroppedItems(savedRun.droppedItems || [])
    setAmmo(savedRun.ammo ?? 6)
    setEnemiesDefeated(savedRun.enemiesDefeated || 0)
    healthRef.current = savedRun.health ?? 100
    setHealth(savedRun.health ?? 100)
    setGems(savedRun.gems || 0)
    setSeconds(savedRun.seconds ?? 18 * 60 + 42)
    setPlayerFloor(savedRun.playerFloor || 'First floor')
    setEnemyAlerted(Boolean(savedRun.enemyAlerted))
    setShowIntro(false)
    setPaused(false)
    setMessage('Your saved investigation has been restored.')
  }

  const restartGame = () => {
    try {
      window.localStorage.removeItem('last-room-save')
    } catch {
      // Ignore storage failures.
    }
    setSavedRun(null)
    setSelected('painting')
    setFound([])
    setRoomComplete(false)
    setHauntedRoom(false)
    setGameWon(false)
    setShowWinBanner(false)
    setShowReplayPrompt(false)
    setSecretEnding(false)
    setShowIntro(true)
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    if (floorTimer.current) window.clearTimeout(floorTimer.current)
    if (memoryTimer.current) window.clearTimeout(memoryTimer.current)
    setTaskNotice(null)
    setFloorBanner(null)
    setMemoryEcho(null)
    setNearbyTask(null)
    setHasHammer(false)
    setHasGun(false)
    setEquipped(null)
    setDroppedItems([])
    setHammerSwing(0)
    setCameraShake(0)
    setAiming(false)
    dogSleepTimers.current.forEach((timer) => window.clearTimeout(timer))
    dogSleepTimers.current = []
    setSleepingDogs([false, false])
    setShotImpacts([])
    setAmmo(6)
    setReloading(false)
    setEnemiesDefeated(0)
    healthRef.current = 100
    setHealth(100)
    setPlayerDead(false)
    setEnemyAlerted(false)
    setPlayerFloor('First floor')
    setGems(0)
    setMessage('The exit is sealed. Find the portrait, desk and chest to open the next room.')
    setSeconds(18 * 60 + 42)
    setPaused(true)
    setSettingsOpen(false)
  }

  const restartCurrentRoom = () => {
    if (!hauntedRoom) {
      restartGame()
      return
    }
    setFound([])
    setNearbyTask(null)
    setHasHammer(false)
    setHasGun(false)
    setEquipped(null)
    setDroppedItems([])
    setHammerSwing(0)
    setCameraShake(0)
    setShot(0)
    setAiming(false)
    dogSleepTimers.current.forEach((timer) => window.clearTimeout(timer))
    dogSleepTimers.current = []
    setSleepingDogs([false, false])
    setShotImpacts([])
    setAmmo(6)
    setReloading(false)
    setEnemiesDefeated(0)
    healthRef.current = 100
    setHealth(100)
    setPlayerDead(false)
    setEnemyAlerted(false)
    setPlayerFloor('First floor')
    setGems(0)
    setGameWon(false)
    setShowWinBanner(false)
    setShowReplayPrompt(false)
    setSecretEnding(false)
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    if (floorTimer.current) window.clearTimeout(floorTimer.current)
    if (memoryTimer.current) window.clearTimeout(memoryTimer.current)
    setTaskNotice(null)
    setFloorBanner(null)
    setMemoryEcho(null)
    setSelected('haunted')
    setMessage('The haunted chamber has been reset. Find the hammer and weapon again.')
    setPaused(false)
    setSettingsOpen(false)
  }

  const handleJump = (event) => {
    setCameraShake((value) => value + 1)
    playWeaponSound(event === 'land' ? 'land' : 'jump', 'ambience')
  }

  const handleFloorChange = (floor) => {
    setPlayerFloor(floor)
    showFloorBanner(floor)
    const echoes = {
      'Ground floor': 'A handprint appears on the wall below you.',
      'First floor': 'The house remembers your footsteps.',
      'Second floor': 'A silhouette waits at the top landing.',
    }
    showMemoryEcho(echoes[floor])
    if (floor === 'Second floor') {
      setEnemyAlerted(true)
      playWeaponSound('alert', 'ambience')
      showTaskNotice('THE HUNTERS ARE AWAKE', 'Something upstairs has noticed you. Find cover and prepare your weapon.', '⚠')
    } else {
      playWeaponSound('unlock', 'ambience')
    }
  }

  const damagePlayer = () => {
    if (playerDead || !combatActive) return
    const now = performance.now()
    if (now - lastDamageAt.current < 750) return
    lastDamageAt.current = now
    const nextHealth = Math.max(0, healthRef.current - 20)
    healthRef.current = nextHealth
    setHealth(nextHealth)
    setCameraShake((value) => value + 1)
    if (nextHealth <= 0) {
      setPlayerDead(true)
      setPaused(true)
      setMessage('The gunmen overwhelmed you. Restart from the first room.')
    } else {
      setMessage(`Sword strike! Health remaining: ${nextHealth}%`)
    }
  }

  const combatActive = enemyAlerted && playerFloor === 'Second floor' && !playerDead && !paused

  const isTaskUnlocked = (id) => {
    if (!hauntedRoom) return true
    if (id === 'hammer') return !hasHammer || droppedItems.some((item) => item.id === 'hammer')
    if (id === 'weapon') return !hasGun || droppedItems.some((item) => item.id === 'weapon')
    if (id === 'key') return gems >= GEM_REQUIREMENT
    const task = HAUNTED_TASKS.find((item) => item.id === id)
    if (task?.requiresHammer && !hasHammer) return false
    if (task?.requiresTask && !found.includes(task.requiresTask)) return false
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
    if (id === 'hammer') {
      setMessage('The hammer is within reach. Use the action button or press Enter to pick it up.')
      return
    }
    if (id === 'weapon') {
      setMessage('A loaded weapon is within reach. Take it from the rack before facing the gunmen.')
      return
    }
    if (id === 'key') {
      setMessage(isTaskUnlocked(id) ? `The final key is within reach. Take it with ${GEM_REQUIREMENT} gems.` : `The key is sealed. Find ${GEM_REQUIREMENT} gems before taking it.`)
      return
    }
    if (id === 'guardDog' || id === 'guardDog2') {
      setMessage('Calm this bulldog. Press Enter when you are close enough.')
      return
    }
    const task = HAUNTED_TASKS.find((item) => item.id === id)
    if (task && !found.includes(id)) setMessage(`${task.action} is ready. Use the action button to continue.`)
  }

  const leaveObject = (id) => {
    setNearbyTask((current) => current === id ? null : current)
  }

  const searchForOwner = () => {
    setShowReplayPrompt(false)
    setSecretEnding(true)
    setPaused(true)
    playWeaponSound('unlock', 'ambience')
  }

  const finishGame = () => {
    try {
      window.localStorage.removeItem('last-room-save')
    } catch {
      // Ignore storage failures.
    }
    setSavedRun(null)
    setSecretEnding(false)
    setGameWon(true)
    setShowWinBanner(true)
    setShowReplayPrompt(true)
    setPaused(true)
    setTaskNotice(null)
    playWeaponSound('victory', 'ambience')
  }

  const discoverObject = (id) => {
    setSelected(id)
    if (id === 'key') {
      setFound((items) => items.includes(id) ? items : [...items, id])
      setMessage('You found the final key. The house falls silent.')
      finishGame()
      return
    }
    setFound((items) => items.includes(id) ? items : [...items, id])
    setMessage(`${HOTSPOTS[id].label} completed. Keep searching this floor.`)
    playWeaponSound('unlock', 'ambience')
    showTaskNotice('CLUE RECOVERED', `${HOTSPOTS[id].label} logged. Keep searching the study.`, HOTSPOTS[id].icon)
  }

  const completeTask = (id) => {
    const droppedSameItem = droppedItems.some((item) => item.id === id)
    if (!hauntedRoom || nearbyTask !== id || found.includes(id) || ((id === 'hammer' && hasHammer && !droppedSameItem) || (id === 'weapon' && hasGun && !droppedSameItem)) || !isTaskUnlocked(id)) return
    const equipItem = (nextItem) => {
      const previousItem = equipped && equipped !== nextItem ? equipped : null
      setDroppedItems((items) => {
        const remaining = items.filter((item) => item.id !== nextItem)
        if (!previousItem) return remaining
        const previousPosition = previousItem === 'weapon' ? [6.9, 1.5, -6.0] : [HAMMER_TARGET.position[0], 1.45, HAMMER_TARGET.position[1]]
        return [...remaining, { id: previousItem, position: previousPosition }]
      })
      setEquipped(nextItem)
    }
    if (id === 'hammer') {
      equipItem('hammer')
      setHasHammer(true)
      setEquipped('hammer')
      setNearbyTask(null)
      setMessage('Hammer equipped. Your previous weapon was left behind and is still rotating on the floor.')
      playWeaponSound('pickup', 'ambience')
      showTaskNotice('TOOL ACQUIRED', 'The iron hammer is ready. Use it on the sealed panels and crate.', '⚒')
      return
    }
    if (id === 'weapon') {
      equipItem('weapon')
      playWeaponSound('equip')
      setHasGun(true)
      setAiming(false)
      setAmmo(6)
      setNearbyTask(null)
      setMessage('Weapon equipped. Your previous item was left behind and keeps rotating. Press F, Space or left click to fire; R reloads.')
      showTaskNotice('WEAPON READY', 'The rack weapon is loaded. Watch the second floor.', '⚔')
      return
    }
    if (id === 'guardDog' || id === 'guardDog2') {
      const dogIndex = id === 'guardDog2' ? 1 : 0
      setFound((items) => dogIndex === 0 && !items.includes(id) ? [...items, id] : items)
      setNearbyTask(null)
      setSleepingDogs((dogs) => dogs.map((sleeping, index) => index === dogIndex ? true : sleeping))
      if (dogSleepTimers.current[dogIndex]) window.clearTimeout(dogSleepTimers.current[dogIndex])
      dogSleepTimers.current[dogIndex] = window.setTimeout(() => {
        setSleepingDogs((dogs) => dogs.map((sleeping, index) => index === dogIndex ? false : sleeping))
      }, 10000)
      setMessage('The bulldog falls asleep for ten seconds. The passage is calm.')
      playWeaponSound('unlock', 'ambience')
      showTaskNotice('PASSAGE CALMED', 'The bulldog is asleep. Move through before it wakes.', '🐕')
      return
    }
    if (id === 'key') {
      setFound((items) => items.includes(id) ? items : [...items, id])
      setMessage('You found the final key. The house falls silent.')
      setNearbyTask(null)
      finishGame()
      return
    }
    const task = HAUNTED_TASKS.find((item) => item.id === id)
    if (!task) return
    setFound((items) => items.includes(id) ? items : [...items, id])
    setGems((count) => count + task.reward)
    if (task.requiresHammer) {
      setHammerSwing((count) => count + 1)
      setCameraShake((value) => value + 1)
    }
    setNearbyTask(null)
    setMessage(`${task.actionText} You now have ${gems + task.reward} of ${GEM_REQUIREMENT} gems.`)
    playWeaponSound('gem', 'ambience')
    showTaskNotice('GEM RECOVERED', `${task.actionText} ${gems + task.reward} of ${GEM_REQUIREMENT} gems collected.`, '◇')
  }

  const onBlocked = (id) => {
    setSelected(id)
    setNearbyTask(id)
    if (id === 'hammer') return
    if (id === 'weapon') {
      setMessage('The weapon is locked to the rack until you move closer and take it.')
      return
    }
    if (id === 'key') {
      setMessage(`The key is sealed. You need ${GEM_REQUIREMENT} gems to open it; you have ${gems}.`)
      return
    }
    const task = HAUNTED_TASKS.find((item) => item.id === id)
    if (task?.requiresHammer && !hasHammer) {
      setMessage('This task needs the iron hammer. Return to the first floor and pick it up.')
      return
    }
    setMessage(`This task is locked. Complete the earlier floor tasks before searching the ${task?.floor || 'next'} area.`)
  }

  const shootWeapon = ({ position, yaw, pitch = 0, direction } = {}) => {
    if (!hauntedRoom || !hasGun || reloading || !position) return
    if (ammo <= 0) {
      playWeaponSound('empty')
      setMessage('The weapon is empty. Press R to reload.')
      return
    }
    playWeaponSound('fire')
    setAmmo((value) => Math.max(0, value - 1))
    setShot((value) => value + 1)
    setCameraShake((value) => value + 1)

    const elevation = THREE.MathUtils.clamp(pitch, -1.15, 0.95)
    const rayDirection = direction?.clone().normalize() || new THREE.Vector3(-Math.sin(yaw || 0) * Math.cos(elevation), -Math.sin(elevation), -Math.cos(yaw || 0) * Math.cos(elevation))
    const horizontalDirection = new THREE.Vector3(rayDirection.x, 0, rayDirection.z).normalize()
    const horizontalScale = Math.max(0.1, Math.hypot(rayDirection.x, rayDirection.z))
    const wallHits = []
    if (Math.abs(rayDirection.x) > 0.001) {
      const rightT = (10.72 - position.x) / rayDirection.x
      const leftT = (-10.72 - position.x) / rayDirection.x
      if (rightT > 0) wallHits.push({ distance: rightT, surface: 'x+' })
      if (leftT > 0) wallHits.push({ distance: leftT, surface: 'x-' })
    }
    if (Math.abs(rayDirection.z) > 0.001) {
      const frontT = (6.86 - position.z) / rayDirection.z
      const backT = (-6.86 - position.z) / rayDirection.z
      if (frontT > 0) wallHits.push({ distance: frontT, surface: 'z+' })
      if (backT > 0) wallHits.push({ distance: backT, surface: 'z-' })
    }
    const wallHit = wallHits.sort((a, b) => a.distance - b.distance)[0] || { distance: 14, surface: 'z-' }
    const objects = [
      { id: 'cross', center: [0, -6.55], radius: 1.25, type: 'wood' },
      { id: 'crate', center: [6.9, -5.82], radius: 1.05, type: 'wood' },
      { id: 'brokenFurniture', center: [-3.6, 4.5], radius: 1.1, type: 'wood' },
    ]
    const objectHit = objects.map((object) => {
      const toObject = new THREE.Vector3(object.center[0] - position.x, 0, object.center[1] - position.z)
      const alongRay = horizontalDirection.dot(toObject) / horizontalScale
      const nearest = horizontalDirection.clone().multiplyScalar(alongRay * horizontalScale)
      const distanceFromRay = toObject.sub(nearest).length()
      return { ...object, distance: alongRay, distanceFromRay }
    }).filter((object) => object.distance > 0 && object.distance < wallHit.distance && object.distanceFromRay < object.radius).sort((a, b) => a.distance - b.distance)[0]
    const impactDistance = objectHit?.distance || wallHit.distance
    const impactPosition = new THREE.Vector3(position.x, position.y, position.z).add(rayDirection.clone().multiplyScalar(impactDistance))
    const impact = {
      id: `${Date.now()}-${Math.random()}`,
      position: [impactPosition.x, impactPosition.y, impactPosition.z],
      surface: objectHit ? 'z-' : wallHit.surface,
      type: objectHit?.type || 'wall',
    }
    setShotImpacts((items) => [...items, impact].slice(-48))

    const enemyPositions = [[2.1, -1.8], [4.9, 1.6]]
    const targetIndex = enemyPositions.findIndex(([x, z], index) => {
      if (index < enemiesDefeated || !position) return false
      const toEnemy = new THREE.Vector3(x - position.x, 0, z - position.z)
      const distance = toEnemy.length()
      if (distance > 14 || distance < 0.1) return false
      // The gunmen patrol, so allow a small aiming tolerance around their base positions.
      return horizontalDirection.dot(toEnemy.normalize()) > 0.82
    })
    if (targetIndex >= 0) {
      const defeated = enemiesDefeated + 1
      setEnemiesDefeated(defeated)
      playWeaponSound(defeated >= 2 ? 'defeat' : 'hit')
      setMessage(defeated >= 2 ? 'Both second-floor gunmen are down. Continue searching for the final key.' : 'Direct hit. One gunman is down; find the second one.')
    } else if (objectHit?.type === 'wood') {
      setMessage(objectHit.id === 'cross' ? 'The shot splinters the Christian cross and leaves a dark hole.' : 'The shot strikes the wood and breaks off a splinter.')
    } else {
      setMessage('Shot fired. A fresh bullet hole marks the wall.')
    }
  }

  const reloadWeapon = () => {
    if (!hasGun || reloading || ammo === 6) return
    playWeaponSound('reload')
    setReloading(true)
    setMessage('Reloading the weapon...')
    window.setTimeout(() => {
      setAmmo(6)
      setReloading(false)
      setMessage('Reloaded. The weapon is ready.')
    }, 900)
  }

  const visibleTasks = hauntedRoom ? HAUNTED_TASKS : ROOM_TASKS
  const selectedTask = HAUNTED_TASKS.find((task) => task.id === selected)
  const actionAvailable = hauntedRoom && nearbyTask === selected && !found.includes(selected) && !collected.includes(selected) && isTaskUnlocked(selected)
  const taskFloors = hauntedRoom ? ['First floor', 'Ground floor', 'Second floor'] : ['First floor']
  const taskTotal = hauntedRoom ? HAUNTED_TASKS.length + 1 : ROOM_TASKS.length

  useEffect(() => {
    const handleActionKey = (event) => {
      if (event.key !== 'Enter' || !actionAvailable) return
      event.preventDefault()
      completeTask(selected)
    }
    window.addEventListener('keydown', handleActionKey)
    return () => window.removeEventListener('keydown', handleActionKey)
  }, [actionAvailable, selected, nearbyTask, hasHammer, gems, found])

  useEffect(() => {
    if (!showReplayPrompt) return undefined
    const handleReplayKey = (event) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      restartGame()
    }
    window.addEventListener('keydown', handleReplayKey)
    return () => window.removeEventListener('keydown', handleReplayKey)
  }, [showReplayPrompt])

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><div><p className="brand-kicker">A QUIET PLACE TO</p><h1>ESCAPE</h1></div></div>
      <div className="game-title"><span>CASE 014 · {hauntedRoom ? 'HAUNTED CHAMBER' : 'THE STUDY'}</span><strong>{hauntedRoom ? 'THE LAST ROOM' : 'THE LAST ROOM'}</strong></div>
      <div className="top-status"><button className="utility-button" type="button" onClick={() => setSettingsOpen((value) => !value)} aria-label="Open settings">⚙</button><div className="timer"><span className="timer-dot" />{time}</div>{hauntedRoom && <div className="gem-counter"><span>◇</span><b>{gems} / {GEM_REQUIREMENT}</b><small>GEMS</small></div>}<div className="progress"><span>{paused ? 'PAUSED' : hauntedRoom ? 'HOUSE TASKS' : 'ROOM TASKS'}</span><b>{found.length} / {taskTotal}</b><i><em style={{ width: `${found.length / taskTotal * 100}%` }} /></i></div></div>
    </header>

    <section className="game-layout">
      <div className="scene-wrap">
        <div className="scene-toolbar"><span className="live-dot" /> LIVE VIEW <span className="toolbar-divider" /> FIRST-PERSON POV <span className="toolbar-right">{hauntedRoom ? 'HAUNTED CHAMBER' : 'ONE ROOM · MOUSE LOOK'}</span></div>
        <div className="scene-frame"><Room onSelect={selectObject} selected={selected} chestOpened={false} won={gameWon} hauntedRoom={hauntedRoom} targets={targets} found={found} collected={collected} hasHammer={hasHammer} hasGun={hasGun} equipped={equipped} droppedItems={droppedItems} hammerSwing={hammerSwing} shot={shot} reloading={reloading} ammo={ammo} enemiesDefeated={enemiesDefeated} paused={paused} sensitivity={sensitivity} lowQuality={lowQuality} shotImpacts={shotImpacts} cameraShake={cameraShake} health={health} gems={gems} aiming={aiming} sleepingDogs={sleepingDogs} combatActive={combatActive} onEnemyAttack={damagePlayer} onFloorChange={handleFloorChange} onJump={handleJump} audioSettings={audioSettings} muted={muted} reduceMotion={reduceMotion} onShoot={shootWeapon} onAim={setAiming} onReload={reloadWeapon} onDiscover={discoverObject} onApproach={approachObject} onLeave={leaveObject} canDiscover={isTaskUnlocked} onBlocked={onBlocked} />{floorBanner && <div className="floor-banner" role="status"><span className="floor-banner-kicker">NOW ENTERING</span><strong>{floorBanner.toUpperCase()}</strong><span className="floor-banner-line" /></div>}{memoryEcho && <div className="memory-echo" role="status"><span>✧</span><em>{memoryEcho}</em></div>}{taskNotice && <div className="task-toast" role="status"><span className="task-toast-icon">{taskNotice.icon}</span><div><p>{taskNotice.title}</p><strong>{taskNotice.text}</strong></div></div>}{hauntedRoom && nearbyTask && !paused && <div className={`interaction-prompt ${actionAvailable ? 'ready' : 'locked'}`}><span className="interaction-key">{actionAvailable ? 'ENTER' : 'LOCKED'}</span><strong>{actionAvailable ? selected === 'key' ? 'TAKE THE FINAL KEY' : selected === 'hammer' ? 'PICK UP THE HAMMER' : selected === 'weapon' ? 'TAKE THE WEAPON' : selected === 'guardDog' || selected === 'guardDog2' ? 'CALM THE BULLDOG' : `INTERACT WITH ${HOTSPOTS[selected]?.short?.toUpperCase() || 'OBJECT'}` : 'COMPLETE EARLIER OBJECTIVES'}</strong></div>}<div className={`fps-crosshair ${hauntedRoom && equipped === 'weapon' ? 'crosshair-hidden' : ''}`} aria-hidden="true"><span /></div>{hauntedRoom && equipped === 'weapon' && <div className={`gun-aim-pointer ${aiming ? 'active' : ''}`} aria-hidden="true"><span>RIGHT CLICK / SHIFT TO AIM</span></div>}<div className="fps-hint">{paused ? 'PAUSED · PRESS P TO RESUME' : <>WASD MOVE <span>·</span> MOUSE LOOK <span>·</span> J JUMP <span>·</span> ENTER INTERACT {hasGun && <><span>·</span> RIGHT CLICK / SHIFT AIM <span>·</span> F / SPACE / CLICK FIRE <span>·</span> R RELOAD</>}</>}</div>{paused && !playerDead && !showReplayPrompt && <div className="pause-overlay"><div className="pause-card"><p className="eyebrow">Game paused</p><h2>Take a breath</h2><button className="action-button" type="button" onClick={() => setPaused(false)}>Resume <span>↗</span></button><button className="secondary-button" type="button" onClick={restartCurrentRoom}>Restart current room</button></div></div>}{playerDead && <div className="death-overlay"><div className="pause-card"><p className="eyebrow">You were defeated</p><h2>The second floor was too dangerous.</h2><p>Restart from the first room and prepare before returning.</p><button className="action-button" type="button" onClick={restartGame}>Restart from the beginning <span>↗</span></button></div></div>}{hauntedRoom && <div className="health-hud" aria-label={`Health ${health} percent`}><span>HEALTH</span><i><em style={{ width: `${health}%` }} /></i><b>{health}%</b></div>}{hauntedRoom && health < 40 && <div className="damage-vignette" aria-hidden="true" />}{hauntedRoom && hasGun && <div className="weapon-hud"><strong>{reloading ? 'RELOADING' : `AMMO ${ammo} / 6`}</strong><span>F / SPACE / CLICK FIRE · R RELOAD</span></div>}{roomComplete && <div className="win-banner"><span className="win-icon">✦</span><div><p>THREE TASKS COMPLETE</p><strong>The haunted chamber is opening…</strong></div><span className="round-loader">● ● ●</span></div>}{showWinBanner && <div className="win-banner final-win"><span className="win-icon">⚿</span><div><p>FINAL KEY FOUND</p><strong>The house falls silent.</strong></div></div>}{showReplayPrompt && <div className="replay-overlay" role="dialog" aria-modal="true" aria-labelledby="replay-title"><div className="pause-card replay-card"><p className="eyebrow">Escape complete</p><h2 id="replay-title">Would you like to play again?</h2><p>You found the final key and escaped the house.</p><div className="completion-stats"><div><b>{time}</b><small>TIME LEFT</small></div><div><b>{gems}/{GEM_REQUIREMENT}</b><small>GEMS</small></div><div><b>{enemiesDefeated}</b><small>HUNTERS</small></div></div><button className="action-button" type="button" onClick={restartGame}>Play again <span>↵ ENTER</span></button><button className="secondary-button secret-search-button" type="button" onClick={searchForOwner}>Search for the missing owner <span>↗</span></button></div></div>}{secretEnding && <div className="replay-overlay secret-ending" role="dialog" aria-modal="true"><div className="pause-card replay-card"><p className="eyebrow">A hidden ending</p><h2>The house keeps one more secret.</h2><p>You turn the second key. Upstairs, a man whispers your name from behind the wall. His hand presses against the other side — then the house goes quiet.</p><p className="secret-quote">“You were supposed to leave the key outside.”</p><button className="action-button" type="button" onClick={restartGame}>Begin another investigation <span>↵</span></button></div></div>}</div>
        <div className="scene-caption"><span>{hauntedRoom ? 'The new chamber has three floors. Walk to the left stairwell: front stairs descend, back stairs rise.' : 'The exit is sealed. Find the portrait, desk and chest to open the next chamber.'}</span><span className="coordinates">FPS POV <b>●</b> POINTER LOCK</span></div>
      </div>

      <aside className="clue-panel">
        <div className="panel-top"><p className="eyebrow">Investigation log</p><span className="panel-count">{found.length.toString().padStart(2, '0')} / {taskTotal.toString().padStart(2, '0')}</span></div>
        {settingsOpen && <section className="settings-panel" aria-label="Game settings">
          <div className="settings-heading"><b>Accessibility & sound</b><button className="settings-close" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button></div>
          <label className="setting-row"><span>Music <output>{Math.round(audioSettings.music * 100)}%</output></span><input type="range" min="0" max="1" step="0.05" value={audioSettings.music} onChange={(event) => setAudioSettings((current) => ({ ...current, music: Number(event.target.value) }))} /></label>
          <label className="setting-row"><span>Ambience <output>{Math.round(audioSettings.ambience * 100)}%</output></span><input type="range" min="0" max="1" step="0.05" value={audioSettings.ambience} onChange={(event) => setAudioSettings((current) => ({ ...current, ambience: Number(event.target.value) }))} /></label>
          <label className="setting-row"><span>Dog sounds <output>{Math.round(audioSettings.dog * 100)}%</output></span><input type="range" min="0" max="1" step="0.05" value={audioSettings.dog} onChange={(event) => setAudioSettings((current) => ({ ...current, dog: Number(event.target.value) }))} /></label>
          <label className="setting-row"><span>Weapon sounds <output>{Math.round(audioSettings.weapons * 100)}%</output></span><input type="range" min="0" max="1" step="0.05" value={audioSettings.weapons} onChange={(event) => setAudioSettings((current) => ({ ...current, weapons: Number(event.target.value) }))} /></label>
          <label className="setting-row"><span>Mouse sensitivity <output>{sensitivity.toFixed(1)}×</output></span><input type="range" min="0.4" max="1.8" step="0.1" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} /></label>
          <label className="check-row"><input type="checkbox" checked={muted} onChange={(event) => setMuted(event.target.checked)} /> Mute all sound</label>
          <label className="check-row"><input type="checkbox" checked={lowQuality} onChange={(event) => setLowQuality(event.target.checked)} /> Low-quality graphics</label>
          <label className="check-row"><input type="checkbox" checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} /> Reduce motion and recoil</label>
          <div className="settings-actions"><button className="secondary-button" type="button" onClick={() => setPaused((value) => !value)}>{paused ? 'Resume game' : 'Pause game'} <span>P</span></button><button className="secondary-button" type="button" onClick={restartGame}>Restart game</button><button className="secondary-button" type="button" onClick={() => { enableAudio(); playWeaponSound('fire') }}>Test sound</button></div>
        </section>}
        <div className="object-heading"><span className="object-icon">{HOTSPOTS[selected].icon}</span><div><p>{HOTSPOTS[selected].location}</p><h2>{HOTSPOTS[selected].label}</h2></div></div>
        <div className="clue-copy"><p>{clue.text}</p></div>
        {hauntedRoom && <button className="action-button task-action" type="button" disabled={!actionAvailable} onClick={() => completeTask(selected)}>{found.includes(selected) ? 'Task completed' : selected === 'hammer' ? 'Pick up the hammer' : selected === 'weapon' ? 'Take the weapon' : selected === 'guardDog2' ? 'Calm this bulldog' : selected === 'key' ? 'Take the final key' : selectedTask?.action || 'Move closer to interact'}<span>↗</span></button>}
        {message && <div className="feedback"><span>✓</span>{message}</div>}
        <div className="action-button movement-tip"><span className="key-cap">↑</span><span className="key-cap">↓</span><span className="key-cap">←</span><span className="key-cap">→</span><strong>Move toward the object</strong></div>
        <div className="inventory"><div className="inventory-head"><span>{hauntedRoom ? 'Haunted chamber' : 'Room objectives'}</span><span>{hauntedRoom ? `${gems} / ${GEM_REQUIREMENT} GEMS` : `${ROOM_TASKS.length} TASKS`}</span></div><div className="floor-objectives">{taskFloors.map((floor) => <div className="floor-objective" key={floor}><div className="floor-objective-head"><b>{floor}</b><small>{hauntedRoom ? `${visibleTasks.filter((task) => task.floor === floor && found.includes(task.id)).length} / ${visibleTasks.filter((task) => task.floor === floor).length}` : `${ROOM_TASKS.length} TASKS`}</small></div>{visibleTasks.filter((task) => task.floor === floor).map((task) => <div className={`floor-task ${found.includes(task.id) ? 'completed' : ''} ${!isTaskUnlocked(task.id) ? 'locked' : ''}`} key={task.id}><span>{found.includes(task.id) ? '✓' : '·'}</span>{task.text}</div>)}</div>)}{hauntedRoom && <div className="tool-status"><span>{hasHammer ? '⚒' : '·'}</span>{hasHammer ? `Iron hammer ${equipped === 'hammer' ? 'equipped' : 'stored'}` : 'Find the iron hammer on the first floor'}</div>}{hauntedRoom && <div className="tool-status weapon-status"><span>{hasGun ? '⚔' : '·'}</span>{hasGun ? `Weapon ${equipped === 'weapon' ? 'equipped' : 'stored'} · ${ammo} / 6 rounds` : 'Take a weapon from the first-floor rack'}</div>}{hauntedRoom && <div className={`floor-objective final-objective ${found.includes('key') ? 'completed' : ''}`}><div className="floor-objective-head"><b>Final goal</b><small>{found.includes('key') ? 'FOUND' : 'HIDDEN'}</small></div><div className={`floor-task ${!isTaskUnlocked('key') ? 'locked' : ''}`}><span>{found.includes('key') ? '✓' : '·'}</span>Find the last key inside the cabinet ({GEM_REQUIREMENT} gems)</div></div>}</div></div>
        <div className="hint-footer"><span className="hint-bulb">✧</span><span><b>How to play</b> Click the scene to capture the mouse. Look left or right, move with WASD, then get close and use the task button when it appears.</span></div>
      </aside>
    </section>
    {showIntro && <BackstoryCinematic onComplete={beginGame} hasSave={Boolean(savedRun)} onResume={resumeGame} />}
  </main>
}

export default App
