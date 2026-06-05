type BaseSchema<T extends string> = {
  type: T
  raw: string
  is2D: boolean
}

type ArrayFieldSchema = BaseSchema<'arrayField'> & {
  name: string
  toNumber: boolean
  index: number | undefined
  lineCount: string | undefined
}

type SpreadFieldSchema = BaseSchema<'spreadField'> & {
  name: string
  toNumber: boolean
  lineCount: string | undefined
}

type BracketArrayFieldSchema = BaseSchema<'bracketArrayField'> & {
  name: string
  fields: Field[]
  lineCount: string | undefined
}

type ScalarFieldsSchema = BaseSchema<'scalarFields'> & {
  fields: Field[]
  is2D: false
}

export type Field = {
  name: string
  toNumber: boolean
}

export type Schema =
  | ArrayFieldSchema
  | SpreadFieldSchema
  | BracketArrayFieldSchema
  | ScalarFieldsSchema
