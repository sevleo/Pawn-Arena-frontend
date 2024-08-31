import { gameState } from './gameState'

export function initializeCanvas() {
  if (gameState.canvas) {
    gameState.context = gameState.canvas.getContext('2d')
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

        // Draw entity
        gameState.context.beginPath()
        gameState.context.arc(entity.position.x, entity.position.y, radius, 0, 2 * Math.PI)
        gameState.context.fillStyle = color
        gameState.context.fill()
        gameState.context.lineWidth = 1
        gameState.context.strokeStyle = 'black'
        gameState.context.stroke()

        let weaponPosition
        const lineLength = 30

        if (gameState.entity_id === entity.entity_id) {
          entity.updateFaceDirection(gameState.mouseMoved ? gameState.mousePosition : null)
          weaponPosition = getWeaponPosition(
            entity.position,
            gameState.faceDirection,
            getMagnitude(gameState.faceDirection.x, gameState.faceDirection.y),
            lineLength
          )
        } else {
          weaponPosition = getWeaponPosition(
            entity.position,
            entity.faceDirection,
            getMagnitude(entity.faceDirection.x, entity.faceDirection.y),
            lineLength
          )
        }

        // Draw weapon
        gameState.context.strokeStyle = 'black'
        gameState.context.lineWidth = 1 // Set specific line width for weapon line
        gameState.context.beginPath()
        gameState.context.moveTo(entity.position.x, entity.position.y)
        gameState.context.lineTo(weaponPosition.x, weaponPosition.y)
        gameState.context.stroke()
        gameState.context.restore() // Restore the previous state
      }
    }
  }
}

function getMagnitude(x: number, y: number) {
  return Math.sqrt(x * x + y * y)
}

function getWeaponPosition(
  startPos: { x: number; y: number },
  direction: { x: any; y: any },
  magnitude: number,
  length: number
) {
  return {
    x: startPos.x + (direction.x / magnitude) * length,
    y: startPos.y + (direction.y / magnitude) * length
  }
}
