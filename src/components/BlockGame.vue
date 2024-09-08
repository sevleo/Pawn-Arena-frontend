<!-- eslint-disable no-constant-condition -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { connectToServer } from '@/ws/webSocket'
import { gameState, updateGameState } from '@/services/gameState'
import { GAME_SPEED_RATE, CANVAS_HEIGHT, CANVAS_WIDTH } from '@/config/gameConstants'
import { initializeCanvas, renderWorld } from '@/services/canvasManager'

const isInGame = ref(false)

function startGameLoop() {
  // Clear the previous interval if any
  clearInterval(gameState.update_interval)
  initializeCanvas()

  // Use setInterval for input processing and other non-visual updates
  gameState.update_interval = setInterval(() => {
    updateGameState(isInGame)
  }, GAME_SPEED_RATE)

  // Start the rendering loop with requestAnimationFrame
  function renderLoop() {
    renderWorld()
    requestAnimationFrame(renderLoop)
  }

  renderLoop() // Start the loop
}

function keyHandler(e: any) {
  let input = e.type == 'keydown'
  switch (e.key) {
    case 'd':
      gameState.key_right = input
      break
    case 'a':
      gameState.key_left = input
      break
    case 'w':
      gameState.key_up = input
      break
    case 's':
      gameState.key_down = input
      break
    case ' ':
      if (e.target.tagName !== 'BUTTON') {
        // Prevent space from interacting with buttons
        gameState.key_space = input
      } else {
        e.preventDefault() // Prevent space bar from triggering button clicks
      }
      break
  }
}

function updateMousePosition(event: MouseEvent) {
  if (gameState.context) {
    const rect = gameState.context.canvas.getBoundingClientRect()
    gameState.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    gameState.mouseMoved = true
  }
}

// Create instances of Client and Server
const player1Canvas = ref<HTMLCanvasElement | null>(null)
const player1Status = ref<HTMLElement | null>(null)

onMounted(() => {
  gameState.canvas = player1Canvas.value
  gameState.status = player1Status.value
  gameState.socket = connectToServer(isInGame)
  startGameLoop()

  window.addEventListener('keydown', (e) => keyHandler(e))
  window.addEventListener('keyup', (e) => keyHandler(e))
  gameState.canvas.addEventListener('mousemove', (e: MouseEvent) => {
    //   console.log(e)
    updateMousePosition(e)
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyHandler)
  window.removeEventListener('keyup', keyHandler)
  clearInterval(gameState.update_interval)
})

function requestToEnterGame() {
  gameState.socket.send(JSON.stringify({ type: 'enter_game_request', data: {} }))
}
</script>

<template>
  <div class="main">
    <div style="padding: 15px">
      <button
        :style="{ opacity: isInGame ? '0' : '1', pointerEvents: isInGame ? 'none' : 'auto' }"
        @click="requestToEnterGame"
        tabindex="-1"
        :class="'bg-green-500'"
      >
        Spawn
      </button>
      <canvas
        :height="CANVAS_HEIGHT"
        :width="CANVAS_WIDTH"
        ref="player1Canvas"
        style="border: 0.5px solid grey"
      ></canvas>
      <div ref="player1Status" style="font-family: courier">Waiting for connection…</div>
    </div>
  </div>
</template>
<style scoped></style>
