import { type Pawn } from './pawn'

export interface PositionMessage {
  type: 'position'
  data: {
    allPawns: Pawn[]
  }
}

export interface InitialPositionMessage {
  type: 'initial position'
  data: {
    allPawns: Pawn[]
    clientId: string
    position: {
      x: number
      y: number
    }
  }
}
