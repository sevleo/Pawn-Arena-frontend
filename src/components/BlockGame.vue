<!-- eslint-disable no-constant-condition -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Entity from '@/models/entity'
import { connectToServer } from '@/ws/webSocket'
import clientState from '@/services/clientState'

function receiveServerMessage(message: any) {
  // console.log(message)
  clientState.messages.push({ recv_ts: Date.now(), payload: message })
}

function assignEntityId(id: string) {
  clientState.entity_id = id
  console.log(`Assigned entity_id: ${clientState.entity_id}`)
}

function getMessage() {
  const now = Date.now()
  for (let i = 0; i < clientState.messages.length; i++) {
    // Access each message in the queue.
    const message = clientState.messages[i]
    // // Check if the message's designated reception time has passed or is equal to the current time.
    if (message.recv_ts <= now) {
      clientState.messages.splice(i, 1)
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
    // console.log(messages)
    // Handle the game state received from the server

    for (const state of message.data) {
      if (!clientState.entities[state.entity_id]) {
        const entity = new Entity()
        entity.entity_id = state.entity_id
        clientState.entities[state.entity_id] = entity
      }
      const entity = clientState.entities[state.entity_id]
      if (state.entity_id == clientState.entity_id) {
        // Received the authoritative position of this client's entity.
        entity.x = state.position
        // Server Reconciliation. Re-apply all the inputs not yet processed by
        // the server.
        let j = 0
        while (j < clientState.pending_inputs.length) {
          const input = clientState.pending_inputs[j]
          if (input.input_sequence_number <= state.last_processed_input) {
            // Already processed. Its effect is already taken into account into the world update
            // we just got, so we can drop it.
            clientState.pending_inputs.splice(j, 1)
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
  clearInterval(clientState.update_interval)
  clientState.update_interval = setInterval(() => {
    update()
  }, clientState.update_rate)
}

// Update Client state.
function update() {
  // Listen to the server.
  processServerMessage()

  if (clientState.entity_id == null) {
    return // Not connected yet.
  }

  // Process inputs.
  processInputs()

  // Interpolate other entities.
  interpolateEntities()

  // Render the World.
  renderWorld(clientState.canvas, clientState.entities, clientState.entity_id)

  // Show some info.
  const info = `Non-acknowledged inputs: ${clientState.pending_inputs.length}`
  clientState.status.textContent = info
}

// Get inputs and send them to the server
function processInputs() {
  // Compute delta time since last update.
  const now_ts = Date.now()
  clientState.last_ts = clientState.last_ts || now_ts
  const dt_sec = (now_ts - clientState.last_ts) / 1000.0
  clientState.last_ts = now_ts

  // Package player's input.
  let input: any
  if (clientState.key_right) {
    input = { press_time: dt_sec }
  } else if (clientState.key_left) {
    input = { press_time: -dt_sec }
  } else {
    // Nothing interesting happened
    return
  }

  // Send the input to the server.
  input.input_sequence_number = clientState.input_sequence_number++
  clientState.socket.send(JSON.stringify({ type: 'input', data: input }))

  // Do client-side prediction.
  if (clientState.entity_id !== null) {
    clientState.entities[clientState.entity_id].applyInput(input)
  }

  // Save this input for later reconciliation.
  clientState.pending_inputs.push(input)
}

function interpolateEntities() {
  // Compute render timestamp.
  let now = Date.now()
  let render_timestamp = now - 500

  for (const i in clientState.entities) {
    const entity = clientState.entities[i]

    // No point in interpolating this client's entity.
    if (entity.entity_id == clientState.entity_id) {
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
      clientState.key_left = input
      break
    case 'd':
      clientState.key_right = input
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
  clientState.canvas = player1Canvas.value
  clientState.status = player1Status.value

  clientState.socket = connectToServer(receiveServerMessage, assignEntityId)

  setClientUpdate()

  window.addEventListener('keydown', (e) => keyHandler(e))
  window.addEventListener('keyup', (e) => keyHandler(e))
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyHandler)
  window.removeEventListener('keyup', keyHandler)
  clearInterval(clientState.update_interval)
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
