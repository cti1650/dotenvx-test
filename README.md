# dotenvx-test

dotenvxを実プロジェクトに導入する前に、**運用上の論点だけを切り出して事前検証**するためのリポジトリです。

## このリポジトリの設計思想：シークレット管理における「最小化」原理

dotenvxは単なる「.env暗号化ツール」ではなく、**シークレット管理を多面的に最小化する仕組み**として捉えると本質がわかりやすくなります。

### 4つの最小化

| 最小化対象 | 内容 |
|---|---|
| **真実の所在** | 値の最新版はGit上にのみ存在。Slack DM・口頭・各人のメモといった分散経路が消え、変更履歴は`git log`で追跡可能 |
| **存在範囲** | 平文はプロセスのメモリ上にのみ存在。ディスクに永続化されないため、端末紛失・バックアップ・AIエージェント経由などの漏洩経路が構造的に消える |
| **管理対象** | 共有が必要なのは`.env.keys`のみ。環境変数が増えても共有作業量は一定で、コピペ事故の確率も低い |
| **回復点** | 漏洩疑惑時に再生成すべきは`.env.keys`のみ。各サービスのAPIキー個別再発行が不要で、インシデント対応のMTTRが短い |

### AIエージェント時代における構造的防御

旧来の「.envをコミットしない」運用は**指示ベースの防御**（人間・AIが正しく振る舞うことを期待する）ですが、dotenvxは**構造ベースの防御**（間違えても被害が出ない構造を作る）へ転換します。

- **書き込み方向**: AIが平文を新規作成しても、precommit hookで物理的にブロック
- **読み取り方向**: AIが`.env`を読んでも、AI事業者ログに乗るのは暗号化文字列のみ

この双方向の防御は、`prepare`スクリプト + lefthookによって、**新規参加者（人間・AI問わず）が`npm install`した瞬間に自動で有効化されます**。防御策を理解していなくても効く点がポイントです。

### 設計上の最大リスクと、ツール側の対応

最小化の裏返しとして、**`.env.keys`が単一障害点**になります。万が一コミットされてしまうと、過去のGit履歴に含まれる全暗号化値が復号可能となり、被害が時系列に遡及します。

ただし `dotenvx ext precommit` は平文混入だけでなく**`.env.keys`の.gitignore登録漏れも検知**し、修正コマンドまで提示します。「ユーザーは間違えるもの」を前提にツール側で対応されているため、過剰なカスタムチェックは不要です。

## 検証スコープ

### 検証する論点

- **暗号化された`.env`を本当にGitにコミットして安全か**
  - 公開鍵 / 秘密鍵 (`.env.keys`) の取り扱いと`.gitignore`の境界線
- **平文の`.env`を誤ってコミットする事故をどう防ぐか**
  - `dotenvx ext precommit` をローカル / チーム / CIの各レイヤで動作確認
  - hook共有ツール選定（lefthook / Husky / simple-git-hooks）の比較
- **特定キーだけを更新・参照する運用が回るか**
  - `dotenvx set` / `get` / `encrypt --key` / `decrypt` の使い分け
- **複数環境（dev / prod）で鍵分離ができているか**
  - `DOTENV_PUBLIC_KEY_*` / `DOTENV_PRIVATE_KEY_*` の環境別管理

### スコープ外

- フレームワーク統合（Next.js / NestJS等の個別事情）
- CI/CD全体構築（プロジェクト固有のパイプライン設計）
- 組織横断のシークレット管理ポリシー（運用ロードマップのフェーズ2以降）

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

### 3. 特定のキーのみ更新

```bash
# 特定のキーの値を更新（自動で暗号化される）
npx dotenvx set HELLO "new value"

# 特定の環境ファイルのキーを更新
npx dotenvx set HELLO "new value" -f .env.production

# 暗号化せずプレーンで保存
npx dotenvx set HELLO "new value" --plain

# 既存の値のうち特定キーのみを暗号化
npx dotenvx encrypt --key SECRET_KEY --key API_KEY

# 特定キーを暗号化対象から除外
npx dotenvx encrypt --exclude-key PUBLIC_URL
```

### 4. 暗号化された値を確認する

```bash
# 全キーの復号値を表示
npx dotenvx get

# 特定キーだけ表示
npx dotenvx get HELLO

# 特定の環境ファイルから取得
npx dotenvx get HELLO -f .env.production

# シェル形式で表示
npx dotenvx get --format shell

# 復号された値で任意のコマンドを実行して確認
npx dotenvx run -- printenv HELLO
npx dotenvx run -- env
```

