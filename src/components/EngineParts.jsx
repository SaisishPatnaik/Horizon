
import React from 'react'

const materials = {
  block: '#65788a',
  silver: '#c4d0db',
  steel: '#8797a7',
  dark: '#263443',
  gold: '#d49b43',
  copper: '#a66b42',
  black: '#111b26',
}

function Material({ color, metalness = 0.75, roughness = 0.3 }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
    />
  )
}

function Part({
  name,
  position,
  offset,
  exploded,
  selectedPart,
  onSelect,
  partRefs,
  children,
}) {
  const selected = selectedPart === name

  const currentPosition = [
    position[0] + offset[0] * exploded,
    position[1] + offset[1] * exploded,
    position[2] + offset[2] * exploded,
  ]

  return (
    <group
      position={currentPosition}
      ref={(node) => {
        if (node) {
          node.userData.horizonPartName = name
          node.userData.horizonOrigin = [...currentPosition]
          partRefs.current[name] = node
        } else if (partRefs.current[name]) {
          delete partRefs.current[name]
        }
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(name)
      }}
    >
      {children(selected ? '#43cafa' : null)}
    </group>
  )
}

function Cylinder({ position, radius = 0.19, height = 0.3, color }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <Material color={color} />
    </mesh>
  )
}

function Bolt({ position }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.045, 0.045, 0.045, 6]} />
      <Material color="#dce4ec" metalness={0.95} roughness={0.2} />
    </mesh>
  )
}

