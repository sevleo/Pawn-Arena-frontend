import { type Position } from './position'

export interface PositionMessage {
  type: 'position'
  data: {
    allPositions: Position[]
  }
}

export interface InitialPositionMessage {
  type: 'initial position'
  data: {
    allPositions: Position[]
    clientId: string
    position: {
      x: number
      y: number
    }
  }
}
