import { gameState } from './gameState'
import { type Input } from '@/types/Input'

// Get inputs and send them to the server
function processInputs() {
  // Compute delta time since last update.
  const now_ts = Date.now()
  gameState.last_ts = gameState.last_ts || now_ts
  const dt_sec = (now_ts - gameState.last_ts) / 1000.0
  gameState.last_ts = now_ts

  // Package player's input.
  const input: Input = {
    press_time: dt_sec,
    active_keys: {
      right: gameState.key_right,
      left: gameState.key_left,
      up: gameState.key_up,
      down: gameState.key_down,
      space: gameState.key_space
    },
    input_sequence_number: null,
    faceDirection: {
      x: gameState.faceDirection.x,
      y: gameState.faceDirection.y
    },
    mousePosition: gameState.mousePosition
  }

  if (
    !input.active_keys.right &&
    !input.active_keys.left &&
    !input.active_keys.up &&
    !input.active_keys.down &&
    !input.active_keys.space &&
    input.faceDirection.x === gameState.previousFaceDirection.x &&
    input.faceDirection.y === gameState.previousFaceDirection.y
  ) {
    return
  }

  // Send the input to the server.
  input.input_sequence_number = gameState.input_sequence_number++
  gameState.socket.send(JSON.stringify({ type: 'input', data: input }))

  // Do client-side prediction.
  if (gameState.entity_id !== null) {
    gameState.entities[gameState.entity_id]?.applyInput(input)
    // gameState.entities[gameState.entity_id]?.updateFaceDirection(
    //   gameState.mouseMoved ? gameState.mousePosition : null
    // )
  }

  // Save this input for later reconciliation.
  gameState.pending_inputs.push(input)
}

export { processInputs }
