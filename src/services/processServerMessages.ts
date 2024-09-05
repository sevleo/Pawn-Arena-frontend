import Entity from '@/models/entity'
import { gameState, reconcile } from '@/services/gameState'
import Bullet from '@/models/bullet'

const messages: any = []

function processServerMessages() {
  while (messages.length > 0) {
    const message = getMessage()
    if (message) {
      console.log(message)
      console.log(gameState.gameBullets)
      console.log(gameState.clientBullets)
      for (const bull of message.data.removedBullets) {
        for (const gameBull of gameState.gameBullets) {
          if (gameBull !== undefined) {
            if (gameBull.bullet_id === bull.bullet_id) {
              console.log('need to delete it')
              // Remove the bullet from gameBullets
              delete gameState.gameBullets[gameBull.bullet_id]
            }
          }
        }
        for (const clientBull of gameState.clientBullets) {
          if (clientBull !== undefined) {
            if (clientBull.bullet_id === bull.bullet_id) {
              console.log('need to delete it')
              // Remove the bullet from gameBullets
              delete gameState.clientBullets[clientBull.bullet_id]
            }
          }
        }
      }
      // console.log(gameState.gameBullets)
      // console.log(gameState.entities)
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
          for (const clientBull of gameState.clientBullets) {
            if (clientBull) {
              if (clientBull.bullet_sequence_number === bull.bullet_sequence_number) {
                clientBull.bullet_id = bull.bullet_id
              }
            }
          }
        }
        // if (gameState.entity_id !== bull.entity_id) {
        // if (gameState.gameBullets[bull.bullet_id]) {
        //   console.log('this bullet exists')
        // } else {
        //   console.log('this bullet does not exist yet, so lets create it')
        //   gameState.gameBullets[bull.bullet_id] = bull
        // }
        // gameState.gameBullets[bull.bullet_id] = bull
        if (gameState.gameBullets[bull.bullet_id]) {
          continue
        } else {
          // console.log(bull.entity_id)
          // console.log('new bullet')
          // console.log(bull.initialPosition)
          const entity = gameState.entities[bull.entity_id]

          const bullet = new Bullet(
            bull.bullet_id,
            bull.entity_id,
            bull.serverPosition,
            bull.direction,
            entity?.position,
            // bull.initialPosition,
            // { x: 500, y: 500 },
            // bull.entity_id.position,
            bull.mousePosition,
            bull.newBullet,
            bull.bullet_sequence_number
          )
          // console.log(bullet)
          gameState.gameBullets[bull.bullet_id] = bullet
          // console.log(bullet)
          // console.log(bull.mousePosition)
          // console.log(gameState.entities[gameState.entity_id].position)
          // console.log(bull.initialPosition)
        }
        // }
      }

      // for (const )
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
