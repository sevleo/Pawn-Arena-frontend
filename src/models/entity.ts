import { MOVEMENT_SPEED, BULLET_COOLDOWN } from '@/config/gameConstants'
import { gameState } from '@/services/gameState'
import { type Input } from '@/types/Input'
import Bullet from './bullet'

class Entity {
  position: {
    x: number
    y: number
  }
  speed: number
  position_buffer: []
  entity_id: any
  faceDirection: {
    x: number
    y: number
  }
  lastBulletTimestamp: number | null

  constructor() {
    this.position = {
      x: 0,
      y: 0
    }
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
      this.position.x += xForce
      this.position.y += yForce
    }

    if (input.active_keys.space) {
      const currentTimestamp = Date.now()

      if (
        this.lastBulletTimestamp === null || // No bullets have been fired yet
        currentTimestamp - this.lastBulletTimestamp >= BULLET_COOLDOWN // 200ms cooldown
      ) {
        const bullet = new Bullet(this.entity_id, this.position, this.faceDirection)
        gameState.bullets.push(bullet)
        this.lastBulletTimestamp = currentTimestamp // Update the last bullet timestamp
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
    gameState.faceDirection.x = targetX - gameState.entities[gameState.entity_id].position.x
    gameState.faceDirection.y = targetY - gameState.entities[gameState.entity_id].position.y

    gameState.entities[gameState.entity_id].faceDirection = gameState.faceDirection
  }
}

export default Entity
