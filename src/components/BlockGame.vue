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

class LagNetwork {
  messages: { recv_ts: number; payload: any }[]
  constructor() {
    this.messages = []
  }

  // "Send" a message. Store each message with the timestamp when it should be
  // received, to simulate lag.
  send(lag_ms: number, message: any) {
    this.messages.push({ recv_ts: Date.now() + lag_ms, payload: message })
  }

  // Returns a "received" message, or undefined if there are no messages available
  // yet.
  receive() {
    const now = Date.now()
    for (let i = 0; i < this.messages.length; i++) {
      // Access each message in the queue.
      const message = this.messages[i]
      // // Check if the message's designated reception time has passed or is equal to the current time.
      if (message.recv_ts <= now) {
        this.messages.splice(i, 1)
        return message.payload
      }
    }
  }
}

class Client {
  socket: WebSocket
  entities: any
  key_left: boolean
  key_right: boolean
  network: any
  server: any
  lag: number
  entity_id: null
  input_sequence_number: number
  pending_inputs: []
  canvas: any
  status: any
  update_rate: number
  update_interval: any
  last_ts: number
  constructor(canvas: any, status: any) {
    // Local representation of the entities.
    this.entities = {}

    // Input state.
    this.key_left = false
    this.key_right = false

    // Simulated network connection.
    this.network = new LagNetwork()
    this.server = null
    this.lag = 200

    // Unique ID of our entity. Assigned by Server on connection.
    this.entity_id = null

    // Data needed for reconciliation.
    this.input_sequence_number = 0
    this.pending_inputs = []

    // UI.
    this.canvas = canvas
    this.status = status

    // Update rate.
    this.update_rate = 20
    this.last_ts = null
    // this.setUpdateRate(this.update_rate)

    this.messages = []
  }

  receiveServerMessage(message) {
    this.messages.push({ recv_ts: Date.now(), payload: message })
  }

  connectToServer() {
    this.socket = new WebSocket(`ws://localhost:3000`)

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.receiveServerMessage(message)
    }

    this.socket.onopen = () => {
      console.log('Connected to the server')
    }

