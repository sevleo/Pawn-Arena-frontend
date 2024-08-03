import { type Ref } from 'vue'
import { setupWebSocket } from '../services/webSocket'
import { initializeCanvas } from './canvasManager'

export function setup(canvasRef: Ref<HTMLCanvasElement | null>, health: Ref<number>) {
  initializeCanvas(canvasRef)
  setupWebSocket(canvasRef, health)
}
