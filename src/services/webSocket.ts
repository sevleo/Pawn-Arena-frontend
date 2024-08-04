import { type Ref } from 'vue'
import { drawPositions } from '@/utilities/canvasManager'

export let ws: WebSocket
let clientId: string | undefined
let defaultMousePosition: { x: number; y: number } = { x: 0, y: 0 } // Initialize with default values
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

export const setupWebSocket = (canvasRef: Ref<HTMLCanvasElement | null>, health: Ref<number>) => {
  // ws = new WebSocket('ws://localhost:3000')
  ws = new WebSocket(`${import.meta.env.VITE_BACKEND_URL}`)

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)

    if (msg.type === 'initial position') {
      console.log('initial position received:', msg)
      clientId = msg.data.clientId
      defaultMousePosition = msg.data.defaultMousePosition
    }

    if (msg.type === 'gameState') {
      drawPositions(canvasRef, msg.data.allPawns, msg.data.bullets)
      health.value = msg.data.clientData.health
    }
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed, attempting to reconnect...')
    if (reconnectTimeout === null) {
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null
        setupWebSocket(canvasRef, health)
      }, 1000)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    ws.close() // Close the connection on error
  }
}

export function getClientId() {
  return clientId
}

export function getDefaultMousePosition() {
  return defaultMousePosition
}

export function sendFaceDirectionUpdate(direction: { directionX: number; directionY: number }) {
  const message = {
    type: 'updateFaceDirection',
    clientId: clientId,
    direction
  }
  ws.send(JSON.stringify(message))
}

export function updateDirections(activeDirections: Ref<Set<string>>) {
  ws.send(JSON.stringify({ type: 'move', data: Array.from(activeDirections.value) }))
}

export function updateBoost(value: boolean) {
  ws.send(JSON.stringify({ type: 'boost', data: value }))
}

export function fireBullet() {
  ws.send(JSON.stringify({ type: 'fireBullet' }))
}
