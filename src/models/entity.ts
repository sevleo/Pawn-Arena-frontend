import { MOVEMENT_SPEED } from '@/config/gameConstants'
import { type Input } from '@/types/Input'

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

    this.faceDirection.x = input.faceDirection.x
    this.faceDirection.y = input.faceDirection.y
  }
}

export default Entity
