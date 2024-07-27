import { type Ref } from 'vue'
import { getClientId } from '@/services/webSocket'
import { type AllPositions } from '@/types/allPositions'

let context: CanvasRenderingContext2D | null = null
export function initializeCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>
): CanvasRenderingContext2D | null {
  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
  }
  return context
}

export function drawPositions(
  canvasRef: Ref<HTMLCanvasElement | null>,
  allPositions: AllPositions
) {
  // console.log(msg.data.allPositions)
  if (context && canvasRef.value) {
    context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    Object.entries(allPositions).forEach(([, value]) => {
      if (context) {
        context.fillStyle = value.clientId === getClientId() ? 'green' : 'white'
        context.beginPath() // Start a new path
        context.arc(value.position.x, value.position.y, 10, 0, Math.PI * 2) // Draw a circle with radius 10
        context.fill() // Fill the circle with the current fill style
      }
    })
  }
}
