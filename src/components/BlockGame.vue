<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ws } from '../services/webSocket'
import { setup } from '@/utilities/setup'

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
  const key = event.key.toLowerCase() // Convert key to lowercase
  // Start moving
  if (
    key === 'arrowleft' ||
    key === 'arrowright' ||
    key === 'arrowup' ||
    key === 'arrowdown' ||
    key === 'a' ||
    key === 'd' ||
    key === 'w' ||
    key === 's'
  ) {
    if (!activeDirections.value.has(key)) {
      activeDirections.value.add(key)
      updateDirections()
    }
  }

  // Start boosting
  if (event.key === 'Shift') {
    ws.send(JSON.stringify({ type: 'boost', data: true }))
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase() // Convert key to lowercase

  // Stop moving
  if (
    key === 'arrowleft' ||
    key === 'arrowright' ||
    key === 'arrowup' ||
    key === 'arrowdown' ||
    key === 'a' ||
    key === 'd' ||
    key === 'w' ||
    key === 's'
  ) {
    if (activeDirections.value.has(key)) {
      activeDirections.value.delete(key)
      updateDirections()
    }
  }

  // Stop boosting
  if (event.key === 'Shift') {
    ws.send(JSON.stringify({ type: 'boost', data: false }))
  }
}

onMounted(() => {
  setup(canvasRef)
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
