import {
  TonApiClient,
  Trace,
  TraceID,
  TraceIDs,
} from '@ton-api/client'
import { Address, Slice } from '@ton/core'
import { extractEventFromMessage } from '../contract-helper'
import { getTransactionFromTrace } from '../ton/helper'

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const extractEventFromTrace = (trace: Trace): { event: number } | { error: string } => {
  const transactionResult = getTransactionFromTrace(trace, [0, 0])
  if ('error' in transactionResult) return { error: transactionResult.error }

  const message: Slice | undefined = transactionResult.transaction.inMsg?.rawBody?.asSlice()
  if (!message) return { error: 'Message not found in transaction' }

  try {
    return extractEventFromMessage(message)
  } catch (error: any) {
    return { error: `Error while extracting event: ${error.message}` }
  }
}

export class EventHandler {
  private readonly client: TonApiClient
  private readonly account: Address
  private lastProcessedTime: bigint
  private isRunning: boolean

  constructor (client: TonApiClient, account: Address, lastProcessedTime: bigint = 30174595000000n) {
    this.client = client
    this.account = account
    this.lastProcessedTime = lastProcessedTime
    this.isRunning = false
  }

  processTraces = async (newTraceIDs: TraceID[]) => {
    for (const traceID of newTraceIDs) {
      try {
        console.log(`Processing trace ID: ${traceID.id}`)
        const trace: Trace = await this.client.traces.getTrace(traceID.id)
        const eventResult = extractEventFromTrace(trace)
        if ('error' in eventResult) {
          console.error('Event extraction failed:', eventResult.error)
          return
        }
        console.log('Extracted event:', eventResult.event)
      } catch (error: any) {
        console.error('Error processing trace:', error)
      }
    }
  }
  fetchNewTraceIDs = async () => {
    try {
      const allTraceIDs: TraceIDs = await this.client.accounts.getAccountTraces(this.account)
      return allTraceIDs.traces.filter((trace) => BigInt(trace.utime) > this.lastProcessedTime)
    } catch (error: any) {
      console.error('Error fetching trace IDs:', error)
      return []
    }
  }

  public async start () {
    this.isRunning = true
    process.on('SIGINT', () => {
      console.log('Terminating process...')
      this.isRunning = false
    })

    while (this.isRunning) {
      const newTraceIDs = await this.fetchNewTraceIDs()

      if (newTraceIDs.length === 0) {
        console.log('No new traces available.')
        await delay(5000)
        continue
      }

      await this.processTraces(newTraceIDs)

      this.lastProcessedTime = BigInt(newTraceIDs[newTraceIDs.length - 1].utime)
      await delay(5000)
    }
  }
}
