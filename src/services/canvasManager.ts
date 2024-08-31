import { gameState } from './gameState'

export function initializeCanvas() {
  if (gameState.canvas) {
    gameState.context = gameState.canvas.getContext('2d')
    gameState.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      //   console.log(e)
      updateMousePosition(e)
    })
  }
}

function updateMousePosition(event: MouseEvent) {
  if (gameState.context) {
    const rect = gameState.context.canvas.getBoundingClientRect()
    gameState.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    gameState.mouseMoved = true
  }
}

export function renderWorld() {
  if (gameState.context) {
    gameState.context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height)
    gameState.context.fillStyle = '#333300' // Set your desired background color here
    gameState.context.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height)

    for (const entity of gameState.entities) {
      if (entity) {
        // console.log(entity)
        const color = gameState.entity_id === entity.entity_id ? 'green' : 'red'
        const radius = 10

        // const x = (entity.x / 10.0) * gameState.canvas.width

        gameState.context.beginPath()
        gameState.context.arc(entity.position.x, entity.position.y, radius, 0, 2 * Math.PI)
        gameState.context.fillStyle = color
        gameState.context.fill()
        gameState.context.lineWidth = 1
        gameState.context.strokeStyle = 'black'
        gameState.context.stroke()

        let targetPosition
        let weaponPosition
        const lineLength = 30

        if (gameState.entity_id === entity.entity_id) {
          const defaultMousePosition = { x: 0, y: 0 }

          const targetX = gameState.mouseMoved ? gameState.mousePosition.x : defaultMousePosition.x
          const targetY = gameState.mouseMoved ? gameState.mousePosition.y : defaultMousePosition.y

          gameState.previousFaceDirection.x = gameState.faceDirection.x
          gameState.previousFaceDirection.y = gameState.faceDirection.y

          // Direction from current object coordinates to target coordinates
          gameState.faceDirection.x = targetX - entity.position.x
          gameState.faceDirection.y = targetY - entity.position.y

          const magnitude = Math.sqrt(
            gameState.faceDirection.x * gameState.faceDirection.x +
              gameState.faceDirection.y * gameState.faceDirection.y
          )

          weaponPosition = {
            x: entity.position.x + (gameState.faceDirection.x / magnitude) * lineLength,
            y: entity.position.y + (gameState.faceDirection.y / magnitude) * lineLength
          }

          targetPosition = {
            x: targetX,
            y: targetY
          }

          // Extend the line far beyond the canvas boundaries
          const lineLength2 = Math.max(gameState.canvas.width, gameState.canvas.height) * 2

          const extendedPosition = {
            x: entity.position.x + (gameState.faceDirection.x / magnitude) * lineLength2,
            y: entity.position.y + (gameState.faceDirection.y / magnitude) * lineLength2
          }

          gameState.context.save() // Save the current state
          gameState.context.strokeStyle = 'red'
          gameState.context.lineWidth = 1 // Set specific line width for weapon line
          gameState.context.beginPath()
          gameState.context.moveTo(entity.position.x, entity.position.y)
          gameState.context.lineTo(extendedPosition.x, extendedPosition.y)
          gameState.context.stroke()

          gameState.context.strokeStyle = 'black'
          gameState.context.lineWidth = 1 // Set specific line width for weapon line
          gameState.context.beginPath()
          gameState.context.moveTo(entity.position.x, entity.position.y)
          gameState.context.lineTo(weaponPosition.x, weaponPosition.y)
          gameState.context.stroke()
          gameState.context.restore() // Restore the previous state
        } else {
          const magnitude = Math.sqrt(
            entity.faceDirection.x * entity.faceDirection.x +
              entity.faceDirection.y * entity.faceDirection.y
          )

          weaponPosition = {
            x: entity.position.x + (entity.faceDirection.x / magnitude) * lineLength,
            y: entity.position.y + (entity.faceDirection.y / magnitude) * lineLength
          }

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
}
