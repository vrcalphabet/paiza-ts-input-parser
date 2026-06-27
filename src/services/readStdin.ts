import fs from 'node:fs'
import { ParserError } from './ParserError'

export function readStdin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input = (globalThis as any)['$input'] as string | undefined

  const stdin = input ?? fs.readFileSync(0, 'utf-8')
  if (!stdin) {
    throw ParserError(
      'parseInput より前に stdin を取得する処理を入れてはいけません。',
    )
  }

  return stdin.split('\n').filter(Boolean)
}
