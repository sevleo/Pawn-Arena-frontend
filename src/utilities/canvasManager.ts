import { type Ref } from 'vue'
import { getClientId, getDefaultMousePosition } from '@/services/webSocket'
import { type allPawns } from '@/types/allPawns'
import { sendFaceDirectionUpdate } from '@/services/webSocket'

let context: CanvasRenderingContext2D | null = null
let mousePosition = { x: 0, y: 0 }
let mouseMoved = false

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
  bullets: { clientid: string; position: { x: number; y: number }; radius: number }[]
) {
  if (context && canvasRef.value) {
    context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    // Draw Controllable Units
    Object.entries(allPawns).forEach(([, value]) => {
      // console.log(value)
      if (context) {
        context.fillStyle = value.clientId === getClientId() ? 'green' : 'white'
        context.beginPath() // Start a new path
        context.arc(value.position.x, value.position.y, value.radius, 0, Math.PI * 2) // Draw a circle with radius 10
        context.fill() // Fill the circle with the current fill style

        let targetPosition
        let weaponPosition
        const lineLength = 30

        if (value.clientId === getClientId()) {
          const defaultMousePosition = getDefaultMousePosition()

          const targetX = mouseMoved ? mousePosition.x : defaultMousePosition.x
          const targetY = mouseMoved ? mousePosition.y : defaultMousePosition.y

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

          sendFaceDirectionUpdate({
            directionX: directionX,
            directionY: directionY
          })

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

        // Draw the target position line
        // context.strokeStyle = 'red'
        // context.beginPath()
        // context.moveTo(value.position.x, value.position.y)
        // context.lineTo(targetPosition.x, targetPosition.y)
        // context.stroke()

        // console.log(value.position.x)

        // Draw the weapon position line
        context.strokeStyle = 'white'
        context.beginPath()
        context.moveTo(value.position.x, value.position.y)
        context.lineTo(weaponPosition.x, weaponPosition.y)
        context.stroke()
      }
    })

    // Draw Bullets
    bullets.forEach((bullet) => {
      if (context) {
        // context.fillStyle = 'yellow'
        // context.beginPath()
        // // context.arc(bullet.position.x, bullet.position.y, bullet.radius, 0, Math.PI * 2)
        // context.rect(bullet.position.x, bullet.position.y, bullet.width, bullet.height)
        // context.fill()

        context.fillStyle = 'gray'
        context.save()
        context.translate(bullet.position.x, bullet.position.y)
        context.rotate(bullet.angle) // Rotate based on the bullet's angle
        context.fillRect(-bullet.height / 2, -bullet.width / 2, bullet.height, bullet.width) // Draw rectangle centered
        context.restore()
      }
    })
  }
}

function updateMousePosition(event: MouseEvent) {
  if (context) {
    const rect = context.canvas.getBoundingClientRect()
    mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    mouseMoved = true
  }
}
