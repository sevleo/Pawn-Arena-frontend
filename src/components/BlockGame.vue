<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ws, setupWebSocket } from './utilities/webSocket'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const activeDirections = ref<Set<string>>(new Set())
let animationFrameId: number | null = null

const updateDirections = () => {
  ws.send(JSON.stringify({ type: 'move', data: Array.from(activeDirections.value) }))
}

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
      console.log('update directions down')
      updateDirections()
    }
  }

  // Start boosting
  if (event.key === 'Shift') {
    console.log(event.key)
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

onMounted(() => {
  setupWebSocket(canvasRef)
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
    <canvas ref="canvasRef" width="640" height="480" style="border: 1px solid black"> </canvas>
  </div>
</template>

<style scoped></style>
