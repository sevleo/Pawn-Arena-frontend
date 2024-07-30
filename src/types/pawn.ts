export interface Pawn {
  direction: { directionX: number; directionY: number }
  radius: number
  clientId: string
  position: {
    x: number
    y: number
  }
}
