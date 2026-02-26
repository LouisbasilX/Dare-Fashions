'use server'

import { checkBotId } from 'botid/server'

export async function verifyBot() {
  try {
    const botCheck = await checkBotId()
    if (botCheck.isBot) {
      return { success: false, error: 'Suspicious activity detected' }
    }
    return { success: true }
  } catch (err: any) {
    console.error('verifyBot error:', err)
    return { success: false, error: err.message || 'Bot verification failed' }
  }
}