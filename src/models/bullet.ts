import { BULLET_SPEED } from '@/config/gameConstants'
import { gameState } from '@/services/gameState'

class Bullet {
  entity_id: number
  position: {
    x: number
    y: number
  }
  direction: {
    x: number
    y: number
  }
  speed: number

  constructor(
    entity_id: number,
    position: { x: number; y: number },
    direction: { x: number; y: number }
  ) {
    this.entity_id = entity_id
    this.position = {
      x: position.x,
      y: position.y
    }
    this.direction = {
      x: direction.x,
      y: direction.y
    }
    this.speed = BULLET_SPEED
    // console.log('gg')
    // console.log(this.position)
    // console.log(this.direction)
  }

  updatePosition() {
    this.position.x +=
      (this.direction.x / Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)) * this.speed
    this.position.y +=
      (this.direction.y / Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)) * this.speed
    // console.log(this.position)
  }
}

export default Bullet
