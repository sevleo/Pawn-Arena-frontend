import { ref, type Ref } from 'vue'
import { io } from 'socket.io-client'

const position = ref({ x: 0, y: 0 })

export const socket = io('http://localhost:3000')

export function setupSocketIo(canvasRef: Ref<HTMLCanvasElement | null>) {
  let context: CanvasRenderingContext2D | null = null

  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
  }

  socket.on('position', (data: { x: number; y: number }) => {
    console.log('position received:', data)
    position.value = data

    if (context) {
      context.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
      context.fillRect(position.value.x, position.value.y, 20, 20)
    }
  })
}
