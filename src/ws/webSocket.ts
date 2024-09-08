import { type Ref } from 'vue'

import handleServerMessage from './serverMessage'

export function connectToServer(
  isInGame: Ref<boolean>,
  hasClientId: Ref<boolean>,
  playerHealth: Ref<number | null>
) {
  const socket = new WebSocket(`${import.meta.env.VITE_BACKEND_URL}`)

  // Listen for the server to send the clientId
  socket.onmessage = (event: any) => {
    handleServerMessage(event, isInGame, hasClientId, playerHealth)
  }

  socket.onopen = () => {
    // console.log('Connected to the server')
  }
  socket.onclose = () => {
    // console.log('Disconnected from the server')
  }

  return socket
}
