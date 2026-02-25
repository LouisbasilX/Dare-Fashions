'use server'

import { checkBotId } from 'botid/server'

export async function verifyBot() {
  const botCheck = await checkBotId()
  if (botCheck.isBot) {
    throw new Error('Suspicious activity detected')
  }
  return true
}