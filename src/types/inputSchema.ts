/* eslint-disable @typescript-eslint/no-empty-object-type */

// #region Utils

/** 先頭と末尾の空白文字を削除する。 */
type Trim<T extends string> =
  T extends ` ${infer R}` ? Trim<R>
  : T extends `${infer L} ` ? Trim<L>
  : T

/** コメントを除去したうえで、トリムしたものを返す。 */
type RemoveComment<T extends string> = Trim<T extends `${infer L}#${string}` ? L : T>

/** キーと値から、連想配列を作成する。 */
type O<Name extends string, T> = { [K in Name]: T }

/** ホバー時に見やすいように複雑な型を展開する。 */
type Prettify<T> = { [K in keyof T]: T[K] } & {}

/** 先頭文字がアンダーバー（無視する変数）かどうかを判定して返す。 */
type CheckIgnoreVar<Name extends string, T> = Name extends `_${string}` ? {} : T

/** 文字列を改行文字で分割して返す。 */
type SplitLines<T extends string> =
  T extends `${infer L}\n${infer R}` ? [RemoveComment<L>, ...SplitLines<R>]
  : [RemoveComment<T>]

type Dimension<T, K> =
  K extends void ? T
  : K extends [] ? T[]
  : K extends (infer U)[] ? Dimension<T, U>[]
  : never

type Flatten<T> = T extends (infer U)[] ? U : never

// #endregion
// #region Errors

type Error<T extends string> = Prettify<O<'__ERROR__', T>>

type Err_InvalidIdentWithNumeric =
  Error<'無効な識別子です。識別子の先頭に数字は入れられません。'>
type Err_InvalidSyntax = Error<'無効な構文です。'>
type Err_InvalidSyntaxForgetComma =
  Error<'無効な構文です。カンマを忘れていませんか？'>
type Err_InvalidSyntaxWithExtraSymbol =
  Error<'無効な構文です。末尾や途中に余計な記号が含まれています。'>
type Err_HasSyntaxError =
  '構文エラーがあります。下記のエラー内容をよく確認してください。'

// #endregion
// #region Identifier

// prettier-ignore
type AlphaChar =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
  | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'
  | '_' | '$'

// prettier-ignore
type NumericChar =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type IdentBodyChar = AlphaChar | NumericChar

/** 文字列が、英数字または記号（`$`, `_`）の繰り返しであるかどうかを判定する。 */
type IsIdentBody<T extends string> =
  T extends `${infer Head}${infer Tail}` ?
    Head extends IdentBodyChar ?
      Tail extends '' ?
        true
      : IsIdentBody<Tail>
    : false
  : true

/** 有効な識別子であるかどうかを判定し、Thenを返す。無効である場合は、エラーを返す。 */
type IfIdent<T extends string, Raw extends string, Then> =
  // "scalar1 scalar2" などは、カンマを忘れているのではないか？
  T extends `${string} ${string}` ? O<Raw, Err_InvalidSyntaxForgetComma>
  : T extends `${infer Head}${infer Tail}` ?
    Head extends AlphaChar ?
      IsIdentBody<Tail> extends true ?
        Then
      : O<Raw, Err_InvalidSyntax>
    : Head extends NumericChar ? O<Raw, Err_InvalidIdentWithNumeric>
    : O<Raw, Err_InvalidSyntax>
  : O<Raw, Err_InvalidSyntaxWithExtraSymbol>

// #endregion
// #region Schema

/** 連想配列内に、"\_\_ERROR__"というキーが含まれているかを再帰的に探索する。 */
type HasError<T> =
  T extends unknown[] ? HasError<T[number]>
  : T extends object ?
    { [K in keyof T]: K extends '__ERROR__' ? true : HasError<T[K]> }[keyof T]
  : false

/** 型にエラーが含まれている場合は、エラーオブジェクトに変換する。 */
type CheckHasError<T> =
  HasError<T> extends false ? T
  : {
      __ERROR__: {
        reason: Err_HasSyntaxError
        source: Prettify<T>
      }
    }

