<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

// const socket = io('http://localhost:3000')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const position = ref({ x: 0, y: 0 })
let context: CanvasRenderingContext2D | null = null
let ws: WebSocket

const move = (direction: string) => {
  // socket.emit('move', direction)
  ws.send(JSON.stringify({ type: 'move', data: direction }))
}

onMounted(() => {
  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
  }

  ws = new WebSocket('ws://localhost:3000')
  ws.onopen = () => {
    console.log('WebSocket connection established')
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'position') {
      position.value = msg.data

      if (context && canvasRef.value) {
        context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
        context.fillRect(position.value.x, position.value.y, 20, 20)
      }
    }
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }

  // socket.on('position', (data: { x: number; y: number }) => {
  //   console.log('position received:', data)
  //   position.value = data

  //   if (context) {
  //     context.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
  //     context.fillRect(position.value.x, position.value.y, 20, 20)
  //   }
  // })
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
