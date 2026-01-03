# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

高齢者向け記憶力トレーニングアプリ（React Native/Expo）。絵合わせ形式で、表示された画像を記憶し、選択肢から正解を選ぶゲーム。

## 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動（Expo）
npm start

# iOS実機/シミュレーター
npm run ios

# Android実機/エミュレーター
npm run android

# Web版
npm run web
```

## アーキテクチャ

### 技術スタック
- **フレームワーク**: React Native (Expo SDK 54)
- **言語**: TypeScript (strict mode)
- **UI**: React Native Paper
- **ナビゲーション**: React Navigation (Stack Navigator)
- **状態管理**: Context API (`GameContext`)
- **ストレージ**: AsyncStorage

### ディレクトリ構成

```
src/
├── screens/          # 画面コンポーネント (6画面)
├── components/       # 再利用可能なUIコンポーネント
├── contexts/         # Context API (GameContext)
├── types/            # TypeScript型定義
└── utils/            # ユーティリティ関数
    ├── constants.ts  # 定数・ゲーム設定
    ├── gameLogic.ts  # ゲームロジック
    ├── imageData.ts  # 画像データ管理
    ├── storage.ts    # AsyncStorage操作
    └── achievements.ts # 実績システム
```

### ゲームフロー

1. **HomeScreen**: レベル選択（1-20）
2. **GameScreen**: カウントダウン → 記憶フェーズ → カウントダウン → 回答フェーズ（`GamePhase` enumで状態管理）
   - `COUNTDOWN_MEMORIZE` → `MEMORIZE` → `COUNTDOWN_ANSWER` → `CALCULATION`（超級のみ） → `ANSWER` → `RESULT`
3. **ResultScreen**: 結果表示・次レベルへ

### 難易度システム（`GameMode` enum）

- `BEGINNER`: 正解枚数 + 6枚
- `INTERMEDIATE`: 正解枚数 × 2倍
- `ADVANCED`: レベル帯別固定枚数（24/48/72/96枚）
- `EXPERT`: ADVANCED + 計算問題（記憶→回答の間に2桁の足し算・引き算を3問正解する必要がある）

難易度ごとに独立した進捗管理（`modeProgress`）が行われる。

### データ永続化

`AsyncStorage`を使用。キーは`STORAGE_KEYS`で定義:
- `user_progress`: レベル進捗・ストリーク
- `user_settings`: ゲームモード・ヒント設定
- `play_history`: プレイ履歴

### Context API

`GameContext`が全体の状態を管理:
- 難易度ごとの進捗（`modeProgress`）
- ユーザー設定（`settings`）
- プレイ履歴（`playHistory`）
- 連続プレイ日数（`currentStreak`、`longestStreak`）

### 重要な設計原則

- **ゲームロジックの分離**: ビジネスロジックは`utils/gameLogic.ts`に集約。画面コンポーネントはUIロジックのみ
- **型安全性**: TypeScript strict modeを使用。全てのデータは`types/index.ts`で型定義
- **高齢者向けUI**: `UI_CONFIG`で定義された最小フォントサイズ(18pt)、ボタンサイズ(60pt)を厳守
- **データ永続化**: 全ての状態変更は`GameContext`経由で行い、`storage.ts`で自動保存

### 実装時の注意点

- 新しい画面を追加する場合は、`RootStackParamList`に型定義を追加
- ゲームモードを追加する場合は、`GAME_MODE_CONFIG`で選択肢数の計算ロジックを定義
- 実績システムを拡張する場合は、`utils/achievements.ts`を参照

## 言語設定

- コードコメント・コミットメッセージは日本語
- 日本語で応答

## テストコード規約

- `expect(true).toBe(true)`のような意味のないアサーションは禁止
- テストを通すためだけのハードコードは禁止
- 境界値・異常系・エラーケースを必ずテスト
- 不明点は仮実装ではなくユーザーに確認
