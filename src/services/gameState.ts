import { processInputs } from './processInputs'
import serverMessages from './processServerMessages'

// Input state.
const key_left = false
const key_right = false
const last_ts: any = null

// Unique ID of our entity. Assigned by Server on connection.
const gameState = {
  entities: [] as any,
  entity_id: null as any,
  status: { textContent: null as any } as any
}
// const entity_id: any = null

// Data needed for reconciliation.
const input_sequence_number = 0
const pending_inputs: any = []

// UI.
let canvas: any

// Update rate.
const update_interval: any = null

let socket: any

// Update Client state.
function updateGameState() {
  // Listen to the server.
  serverMessages.processServerMessages()

  // console.log(entity_id)
  if (gameState.entity_id == null) return // Not connected yet

  processInputs()
  interpolate()

  // Show some info.
  const info = `Non-acknowledged inputs: ${pending_inputs.length}`
  gameState.status.textContent = info
}

function interpolate() {
  // Compute render timestamp.
  const now = Date.now()
  const render_timestamp = now - 500

  for (const i in gameState.entities) {
    const entity = gameState.entities[i]

    // No point in interpolating this client's entity.
    if (entity.entity_id == gameState.entity_id) {
      continue
    }

    // Find the two authoritative positions surrounding the rendering timestamp.
    const buffer = entity.position_buffer

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

function reconcile(entity, state) {
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
}

export default {
  key_left,
  key_right,
  gameState,
  input_sequence_number,
  pending_inputs,
  canvas,
  last_ts,
  update_interval,
  socket,
  interpolate,
  reconcile,
  updateGameState
}
