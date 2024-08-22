import { gameState } from './gameState'

export function initializeCanvas() {
  if (gameState.canvas) {
    gameState.context = gameState.canvas.getContext('2d')
    gameState.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      console.log(e)
    })
  }
}

export function renderWorld() {
  if (!gameState.canvas) return
  const ctx = gameState.canvas.getContext('2d')
  if (!ctx) return

  // eslint-disable-next-line no-self-assign
  gameState.canvas.width = gameState.canvas.width

  for (const entity_id in gameState.entities) {
    const color = gameState.entity_id.toString() === entity_id ? 'green' : 'red'
    const entity = gameState.entities[entity_id]
    const radius = 10
    const x = (entity.x / 10.0) * gameState.canvas.width

    ctx.beginPath()
    ctx.arc(x, gameState.canvas.height / 2, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
    ctx.lineWidth = 5
    ctx.strokeStyle = color
    ctx.stroke()
  }
}
