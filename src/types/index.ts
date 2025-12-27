/**
 * 型定義ファイル
 * 高齢者向け脳トレアプリの全型定義
 */

/**
 * ゲームモード (難易度設定)
 */
export enum GameMode {
  BEGINNER = 'beginner', // 初級: 正解枚数 + 10枚
  INTERMEDIATE = 'intermediate', // 中級: 正解枚数 × 3倍
  ADVANCED = 'advanced', // 上級: レベル1-10は50枚、レベル11-20は100枚
}

/**
 * 画像データ
 */
export interface ImageData {
  id: string; // 一意のID
  uri: string; // 画像のパス or require()
  category: 'daily' | 'animal' | 'plant'; // カテゴリ
  name: string; // 画像の名前 (デバッグ用)
}

/**
 * レベル情報
 */
export interface Level {
  level: number; // レベル番号 (1-20)
  imageCount: number; // 表示する画像の枚数 (level + 3)
  isCleared: boolean; // クリア済みかどうか
  isUnlocked: boolean; // プレイ可能かどうか
}

/**
 * ゲーム状態 (ゲームプレイ中の状態)
 */
export interface GameState {
  currentLevel: number; // 現在のレベル
  phase: GamePhase; // 現在のフェーズ
  correctImages: ImageData[]; // 正解の画像リスト
  choiceImages: ImageData[]; // 選択肢の画像リスト
  selectedImages: ImageData[]; // ユーザーが選択した画像リスト
  gameMode: GameMode; // 現在のゲームモード
}

/**
 * ゲームフェーズ
 */
export enum GamePhase {
  MEMORIZE = 'memorize', // 記憶フェーズ
  ANSWER = 'answer', // 回答フェーズ
  RESULT = 'result', // 結果フェーズ
}

/**
 * ゲーム結果
 */
export interface GameResult {
  level: number; // プレイしたレベル
  totalCount: number; // 全体の枚数
  correctCount: number; // 正解数
  accuracy: number; // 正解率 (0-100)
  isCleared: boolean; // クリアしたかどうか (80%以上)
  selectedResults: SelectedResult[]; // 各選択の正誤
}

/**
 * 各選択の正誤結果
 */
export interface SelectedResult {
  image: ImageData; // 選択した画像
  isCorrect: boolean; // 正解かどうか
}

/**
 * ユーザー設定
 */
export interface UserSettings {
  gameMode: GameMode; // 選択肢モード
  soundEnabled: boolean; // 音声ON/OFF
}

/**
 * ユーザープログレス (保存データ)
 */
export interface UserProgress {
  maxUnlockedLevel: number; // 最高到達レベル
  clearedLevels: number[]; // クリア済みレベルのリスト
  settings: UserSettings; // ユーザー設定
}

/**
 * ナビゲーションのパラメータ型
 */
export type RootStackParamList = {
  Home: undefined;
  Game: { level: number };
  Result: { result: GameResult };
  Settings: undefined;
};
