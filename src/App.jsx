
import React, { useState, useCallback } from 'react'

import {
  RotateCcw,
  Box,
  Layers,
  Scan,
  MousePointer2,
  Hand,
  ChevronDown,
  Play,
  Pause,
  Expand,
  BookOpen,
} from 'lucide-react'

import Sidebar from './components/Sidebar'
import Engine3D from './components/Engine3D'
import Inspector from './components/Inspector'
import HandTracking from './components/HandTracking'
import LearningMode from './components/LearningMode'

import './App.css'

const components = [
  'Engine Block',
  'Cylinder Head',
  'Cylinder Sleeves',
  'Pistons',
  'Crankshaft',
  'Intake Manifold',
  'Timing Gears',
]

export default function App() {
  const [active, setActive] = useState('3D Simulator')
  const [learningMode, setLearningMode] = useState(false)

  const [selectedPart, setSelectedPart] = useState('Engine Block')

  const [exploded, setExploded] = useState(0)
  const [autoRotate, setAutoRotate] = useState(false)
  const [controlMode, setControlMode] = useState('Mouse')

  const [resetKey, setResetKey] = useState(0)

  const [handRotation, setHandRotation] = useState({
    x: 0.08,
    y: 0,
  })

  const [handPointer, setHandPointer] = useState({
    handX: 0.5,
    handY: 0.5,
    handRoll: 0,
    handCount: 0,
    pinching: false,
  })

  const reset = () => {
    setExploded(0)
    setSelectedPart('Engine Block')
    setAutoRotate(false)

    setHandRotation({
      x: 0.08,
      y: 0,
    })

    setHandPointer({
      handX: 0.5,
      handY: 0.5,
      handRoll: 0,
      handCount: 0,
      pinching: false,
    })

    setResetKey(value => value + 1)
  }

  const handleHandGesture = useCallback((data) => {
    if (controlMode !== 'Hand') return

    if (data.handCount > 0) {
      if (
        Number.isFinite(data.handX) &&
        Number.isFinite(data.handY)
      ) {
        setHandRotation({
          x: (0.5 - data.handY) * 1.3,
          y: (data.handX - 0.5) * 2.5,
        })
      }

      setHandPointer({
        handX: data.handX ?? 0.5,
        handY: data.handY ?? 0.5,
        handRoll: data.handRoll ?? 0,
        handCount: data.handCount,
        pinching: Boolean(data.pinching),
      })

      if (Number.isFinite(data.explosion)) {
        setExploded(data.explosion)
      }
    } else {
      setHandPointer({
        handX: 0.5,
        handY: 0.5,
        handRoll: 0,
        handCount: 0,
        pinching: false,
      })
    }
  }, [controlMode])

  // Open Learning Mode.
  const openLearningMode = () => {
    setLearningMode(true)
    setActive('Learning Mode')
  }

  // Return to simulator and select the requested component.
  const exploreComponent = (part) => {
    setSelectedPart(part)
    setLearningMode(false)
    setActive('3D Simulator')
  }

  // Exit Learning Mode.
  const exitLearningMode = () => {
    setLearningMode(false)
    setActive('3D Simulator')
  }

  // Learning Mode screen.
  if (learningMode) {
    return (
      <LearningMode
        onExit={exitLearningMode}
        onSelectPart={exploreComponent}
        selectedPart={selectedPart}
      />
    )
  }

  return (
    <div className="app-shell">

      <Sidebar
        active={active}
        setActive={(value) => {
          if (value === 'Learning Mode') {
            openLearningMode()
          } else {
            setActive(value)
          }
        }}
      />

      <main className="main-content">

        <header className="topbar">

          <div>
            <span className="breadcrumb">WORKSPACE /</span>

            <span className="breadcrumb-current">
              {active.toUpperCase()}
            </span>
          </div>

          <div className="topbar-right">

            <button
              className="learning-launch-button"
              onClick={openLearningMode}
            >
              <BookOpen size={16} />
              Learning Mode
            </button>

            <div className="connection-status">
              <span className="status-dot" />
              LOCAL SIMULATION
            </div>

            <div className="avatar">H</div>

          </div>

        </header>

        <section className="page-content">

          <div className="page-title">

            <div>
              <span className="eyebrow">
                MECHANICAL VISUALIZATION SYSTEM
              </span>

              <h1>
                Engine Simulator<span>.</span>
              </h1>

              <p>
                Explore. Analyze. Understand the mechanics.
              </p>
            </div>

            <div className="version-tag">
              <span className="status-dot" />
              BUILD 07.0
            </div>

          </div>

          {/* ENGINE AND CAMERA */}

          <div className="workspace-grid">

            <section className="viewport-panel">

              <div className="viewport-header">

                <div className="viewport-label">
                  <Box size={17} />
                  <span>3D ENGINE VIEWPORT</span>
                  <span className="live-tag">LIVE</span>
                </div>

                <div className="viewport-actions">

                  <button
                    onClick={reset}
                    title="Reset assembly"
                  >
                    <RotateCcw size={17} />
                  </button>

                  <button
                    className={autoRotate ? 'tool-active' : ''}
                    onClick={() => setAutoRotate(!autoRotate)}
                    title="Auto rotate"
                  >
                    {autoRotate
                      ? <Pause size={17} />
                      : <Play size={17} />}
                  </button>

                  <button
                    onClick={() =>
                      setExploded(exploded === 1 ? 0 : 1)
                    }
                    title="Toggle exploded view"
                  >
                    <Expand size={17} />
                  </button>

                </div>

              </div>

              <div className="engine-canvas">

                <Engine3D
                  exploded={exploded}
                  selectedPart={selectedPart}
                  onSelect={setSelectedPart}
                  autoRotate={autoRotate}
                  handRotation={handRotation}
                  controlMode={controlMode}
                  handPointer={handPointer}
                  resetKey={resetKey}
                />

                <div className="viewport-overlay top-left">
                  <span>FIG 01 / ENGINE ASSEMBLY</span>
                  <span>3D PERSPECTIVE</span>
                </div>

                <div className="viewport-overlay bottom-left">

                  <MousePointer2 size={14} />

                  {controlMode === 'Hand'
                    ? handPointer.pinching
                      ? 'GRABBING · MOVE OR ROTATE YOUR WRIST'
                      : 'POINT TO SELECT · PINCH TO GRAB'
                    : 'DRAG TO ROTATE · SCROLL TO ZOOM'}

                </div>

                <div className="viewport-overlay top-right">
                  <span className="axis-label">X</span>
                  <span className="axis-label y-axis">Y</span>
                  <span className="axis-label z-axis">Z</span>
                </div>

              </div>

              <div className="explosion-control">

                <div className="explosion-heading">

                  <div>
                    <Layers size={16} />
                    <span>EXPLODED VIEW CONTROL</span>
                  </div>

                  <strong>
                    {Math.round(exploded * 100)}%
                  </strong>

                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={exploded}
                  onChange={e => setExploded(Number(e.target.value))}
                />

                <div className="range-labels">
                  <span>ASSEMBLED</span>
                  <span>EXPLODED</span>
                </div>

              </div>

            </section>

            {/* CAMERA AND HAND TRACKING */}

            <section className="bottom-panel hand-panel camera-side-panel">

              <div className="panel-heading">

                <div>
                  <span className="eyebrow">COMPUTER VISION</span>
                  <h3>Hand Tracking</h3>
                </div>

                <Scan size={20} />

              </div>

              <HandTracking
                onGesture={handleHandGesture}
              />

              <div className="tracking-controls">

                <button
                  className={`mode-button ${
                    controlMode === 'Mouse' ? 'mode-selected' : ''
                  }`}
                  onClick={() => {
                    setControlMode('Mouse')

                    setHandPointer({
                      handX: 0.5,
                      handY: 0.5,
                      handRoll: 0,
                      handCount: 0,
                      pinching: false,
                    })
                  }}
                >
                  <MousePointer2 size={15} />
                  Mouse
                </button>

                <button
                  className={`mode-button ${
                    controlMode === 'Hand' ? 'mode-selected' : ''
                  }`}
                  onClick={() => setControlMode('Hand')}
                >
                  <Hand size={15} />
                  Hand
                </button>

              </div>

            </section>

          </div>

          {/* COMPONENTS AND INSPECTOR */}

          <section className="bottom-grid">

            <div className="bottom-panel components-panel">

              <div className="panel-heading">

                <div>
                  <span className="eyebrow">ASSEMBLY DIRECTORY</span>
                  <h3>Engine Components</h3>
                </div>

                <span className="count-tag">07 PARTS</span>

              </div>

              <div className="component-list">

                {components.map((part, index) => (

                  <button
                    key={part}
                    className={`component-item ${
                      selectedPart === part ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedPart(part)}
                  >

                    <span className="component-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span>{part}</span>

                    <ChevronDown
                      size={15}
                      className="component-arrow"
                    />

                  </button>

                ))}

              </div>

            </div>

            <Inspector selectedPart={selectedPart} />

          </section>

          {/* LEARNING MODE ENTRY */}

          <section className="learning-promo">

            <div className="learning-promo-icon">
              <BookOpen size={24} />
            </div>

            <div className="learning-promo-content">
              <span className="eyebrow">
                INTERACTIVE ENGINE EDUCATION
              </span>

              <h3>Ready to understand how the engine works?</h3>

              <p>
                Follow guided lessons and explore the function of
                every major engine component.
              </p>
            </div>

            <button
              className="learning-promo-button"
              onClick={openLearningMode}
            >
              Start Learning
              <BookOpen size={16} />
            </button>

          </section>

          <footer className="page-footer">

            <span>HORIZON ENGINE LAB © 2026</span>

            <span>
              BUILT FOR INTERACTIVE MECHANICAL EXPLORATION
            </span>

            <span>V1.0.0</span>

          </footer>

        </section>

      </main>

    </div>
  )
}
