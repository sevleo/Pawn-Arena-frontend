<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const position = ref({ x: 0, y: 0 })
let context: CanvasRenderingContext2D | null = null

const move = (direction: string) => {
  socket.emit('move', direction)
}

onMounted(() => {
  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
  }

  socket.on('position', (data: { x: number; y: number }) => {
    console.log('position received:', data)
    position.value = data

    if (context) {
      context.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
      context.fillRect(position.value.x, position.value.y, 20, 20)
    }
  })
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

<!-- <script>
import io from 'socket.io-client'

export default {
  name: 'BlockGame',
  data() {
    return {
      socket: {},
      context: {},
      position: {
        x: 0,
        y: 0
      }
    }
  },
  created() {
    this.socket = io('http://localhost:3000')
  },
  mounted() {
    this.context = this.$refs.game.getContext('2d')
    this.socket.on('position', (data) => {
      console.log('position received:', data)
      this.position = data
      this.context.clearRect(0, 0, this.$refs.game.width, this.$refs.game.height)
      this.context.fillRect(this.position.x, this.position.y, 20, 20)
    })
  },
  methods: {
    move(direction) {
      this.socket.emit('move', direction)
    }
  }
}
</script> -->
