import { ref, type Ref } from 'vue'

const position = ref({ x: 0, y: 0 })
let clientId

export let ws: WebSocket

export function setupWebSocket(canvasRef: Ref<HTMLCanvasElement | null>) {
  let context: CanvasRenderingContext2D | null = null

  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
  }

  ws = new WebSocket('ws://localhost:3000')

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'initial position') {
      console.log('initial position received:', msg.data)
      clientId = msg.data.clientId
    }
    if (msg.type === 'position') {
      console.log('position received:', msg.data)
      if (context && canvasRef.value) {
        context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
        if (msg.data.x !== undefined) {
          context.fillRect(msg.data.x, msg.data.y, 20, 20)
        } else {
          Object.entries(msg.data).forEach(([key, value]) => {
            // console.log(key)
            // console.log(value.position.x)
            // console.log(value.position.y)
            if (value.clientId === clientId) {
              context.fillStyle = 'green'
            } else {
              context.fillStyle = 'white'
            }
            // context.fillRect(value.position.x, value.position.y, 20, 20)
            context.beginPath() // Start a new path
            context.arc(value.position.x, value.position.y, 10, 0, Math.PI * 2) // Draw a circle with radius 10
            context.fill() // Fill the circle with the current fill style
          })
        }
      }
    }
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }
}
