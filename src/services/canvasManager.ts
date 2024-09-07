import { gameState } from './gameState'
import { CANVAS_HEIGHT, CANVAS_WIDTH, GRID_SIZE } from '@/config/gameConstants'

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
  }

  // for (const entity of gameState.entities) {
  gameState.entities.forEach((entity: any) => {
    // console.log(gameState.entities)
    if (entity && entity.position !== null) {
      const color = gameState.entity_id === entity.entity_id ? 'green' : 'red'
      const radius = 10

      // Draw entity
      if (gameState.context) {
        gameState.context.beginPath()
        gameState.context.arc(entity.position.x, entity.position.y, radius, 0, 2 * Math.PI)
        gameState.context.fillStyle = color
        gameState.context.fill()
        gameState.context.lineWidth = 1
        gameState.context.strokeStyle = 'black'
        gameState.context.stroke()
      }

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
      if (gameState.context) {
        gameState.context.strokeStyle = 'black'
        gameState.context.lineWidth = 1 // Set specific line width for weapon line
        gameState.context.beginPath()
        gameState.context.moveTo(entity.position.x, entity.position.y)
        gameState.context.lineTo(weaponPosition.x, weaponPosition.y)
        gameState.context.stroke()
        gameState.context.restore() // Restore the previous state
      }
    }
  })

  // Draw Bullets
  for (const bullet of gameState.clientBullets.values()) {
    if (bullet) {
      const color = 'yellow'
      const radius = 1.5

      // Draw bullet
      if (gameState.context) {
        gameState.context.beginPath()
        gameState.context.arc(bullet.position.x, bullet.position.y, radius, 0, 2 * Math.PI)
        gameState.context.fillStyle = color
        gameState.context.fill()
      }
    }
  }

  for (const bullet of gameState.gameBullets.values()) {
    if (
      bullet &&
      bullet.clientCalculatedPosition !== null &&
      gameState.entity_id !== bullet.entity_id
    ) {
      // console.log(bullet.clientCalculatedPosition)
      // console.log(bullet.clientDirection)
      const color = 'yellow'
      const radius = 1.5

      // Draw bullet
      if (gameState.context) {
        gameState.context.beginPath()
        gameState.context.arc(
          bullet.clientCalculatedPosition.x,
          bullet.clientCalculatedPosition.y,
          radius,
          0,
          2 * Math.PI
        )
        gameState.context.fillStyle = color
        gameState.context.fill()
      }
    }
  }

  drawGrid()
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

// function drawGrid(canvasWidth: number, canvasHeight: number, cameraX: number, cameraY: number) {
//   if (gameState.context) {
//     gameState.context.strokeStyle = 'gray'
//     gameState.context.lineWidth = 0.2

//     // Define the boundaries of the game area
//     const GAME_WIDTH = 2000
//     const GAME_HEIGHT = 2000

//     // Determine the visible area based on the camera position
//     const visibleXStart = Math.max(cameraX, 0)
//     const visibleYStart = Math.max(cameraY, 0)
//     const visibleXEnd = Math.min(cameraX + canvasWidth, GAME_WIDTH)
//     const visibleYEnd = Math.min(cameraY + canvasHeight, GAME_HEIGHT)

//     // Determine where to start drawing grid lines based on the camera position
//     const startX = Math.floor(visibleXStart / GRID_SIZE) * GRID_SIZE
//     const startY = Math.floor(visibleYStart / GRID_SIZE) * GRID_SIZE

//     // Draw vertical lines
//     for (let x = -startX; x <= visibleXEnd; x += GRID_SIZE) {
//       gameState.context.beginPath()
//       gameState.context.moveTo(x - cameraX, Math.max(visibleYStart - cameraY, 0))
//       gameState.context.lineTo(x - cameraX, Math.min(visibleYEnd - cameraY, canvasHeight))
//       gameState.context.stroke()
//     }

//     // Draw horizontal lines
//     for (let y = startY; y <= visibleYEnd; y += GRID_SIZE) {
//       gameState.context.beginPath()
//       gameState.context.moveTo(Math.max(visibleXStart - cameraX, 0), y - cameraY)
//       gameState.context.lineTo(Math.min(visibleXEnd - cameraX, canvasWidth), y - cameraY)
//       gameState.context.stroke()
//     }
//   }
// }

function drawGrid() {
  if (gameState.context) {
    gameState.context.strokeStyle = 'gray'
    gameState.context.lineWidth = 0.2

    // Determine where to start drawing grid lines based on the canvas size
    const startX = Math.floor(-gameState.canvas.width / 2 / GRID_SIZE) * GRID_SIZE
    const startY = Math.floor(-gameState.canvas.height / 2 / GRID_SIZE) * GRID_SIZE

    // Draw vertical lines
    for (let x = startX; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      gameState.context.beginPath()
      gameState.context.moveTo(x, 0)
      gameState.context.lineTo(x, CANVAS_HEIGHT)
      gameState.context.stroke()
    }

    // Draw horizontal lines
    for (let y = startY; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      gameState.context.beginPath()
      gameState.context.moveTo(0, y)
      gameState.context.lineTo(CANVAS_WIDTH, y)
      gameState.context.stroke()
    }
  }
}
