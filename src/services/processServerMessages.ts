import Entity from '@/models/entity'
import { gameState, reconcile } from '@/services/gameState'

const messages: any = []

function processServerMessages() {
  while (messages.length > 0) {
    const message = getMessage()
    if (message) {
      // console.log(message)
      for (const state of message.data) {
        if (!gameState.entities[state.entity_id]) {
          const entity = new Entity()
          entity.entity_id = state.entity_id
          gameState.entities[state.entity_id] = entity
        }
        const entity = gameState.entities[state.entity_id]
        if (state.entity_id == gameState.entity_id) {
          // Received the authoritative position of this client's entity.
          entity.position.x = state.position.x
          entity.position.y = state.position.y
          // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
          reconcile(entity, state)
          entity.faceDirection.x = state.faceDirection.x
          entity.faceDirection.y = state.faceDirection.y
        } else {
          // Received the position of an entity other than this client's.
          // Add it to the position buffer for interpolation.
          const timestamp = Date.now()
          const timestampDifference = timestamp - message.ts
          entity.position_buffer.push([
            message.ts + timestampDifference,
            state.position,
            state.faceDirection
          ])
          console.log(entity.position_buffer.length)

          // entity.faceDirection.x = state.faceDirection.x
          // entity.faceDirection.y = state.faceDirection.y
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
