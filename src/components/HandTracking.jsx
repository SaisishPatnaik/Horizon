
import React, { useEffect, useRef, useState } from 'react'

import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from '@mediapipe/tasks-vision'

import { Camera, CameraOff } from 'lucide-react'
import './HandTracking.css'

const WASM_URL = `${import.meta.env.BASE_URL}mediapipe/wasm`

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value))

const distance = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y)

function smooth(previous, next, factor = 0.22) {
  return previous + (next - previous) * factor
}

export default function HandTracking({ onGesture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const landmarkerRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)

  const callbackRef = useRef(onGesture)
  const activeRef = useRef(false)

  const smoothedRef = useRef({
    handX: 0.5,
    handY: 0.5,
    handRoll: 0,
    explosion: 0,
  })

  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    callbackRef.current = onGesture
  }, [onGesture])

  const stopCamera = () => {
    activeRef.current = false

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null

    landmarkerRef.current?.close()
    landmarkerRef.current = null

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    setActive(false)
    setLoading(false)

    smoothedRef.current = {
      handX: 0.5,
      handY: 0.5,
      handRoll: 0,
      explosion: 0,
    }

    callbackRef.current?.({
      handCount: 0,
      handX: 0.5,
      handY: 0.5,
      handRoll: 0,
      pinching: false,
      explosion: null,
      gesture: 'No hand detected',
    })
  }

  const startCamera = async () => {
    if (loading || activeRef.current) return

    setError('')
    setLoading(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      streamRef.current = stream

      const video = videoRef.current
      video.srcObject = stream

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = reject
      })

      await video.play()

      const vision = await FilesetResolver.forVisionTasks(WASM_URL)

      const options = {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.55,
      }

      let landmarker

      try {
        landmarker = await HandLandmarker.createFromOptions(vision, options)
      } catch (gpuError) {
        console.warn('GPU unavailable. Switching to CPU.', gpuError)

        landmarker = await HandLandmarker.createFromOptions(
          vision,
          {
            ...options,
            baseOptions: {
              modelAssetPath: MODEL_URL,
              delegate: 'CPU',
            },
          }
        )
      }

      landmarkerRef.current = landmarker

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const drawing = new DrawingUtils(ctx)

      activeRef.current = true
      setActive(true)
      setLoading(false)

      let lastVideoTime = -1
      let pinchWasActive = false

      const detect = () => {
        if (
          !activeRef.current ||
          !videoRef.current ||
          !landmarkerRef.current
        ) return

        const currentVideo = videoRef.current

        if (
          currentVideo.readyState >= 2 &&
          currentVideo.currentTime !== lastVideoTime
        ) {
          lastVideoTime = currentVideo.currentTime

          if (
            canvas.width !== currentVideo.videoWidth ||
            canvas.height !== currentVideo.videoHeight
          ) {
            canvas.width = currentVideo.videoWidth
            canvas.height = currentVideo.videoHeight
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          const result = landmarkerRef.current.detectForVideo(
            currentVideo,
            performance.now()
          )

          const hands = result.landmarks || []

          hands.forEach(landmarks => {
            drawing.drawConnectors(
              landmarks,
              HandLandmarker.HAND_CONNECTIONS,
              {
                color: '#42d9ff',
                lineWidth: 3,
              }
            )

            drawing.drawLandmarks(landmarks, {
              color: '#ffffff',
              fillColor: '#42d9ff',
              lineWidth: 1,
              radius: 3,
            })
          })

          if (hands.length > 0) {
            const first = hands[0]

            const wrist = first[0]
            const middleBase = first[9]

            const centerX = 1 - (wrist.x + middleBase.x) / 2
            const centerY = (wrist.y + middleBase.y) / 2

            const smoothData = smoothedRef.current

            smoothData.handX = smooth(smoothData.handX, centerX)
            smoothData.handY = smooth(smoothData.handY, centerY)

            // Palm orientation: index MCP to pinky MCP.
            const indexBase = first[5]
            const pinkyBase = first[17]

            const rawRoll = Math.atan2(
              pinkyBase.y - indexBase.y,
              pinkyBase.x - indexBase.x
            )

            smoothData.handRoll = smooth(
              smoothData.handRoll,
              rawRoll,
              0.25
            )

            const pinchDistance = distance(first[4], first[8])

            const pinching = pinchWasActive
              ? pinchDistance < 0.095
              : pinchDistance < 0.075

            pinchWasActive = pinching

            let explosion = null
            let gesture = pinching
              ? 'Pinch / Grab'
              : 'Hand pointing'

            if (hands.length >= 2) {
              const separation = distance(hands[0][0], hands[1][0])

              const rawExplosion = clamp(
                (separation - 0.25) / 0.42,
                0,
                1
              )

              smoothData.explosion = smooth(
                smoothData.explosion,
                rawExplosion,
                0.18
              )

              explosion = smoothData.explosion
              gesture = 'Two-hand expansion'
            }

            callbackRef.current?.({
              handX: smoothData.handX,
              handY: smoothData.handY,
              handRoll: smoothData.handRoll,
              handCount: hands.length,
              pinching,
              explosion,
              gesture,
            })
          } else {
            pinchWasActive = false

            callbackRef.current?.({
              handCount: 0,
              handX: 0.5,
              handY: 0.5,
              handRoll: 0,
              pinching: false,
              explosion: null,
              gesture: 'No hand detected',
            })
          }
        }

        animationRef.current = requestAnimationFrame(detect)
      }

      detect()

    } catch (err) {
      console.error('HORIZON hand tracking error:', err)

      const message =
        err.name === 'NotAllowedError'
          ? 'Camera permission denied.'
          : err.name === 'NotReadableError'
            ? 'Camera is being used by another application.'
            : err.message || 'Camera initialization failed.'

      setError(message)
      stopCamera()
    }
  }

  useEffect(() => {
    return () => {
      activeRef.current = false

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      streamRef.current?.getTracks().forEach(track => track.stop())
      landmarkerRef.current?.close()
    }
  }, [])

  return (
    <div className="vision-compact">
      <div className="vision-camera-small">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />

        {!active && (
          <div className="vision-camera-placeholder">
            <Camera size={22} />
          </div>
        )}

        <span
          className={`vision-camera-indicator ${active ? 'online' : ''}`}
        />
      </div>

      {error && (
        <p className="vision-error-small">{error}</p>
      )}

      <button
        className={`vision-camera-button ${active ? 'disconnect' : ''}`}
        onClick={active ? stopCamera : startCamera}
        disabled={loading}
      >
        {active ? <CameraOff size={15} /> : <Camera size={15} />}

        {loading
          ? 'INITIALIZING...'
          : active
            ? 'DISCONNECT CAMERA'
            : 'CONNECT CAMERA'}
      </button>
    </div>
  )
}
