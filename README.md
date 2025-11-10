# 動物顔診断アプリ

Claude AIを使って、顔写真から似ている動物を診断するWebアプリです。

## 機能

- 顔写真のアップロード（カメラ撮影 or ファイル選択）
- Claude AIによる動物診断
- 性格、好きなこと、苦手なこと、魅力ポイントの表示

## 開発環境での実行

### 必要なもの

- Node.js 18以上
- Claude API キー

### セットアップ

1. 依存関係をインストール
```bash
npm install
```

2. `.env`ファイルを作成してAPIキーを設定
```
VITE_CLAUDE_API_KEY=your-api-key-here
```

3. サーバーとフロントエンドを起動（2つのターミナルで実行）

ターミナル1:
```bash
npm run server
```

ターミナル2:
```bash
npm run dev
```

4. ブラウザで `http://localhost:5173` を開く

## Vercelへのデプロイ

### 1. Vercel CLIをインストール

```bash
npm install -g vercel
```

### 2. Vercelにログイン

```bash
vercel login
```

### 3. プロジェクトをデプロイ

```bash
vercel
```

### 4. 環境変数を設定

Vercelダッシュボードで以下の環境変数を設定：

- `VITE_CLAUDE_API_KEY`: あなたのClaude APIキー

または、コマンドラインで設定：

```bash
vercel env add VITE_CLAUDE_API_KEY
```

### 5. 本番環境にデプロイ

```bash
vercel --prod
```

## 技術スタック

- React + TypeScript
- Vite
- Tailwind CSS
- Claude AI API
- Vercel (デプロイ)

## ライセンス

MIT
