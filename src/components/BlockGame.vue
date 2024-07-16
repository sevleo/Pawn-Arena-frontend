<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ws, setupWebSocket } from './utilities/webSocket'
// import { socket, setupSocketIo } from './utilities/socketIo'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const move = (direction: string) => {
  // socket.emit('move', direction)
  ws.send(JSON.stringify({ type: 'move', data: direction }))
}

onMounted(() => {
  setupWebSocket(canvasRef)
  // setupSocketIo(canvasRef)
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
