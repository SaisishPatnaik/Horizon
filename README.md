
# HORIZON — Interactive Automotive Learning Platform

<p align="center">
  <strong>Explore. Understand. Experience the Mechanics.</strong>
</p>

<p align="center">
  An interactive 3D automotive learning environment that helps students
  understand internal combustion engines through 3D visualization,
  component interaction, and gesture-based controls.
</p>

---

## Overview

HORIZON is an interactive automotive engineering learning platform designed
to make engine education more engaging and accessible.

Instead of relying entirely on static diagrams and theoretical explanations,
HORIZON allows students to explore a virtual engine, inspect individual
components, and learn about their functions through an interactive 3D environment.

The platform combines real-time 3D rendering, computer vision, and guided
learning experiences to create an immersive educational tool.

## Features

### 1. Interactive 3D Engine Simulator
- Explore a virtual internal combustion engine.
- Rotate and inspect the engine from different angles.
- Select individual engine components.
- Switch between assembled and exploded views.
- Reset the engine assembly.

### 2. Hand Gesture Controls
- Real-time hand tracking using MediaPipe.
- Select engine components using hand gestures.
- Grab and move individual components.
- Rotate grabbed components using wrist movement.
- Return components to their original positions through snapping.

### 3. Guided Learning Mode
- Explore seven major engine components.
- Learn component descriptions and functions.
- Understand how individual components work.
- Navigate through structured lessons.
- Track lesson completion during the session.
- Jump directly from a lesson to its corresponding 3D component.

### 4. Responsive Interface
- Designed for desktop and mobile browsers.
- Adaptive layouts for different screen sizes.
- Supports portrait and landscape orientations.
- Touch-friendly controls for mobile devices.

## Engine Components

HORIZON currently features seven major engine components:

| Component | Function |
|---|---|
| Engine Block | Main structural foundation of the engine |
| Cylinder Head | Houses valves and combustion-related passages |
| Cylinder Sleeves | Provide the working surface for pistons |
| Pistons | Transfer combustion pressure into mechanical movement |
| Crankshaft | Converts reciprocating motion into rotational motion |
| Intake Manifold | Distributes incoming air to the cylinders |
| Timing Gears | Synchronize crankshaft and camshaft movement |

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### 3D Visualization
- Three.js
- React Three Fiber
- React Three Drei

### Computer Vision
- MediaPipe Tasks Vision
- Hand Landmark Detection
- Real-time gesture processing

### Development and Deployment
- Git
- GitHub
- GitHub Actions
- GitHub Pages

## Project Structure

```text
horizon/
│
├── public/
│   └── mediapipe/
│       └── wasm/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Engine3D.jsx
│   │   ├── EngineParts.jsx
│   │   ├── HandTracking.jsx
│   │   ├── HandTracking.css
│   │   ├── Inspector.jsx
│   │   ├── LearningMode.jsx
│   │   ├── LearningMode.css
│   │   └── Sidebar.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/SaisishPatnaik/Horizon.git
```

### 2. Navigate into the project

```bash
cd Horizon
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

### 5. Create a production build

```bash
npm run build
```

## Deployment

HORIZON is configured for deployment using GitHub Pages and GitHub Actions.

Every push to the `main` branch triggers the deployment workflow:

1. GitHub checks out the repository.
2. Node.js dependencies are installed.
3. Vite generates the production build.
4. The `dist` directory is uploaded as a Pages artifact.
5. GitHub Pages deploys the application.

**Live Website:**  
https://saisishpatnaik.github.io/Horizon/

## Future Scope

Potential future enhancements include:

- Animated internal combustion engine mechanisms.
- Four-stroke engine cycle visualization.
- Interactive mechanical simulations.
- Additional automotive engineering learning modules.

## Project Objective

The objective of HORIZON is to bridge the gap between theoretical
automotive engineering education and practical visual understanding
through interactive 3D technology.

---

<p align="center">
  <strong>HORIZON — Making Mechanical Learning Interactive.</strong>
</p>

