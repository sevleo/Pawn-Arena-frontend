import Entity from '@/models/entity'
import { gameState, reconcile } from '@/services/gameState'
import { Body } from 'matter-js'

const messages: any = []

function processServerMessages(world: any) {
  while (messages.length > 0) {
    const message = getMessage()
    if (message) {
      // console.log(message)
      for (const state of message.data) {
        if (!gameState.entities[state.entity_id]) {
          const entity = new Entity(world)
          entity.entity_id = state.entity_id
          gameState.entities[state.entity_id] = entity
        }
        const entity = gameState.entities[state.entity_id]
        if (state.entity_id == gameState.entity_id) {
          // Received the authoritative position of this client's entity.
          // entity.position.x = state.position.x
          // entity.position.y = state.position.y

          // Use Body.setPosition to update the position safely
          Body.setPosition(entity.entityBody, {
            x: state.position.x,
            y: state.position.y
          })

          // Reset the velocity to prevent it from flying off
          // Body.setVelocity(entity.entityBody, { x: 0, y: 0 })

          // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
          reconcile(entity, state)
        } else {
          // Received the position of an entity other than this client's.
          // Add it to the position buffer for interpolation.
          const timestamp = Date.now()
          const timestampDifference = timestamp - message.ts
          entity.position_buffer.push([message.ts + timestampDifference, state.position])
        }
      }
    }
  }
}

export default { processServerMessages, messages }

function getMessage() {
  for (let i = 0; i < messages.length; i++) {
    // Access each message in the queue.
    const message = messages[i]
    // // Check if the message's designated reception time has passed or is equal to the current time.
    messages.splice(i, 1)
    return message.payload
  }
}
