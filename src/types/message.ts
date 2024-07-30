import { type Position } from './position'

export interface PositionMessage {
  type: 'position'
  data: {
    allPawns: Position[]
  }
}

export interface InitialPositionMessage {
  type: 'initial position'
  data: {
    allPawns: Position[]
    clientId: string
    position: {
      x: number
      y: number
    }
  }
}
