
import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

import {
  OrbitControls,
  Grid,
  ContactShadows,
  Environment,
} from '@react-three/drei'

import {
  Vector2,
  Vector3,
  Raycaster,
  Plane,
} from 'three'

import EngineParts from './EngineParts'

function normalizeAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

function GestureController({ controlMode }) {
  const { camera } = useThree()

  const direction = useMemo(
    () => new Vector3(4.8, 3.2, 6.5).normalize(),
    []
  )

  const lookTarget = useMemo(() => new Vector3(0, 0, 0), [])

  useFrame((_, delta) => {
    if (controlMode !== 'Hand') return

    const targetPosition = direction.clone().multiplyScalar(8.7)
    const alpha = 1 - Math.exp(-delta * 5)

    camera.position.lerp(targetPosition, alpha)
    camera.lookAt(lookTarget)
  })

  return null
}

function ComponentManipulator({
  engineRef,
  partRefs,
  handPointer,
  controlMode,
  resetKey,
  onSelect,
}) {
  const { camera } = useThree()

  const raycaster = useMemo(() => new Raycaster(), [])
  const pointer = useMemo(() => new Vector2(), [])
  const dragPlane = useMemo(() => new Plane(), [])

  const cameraDirection = useMemo(() => new Vector3(), [])
  const hitPoint = useMemo(() => new Vector3(), [])
  const worldPosition = useMemo(() => new Vector3(), [])
  const localPosition = useMemo(() => new Vector3(), [])
  const dragOffset = useMemo(() => new Vector3(), [])

  const hoveredRef = useRef(null)
  const grabbedRef = useRef(null)
  const wasPinchingRef = useRef(false)

  const grabStartRollRef = useRef(0)
  const grabStartRotationRef = useRef(0)

  const previousResetRef = useRef(resetKey)

  const findPartGroup = (object) => {
    let current = object

    while (current) {
      if (current.userData?.horizonPartName) return current
      current = current.parent
    }

    return null
  }

  const dropPart = () => {
    const group = grabbedRef.current
    if (!group) return

    const origin = group.userData.horizonOrigin

    if (origin) {
      const originalPosition = new Vector3(...origin)
      const positionDistance = group.position.distanceTo(originalPosition)

      const originalRotation = group.userData.horizonOriginRotation || [0, 0, 0]

      const rotationDistance = Math.abs(
        normalizeAngle(group.rotation.z - originalRotation[2])
      )

      // Snap only when both position and orientation are close.
      if (positionDistance < 0.42 && rotationDistance < 0.28) {
        group.position.copy(originalPosition)
        group.rotation.set(...originalRotation)
      }
    }

    grabbedRef.current = null
  }

  useEffect(() => {
    if (previousResetRef.current === resetKey) return

    previousResetRef.current = resetKey

    Object.values(partRefs.current).forEach(group => {
      if (!group) return

      const origin = group.userData.horizonOrigin
      const rotation = group.userData.horizonOriginRotation || [0, 0, 0]

      if (origin) group.position.set(...origin)

      group.rotation.set(...rotation)
    })

    grabbedRef.current = null
    hoveredRef.current = null
    wasPinchingRef.current = false
  }, [resetKey, partRefs])

  useFrame(() => {
    if (controlMode !== 'Hand' || !handPointer?.handCount) {
      if (grabbedRef.current) dropPart()

      wasPinchingRef.current = false
      return
    }

    if (!engineRef.current) return

    pointer.set(
      handPointer.handX * 2 - 1,
      1 - handPointer.handY * 2
    )

    raycaster.setFromCamera(pointer, camera)

    const intersections = raycaster.intersectObjects(
      engineRef.current.children,
      true
    )

    let hit = null
    let hitGroup = null

    for (const intersection of intersections) {
      const candidate = findPartGroup(intersection.object)

      if (candidate) {
        hit = intersection
        hitGroup = candidate
        break
      }
    }

    if (!grabbedRef.current && hitGroup !== hoveredRef.current) {
      hoveredRef.current = hitGroup
      onSelect?.(hitGroup?.userData?.horizonPartName || null)
    }

    const pinching = Boolean(handPointer.pinching)

    // Start grab.
    if (pinching && !wasPinchingRef.current && hitGroup && hit) {
      grabbedRef.current = hitGroup

      hitGroup.getWorldPosition(worldPosition)
      dragOffset.copy(worldPosition).sub(hit.point)

      camera.getWorldDirection(cameraDirection)

      dragPlane.setFromNormalAndCoplanarPoint(
        cameraDirection,
        hit.point
      )

      grabStartRollRef.current = handPointer.handRoll || 0
      grabStartRotationRef.current = hitGroup.rotation.z

      onSelect?.(hitGroup.userData.horizonPartName)
    }

    // Move and rotate grabbed component.
    if (pinching && grabbedRef.current) {
      const group = grabbedRef.current

      const intersectsPlane = raycaster.ray.intersectPlane(
        dragPlane,
        hitPoint
      )

      if (intersectsPlane) {
        worldPosition.copy(hitPoint).add(dragOffset)

        if (group.parent) {
          group.parent.worldToLocal(localPosition.copy(worldPosition))
          group.position.copy(localPosition)
        }

        const rollDelta = normalizeAngle(
          (handPointer.handRoll || 0) - grabStartRollRef.current
        )

        group.rotation.z = grabStartRotationRef.current + rollDelta
      }
    }

    // Release.
    if (!pinching && wasPinchingRef.current) {
      dropPart()
    }

    wasPinchingRef.current = pinching
  })

  return null
}

