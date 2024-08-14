<!-- eslint-disable no-constant-condition -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

class Entity {
  x: number
  speed: number
  position_buffer: []
  entity_id: any
  constructor() {
    this.x = 0
    this.speed = 2
    this.position_buffer = []
  }

  applyInput(input: { press_time: number }) {
    this.x += input.press_time * this.speed
  }
}

// Local representation of the entities.
let entities: any = {}

// Input state.
let key_left = false
let key_right = false

// Unique ID of our entity. Assigned by Server on connection.
let entity_id: any = null

// Data needed for reconciliation.
let input_sequence_number = 0
let pending_inputs: any = []

// UI.
let canvas: any
let status: any

// Update rate.
let update_rate = 100
let last_ts: any = null
let update_interval: any = null

let messages: any = []

let socket: any

function receiveServerMessage(message: any) {
  messages.push({ recv_ts: Date.now(), payload: message })
}

function connectToServer() {
  socket = new WebSocket(`${import.meta.env.VITE_BACKEND_URL}`)

  // Listen for the server to send the entity_id
  socket.onmessage = (event: any) => {
    const message = JSON.parse(event.data)

    if (message.type === 'connection') {
      entity_id = message.entity_id // Assign entity_id
      console.log(`Assigned entity_id: ${entity_id}`)
    } else {
      console.log('ss')
      receiveServerMessage(message)
    }
  }

  socket.onopen = () => {
    console.log('Connected to the server')
  }
  socket.onclose = () => {
    console.log('Disconnected from the server')
  }
}

function getMessage() {
  const now = Date.now()
  for (let i = 0; i < messages.length; i++) {
    // Access each message in the queue.
    const message = messages[i]
    // // Check if the message's designated reception time has passed or is equal to the current time.
    if (message.recv_ts <= now) {
      messages.splice(i, 1)
      return message.payload
    }
  }
}

function processServerMessage() {
  while (true) {
    let message = getMessage()
    if (!message) {
      break
    }
    // Handle the game state received from the server

    for (const state of message.data) {
      if (!entities[state.entity_id]) {
        const entity = new Entity()
        entity.entity_id = state.entity_id
        entities[state.entity_id] = entity
      }
      const entity = entities[state.entity_id]
      if (state.entity_id == entity_id) {
        // Received the authoritative position of this client's entity.
        entity.x = state.position
        // Server Reconciliation. Re-apply all the inputs not yet processed by
        // the server.
        let j = 0
        while (j < pending_inputs.length) {
          const input = pending_inputs[j]
          if (input.input_sequence_number <= state.last_processed_input) {
            // Already processed. Its effect is already taken into account into the world update
            // we just got, so we can drop it.
            pending_inputs.splice(j, 1)
          } else {
            // Not processed by the server yet. Re-apply it.
            entity.applyInput(input)
            j++
          }
        }
      } else {
        // Received the position of an entity other than this client's.
        // Add it to the position buffer for interpolation.
        const timestamp = Date.now()
        entity.position_buffer.push([timestamp, state.position])
      }
    }
  }
}

function setClientUpdate() {
  clearInterval(update_interval)
  update_interval = setInterval(() => {
    update()
  }, update_rate)
}

// Update Client state.
function update() {
  // Listen to the server.
  processServerMessage()

  if (entity_id == null) {
    return // Not connected yet.
  }

  // Process inputs.
  processInputs()

  // Interpolate other entities.
  interpolateEntities()

  // Render the World.
  renderWorld(canvas, entities, entity_id)

  // Show some info.
  const info = `Non-acknowledged inputs: ${pending_inputs.length}`
  status.textContent = info
}

// Get inputs and send them to the server
function processInputs() {
  // Compute delta time since last update.
  const now_ts = Date.now()
  last_ts = last_ts || now_ts
  const dt_sec = (now_ts - last_ts) / 1000.0
  last_ts = now_ts

  // Package player's input.
  let input: any
  if (key_right) {
    input = { press_time: dt_sec }
  } else if (key_left) {
    input = { press_time: -dt_sec }
  } else {
    // Nothing interesting happened
    return
  }

  // Send the input to the server.
  input.input_sequence_number = input_sequence_number++
  socket.send(JSON.stringify({ type: 'input', data: input }))

  // Do client-side prediction.
  if (entity_id !== null) {
    entities[entity_id].applyInput(input)
  }

  // Save this input for later reconciliation.
  pending_inputs.push(input)
}

function interpolateEntities() {
  // Compute render timestamp.
  let now = Date.now()
  let render_timestamp = now - 400

  for (const i in entities) {
    const entity = entities[i]

    // No point in interpolating this client's entity.
    if (entity.entity_id == entity_id) {
      continue
    }

    // Find the two authoritative positions surrounding the rendering timestamp.
    let buffer = entity.position_buffer

    // Drop older positions.
    while (buffer.length >= 2 && buffer[1][0] <= render_timestamp) {
      buffer.shift()
    }

    // Check if there are at least two positions in the buffer that
    // surround the render_timestamp
    if (
      buffer.length >= 2 &&
      buffer[0][0] <= render_timestamp &&
      render_timestamp <= buffer[1][0]
    ) {
      const [t0, x0] = buffer[0] // represent the earlier timestamp and position.
      const [t1, x1] = buffer[1] // represent the later timestamp and position.

      entity.x = x0 + ((x1 - x0) * (render_timestamp - t0)) / (t1 - t0)
    }
  }
}

function keyHandler(e: any) {
  let input = e.type == 'keydown'
  switch (e.key) {
    case 'a':
      key_left = input
      break
    case 'd':
      key_right = input
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
  canvas = player1Canvas.value
  status = player1Status.value

  connectToServer()

  setClientUpdate()
  setClientUpdate()

  window.addEventListener('keydown', (e) => keyHandler(e))
  window.addEventListener('keyup', (e) => keyHandler(e))
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyHandler)
  window.removeEventListener('keyup', keyHandler)
  clearInterval(update_interval)
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
