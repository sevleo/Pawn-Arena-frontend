<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ws, setupWebSocket } from './utilities/webSocket'
// import { socket, setupSocketIo } from './utilities/socketIo'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const move = (direction: string) => {
  // socket.emit('move', direction)
  ws.send(JSON.stringify({ type: 'move', data: direction }))
}

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowUp':
      move('up')
      break
    case 'ArrowDown':
      move('down')
      break
    case 'ArrowLeft':
      move('left')
      break
    case 'ArrowRight':
      move('right')
      break
  }
}

onMounted(() => {
  setupWebSocket(canvasRef)
  // setupSocketIo(canvasRef)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div>
    <canvas ref="canvasRef" width="640" height="480" style="border: 1px solid black"> </canvas>
    <div>
      <button v-on:click="move('right')">Right</button>
      <button v-on:click="move('left')">Left</button>
      <button v-on:click="move('up')">Up</button>
      <button v-on:click="move('down')">Down</button>
    </div>
  </div>
</template>

<style scoped></style>
