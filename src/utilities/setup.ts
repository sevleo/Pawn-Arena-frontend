import { type Ref } from 'vue'
import { setupWebSocket } from '../services/webSocket'
import { initializeCanvas } from './canvasManager'

export function setup(canvasRef: Ref<HTMLCanvasElement | null>) {
  initializeCanvas(canvasRef)
  setupWebSocket(canvasRef)
}
