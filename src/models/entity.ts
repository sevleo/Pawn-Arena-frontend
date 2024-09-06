import { MOVEMENT_SPEED, BULLET_COOLDOWN } from '@/config/gameConstants'
import { gameState } from '@/services/gameState'
import { type Input } from '@/types/Input'
import Bullet from './bullet'

class Entity {
  position: {
    x: number
    y: number
  } | null
  speed: number
  position_buffer: []
  entity_id: any
  faceDirection: {
    x: number
    y: number
  }
  lastBulletTimestamp: number | null

  constructor() {
    this.position = null
    this.speed = MOVEMENT_SPEED
    this.position_buffer = []
    this.faceDirection = {
      x: 0,
      y: 0
    }
    this.lastBulletTimestamp = null
  }

  applyInput(input: Input) {
    let xForce = 0
    let yForce = 0

    if (input.active_keys.right) xForce = this.speed * input.press_time
    if (input.active_keys.left) xForce = -this.speed * input.press_time
    if (input.active_keys.up) yForce = -this.speed * input.press_time
    if (input.active_keys.down) yForce = this.speed * input.press_time

    if (xForce !== 0 || yForce !== 0) {
      const diagonalFactor = 0.7071 // Approximation of 1/√2 for 45-degree movement

      if (xForce !== 0 && yForce !== 0) {
        xForce *= diagonalFactor
        yForce *= diagonalFactor
      }

      // Update the position of the entity
      if (this.position) {
        this.position = {
          x: (this.position.x += xForce),
          y: (this.position.y += yForce)
        }
      }
    }

    if (input.active_keys.space) {
      const currentTimestamp = Date.now()

      if (
        this.lastBulletTimestamp === null || // No bullets have been fired yet
        currentTimestamp - this.lastBulletTimestamp >= BULLET_COOLDOWN // 200ms cooldown
      ) {
        if (this.position) {
          const bullet_sequence_number = gameState.bullet_sequence_number
          const bullet = new Bullet(
            null,
            this.entity_id,
            this.position,
            this.faceDirection,
            null,
            null,
            true,
            bullet_sequence_number
          )
          // gameState.clientBullets.push(bullet)
          // Use bullet_sequence_number as the key temporarily
          if (bullet.bullet_sequence_number !== null) {
            gameState.clientBullets.set('client-' + bullet.bullet_sequence_number, bullet)
            gameState.bullet_sequence_number++
          }
          this.lastBulletTimestamp = currentTimestamp // Update the last bullet timestamp
        }
      }
    }
  }

  updateFaceDirection(mousePosition: { x: number; y: number } | null) {
    const defaultMousePosition = { x: 0, y: 0 }
    const targetX = mousePosition ? mousePosition.x : defaultMousePosition.x
    const targetY = mousePosition ? mousePosition.y : defaultMousePosition.y

    gameState.previousFaceDirection.x = gameState.faceDirection.x
    gameState.previousFaceDirection.y = gameState.faceDirection.y

    // Direction from current object coordinates to target coordinates
    const clientEntity = gameState.entities.get(gameState.entity_id)
    if (clientEntity && clientEntity.position) {
      gameState.faceDirection.x = targetX - clientEntity.position.x
      gameState.faceDirection.y = targetY - clientEntity.position.y

      clientEntity.faceDirection = gameState.faceDirection
    }
    // gameState.faceDirection.x = targetX - gameState.entities[gameState.entity_id].position.x
    // gameState.faceDirection.y = targetY - gameState.entities[gameState.entity_id].position.y

    // gameState.entities[gameState.entity_id].faceDirection = gameState.faceDirection
  }
}

export default Entity
