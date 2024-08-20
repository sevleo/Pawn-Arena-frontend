import gameState from '@/services/gameState'
import serverMessages from '@/services/processServerMessages'

export default function handleServerMessage(event: any) {
  const message = JSON.parse(event.data)

  switch (message.type) {
    case 'connection':
      assignEntityId(message.entity_id)
      break

    case 'world_state':
      saveServerMessage(message)
      break
  }
}

function assignEntityId(id: string) {
  gameState.gameState.entity_id = id
  console.log(`Assigned entity_id: ${gameState.gameState.entity_id}`)
  console.log(gameState.gameState.entity_id)
}

function saveServerMessage(msg: any) {
  // console.log(message)
  const message = {
    payload: msg
  }
  serverMessages.messages.push(message)
}
