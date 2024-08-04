import { ref } from 'vue'

export const mousePosition = ref<{ x: number; y: number }>({ x: 0, y: 0 })
export const faceDirection = ref<{ directionX: number; directionY: number }>({
  directionX: 0,
  directionY: 0
})
export const clientPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 })

export const clientMostRecentPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 })
