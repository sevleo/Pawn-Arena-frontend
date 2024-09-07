import { gameState } from '@/services/gameState'
import serverMessages from '@/services/processServerMessages'

export default function handleServerMessage(event: any) {
  const message = JSON.parse(event.data)

  switch (message.type) {
    case 'connection':
      assignClientId(message.clientId)
      break

    case 'world_state':
      saveServerMessage(message)
      break

    case 'disconnect':
      removePlayerEntity(message.clientId)
      break
  }
}

function assignClientId(id: string) {
  gameState.clientId = id
  console.log(`Assigned clientId: ${gameState.clientId}`)
}

function removePlayerEntity(clientId: any) {
  gameState.entities.delete(clientId)
}

function saveServerMessage(msg: any) {
  // console.log(msg)
  const message = {
    payload: msg
  }
  serverMessages.messages.push(message)
}
