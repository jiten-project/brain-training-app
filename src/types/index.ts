/**
 * 型定義ファイル
 * 高齢者向け脳トレアプリの全型定義
 */

/**
 * ゲームモード (難易度設定)
 */
export enum GameMode {
  BEGINNER = 'beginner', // 初級: 正解枚数 + 6枚
  INTERMEDIATE = 'intermediate', // 中級: 正解枚数 × 2倍
  ADVANCED = 'advanced', // 上級: レベル帯別（25/50/75/100枚）
  EXPERT = 'expert', // 超級: 上級と同じ + 記憶時にパネルが動く
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
  COUNTDOWN_MEMORIZE = 'countdown_memorize', // 記憶フェーズ前のカウントダウン
  MEMORIZE = 'memorize', // 記憶フェーズ
  COUNTDOWN_ANSWER = 'countdown_answer', // 回答フェーズ前のカウントダウン
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
  choiceImages: ImageData[]; // 選択肢の全画像
  correctImages: ImageData[]; // 正解の画像
  memorizeTime: number; // 記憶時間（ミリ秒）
  answerTime: number; // 回答時間（ミリ秒）
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
  hintEnabled: boolean; // ヒント機能ON/OFF
}

/**
 * 難易度ごとの進捗
 */
export interface ModeProgress {
  maxUnlockedLevel: number; // 最高到達レベル
  clearedLevels: number[]; // クリア済みレベルのリスト
}

/**
 * ユーザープログレス (保存データ)
 */
export interface UserProgress {
  maxUnlockedLevel: number; // 最高到達レベル（後方互換性のため残す）
  clearedLevels: number[]; // クリア済みレベルのリスト（後方互換性のため残す）
  modeProgress: {
    [GameMode.BEGINNER]: ModeProgress;
    [GameMode.INTERMEDIATE]: ModeProgress;
    [GameMode.EXPERT]: ModeProgress;
  }; // 難易度ごとの進捗
  settings: UserSettings; // ユーザー設定
  currentStreak: number; // 現在の連続プレイ日数
  lastPlayedDate: string; // 最終プレイ日（YYYY-MM-DD形式）
  longestStreak: number; // 最長連続プレイ日数
}

/**
 * プレイ履歴（実施記録）
 */
export interface PlayHistory {
  id: string; // 一意のID (UUIDなど)
  date: string; // プレイ日時（ISO 8601形式）
  level: number; // プレイしたレベル
  totalCount: number; // 全体の枚数
  correctCount: number; // 正解数
  accuracy: number; // 正解率 (0-100)
  isCleared: boolean; // クリアしたかどうか
  memorizeTime: number; // 記憶時間（ミリ秒）
  answerTime: number; // 回答時間（ミリ秒）
  gameMode: GameMode; // プレイ時のゲームモード
  isBestRecord?: boolean; // 最高記録かどうか
}

/**
 * 実績バッジ
 */
export interface Achievement {
  id: string; // 実績ID
  title: string; // 実績名
  description: string; // 説明
  icon: string; // アイコン（絵文字）
  unlocked: boolean; // 解除済みか
  unlockedDate?: string; // 解除日時（ISO 8601形式）
  category: 'level' | 'perfect' | 'streak' | 'speed' | 'total'; // カテゴリ
}

/**
 * ナビゲーションのパラメータ型
 */
export type RootStackParamList = {
  Home: undefined;
  Game: { level: number };
  Result: { result: GameResult };
  Settings: undefined;
  History: undefined;
  Achievements: undefined;
  Legal: { type: 'terms' | 'privacy' };
};
