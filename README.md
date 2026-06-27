# paiza-ts

[![npm version](https://badge.fury.io/js/@vrcalphabet%2Fpaiza-ts-input-parser.svg)](https://badge.fury.io/js/@vrcalphabet%2Fpaiza-ts-input-parser)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[paiza-ts](https://github.com/vrcalphabet/paiza-ts)で入力データを型安全に取り出すためのライブラリ

## 使い方

1. [paiza-tsをセットアップした](https://github.com/vrcalphabet/paiza-ts#%E4%BD%BF%E3%81%84%E6%96%B9)ディレクトリで、以下のコマンドを実行します。
※ 最新版の[create-paiza-ts](https://github.com/vrcalphabet/create-paiza-ts)でセットアップした場合、デフォルトでインストールされるのでこの手順は必要ありません。

```
npm i @vrcalphabet/paiza-ts-input-parser
```

1. `main.ts` などでスキーマを定義（後述）した `InputParser.parse` を実行します。

```ts
import { parseInput } from '@vrcalphabet/paiza-ts-input-parser'

const input = parseInput(`
  +n
  arr[]
  point[x, y]
`)

// 入力例
// 5
// apple banana
// 10 -5

// 結果
// {
//   n: 5,
//   arr: ["apple", "banana"],
//   point: ["10", "-5"]
// }
```

## スキーマ構文

- `name`: 次の文字列を読む
- `+name`: 次の数値を読む
- `a, b, +c`: 同じ行の複数カラムを読む

- `arr[]`: 1行を文字列配列として読む
- `+arr[]`: 1行を数値配列として読む

- `arr[][]`: その行以降の全行を文字列配列として読む
- `+arr[][]`: その行以降の全行を数値配列として読む

- `arr[0][]`: その行以降の全行の1列目だけを取り出して文字列配列として読む
- `+arr[0][]`: その行以降の全行の1列目だけを取り出して数値配列として読む

- ```
  +C
  arr[][C]
  # arr[0][C]
  # ...arr[C]
  # obj[a, b][C]
  ```

  直前に読み取った数値分の行数を読む

- `...s`: 1行を1文字ずつ分割して文字列配列として読む
- `...+n`: 1行を1文字ずつ分割して数値配列として読む

- `...arr[]`: その行以降の全行を1文字ずつ分割して文字列配列として読む
- `...+arr[]`: その行以降の全行を1文字ずつ分割して数値配列として読む

- `obj[a, +b]`: 同じ行の複数カラムからオブジェクトを作る
- `obj[a, +b][]`: その行以降の全行からオブジェクト配列を作る

- `+~name`: 読んだ数値から1引いたものを結果にする（paizaの問題はすべて1オリジンなので、JSで配列直アクセスをするために0オリジンに直す構文）

- ```
  # +~name1
  # +~arr1[]
  # +~arr2[][]
  # ...+~n
  # ...+~arr[]
  # ...obj[+~a]
  ```

- `_name`, `+_name`: 値を読み取るが結果に含めない
- `# コメント`: 行コメント

### 例1: 単一値と複数列

入力:

```
3
alice 20 math
```

スキーマ:

```ts
+n
name, +age, _subject # これはコメントです。先頭に _ が付いている変数は出力されません。
```

結果:

```ts
{
  n: 3,
  name: "alice",
  age: 20,
}
```

### 例2: 配列と複数行配列

入力:

```
red blue green
11 22 33 44
1 2
3 4
```

スキーマ:

```ts
colors[]
+numbers[]
+grid[][]
```

結果:

```ts
{
  colors: ["red", "blue", "green"],
  numbers: [11, 22, 33, 44],
  grid: [
    [1, 2],
    [3, 4],
  ],
}
```

### 例3: スプレット構文

入力:

```
GREEN
12345
67890
```

スキーマ:

```ts
...color
...+map[]
```

結果:

```ts
{
  color.: ["G", "R", "E", "E", "N"],
  map: [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 0],
  ],
}
```

### 例4: オブジェクト形式と無視変数

入力:

```
3
200 300
id-1 taro 90
id-2 hanako 85
```

スキーマ:

```ts
+n
prices[+apple, banana]
rows[_id, name, +score][]
```

結果:

```ts
{
  n: 3,
  prices: {
    apple: 200,
    banana: "300",
  },
  rows: [
    { name: "taro", score: 90 },
    { name: "hanako", score: 85 },
  ],
}
```

### 例5: 行数指定

入力:

```
3
10
20
30
2
taro jiro 2
jiro taro 1
```

スキーマ:

```ts
+n
+points[0][n]
+m
logs[from, to, +type][m]
```

結果:

```ts
{
  n: 3,
  points: [10, 20, 30],
  m: 2,
  logs: [
    { from: "taro", to: "jiro", type: 2 },
    { from: "jiro", to: "taro", type: 1 },
  ],
}
```

### 例6: `+~` 構文

入力:

```
2
1 3
2 4
```

スキーマ:

```ts
+n
+~entry[][n]
```

結果:

```ts
{
  n: 2,
  entry: [
    [0, 2],
    [1, 3],
  ],
}
```

## 注意点

- `arr[][]` / `...arr[]` / `obj[...][]` のような複数行を読む構文は、その行から末尾までをすべて消費します。これより下の行にスキーマがあっても無視されます。
- 行数や列数が不足している場合は、実行時に `Error` が投げられます。
- <u>スキーマ自体の構文ミスは、TypeScript の型エラーとして検出されます。</u>(！)

## 貢献

プロジェクトへの貢献を歓迎します！以下のルールに従うと，あなたの貢献がスムーズになります！

### Issue / PR

Issueを立てる際は，バグ報告・機能要望のどちらかを明記してください。
PRの説明には，目的・変更点・影響範囲・サンプルコードがあるとありがたいです。

**※スクリーンショットを添付する際は、チャレンジ問題の問題文が画像に含まれていないことを確認してください。**

## ライセンス

MIT License

詳細は[LICENSE](./LICENSE)ファイルを参照してください。
