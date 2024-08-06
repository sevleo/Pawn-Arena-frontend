<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { type allPawns } from '@/types/allPawns'

// List of active directions
const activeDirections = ref<Set<string>>(new Set())

// Variable for requesting frame animation update
let animationFrameId: number | null = null

// CanvasRef for canvas drawing
const canvasRef = ref<HTMLCanvasElement | null>(null)

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
      updateDirections(activeDirections)
    }
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
      updateDirections(activeDirections)
    }
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

let context: CanvasRenderingContext2D | null = null
let ws: WebSocket

function setup(canvasRef: Ref<HTMLCanvasElement | null>) {
  initializeCanvas(canvasRef)
  setupWebSocket(canvasRef)
}

function initializeCanvas(canvasRef: Ref<HTMLCanvasElement | null>) {
  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
  }
}

const setupWebSocket = (canvasRef: Ref<HTMLCanvasElement | null>) => {
  ws = new WebSocket(`${import.meta.env.VITE_BACKEND_URL}`)

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)

    if (msg.type === 'gameState') {
      console.log(msg)
      drawPositions(canvasRef, msg.data.allPawns)
    }
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }
}

function drawPositions(canvasRef: Ref<HTMLCanvasElement | null>, allPawns: allPawns) {
  if (context && canvasRef.value) {
    context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    context.fillStyle = '#333300' // Set your desired background color here
    context.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    // Draw Controllable Units
    Object.entries(allPawns).forEach(([, value]) => {
      if (context) {
        context.fillStyle = 'white'
        context.beginPath()
        context.arc(value.position.x, value.position.y, value.radius, 0, Math.PI * 2) // Draw a circle with radius 10
        context.fill()
      }
    })
  }
}

function updateDirections(activeDirections: Ref<Set<string>>) {
  ws.send(JSON.stringify({ type: 'move', data: Array.from(activeDirections.value) }))
}
</script>

<template>
  <div>
    <canvas ref="canvasRef" width="800" height="800" style="border: 0.5px solid wheat"> </canvas>
  </div>
</template>

<style scoped></style>
