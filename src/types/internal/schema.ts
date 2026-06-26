type BaseSchema<T extends string> = {
  type: T
  raw: string
  is2D: boolean
}

type ArrayFieldSchema = BaseSchema<'arrayField'> &
  Field & {
    index: number | undefined
    lineCount: string | undefined
  }

type SpreadFieldSchema = BaseSchema<'spreadField'> &
  Field & {
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
  decrement: boolean
}

export type Schema =
  | ArrayFieldSchema
  | SpreadFieldSchema
  | BracketArrayFieldSchema
  | ScalarFieldsSchema