    this.socket.onclose = () => {
      console.log('Disconnected from the server')
    }
  }

  getMessage() {
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

  processServerMessage() {
    // while (this.messages.length > 0) {
    //   let message = this.getMessage()
    //   console.log(message)
    //   const id = message.entity_id
    //   const entity = entities.find((entity) => entity.clientId === id)
    //   if (entity) {
    //     entity.applyInput(message)
    //     last_processed_input[id] = message.input_sequence_number
    //     // console.log(last_processed_input);
    //   }
    // }
    // // Handle the game state received from the server
    // console.log(message)
    // for (const state of message.data) {
    //   if (!this.entities[state.entity_id]) {
    //     const entity = new Entity()
    //     entity.entity_id = state.entity_id
    //     this.entities[state.entity_id] = entity
    //   }
    //   const entity = this.entities[state.entity_id]
    //   if (state.entity_id == this.entity_id) {
    //     // Received the authoritative position of this client's entity.
    //     entity.x = state.position
    //     // Server Reconciliation. Re-apply all the inputs not yet processed by
    //     // the server.
    //     let j = 0
    //     while (j < this.pending_inputs.length) {
    //       const input = this.pending_inputs[j]
    //       if (input.input_sequence_number <= state.last_processed_input) {
    //         // Already processed. Its effect is already taken into account into the world update
    //         // we just got, so we can drop it.
    //         this.pending_inputs.splice(j, 1)
    //       } else {
    //         // Not processed by the server yet. Re-apply it.
    //         entity.applyInput(input)
    //         j++
    //       }
    //     }
    //   } else {
    //     // Received the position of an entity other than this client's.
    //     // Add it to the position buffer for interpolation.
    //     const timestamp = Date.now()
    //     entity.position_buffer.push([timestamp, state.position])
    //   }
    // }
  }

  setClientUpdate() {
    clearInterval(this.update_interval)
    this.update_interval = setInterval(() => {
      this.update()
    }, this.update_rate)
  }

  // Update Client state.
  update() {
    // Listen to the server.
    this.processServerMessages()

    if (this.entity_id == null) {
      return // Not connected yet.
    }

    // Process inputs.
    this.processInputs()

    // Interpolate other entities.
    this.interpolateEntities()

    // Render the World.
    renderWorld(this.canvas, this.entities)

    // Show some info.
    const info = `Non-acknowledged inputs: ${this.pending_inputs.length}`
    this.status.textContent = info
  }

  // Process all messages from the server, i.e. world updates.
  processServerMessages() {
    while (true) {
      const message = this.network.receive()
      if (!message) {
        break
      }

      // World state is a list of entity states.
      for (let i = 0; i < message.length; i++) {
        const state = message[i]
        // console.log(state)

        // If this is the first time we see this entity, create a local representation.
        if (!this.entities[state.entity_id]) {
          const entity = new Entity()
          entity.entity_id = state.entity_id
          this.entities[state.entity_id] = entity
        }

        const entity = this.entities[state.entity_id]

        if (state.entity_id == this.entity_id) {
          // Received the authoritative position of this client's entity.
          entity.x = state.position

          // Server Reconciliation. Re-apply all the inputs not yet processed by
          // the server.
          let j = 0
          while (j < this.pending_inputs.length) {
            const input = this.pending_inputs[j]
            if (input.input_sequence_number <= state.last_processed_input) {
              // Already processed. Its effect is already taken into account into the world update
              // we just got, so we can drop it.
              this.pending_inputs.splice(j, 1)
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
      // console.log(this.entities)
    }
  }

  // Get inputs and send them to the server
  processInputs() {
    // Compute delta time since last update.
    const now_ts = Date.now()
    const last_ts = this.last_ts || now_ts
    const dt_sec = (now_ts - last_ts) / 1000.0
    this.last_ts = now_ts

    // Package player's input.
    let input: any
    if (this.key_right) {
      input = { press_time: dt_sec }
    } else if (this.key_left) {
      input = { press_time: -dt_sec }
    } else {
      // Nothing interesting happened
      return
    }

    // Send the input to the server.
    input.input_sequence_number = this.input_sequence_number++
    // input.entity_id = this.entity_id
    // this.server.network.send(this.lag, input)

    this.socket.send(JSON.stringify({ type: 'input', data: input }))

    // Do client-side prediction.
    console.log(this.entity_id)
    if (this.entity_id !== null) {
      this.entities[this.entity_id].applyInput(input)
    }

    // Save this input for later reconciliation.
    this.pending_inputs.push(input)
  }

  interpolateEntities() {
    // Compute render timestamp.
    const now = Date.now()
    const render_timestamp = now - 250

    for (const i in this.entities) {
      const entity = this.entities[i]

      // No point in interpolating this client's entity.
      if (i == this.entity_id) {
        continue
      }

      // Find the two authoritative positions surrounding the rendering timestamp.
      const buffer = entity.position_buffer

      // console.log(buffer)

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
}

// Define Server class
class Server {
  clients: Client[]
  entities: Entity[]
  last_processed_input: number[]
  network: LagNetwork
  canvas: HTMLCanvasElement | null
  status: HTMLElement | null
  update_rate: number
  update_interval: any

  constructor(canvas: HTMLCanvasElement | null, status: HTMLElement | null) {
    // Connected clients and their entities.
    this.clients = []
    this.entities = []

    // Last processed input for each client.
    this.last_processed_input = []

    // Simulated network connection.
    this.network = new LagNetwork()

    // UI.
    this.canvas = canvas
    this.status = status

    // Default update rate.
    this.update_rate = 50
    this.update_interval = null
  }

  connect(client: Client) {
    // Give the Client enough data to identify itself.
    client.server = this
    client.entity_id = this.clients.length
    this.clients.push(client)

    // Create a new Entity for this Client.
    const entity = new Entity()
    this.entities.push(entity)
    entity.entity_id = client.entity_id!

    // Set the initial state of the Entity (e.g. spawn point)
    const spawn_points = [4, 6]
    entity.x = spawn_points[client.entity_id!]
  }

  setServerUpdate() {
    if (this.update_interval) {
      clearInterval(this.update_interval)
    }
    this.update_interval = setInterval(() => {
      this.update()
    }, this.update_rate)
  }
  update() {
    // Listen to clients.
    this.processClientMessages()
    this.sendWorldState()
    renderWorld(this.canvas, this.entities)
  }

  // Process all pending messages from clients.
  processClientMessages() {
    while (true) {
      const message = this.network.receive()
      if (!message) {
        break
      }

      // Update the state of the entity, based on its input.
      // We just ignore inputs that don't look valid; this is what prevents clients from cheating.
      if (this.validateInput(message)) {
        const id = message.entity_id
        this.entities[id].applyInput(message)
        this.last_processed_input[id] = message.input_sequence_number
      }
    }
    // Show some info.
    let info = 'Last acknowledged input: '
    for (let i = 0; i < this.clients.length; ++i) {
      info += 'Player ' + i + ': #' + (this.last_processed_input[i] || 0) + '   '
    }
    this.status.textContent = info
  }

  // Check whether this input seems to be valid (e.g. "make sense" according
  // to the physical rules of the World)
  validateInput(input) {
    if (Math.abs(input.press_time) > 1 / 40) {
      return false
    }
    return true
  }

  sendWorldState() {
    // Send the world state to all the connected clients.
    let world_state = []
    let num_clients = this.clients.length
    for (let i = 0; i < num_clients; i++) {
      let entity = this.entities[i]
      world_state.push({
        entity_id: entity.entity_id,
        position: entity.x,
        last_processed_input: this.last_processed_input[i]
      })
    }

    // Broadcast the state to all the clients.
    for (let i = 0; i < num_clients; i++) {
      let client = this.clients[i]
      client.network.send(client.lag, world_state)
    }
  }
}

function keyHandler(e, player1, player2) {
  let input = e.type == 'keydown'
  switch (e.key) {
    case 'a':
      player1.key_left = input
      break
    case 'd':
      player1.key_right = input
      break
    case 'q':
      player2.key_left = input
      break
    case 'e':
      player2.key_right = input
      break
  }
}

function renderWorld(canvas, entities) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = canvas.width

  const colours = ['blue', 'red']

  for (const entity_id in entities) {
    const entity = entities[entity_id]
    const radius = (canvas.height * 0.9) / 2
    const x = (entity.x / 10.0) * canvas.width

    ctx.beginPath()
    ctx.arc(x, canvas.height / 2, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = colours[entity_id]
    ctx.fill()
    ctx.lineWidth = 5
    ctx.strokeStyle = 'dark' + colours[entity_id]
    ctx.stroke()
  }
}

// Create instances of Client and Server
const player1Canvas = ref<HTMLCanvasElement | null>(null)
const player1Status = ref<HTMLElement | null>(null)
const player2Canvas = ref<HTMLCanvasElement | null>(null)
const player2Status = ref<HTMLElement | null>(null)
const serverCanvas = ref<HTMLCanvasElement | null>(null)
const serverStatus = ref<HTMLElement | null>(null)

onMounted(() => {
  const server = new Server(serverCanvas.value, serverStatus.value)

  let player1 = new Client(player1Canvas.value, player1Status.value)
  let player2 = new Client(player2Canvas.value, player2Status.value)

  server.connect(player1)
  // server.connect(player2)

  player1.connectToServer()

  server.setServerUpdate()
  player1.setClientUpdate()
  player2.setClientUpdate()

  window.addEventListener('keydown', (e) => keyHandler(e, player1, player2))
  window.addEventListener('keyup', (e) => keyHandler(e, player1, player2))
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyHandler)
  window.removeEventListener('keyup', keyHandler)
  if (player1) clearInterval(player1.update_interval)
  if (player2) clearInterval(player2.update_interval)
})
</script>

<template>
  <div class="main">
    <div style="border: 5px solid blue; padding: 15px">
      <canvas height="75" ref="player1Canvas" width="920"></canvas>
      <div ref="player1Status" style="font-family: courier">Waiting for connection…</div>
    </div>
    <div style="height: 1em"></div>
    <div style="border: 2px solid grey; padding: 15px">
      <canvas height="75" ref="serverCanvas" width="920"></canvas>
      <div ref="serverStatus" style="font-family: courier"></div>
    </div>
    <div style="height: 1em"></div>
    <div style="border: 5px solid red; padding: 15px">
      <canvas height="75" ref="player2Canvas" width="920"></canvas>
      <div ref="player2Status" style="font-family: courier">Waiting for connection…</div>
    </div>
  </div>
</template>

<style scoped></style>