export default function EngineParts({
  exploded = 0,
  selectedPart,
  onSelect,
  partRefs,
}) {
  const cylinderX = [-0.9, -0.3, 0.3, 0.9]

  return (
    <group rotation={[0.08, -0.35, 0]}>

      {/* ENGINE BLOCK */}
      <Part
        name="Engine Block"
        position={[0, -0.12, 0]}
        offset={[0, -0.8, 0]}
        exploded={exploded}
        selectedPart={selectedPart}
        onSelect={onSelect}
        partRefs={partRefs}
      >
        {(highlight) => (
          <group>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.65, 1.05, 1.45]} />
              <Material color={highlight || materials.block} />
            </mesh>

            <mesh position={[0, 0, 0.74]} castShadow>
              <boxGeometry args={[2.35, 0.8, 0.08]} />
              <Material color={materials.dark} />
            </mesh>

            {[-0.85, -0.3, 0.3, 0.85].map((x) => (
              <mesh key={x} position={[x, -0.02, 0.79]}>
                <boxGeometry args={[0.045, 0.65, 0.035]} />
                <Material color="#718596" />
              </mesh>
            ))}

            {[-1, -0.5, 0.5, 1].map((x) => (
              <Bolt key={x} position={[x, -0.43, 0.8]} />
            ))}
          </group>
        )}
      </Part>

      {/* CYLINDER HEAD */}
      <Part
        name="Cylinder Head"
        position={[0, 0.85, 0]}
        offset={[0, 1.05, 0]}
        exploded={exploded}
        selectedPart={selectedPart}
        onSelect={onSelect}
        partRefs={partRefs}
      >
        {(highlight) => (
          <group>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.75, 0.32, 1.55]} />
              <Material color={highlight || materials.silver} />
            </mesh>

            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[2.25, 0.16, 0.9]} />
              <Material color={materials.steel} />
            </mesh>

            {cylinderX.map((x) => (
              <group key={x} position={[x, 0.32, 0]}>
                <Cylinder
                  position={[0, 0.08, 0]}
                  radius={0.085}
                  height={0.16}
                  color={materials.dark}
                />
                <Cylinder
                  position={[0, 0.19, 0]}
                  radius={0.05}
                  height={0.08}
                  color={materials.gold}
                />
              </group>
            ))}

            {[-1.15, 1.15].map((x) =>
              [-0.55, 0.55].map((z) => (
                <Bolt key={`${x}-${z}`} position={[x, 0.18, z]} />
              ))
            )}
          </group>
        )}
      </Part>

      {/* CYLINDER SLEEVES */}
      <Part
        name="Cylinder Sleeves"
        position={[0, 0.55, 0]}
        offset={[0, 0.8, 0]}
        exploded={exploded}
        selectedPart={selectedPart}
        onSelect={onSelect}
        partRefs={partRefs}
      >
        {(highlight) => (
          <group>
            {cylinderX.map((x, i) => (
              <group key={i} position={[x, 0, 0]}>
                <mesh castShadow>
                  <cylinderGeometry
                    args={[0.245, 0.245, 0.95, 40, 1, true]}
                  />
                  <Material
                    color={highlight || materials.steel}
                    metalness={0.95}
                    roughness={0.2}
                  />
                </mesh>

                <mesh>
                  <cylinderGeometry
                    args={[0.205, 0.205, 0.91, 32, 1, true]}
                  />
                  <Material color={materials.black} metalness={0.4} />
                </mesh>

                <Cylinder
                  position={[0, 0.48, 0]}
                  radius={0.25}
                  height={0.055}
                  color={materials.silver}
                />
              </group>
            ))}
          </group>
        )}
      </Part>

      {/* PISTON ASSEMBLY */}
      <Part
        name="Pistons"
        position={[0, 0.23, 0]}
        offset={[0, 1.35, 0]}
        exploded={exploded}
        selectedPart={selectedPart}
        onSelect={onSelect}
        partRefs={partRefs}
      >
        {(highlight) => (
          <group>
            {cylinderX.map((x, i) => (
              <group key={i} position={[x, 0, 0]}>
                <mesh castShadow position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[0.175, 0.175, 0.34, 32]} />
                  <Material color={highlight || materials.gold} />
                </mesh>

                <Cylinder
                  position={[0, 0.31, 0]}
                  radius={0.19}
                  height={0.07}
                  color={materials.silver}
                />

                <mesh
                  position={[0, -0.22, 0]}
                  rotation={[0, 0, 0.1]}
                  castShadow
                >
                  <boxGeometry args={[0.075, 0.5, 0.075]} />
                  <Material color={materials.copper} />
                </mesh>

                <mesh
                  position={[0, 0.12, 0.19]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.045, 0.045, 0.1, 24]} />
                  <Material color={materials.silver} />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </Part>

      {/* CRANKSHAFT */}
      <Part
        name="Crankshaft"
        position={[0, -0.85, 0]}
        offset={[0, -1.3, 0]}
        exploded={exploded}
        selectedPart={selectedPart}
        onSelect={onSelect}
        partRefs={partRefs}
      >
        {(highlight) => (
          <group>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.11, 0.11, 2.9, 32]} />
              <Material color={highlight || materials.silver} />
            </mesh>

            {cylinderX.map((x, i) => (
              <group key={i} position={[x, 0, 0]}>
                <mesh position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[0.23, 0.23, 0.14, 32]} />
                  <Material color={materials.dark} />
                </mesh>

                <mesh position={[0, 0.28, 0.12]}>
                  <cylinderGeometry args={[0.105, 0.105, 0.2, 32]} />
                  <Material color={materials.gold} />
                </mesh>
              </group>
            ))}

            <mesh position={[1.52, 0, 0]}>
              <cylinderGeometry args={[0.23, 0.23, 0.16, 32]} />
              <Material color={materials.gold} />
            </mesh>
          </group>
        )}
      </Part>

      {/* INTAKE MANIFOLD */}
      <Part
        name="Intake Manifold"
        position={[0, 0.15, -1.0]}
        offset={[0, 0.9, -0.8]}
        exploded={exploded}
        selectedPart={selectedPart}
        onSelect={onSelect}
        partRefs={partRefs}
      >
        {(highlight) => (
          <group>
            <mesh position={[0, 0.32, 0]} castShadow>
              <boxGeometry args={[2.35, 0.25, 0.3]} />
              <Material color={highlight || materials.dark} />
            </mesh>

            {cylinderX.map((x, i) => (
              <group key={i} position={[x, 0, 0]}>
                <mesh
                  position={[0, 0.12, 0]}
                  rotation={[0.5, 0, 0]}
                  castShadow
                >
                  <cylinderGeometry args={[0.105, 0.14, 0.65, 24]} />
                  <Material color={materials.silver} />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </Part>

      {/* TIMING GEARS */}
      <Part
        name="Timing Gears"
        position={[1.5, 0.15, 0.55]}
        offset={[0.9, 0, 0.5]}
        exploded={exploded}
        selectedPart={selectedPart}
        onSelect={onSelect}
        partRefs={partRefs}
      >
        {(highlight) => (
          <group>
            {[0, 0.65].map((y, i) => (
              <group key={i} position={[0, y, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.31, 0.31, 0.14, 32]} />
                  <Material color={highlight || materials.gold} />
                </mesh>

                <mesh>
                  <cylinderGeometry args={[0.105, 0.105, 0.17, 24]} />
                  <Material color={materials.dark} />
                </mesh>

                <mesh position={[0, 0.085, 0]}>
                  <torusGeometry args={[0.23, 0.035, 8, 32]} />
                  <Material color={materials.silver} />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </Part>

    </group>
  )
}
