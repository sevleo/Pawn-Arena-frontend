import { type PositionMessage, type InitialPositionMessage } from '@/types/message'

export let ws: WebSocket
let clientId: string | undefined

export function setupWebSocket(onMessage: (msg: PositionMessage | InitialPositionMessage) => void) {
  ws = new WebSocket('ws://localhost:3000')

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'initial position') {
      console.log('initial position received:', msg)
      clientId = msg.data.clientId
    }
    onMessage(msg)
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }
}

export function getClientId() {
  return clientId
}
