import { MOVEMENT_SPEED } from '@/config/gameConstants'

class Entity {
  x: number
  y: number
  speed: number
  position_buffer: []
  entity_id: any
  constructor() {
    this.x = 0
    this.y = 0
    this.speed = MOVEMENT_SPEED
    this.position_buffer = []
  }

  applyInput(input: { press_time: number; direction: string }) {
    this.x += input.press_time * this.speed
  }
}

export default Entity
