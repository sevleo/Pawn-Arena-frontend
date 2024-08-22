import { Composite, Bodies } from 'matter-js'

function createWorld(world: any, engine: any) {
  engine.gravity.x = 0
  engine.gravity.y = 0
}

export { createWorld }
