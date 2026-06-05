import fs from 'node:fs'
import { ParserError } from './ParserError'

export function readStdin() {
  const stdin = fs.readFileSync(0, 'utf-8')
  if (!stdin) {
    throw ParserError(
      'parseInput より前に stdin を取得する処理を入れてはいけません。',
    )
  }

  return stdin.split('\n').filter(Boolean)
}
