import { parseLines } from './services/parseInput'
import { parseSchema } from './services/parseSchema'
import type { InputSchema } from './types/inputSchema'

export function parseInput<T extends string>(rawSchema: T) {
  const schemas = parseSchema(rawSchema)
  return parseLines(schemas) as InputSchema<T>
}

export function overrideInput(data: string) {
  const normalizedData =
    data
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n') + '\n'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any)['$input'] = normalizedData
}
