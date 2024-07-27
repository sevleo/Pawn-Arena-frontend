<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ws, setupWebSocket } from '../services/webSocket'
import { initializeCanvas, drawPositions } from '@/utilities/canvasManager'
import { type PositionMessage, type InitialPositionMessage } from '@/types/message'

// List of active directions
const activeDirections = ref<Set<string>>(new Set())

// Variable for requesting frame animation update
let animationFrameId: number | null = null

// CanvasRef for canvas drawing
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Send updated directions to server
const updateDirections = () => {
  ws.send(JSON.stringify({ type: 'move', data: Array.from(activeDirections.value) }))
}

// Frame update loop
const animateMovement = () => {
  animationFrameId = requestAnimationFrame(animateMovement)
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Start moving
  if (
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight' ||
    event.key === 'ArrowUp' ||
    event.key === 'ArrowDown'
  ) {
    if (!activeDirections.value.has(event.key)) {
      activeDirections.value.add(event.key)
      updateDirections()
    }
  }

  // Start boosting
  if (event.key === 'Shift') {
    ws.send(JSON.stringify({ type: 'boost', data: true }))
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  // Stop moving
  if (
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight' ||
    event.key === 'ArrowUp' ||
    event.key === 'ArrowDown'
  ) {
    if (activeDirections.value.has(event.key)) {
      activeDirections.value.delete(event.key)
      updateDirections()
    }
  }

  // Stop boosting
  if (event.key === 'Shift') {
    console.log(event.key)
    ws.send(JSON.stringify({ type: 'boost', data: false }))
  }
}

const onMessage = (msg: PositionMessage | InitialPositionMessage) => {
  if (msg.type === 'position') {
    drawPositions(canvasRef, msg.data.allPositions)
  }
}

onMounted(() => {
  initializeCanvas(canvasRef)
  setupWebSocket(onMessage)
  // setupSocketIo(canvasRef)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  animateMovement()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div>
    <canvas ref="canvasRef" width="800" height="800" style="border: 0.5px solid wheat"> </canvas>
  </div>
</template>

<style scoped></style>
