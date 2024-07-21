<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ws, setupWebSocket } from './utilities/webSocket'
// import { socket, setupSocketIo } from './utilities/socketIo'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const activeDirections = ref<Set<string>>(new Set())
let animationFrameId: number | null = null

const move = (direction: string) => {
  // socket.emit('move', direction)
  ws.send(JSON.stringify({ type: 'move', data: direction }))
}

const animateMovement = () => {
  if (activeDirections.value.size > 0) {
    activeDirections.value.forEach((direction) => {
      move(direction)
    })
  }
  animationFrameId = requestAnimationFrame(animateMovement)
}

const handleKeyDown = (event: KeyboardEvent) => {
  const direction = getDirectionFromKey(event.key)
  if (direction) {
    activeDirections.value.add(direction)
    if (!animationFrameId) {
      animateMovement()
    }
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  const direction = getDirectionFromKey(event.key)
  if (direction) {
    activeDirections.value.delete(direction)
    if (activeDirections.value.size === 0 && animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
}

const getDirectionFromKey = (key: string): string | null => {
  switch (key) {
    case 'ArrowUp':
      return 'up'
    case 'ArrowDown':
      return 'down'
    case 'ArrowLeft':
      return 'left'
    case 'ArrowRight':
      return 'right'
    default:
      return null
  }
}

onMounted(() => {
  setupWebSocket(canvasRef)
  // setupSocketIo(canvasRef)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
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
    <!-- <div>
      <button v-on:click="move('right')">Right</button>
      <button v-on:click="move('left')">Left</button>
      <button v-on:click="move('up')">Up</button>
      <button v-on:click="move('down')">Down</button>
    </div> -->
  </div>
</template>

<style scoped></style>
