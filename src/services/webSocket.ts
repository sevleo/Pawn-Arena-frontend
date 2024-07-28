import { type Ref } from 'vue'
import { drawPositions } from '@/utilities/canvasManager'

export let ws: WebSocket
let clientId: string | undefined

export function setupWebSocket(canvasRef: Ref<HTMLCanvasElement | null>) {
  ws = new WebSocket('ws://localhost:3000')

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)

    if (msg.type === 'initial position') {
      console.log('initial position received:', msg)
      clientId = msg.data.clientId
    }

    if (msg.type === 'position') {
      drawPositions(canvasRef, msg.data.allPositions)
    }
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }
}

export function getClientId() {
  return clientId
}

export function sendFaceDirectionUpdate(direction: { directionX: number; directionY: number }) {
  const message = {
    type: 'updateDirection',
    clientId: clientId,
    direction
  }
  ws.send(JSON.stringify(message))
}

// Send updated directions to server
export function updateDirections(activeDirections: Ref<Set<string>>) {
  ws.send(JSON.stringify({ type: 'move', data: Array.from(activeDirections.value) }))
}

export function updateBoost(value: boolean) {
  ws.send(JSON.stringify({ type: 'boost', data: value }))
}
