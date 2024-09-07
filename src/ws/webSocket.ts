import handleServerMessage from './serverMessage'

export function connectToServer() {
  const socket = new WebSocket(`${import.meta.env.VITE_BACKEND_URL}`)

  // Listen for the server to send the clientId
  socket.onmessage = (event: any) => {
    handleServerMessage(event)
  }

  socket.onopen = () => {
    console.log('Connected to the server')
  }
  socket.onclose = () => {
    console.log('Disconnected from the server')
  }

  return socket
}