type ParseArrayFieldSchema<Name extends string, Index extends number | '', D> =
  Index extends '' ? ParseField<Name, D> : ParseField<Name, Flatten<D>>

type ParseBracketArrayField<
  Name extends string,
  Args extends string,
  D = void,
> = CheckIgnoreVar<Name, O<Name, Dimension<Prettify<ParseScalar<Args>>, D>>>

// type TwoDimension<T, TwoD extends boolean> = TwoD extends false ? T : T[]

type ParseField<T extends string, D = void> =
  // 行の末尾にカンマがあるか、カンマの後に配列表記が続いている
  T extends `${string},` ? O<T, Err_InvalidSyntaxWithExtraSymbol>
  : T extends '' ? O<',', Err_InvalidSyntaxWithExtraSymbol>
  : T extends `+~${infer Name}` ?
    CheckIgnoreVar<Name, IfIdent<Name, T, O<Name, Dimension<number, D>>>>
  : T extends `+${infer Name}` ?
    CheckIgnoreVar<Name, IfIdent<Name, T, O<Name, Dimension<number, D>>>>
  : ParseIdent<T, D>

type ParseIdent<T extends string, D> =
  T extends `${infer Name}={${infer Union}}` ?
    CheckIgnoreVar<Name, IfIdent<Name, T, O<Name, Dimension<ParseUnion<Union>, D>>>>
  : CheckIgnoreVar<T, IfIdent<T, T, O<T, Dimension<string, D>>>>

type ParseScalar<T extends string> =
  T extends `${infer L},${infer Rest}` ? ParseField<Trim<L>> & ParseScalar<Rest>
  : ParseField<Trim<T>>

/** ユニオン文字列（例：`N|E|S|W`）をユニオン型（例：`"N" | "E" | "S" | "W"`）に変換する。 */
type ParseUnion<T extends string> =
  T extends `${infer L}|${infer Rest}` ? L | ParseUnion<Rest> : T

type ValidateLineCount<LineCount extends string, Raw extends string, T> =
  LineCount extends '' ? T : IfIdent<LineCount, Raw, T>

/** 改行文字で分割した各行を変換する。 */
type ParseLine<T extends string> =
  // `...spread[]` または `...spread[N]`
  T extends `...${infer Name}[${infer LineCount}]` ?
    ValidateLineCount<LineCount, T, ParseField<Name, [][]>>
  : // `...spread`
  T extends `...${infer Name}` ? ParseField<Name, []>
  : // `arr[][]` または `arr[0][]` または `arr[][N]` または `arr[0][N]`
  T extends `${infer Name}[${infer Index extends number | ''}][${infer LineCount}]` ?
    ValidateLineCount<LineCount, T, ParseArrayFieldSchema<Name, Index, [][]>>
  : // `bracket[arg][]` または `bracket[arg][N]`
  T extends `${infer Name}[${infer Args}][${infer LineCount}]` ?
    ValidateLineCount<LineCount, T, ParseBracketArrayField<Name, Args, []>>
  : // `arr[]` または `bracket[arg]`
  T extends `${infer Name}[${infer Args}]` ?
    Args extends '' ?
      // `arr[]`
      ParseArrayFieldSchema<Name, '', []>
    : // `bracket[arg]`
      ParseBracketArrayField<Name, Args>
  : // 上記のすべてに当てはまらなかったら、スカラ値（`scalar`, `scalar1, scalar2, ...`）
    ParseScalar<T>

/** 各行を変換する。 */
type ParseLines<T extends string[]> =
  T extends [infer L extends string, ...infer Rest extends string[]] ?
    (L extends '' ? {} : ParseLine<L>) & ParseLines<Rest>
  : {}

/** 型のエントリポイント。文字列の分割、変換、エラーチェック、整形を行う。 */
export type InputSchema<T extends string> =
  string extends T ? never : Prettify<CheckHasError<ParseLines<SplitLines<T>>>>

// #endregion
