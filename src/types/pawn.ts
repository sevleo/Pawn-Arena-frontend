export interface Pawn {
  direction: { x: number; y: number }
  radius: number
  clientId: string
  position: {
    x: number
    y: number
  }
  timeStamp: number
}
