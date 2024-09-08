import { gameState } from '@/services/gameState'
import serverMessages from '@/services/processServerMessages'
import { type Ref } from 'vue'

export default function handleServerMessage(
  event: any,
  isInGame: Ref<boolean>,
  hasClientId: Ref<boolean>,
  playerHealth: Ref<number | null>
) {
  const message = JSON.parse(event.data)

  switch (message.type) {
    case 'connection':
      assignClientId(message.clientId)
      hasClientId.value = true
      break

    case 'newEntityId':
      isInGame.value = true
      gameState.entityId = message.entityId
      break

    case 'entityDestroyed':
      // console.log(message)
      if (message.entityId === gameState.entityId) {
        isInGame.value = false
        playerHealth.value = null
        gameState.entityId = null
      }
      break

    case 'world_state':
      saveServerMessage(message)
      break

    case 'disconnect':
      removePlayerEntity(message.clientId)
      // hasClientId.value = false
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
