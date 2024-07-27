// src/setup.ts
import { type Ref } from 'vue'
import { setupWebSocket } from '../services/webSocket'
import { drawPositions } from './canvasManager'

export function setup(canvasRef: Ref<HTMLCanvasElement | null>) {
  setupWebSocket((msg) => {
    if (msg.type === 'position') {
      drawPositions(canvasRef, msg.data.allPositions)
    }
  })
}
