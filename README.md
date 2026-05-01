# dotenvx-test

dotenvxの動作確認用リポジトリ

## dotenvxとは

[dotenvx](https://dotenvx.com/)は、dotenvの作者による次世代の環境変数管理ツールです。

### 主な特徴

- **暗号化機能**: .envファイルを暗号化してGitにコミット可能
- **クロスプラットフォーム**: どの環境でも動作
- **複数環境サポート**: .env.development, .env.productionなど環境ごとの管理
- **変数展開**: `${VAR}`形式で既存の変数を参照可能

## セットアップ

```bash
# リポジトリをクローン
git clone git@github.com:cti1650/dotenvx-test.git
cd dotenvx-test

# 依存関係をインストール
npm install
```

## 基本的な使い方

### 1. 環境変数を読み込んで実行

```bash
# .env を読み込んで実行
npm run start

# 開発環境用
npm run start:dev

# 本番環境用
npm run start:prod
```

### 2. 暗号化

```bash
# .env を暗号化
npm run encrypt

# または直接コマンドで
npx dotenvx encrypt

# 特定の環境ファイルを暗号化
npm run encrypt:dev   # .env.development
npm run encrypt:prod  # .env.production
```

暗号化を実行すると:
- `.env` ファイル内の値が暗号化される
- `.env.keys` ファイルに秘密鍵が保存される（**絶対にコミットしない！**）
- `DOTENV_PUBLIC_KEY` が `.env` に追加される

### 3. 暗号化されたファイルで実行

```bash
# 秘密鍵を環境変数で渡して実行
DOTENV_PRIVATE_KEY="<your-private-key>" npm run start
```

## ファイル構成

```
dotenvx-test/
├── .env              # 基本環境変数
├── .env.development  # 開発環境用
├── .env.production   # 本番環境用
├── .env.example      # テンプレート
├── .env.keys         # 秘密鍵（.gitignoreで除外）
├── .gitignore
├── index.js          # サンプルコード
├── package.json
└── README.md
```

## dotenvxコマンド一覧

```bash
# 基本的なrun
npx dotenvx run -- node index.js

# 複数の.envファイルを指定
npx dotenvx run -f .env -f .env.local -- node index.js

# 既存の環境変数を上書き
npx dotenvx run -o -- node index.js

# 暗号化
npx dotenvx encrypt

# 特定のキーのみ暗号化
npx dotenvx encrypt --key SECRET_KEY API_KEY

# 復号化（通常は不要）
npx dotenvx decrypt
```

## セキュリティのベストプラクティス

1. **`.env.keys`は絶対にコミットしない**
   - 秘密鍵は安全な場所（1Password, AWS Secrets Manager等）に保管

2. **本番環境の秘密鍵はCI/CDの環境変数で管理**
   - GitHub Secretsなどを使用

3. **暗号化された.envはコミット可能**
   - 公開鍵と暗号化された値のみが含まれる

## 参考リンク

- [dotenvx 公式サイト](https://dotenvx.com/)
- [dotenvx GitHub](https://github.com/dotenvx/dotenvx)
- [dotenvx npm](https://www.npmjs.com/package/@dotenvx/dotenvx)
- [dotenvx ドキュメント](https://dotenvx.com/docs)
