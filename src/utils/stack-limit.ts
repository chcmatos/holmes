/**
 * Check current stack limit by current browser
 * @returns current stack limit
 */
export const stackCalculate = () => {
  let stack: number = 0
  let stackC = () => {
    stack++
    stackC()
  }

  try {
    stackC()
  } catch {}
  return stack
}

/**
 * Browser stack limit
 */
export const STACK_LIMIT = stackCalculate()
