import { Trace, Transaction } from '@ton-api/client'

export const getTransactionFromTrace = (trace: Trace, path: number[]): { transaction: Transaction } | { error: string } => {
  const [id, ...remainingPath] = path
  if (id == null) return { error: 'Invalid path provided' }

  const childTrace = trace.children?.[id]
  if (!childTrace) return { error: 'Path not found in trace' }
  if (remainingPath.length === 0) {
    if (!childTrace.transaction) return { error: 'Transaction not found in trace' }
    return { transaction: childTrace.transaction }
  }
  return getTransactionFromTrace(childTrace, remainingPath)
}
