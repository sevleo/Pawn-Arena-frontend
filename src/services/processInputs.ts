import { gameState } from './gameState'
import { type Input } from '@/types/Input'
import { Body } from 'matter-js'

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
      down: gameState.key_down
    },
    input_sequence_number: null
  }

  if (
    !input.active_keys.right &&
    !input.active_keys.left &&
    !input.active_keys.up &&
    !input.active_keys.down
  ) {
    return
  }

  // Send the input to the server.
  input.input_sequence_number = gameState.input_sequence_number++
  gameState.socket.send(JSON.stringify({ type: 'input', data: input }))

  // Do client-side prediction.
  if (gameState.entity_id !== null) {
    const entity = gameState.entities[gameState.entity_id]
    entity.applyInput(input)

    // const xVelocity = input.active_keys.right
    //   ? entity.speed
    //   : input.active_keys.left
    //     ? -entity.speed
    //     : 0
    // const yVelocity = input.active_keys.up
    //   ? -entity.speed
    //   : input.active_keys.down
    //     ? entity.speed
    //     : 0

    // // Predict new position based on velocity and delta time
    // entity.position.x += xVelocity * dt_sec
    // entity.position.y += yVelocity * dt_sec

    // Apply predicted position
    // Body.setPosition(entity.entityBody, entity.position)
  }

  // Save this input for later reconciliation.
  gameState.pending_inputs.push(input)
}

export { processInputs }