ファイル自体を平文に戻したい場合は `decrypt`（`.env.keys` が必要、元ファイルが上書きされる）:

```bash
npx dotenvx decrypt
npx dotenvx decrypt -f .env.production
```

### 5. 暗号化されたファイルで実行

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

4. **コミット前の平文混入チェックを自動化する**
   - 後述の「コミット前の自動チェック」を参照

## コミット前の自動チェック

平文の`.env`を誤ってコミットしないように、dotenvx標準のpre-commitチェック機能を利用できます。

### 手動チェック

```bash
# 暗号化されていない値が残っていないか確認
npx dotenvx ext precommit
```

平文の値が見つかるとエラーになります。

### Git hookに自動インストール（個人環境のみ）

```bash
npx dotenvx ext precommit --install
```

`.git/hooks/pre-commit` が作成され、コミット時に自動チェックされます。

⚠️ **注意**: `.git/hooks/` はGit管理外のため、**他の開発者には共有されません**。チームで使う場合は次のlefthookを利用してください。

### lefthookでチーム全体に共有する

Git hook共有ツールとしてはHuskyやsimple-git-hooksが有名ですが、本リポジトリでは以下の理由から **lefthook** を採用しています。

| 観点 | lefthook | Husky | simple-git-hooks |
|------|----------|-------|------------------|
| 実行速度 | ✅ 高速（Go製の単一バイナリ） | やや遅い | ✅ 軽量で高速 |
| 並列実行 | ✅ 標準対応（`parallel: true`） | 非対応 | 非対応 |
| 設定 | ✅ `lefthook.yml` で宣言的 | シェルスクリプトで都度記述 | `package.json`内に記述 |
| 言語非依存 | ✅ どの言語のプロジェクトでも利用可 | Node.js環境が必須 | Node.js環境が必須 |
| モノレポ対応 | ✅ サブディレクトリ単位の設定が可能 | ⚠️ workspaces設定で対応可能 | ❌ 非対応（リポジトリにつき1設定のみ） |

選定の決め手:
- **並列実行**: 将来 lint / test などのチェックを追加した際、待ち時間を抑えられる
- **モノレポ対応**: `simple-git-hooks` は軽量だがモノレポ運用ができないため、将来パッケージ分割した場合の拡張余地を確保したい
- **設定の宣言性**: `lefthook.yml` でhookと実行コマンドを一元管理でき、シェルスクリプトを各hookごとに書く必要がない

`lefthook.yml`をGit管理することで、`npm install`時に全員の環境で自動セットアップされます。

```bash
# lefthookをインストール
npm install --save-dev lefthook

# Git hookとして登録
npx lefthook install
```

`lefthook.yml`を作成:

```yaml
pre-commit:
  parallel: true
  commands:
    dotenvx-check:
      run: npx dotenvx ext precommit
```

`package.json`に`prepare`スクリプトを追加しておくと、cloneした人が`npm install`するだけで自動的に有効になります。

```json
{
  "scripts": {
    "prepare": "lefthook install"
  }
}
```

今後lintやtestを追加する場合も、`commands:`に並べるだけで並列実行されます。

```yaml
pre-commit:
  parallel: true
  commands:
    dotenvx-check:
      run: npx dotenvx ext precommit
    lint:
      run: npm run lint
      glob: "*.{js,ts}"
    test:
      run: npm test
```

### CI/CDでの二重チェック

GitHub Actions等のCIでも検知できます。

```bash
npx dotenvx ext prebuild
```

ビルド/デプロイ時に平文の混入を検知し、処理を中断します。

### おすすめ構成

| 開発スタイル | 推奨セットアップ |
|------------|----------------|
| 個人開発 | `npx dotenvx ext precommit --install` |
| チーム開発 | lefthook + CIで`prebuild`を実行 |

## 参考リンク

### dotenvx

- [dotenvx 公式サイト](https://dotenvx.com/)
- [dotenvx GitHub](https://github.com/dotenvx/dotenvx)
- [dotenvx npm](https://www.npmjs.com/package/@dotenvx/dotenvx)
- [dotenvx ドキュメント](https://dotenvx.com/docs)

### lefthook

- [lefthook 公式サイト](https://lefthook.dev/)
- [lefthook GitHub](https://github.com/evilmartians/lefthook)
- [lefthook npm](https://www.npmjs.com/package/lefthook)
- [Configuration リファレンス](https://lefthook.dev/configuration/)
