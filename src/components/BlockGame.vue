<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { type allPawns } from '@/types/allPawns'

// List of active directions
const activeKeys = ref<Set<string>>(new Set())

// Variable for requesting frame animation update
let animationFrameId: number | null = null

// CanvasRef for canvas drawing
const canvasRef = ref<HTMLCanvasElement | null>(null)

const clientState = ref({
  position: { x: Infinity, y: Infinity },
  radius: 10
})

const pawnsState = ref<allPawns>([])

const pendingInputs: { sequenceNumber: number; input: Set<string> }[] = []
let sequenceNumber = 0

// Frame update loop
const animateMovement = () => {
  // Predict the next position based on the input
  applyInput(activeKeys.value)
  draw()
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
    if (!activeKeys.value.has(key)) {
      activeKeys.value.add(key)
      updateDirections(activeKeys)
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
    if (activeKeys.value.has(key)) {
      activeKeys.value.delete(key)
      updateDirections(activeKeys)
    }
  }
}

onMounted(() => {
  setup()
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

function setup() {
  initializeCanvas()
  setupWebSocket()
}

function initializeCanvas() {
  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
  }
}

const setupWebSocket = () => {
  ws = new WebSocket(`${import.meta.env.VITE_BACKEND_URL}`)

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)

    if (msg.type === 'gameState') {
      handleServerUpdate(msg.data)
    }
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }
}

// Server reconciliation
function handleServerUpdate(data: any) {
  const lastProcessedServerInput = data.lastProcessedServerInput

  // Reconcile the client state
  clientState.value.position = data.clientPawn.position
  pawnsState.value = data.allPawns

  // Remove processed inputs
  // while (pendingInputs.length > 0 && pendingInputs[0].sequenceNumber <= lastProcessedServerInput) {
  //   pendingInputs.shift()
  // }

  // // Reapply unprocessed inputs
  // for (const pendingInput of pendingInputs) {
  //   console.log(pendingInput)
  //   applyInput(pendingInput.input)
  // }
}

function applyInput(input: Set<string>) {
  const speed = 5

  if (input.has('arrowleft') || input.has('a')) {
    clientState.value.position.x -= speed
  }
  if (input.has('arrowright') || input.has('d')) {
    clientState.value.position.x += speed
  }
  if (input.has('arrowup') || input.has('w')) {
    clientState.value.position.y -= speed
  }
  if (input.has('arrowdown') || input.has('s')) {
    clientState.value.position.y += speed
  }
}

function draw() {
  if (context && canvasRef.value) {
    // Clear the canvas
    context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    // Draw the background
    context.fillStyle = '#333300' // Set your desired background color here
    context.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    // Draw Controllable Units
    pawnsState.value.forEach((pawn) => {
      if (context) {
        context.fillStyle = 'white'
        context.beginPath()
        context.arc(pawn.position.x, pawn.position.y, pawn.radius, 0, Math.PI * 2)
        context.fill()
      }
    })

    // Draw the client's pawn
    context.fillStyle = 'blue'
    context.beginPath()
    if (clientState.value.position.x !== undefined && clientState.value.position.y !== undefined) {
      context.arc(
        clientState.value.position.x,
        clientState.value.position.y,
        clientState.value.radius,
        0,
        Math.PI * 2
      )
    }

    context.fill()
  }
}

function updateDirections(activeDirections: Ref<Set<string>>) {
  sequenceNumber++
  const input = new Set(activeDirections.value)
  pendingInputs.push({ sequenceNumber, input })

  ws.send(
    JSON.stringify({
      type: 'move',
      data: { inputNumber: sequenceNumber, input: Array.from(activeDirections.value) }
    })
  )
}
</script>

<template>
  <div>
    <canvas ref="canvasRef" width="800" height="800" style="border: 0.5px solid wheat"> </canvas>
  </div>
</template>

<style scoped></style>
