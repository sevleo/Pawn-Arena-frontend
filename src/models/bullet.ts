import { BULLET_SPEED } from '@/config/gameConstants'
import { gameState } from '@/services/gameState'

class Bullet {
  bullet_id: number | null
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
  initialPosition: {
    x: number
    y: number
  } | null
  clientCalculatedPosition: {
    x: number
    y: number
  } | null

  constructor(
    bullet_id: number | null,
    entity_id: number,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    initialPosition: { x: number; y: number } | null
  ) {
    this.bullet_id = bullet_id !== null ? bullet_id : null
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
    this.initialPosition = initialPosition !== null ? initialPosition : null
    this.clientCalculatedPosition = null

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
  updateClientPosition() {
    if (this.clientCalculatedPosition === null) {
      this.clientCalculatedPosition = this.initialPosition
    } else {
      this.clientCalculatedPosition.x +=
        (this.direction.x / Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)) * this.speed
      this.clientCalculatedPosition.y +=
        (this.direction.y / Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)) * this.speed
    }
  }
}

export default Bullet
