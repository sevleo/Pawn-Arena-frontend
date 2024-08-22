import { gameState } from './gameState'

// Get inputs and send them to the server
function processInputs() {
  // Compute delta time since last update.
  const now_ts = Date.now()
  gameState.last_ts = gameState.last_ts || now_ts
  const dt_sec = (now_ts - gameState.last_ts) / 1000.0
  gameState.last_ts = now_ts

  // Package player's input.
  let input: any

  switch (true) {
    case gameState.key_right:
      input = { press_time: dt_sec, direction: 'right' }
      break
    case gameState.key_left:
      input = { press_time: dt_sec, direction: 'left' }
      break
    case gameState.key_up:
      input = { press_time: dt_sec, direction: 'up' }
      break
    case gameState.key_down:
      input = { press_time: dt_sec, direction: 'down' }
      break
    default:
      return
  }

  // Send the input to the server.
  input.input_sequence_number = gameState.input_sequence_number++
  gameState.socket.send(JSON.stringify({ type: 'input', data: input }))

  // Do client-side prediction.
  if (gameState.entity_id !== null) {
    gameState.entities[gameState.entity_id].applyInput(input)
  }

  // Save this input for later reconciliation.
  gameState.pending_inputs.push(input)
}

export { processInputs }
