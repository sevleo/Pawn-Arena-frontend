// Local representation of the entities.
const entities: any = {}

// Input state.
const key_left = false
const key_right = false

// Unique ID of our entity. Assigned by Server on connection.
const entity_id: any = null

// Data needed for reconciliation.
const input_sequence_number = 0
const pending_inputs: any = []

// UI.
let canvas: any
let status: any

// Update rate.
const update_rate = 20
const last_ts: any = null
const update_interval: any = null

const messages: any = []

let socket: any

export default {
  entities,
  key_left,
  key_right,
  entity_id,
  input_sequence_number,
  pending_inputs,
  canvas,
  status,
  update_rate,
  last_ts,
  update_interval,
  messages,
  socket
}
