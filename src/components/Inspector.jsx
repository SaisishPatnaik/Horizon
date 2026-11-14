
import React from 'react'
import { Info, Crosshair, Layers3 } from 'lucide-react'

const descriptions = {
  'Engine Block': {
    type: 'STRUCTURAL COMPONENT',
    description:
      'The main structural body of the engine. It houses the cylinders and supports several internal mechanical components.',
    material: 'Cast Aluminium / Iron',
  },

  'Cylinder Head': {
    type: 'COMBUSTION ASSEMBLY',
    description:
      'Seals the top of the cylinders and contains the combustion chambers, valves and spark plugs.',
    material: 'Aluminium Alloy',
  },

  'Cylinder Sleeves': {
    type: 'CYLINDER LINER ASSEMBLY',
    description:
      'Metal liners that form the inner walls of the cylinders. They provide a durable surface for piston movement and help resist wear and heat.',
    material: 'Cast Iron / Alloy Steel',
  },

  Pistons: {
    type: 'RECIPROCATING COMPONENT',
    description:
      'Move inside the cylinders and transfer combustion pressure to the connecting rods.',
    material: 'Aluminium Alloy',
  },

  Crankshaft: {
    type: 'ROTATIONAL COMPONENT',
    description:
      'Converts the reciprocating motion of the pistons into rotational motion.',
    material: 'Forged Steel',
  },

  'Intake Manifold': {
    type: 'AIR INTAKE SYSTEM',
    description:
      'Distributes incoming air to the engine cylinders for combustion.',
    material: 'Aluminium / Composite',
  },

  'Timing Gears': {
    type: 'TIMING MECHANISM',
    description:
      'Synchronize the rotation of engine components to maintain correct mechanical timing.',
    material: 'Hardened Steel',
  },
}

const fallbackInfo = {
  type: 'GENERAL COMPONENT',
  description:
    'Component information is currently unavailable. Select another component to inspect its properties.',
  material: 'Not specified',
}

export default function Inspector({ selectedPart }) {
  const info = descriptions[selectedPart] || fallbackInfo

  return (
    <aside className="inspector">

      <div className="panel-heading">
        <div>
          <span className="eyebrow">ENGINE ANALYSIS</span>
          <h3>Component Inspector</h3>
        </div>

        <Info size={19} />
      </div>

      <div className="selected-card">

        <div className="component-visual">
          <Layers3 size={34} />
        </div>

        <span className="eyebrow">SELECTED COMPONENT</span>

        <h2>{selectedPart || 'No Component Selected'}</h2>

        <span className="component-type">
          {info.type}
        </span>

      </div>

      <div className="info-section">
        <span className="eyebrow">DESCRIPTION</span>
        <p>{info.description}</p>
      </div>

      <div className="info-section">
        <span className="eyebrow">MATERIAL</span>

        <div className="material-row">
          <Crosshair size={17} />
          <span>{info.material}</span>
        </div>
      </div>

      <div className="info-section">
        <span className="eyebrow">COMPONENT STATUS</span>

        <div className="status-row">
          <span className="status-dot" />
          Available for inspection
        </div>
      </div>

      <div className="inspector-footer">
        <span>HORIZON / COMPONENT DATA</span>
        <span>01.0</span>
      </div>

    </aside>
  )
}
