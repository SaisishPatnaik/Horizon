
import React from 'react'
import {
  Box,
  Activity,
  Layers,
  Settings,
  Scan,
  Cpu,
  Gauge,
} from 'lucide-react'

const menu = [
  { icon: Gauge, label: 'Overview' },
  { icon: Box, label: '3D Simulator' },
  { icon: Layers, label: 'Components' },
  { icon: Scan, label: 'Hand Tracking' },
  { icon: Activity, label: 'Diagnostics' },
  { icon: Settings, label: 'Settings' },
]

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Cpu size={23} /></div>
        <div>
          <h2>HORIZON</h2>
          <span>ENGINE LAB v1.0</span>
        </div>
      </div>

      <div className="nav-label">WORKSPACE</div>

      <nav>
        {menu.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className={`nav-item ${active === label ? 'active' : ''}`}
            onClick={() => setActive(label)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-status">
          <span className="status-dot" />
          SYSTEM ONLINE
        </div>
        <p>HORIZON ENGINE LAB</p>
        <small>Interactive 3D Simulation</small>
      </div>
    </aside>
  )
}
