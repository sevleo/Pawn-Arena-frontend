import { gameState } from './gameState'

export function initializeCanvas() {
  if (gameState.canvas) {
    gameState.context = gameState.canvas.getContext('2d')
    gameState.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      //   console.log(e)
    })
  }
}

export function renderWorld() {
  if (gameState.context) {
    gameState.context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height)
    gameState.context.fillStyle = '#333300' // Set your desired background color here
    gameState.context.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height)

    for (const entity of gameState.entities) {
      if (entity) {
        const color = gameState.entity_id === entity.entity_id ? 'green' : 'red'
        const radius = 10

        // const x = (entity.x / 10.0) * gameState.canvas.width

        gameState.context.beginPath()
        gameState.context.arc(
          entity.entityBody.position.x,
          entity.entityBody.position.y,
          radius,
          0,
          2 * Math.PI
        )
        gameState.context.fillStyle = color
        gameState.context.fill()
        gameState.context.lineWidth = 1
        gameState.context.strokeStyle = 'black'
        gameState.context.stroke()
      }
    }
  }
}
