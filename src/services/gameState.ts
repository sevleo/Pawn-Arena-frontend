import { processInputs } from './processInputs'
import serverMessages from './processServerMessages'
import { INTERPOLATION_OFFSET } from '@/config/gameConstants'

// Unique ID of our entity. Assigned by Server on connection.
const gameState = {
  entities: [] as any,
  key_left: false as boolean,
  key_right: false as boolean,
  key_up: false as boolean,
  key_down: false as boolean,
  last_ts: null as any,
  entity_id: null as any,
  input_sequence_number: 0 as number,
  pending_inputs: [] as any,
  status: { textContent: null as any } as any,
  canvas: {} as any,
  context: null as CanvasRenderingContext2D | null,
  update_interval: null as any,
  socket: null as any
}

// Update Client state.
function updateGameState() {
  // Listen to the server.
  serverMessages.processServerMessages()

  // console.log(entity_id)
  if (gameState.entity_id == null) return // Not connected yet

  processInputs()
  interpolate()

  // Show some info.
  const info = `Non-acknowledged inputs: ${gameState.pending_inputs.length}`
  gameState.status.textContent = info
}

function interpolate() {
  // Compute render timestamp.
  const now = Date.now()
  const render_timestamp = now - INTERPOLATION_OFFSET

  for (const i in gameState.entities) {
    const entity = gameState.entities[i]

    // No point in interpolating this client's entity.
    if (entity.entity_id == gameState.entity_id) {
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
      const [t0, p0] = buffer[0] // represent the earlier timestamp and position.
      const [t1, p1] = buffer[1] // represent the later timestamp and position.

      entity.position.x = p0.x + ((p1.x - p0.x) * (render_timestamp - t0)) / (t1 - t0)
      entity.position.y = p0.y + ((p1.y - p0.y) * (render_timestamp - t0)) / (t1 - t0)
    }
  }
}

function reconcile(entity: any, state: any) {
  let j = 0
  while (j < gameState.pending_inputs.length) {
    const input = gameState.pending_inputs[j]
    if (input.input_sequence_number <= state.last_processed_input) {
      // Already processed. Its effect is already taken into account into the world update
      // we just got, so we can drop it.
      gameState.pending_inputs.splice(j, 1)
    } else {
      // Not processed by the server yet. Re-apply it.
      entity.applyInput(input)
      j++
    }
  }
}

export { gameState, updateGameState, reconcile }
