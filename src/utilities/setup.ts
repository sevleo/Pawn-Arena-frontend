import { type Ref } from 'vue'
import { setupWebSocket } from '../services/webSocket'
import { drawPositions, initializeCanvas } from './canvasManager'
import { type PositionMessage, type InitialPositionMessage } from '@/types/message'

export function setup(canvasRef: Ref<HTMLCanvasElement | null>) {
  initializeCanvas(canvasRef)

  setupWebSocket((msg: PositionMessage | InitialPositionMessage) => {
    if (msg.type === 'position') {
      console.log(msg)
      drawPositions(canvasRef, msg.data.allPositions)
    }
  })
}
