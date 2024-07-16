import { ref, type Ref } from 'vue'

const position = ref({ x: 0, y: 0 })

export let ws: WebSocket

export function setupWebSocket(canvasRef: Ref<HTMLCanvasElement | null>) {
  let context: CanvasRenderingContext2D | null = null

  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
  }

  ws = new WebSocket('ws://localhost:3000')

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'position') {
      console.log('position received:', msg.data)

      if (context && canvasRef.value) {
        context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

        console.log(msg.data)
        if (msg.data.x) {
          context.fillRect(msg.data.x, msg.data.y, 20, 20)
        } else {
          Object.entries(msg.data).forEach(([key, value]) => {
            // console.log(key)
            // console.log(value.position.x)
            // console.log(value.position.y)
            context.fillRect(value.position.x, value.position.y, 20, 20)
          })
        }
      }
    }
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }
}
