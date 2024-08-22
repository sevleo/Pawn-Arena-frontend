import { MOVEMENT_SPEED } from '@/config/gameConstants'

class Entity {
  position: {
    x: number
    y: number
  }

  speed: number
  position_buffer: []
  entity_id: any
  constructor() {
    this.position = {
      x: 0,
      y: 0
    }
    this.speed = MOVEMENT_SPEED
    this.position_buffer = []
  }

  applyInput(input: { press_time: number; direction: string }) {
    switch (input.direction) {
      case 'right':
        this.position.x += input.press_time * this.speed
        break
      case 'left':
        this.position.x -= input.press_time * this.speed
        break
      case 'up':
        this.position.y -= input.press_time * this.speed
        break
      case 'down':
        this.position.y += input.press_time * this.speed
        break
    }
  }
}

export default Entity
