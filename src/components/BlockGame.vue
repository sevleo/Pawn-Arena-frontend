<!-- eslint-disable no-constant-condition -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { connectToServer } from '@/ws/webSocket'
import { gameState, updateGameState } from '@/services/gameState'
import { GAME_SPEED_RATE } from '@/config/gameConstants'

function startGameLoop() {
  // Clear the previous interval if any
  clearInterval(gameState.update_interval)

  // Use setInterval for input processing and other non-visual updates
  gameState.update_interval = setInterval(() => {
    updateGameState()
    renderWorld(gameState.canvas, gameState.entities, gameState.entity_id)
  }, GAME_SPEED_RATE)

  // Start the rendering loop with requestAnimationFrame
  // function renderLoop() {
  //   renderWorld(gameState.canvas, gameState.entities, gameState.entity_id)
  //   requestAnimationFrame(renderLoop)
  // }

  // renderLoop() // Start the loop
}

function keyHandler(e: any) {
  let input = e.type == 'keydown'
  switch (e.key) {
    case 'a':
      gameState.key_left = input
      break
    case 'd':
      gameState.key_right = input
      break
  }
}

function renderWorld(canvas: any, entities: any, clientEntityId: any) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // eslint-disable-next-line no-self-assign
  canvas.width = canvas.width

  for (const entity_id in entities) {
    const color = clientEntityId.toString() === entity_id ? 'green' : 'red'
    const entity = entities[entity_id]
    const radius = (canvas.height * 0.9) / 2
    const x = (entity.x / 10.0) * canvas.width

    ctx.beginPath()
    ctx.arc(x, canvas.height / 2, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
    ctx.lineWidth = 5
    ctx.strokeStyle = color
    ctx.stroke()
  }
}

// Create instances of Client and Server
const player1Canvas = ref<HTMLCanvasElement | null>(null)
const player1Status = ref<HTMLElement | null>(null)

onMounted(() => {
  gameState.canvas = player1Canvas.value
  gameState.status = player1Status.value

  gameState.socket = connectToServer()

  startGameLoop()

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
    <div style="border: 5px solid blue; padding: 15px">
      <canvas height="75" ref="player1Canvas" width="920"></canvas>
      <div ref="player1Status" style="font-family: courier">Waiting for connection…</div>
    </div>
  </div>
</template>
<style scoped></style>
