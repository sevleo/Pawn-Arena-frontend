import { type Ref } from 'vue'
import { getClientId, getDefaultMousePosition } from '@/services/webSocket'
import { type allPawns } from '@/types/allPawns'
import { sendFaceDirectionUpdate } from '@/services/webSocket'
import { mousePosition, faceDirection, clientPosition } from '@/sharedState'

let context: CanvasRenderingContext2D | null = null
let mouseMoved = false

const GRID_SIZE = 50

// Store previous direction to compare
let previousDirectionX: number | null = null
let previousDirectionY: number | null = null

// Define a tolerance for floating-point comparisons
const TOLERANCE = 0.01

export function initializeCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>
): CanvasRenderingContext2D | null {
  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
    canvasRef.value.addEventListener('mousemove', updateMousePosition)
  }
  return context
}

export function drawPositions(
  canvasRef: Ref<HTMLCanvasElement | null>,
  allPawns: allPawns,
  bullets: {
    clientid: string
    position: { x: number; y: number }
    radius: number
    angle: number
    height: number
    width: number
  }[]
) {
  if (context && canvasRef.value) {
    context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    context.fillStyle = '#333300' // Set your desired background color here
    context.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    const cameraX = clientPosition.value.x - canvasRef.value.width / 2
    const cameraY = clientPosition.value.y - canvasRef.value.height / 2

    // console.log(clientPosition.value.x)
    // console.log(cameraX)

    // Draw Controllable Units
    Object.entries(allPawns).forEach(([, value]) => {
      // console.log(value)

      if (context) {
        context.fillStyle = value.clientId === getClientId() ? 'green' : 'white'
        context.beginPath() // Start a new path
        context.arc(
          value.position.x - cameraX,
          value.position.y - cameraY,
          value.radius,
          0,
          Math.PI * 2
        ) // Draw a circle with radius 10
        context.fill() // Fill the circle with the current fill style

        let targetPosition
        let weaponPosition
        const lineLength = 30

        if (value.clientId === getClientId()) {
          const defaultMousePosition = getDefaultMousePosition()

          const targetX = (mouseMoved ? mousePosition.value.x : defaultMousePosition.x) + cameraX
          const targetY = (mouseMoved ? mousePosition.value.y : defaultMousePosition.y) + cameraY

          // Direction from current object coordinates to target coordinates
          const directionX = targetX - value.position.x
          const directionY = targetY - value.position.y

          const magnitude = Math.sqrt(directionX * directionX + directionY * directionY)

          weaponPosition = {
            x: value.position.x + (directionX / magnitude) * lineLength,
            y: value.position.y + (directionY / magnitude) * lineLength
          }

          targetPosition = {
            x: targetX,
            y: targetY
          }

          faceDirection.value.directionX = directionX
          faceDirection.value.directionY = directionY

          // Compare with previous direction and update if changed
          if (
            !areValuesApproximatelyEqual(directionX, previousDirectionX) ||
            !areValuesApproximatelyEqual(directionY, previousDirectionY)
          ) {
            sendFaceDirectionUpdate({
              directionX: directionX,
              directionY: directionY
            })

            previousDirectionX = directionX
            previousDirectionY = directionY
          }

          // sendFaceDirectionUpdate({
          //   directionX: directionX,
          //   directionY: directionY
          // })

          // console.log(value.position.x)
          // console.log(directionX)
          // console.log(magnitude)
          // console.log(weaponPosition)
          // console.log(targetPosition)
        } else {
          // Use the provided direction
          const direction = value.direction || { directionX: 0, directionY: 0 }

          const magnitude = Math.sqrt(
            direction.directionX * direction.directionX +
              direction.directionY * direction.directionY
          )

          weaponPosition = {
            x: value.position.x + (direction.directionX / magnitude) * lineLength,
            y: value.position.y + (direction.directionY / magnitude) * lineLength
          }

          targetPosition = {
            x: value.position.x + direction.directionX,
            y: value.position.y + direction.directionY
          }
        }

        // Draw the weapon position line
        context.save() // Save the current state
        context.strokeStyle = 'black'
        context.lineWidth = 1 // Set specific line width for weapon line
        context.beginPath()
        context.moveTo(value.position.x - cameraX, value.position.y - cameraY)
        context.lineTo(weaponPosition.x - cameraX, weaponPosition.y - cameraY)
        context.stroke()
        context.restore() // Restore the previous state
      }
    })

    // Draw Bullets
    bullets.forEach((bullet) => {
      if (context) {
        context.fillStyle = 'gray'
        context.save()
        context.translate(bullet.position.x - cameraX, bullet.position.y - cameraY)
        context.rotate(bullet.angle) // Rotate based on the bullet's angle
        context.fillRect(-bullet.height / 2, -bullet.width / 2, bullet.height, bullet.width) // Draw rectangle centered
        context.restore()
      }
    })
    if (canvasRef.value) {
      drawGrid(canvasRef.value.width, canvasRef.value.height, cameraX, cameraY)
    }
  }
}

function updateMousePosition(event: MouseEvent) {
  if (context) {
    const rect = context.canvas.getBoundingClientRect()
    mousePosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    mouseMoved = true
  }
}

function drawGrid(canvasWidth: number, canvasHeight: number, cameraX: number, cameraY: number) {
  if (context) {
    context.strokeStyle = 'gray'
    context.lineWidth = 0.2

    // Define the boundaries of the game area
    const GAME_WIDTH = 2000
    const GAME_HEIGHT = 2000

    // Determine the visible area based on the camera position
    const visibleXStart = Math.max(cameraX, 0)
    const visibleYStart = Math.max(cameraY, 0)
    const visibleXEnd = Math.min(cameraX + canvasWidth, GAME_WIDTH)
    const visibleYEnd = Math.min(cameraY + canvasHeight, GAME_HEIGHT)

    // Determine where to start drawing grid lines based on the camera position
    const startX = Math.floor(visibleXStart / GRID_SIZE) * GRID_SIZE
    const startY = Math.floor(visibleYStart / GRID_SIZE) * GRID_SIZE

    // Draw vertical lines
    for (let x = -startX; x <= visibleXEnd; x += GRID_SIZE) {
      context.beginPath()
      context.moveTo(x - cameraX, Math.max(visibleYStart - cameraY, 0))
      context.lineTo(x - cameraX, Math.min(visibleYEnd - cameraY, canvasHeight))
      context.stroke()
    }

    // Draw horizontal lines
    for (let y = startY; y <= visibleYEnd; y += GRID_SIZE) {
      context.beginPath()
      context.moveTo(Math.max(visibleXStart - cameraX, 0), y - cameraY)
      context.lineTo(Math.min(visibleXEnd - cameraX, canvasWidth), y - cameraY)
      context.stroke()
    }
  }
}

// Function to compare two values with tolerance
function areValuesApproximatelyEqual(value1: number, value2: number | null): boolean {
  if (value2 === null) return false
  return Math.abs(value1 - value2) < TOLERANCE
}
