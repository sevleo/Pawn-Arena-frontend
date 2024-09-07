import {
  MOVEMENT_SPEED,
  BULLET_COOLDOWN,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  RADIUS
} from '@/config/gameConstants'
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
    let xChange = 0
    let yChange = 0

    if (input.active_keys.right) xChange = this.speed * input.press_time
    if (input.active_keys.left) xChange = -this.speed * input.press_time
    if (input.active_keys.up) yChange = -this.speed * input.press_time
    if (input.active_keys.down) yChange = this.speed * input.press_time

    if (xChange !== 0 || yChange !== 0) {
      const diagonalFactor = 0.7071 // Approximation of 1/√2 for 45-degree movement

      if (xChange !== 0 && yChange !== 0) {
        xChange *= diagonalFactor
        yChange *= diagonalFactor
      }

      // Update the position of the entity
      if (this.position) {
        // Calculate the new position before applying it
        const newX = this.position.x + xChange
        const newY = this.position.y + yChange

        // Boundary checks to ensure entity stays within canvas width and height
        const clampedX = Math.max(RADIUS, Math.min(newX, CANVAS_WIDTH - RADIUS))
        const clampedY = Math.max(RADIUS, Math.min(newY, CANVAS_HEIGHT - RADIUS))

        this.position = {
          x: clampedX,
          y: clampedY
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
