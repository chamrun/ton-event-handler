import { Slice } from '@ton/core'

const CHANGE_NUMBER_NOTIFICATION_EVENT_CODE = 0x5c690c2f



const hexToString = (hexString: string): string => {
  const hex = hexString.toString()
  let resultString = ''
  for (let i = 0; i < hex.length; i += 2) {
    resultString += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16))
  }
  return resultString
}

export const extractEventFromMessage = (message: Slice): { event: number } | { error: string } => {
  const operationCode = message.loadUint(32)
  let event = 0

  if (operationCode === CHANGE_NUMBER_NOTIFICATION_EVENT_CODE) {
    const eventString = hexToString(message.loadUintBig(13 * 8).toString(16)!)
    if (eventString === 'ChangedNumber') {
      event = message.loadUint(8)
    } else {
      return { error: 'Unsupported slice format' }
    }
  }
  return { event }
}
