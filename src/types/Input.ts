export interface Input {
  press_time: number
  active_keys: { right: boolean; left: boolean; up: boolean; down: boolean; space: boolean }
  input_sequence_number: number | null
  faceDirection: { x: number; y: number }
}