function Scene({
  exploded,
  selectedPart,
  onSelect,
  autoRotate,
  handRotation,
  controlMode,
  handPointer,
  resetKey,
}) {
  const engineRef = useRef(null)
  const partRefs = useRef({})

  const baseRotation = useMemo(
    () => ({ x: 0.08, y: -0.35 }),
    []
  )

  useFrame((_, delta) => {
    if (!engineRef.current) return

    const engine = engineRef.current

    if (controlMode === 'Hand') {
      const targetX = handRotation.x
      const targetY = -0.35 + handRotation.y

      const alpha = 1 - Math.exp(-delta * 6)

      engine.rotation.x +=
        (targetX - engine.rotation.x) * alpha

      engine.rotation.y +=
        (targetY - engine.rotation.y) * alpha
    } else {
      const alpha = 1 - Math.exp(-delta * 3)

      engine.rotation.x +=
        (baseRotation.x - engine.rotation.x) * alpha

      engine.rotation.y +=
        (baseRotation.y - engine.rotation.y) * alpha
    }
  })

  return (
    <>
      <ambientLight intensity={0.65} />

      <hemisphereLight
        skyColor="#b7dfff"
        groundColor="#182433"
        intensity={0.8}
      />

      <directionalLight
        position={[5, 8, 7]}
        intensity={3}
        castShadow
      />

      <pointLight
        position={[-5, 3, -4]}
        intensity={2}
        color="#42c9f5"
      />

      <pointLight
        position={[3, 1, 5]}
        intensity={1.5}
        color="#f0a44c"
      />

      <group ref={engineRef} rotation={[0.08, -0.35, 0]}>
        <EngineParts
          exploded={exploded}
          selectedPart={selectedPart}
          onSelect={onSelect}
          partRefs={partRefs}
        />
      </group>

      <ComponentManipulator
        engineRef={engineRef}
        partRefs={partRefs}
        handPointer={handPointer}
        controlMode={controlMode}
        resetKey={resetKey}
        onSelect={onSelect}
      />

      <Grid
        position={[0, -1.8, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#26394b"
        sectionSize={2}
        sectionColor="#3a536a"
        fadeDistance={18}
        infiniteGrid
      />

      <ContactShadows
        position={[0, -1.78, 0]}
        opacity={0.5}
        scale={10}
        blur={2.5}
        far={4}
      />

      <Environment preset="city" />

      <GestureController controlMode={controlMode} />

      <OrbitControls
        makeDefault
        enabled={controlMode === 'Mouse'}
        target={[0, 0, 0]}
        autoRotate={autoRotate && controlMode === 'Mouse'}
        autoRotateSpeed={0.7}
        enableDamping
        dampingFactor={0.06}
        minDistance={3.5}
        maxDistance={10}
      />
    </>
  )
}

export default function Engine3D(props) {
  return (
    <Canvas
      camera={{
        position: [4.8, 3.2, 6.5],
        fov: 40,
        near: 0.1,
        far: 100,
      }}
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#0a1019']} />
      <Scene {...props} />
    </Canvas>
  )
}
