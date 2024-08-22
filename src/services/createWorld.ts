import { Composite, Bodies } from 'matter-js'

function createWorld(world, engine) {
  engine.gravity.x = 0
  engine.gravity.y = 0
}

export { createWorld }
