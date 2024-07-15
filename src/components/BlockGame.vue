<script>
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
</script>

<!-- <script setup lang="ts">
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

const socket = ref({});
const context = ref<CanvasRenderingContext2D | null>(null);
const position = ref({ x: 0, y: 0 });

onMounted(() => {
  socket.value = io('http://localhost:3000');
  const canvas = document.querySelector('canvas');
  if (canvas) {
    context.value = canvas.getContext('2d');
  }
});
</script> -->

<template>
  <div>
    <canvas ref="game" width="640" height="480" style="border: 1px solid black"> </canvas>
    <div>
      <button v-on:click="move('right')">Right</button>
      <button v-on:click="move('left')">Left</button>
      <button v-on:click="move('up')">Up</button>
      <button v-on:click="move('down')">Down</button>
    </div>
  </div>
</template>

<style scoped></style>
