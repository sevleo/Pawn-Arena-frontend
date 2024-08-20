export function connectToServer(
  receiveServerMessage: (message: any) => void,
  assignEntityId: (id: string) => void
) {
  const socket = new WebSocket(`${import.meta.env.VITE_BACKEND_URL}`)

  // Listen for the server to send the entity_id
  socket.onmessage = (event: any) => {
    const message = JSON.parse(event.data)

    if (message.type === 'connection') {
      assignEntityId(message.entity_id)
    } else {
      receiveServerMessage(message)
    }
  }

  socket.onopen = () => {
    console.log('Connected to the server')
  }
  socket.onclose = () => {
    console.log('Disconnected from the server')
  }

  return socket
}
