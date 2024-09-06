import Entity from '@/models/entity'
import { gameState, reconcile } from '@/services/gameState'
import Bullet from '@/models/bullet'

const messages: any = []

function processServerMessages() {
  while (messages.length > 0) {
    const message = getMessage()
    if (message) {
      // console.log(message)
      // console.log(gameState.gameBullets)
      // console.log(gameState.clientBullets)
      for (const ent of message.data.entities) {
        if (!gameState.entities[ent.entity_id]) {
          const entity = new Entity()
          entity.entity_id = ent.entity_id
          gameState.entities[ent.entity_id] = entity
        }
        const entity = gameState.entities[ent.entity_id]
        if (ent.entity_id == gameState.entity_id) {
          // Received the authoritative position of this client's entity.
          entity.position = { x: ent.position.x, y: ent.position.y }

          // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
          reconcile(entity, ent)
        } else {
          // Received the position of an entity other than this client's.
          // Add it to the position buffer for interpolation.
          const timestamp = Date.now()
          const timestampDifference = timestamp - message.ts
          entity.position_buffer.push([
            // message.ts + timestampDifference,
            message.ts,
            ent.position,
            ent.faceDirection
          ])
          entity.mousePosition = ent.mousePosition
        }
      }

      for (const bull of message.data.bullets) {
        if (bull.entity_id === gameState.entity_id) {
          const bullet = gameState.clientBullets.get('client-' + bull.bullet_sequence_number)
          if (bullet) {
            if (bullet.bullet_sequence_number !== null && bullet.bullet_id === null) {
              // Remove the entry with the local bullet_sequence_number

              gameState.clientBullets.delete('client-' + bullet.bullet_sequence_number)

              // Assign the correct bullet_id
              bullet.bullet_id = bull.bullet_id

              // Now store the bullet in the Map using bullet_id as the key
              gameState.clientBullets.set(bull.bullet_id, bullet)
            }
          }
        }

        if (gameState.gameBullets.has(bull.bullet_id)) {
          continue
        } else {
          const entity = gameState.entities[bull.entity_id]

          const bullet = new Bullet(
            bull.bullet_id,
            bull.entity_id,
            bull.serverPosition,
            bull.direction,
            entity?.position,
            bull.mousePosition,
            bull.newBullet,
            bull.bullet_sequence_number
          )
          gameState.gameBullets.set(bull.bullet_id, bullet)
        }
      }
      for (const bull of message.data.removedBullets) {
        // Remove from gameBullets map
        if (gameState.gameBullets.has(bull.bullet_id)) {
          gameState.gameBullets.delete(bull.bullet_id)
        }
        // Remove from clientBullets map
        if (gameState.clientBullets.has(bull.bullet_id)) {
          // console.log('Removing bullet with bullet_id')
          gameState.clientBullets.delete(bull.bullet_id)
        }
        if (gameState.clientBullets.has('client-' + (bull.bullet_sequence_number - 1))) {
          console.log('Removing bullet with bullet_sequence_number minus one')
          gameState.clientBullets.delete('client-' + (bull.bullet_sequence_number - 1))
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
