<!-- eslint-disable no-constant-condition -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { connectToServer } from '@/ws/webSocket'
import { gameState, updateGameState } from '@/services/gameState'
import { GAME_SPEED_RATE } from '@/config/gameConstants'
import { initializeCanvas, renderWorld } from '@/services/canvasManager'
import { Engine } from 'matter-js'
import { createWorld } from '@/services/createWorld'

function startGameLoop(world: any, engine: any) {
  // Clear the previous interval if any
  clearInterval(gameState.update_interval)

  initializeCanvas()

  let lastTime: any

  // Use setInterval for input processing and other non-visual updates
  gameState.update_interval = setInterval(() => {
    updateGameState(world)

    const now = Date.now()
    const delta = now - lastTime
    lastTime = now

    Engine.update(engine, delta)
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
  }
}

// Create instances of Client and Server
const player1Canvas = ref<HTMLCanvasElement | null>(null)
const player1Status = ref<HTMLElement | null>(null)

onMounted(() => {
  gameState.canvas = player1Canvas.value
  gameState.status = player1Status.value
  gameState.socket = connectToServer()

  const engine = Engine.create()
  const world = engine.world
  createWorld(engine, world)

  startGameLoop(world, engine)

  window.addEventListener('keydown', (e) => keyHandler(e))
  window.addEventListener('keyup', (e) => keyHandler(e))
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyHandler)
  window.removeEventListener('keyup', keyHandler)
  clearInterval(gameState.update_interval)
})
</script>

<template>
  <div class="main">
    <div style="padding: 15px">
      <canvas
        height="800"
        ref="player1Canvas"
        width="800"
        style="border: 0.5px solid grey"
      ></canvas>
      <div ref="player1Status" style="font-family: courier">Waiting for connection…</div>
    </div>
  </div>
</template>
<style scoped></style>
