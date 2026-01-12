/**
 * 定数ファイル
 * アプリ全体で使用する定数
 */

import { GameMode } from '../types';

/**
 * レベル設定
 */
export const LEVELS = {
  MIN: 1, // 最小レベル
  MAX: 20, // 最大レベル
  BASE_IMAGE_COUNT: 3, // 基本画像枚数 (レベル数に加算)
};

/**
 * レベルnの画像枚数を計算
 * @param level レベル番号 (1-20)
 * @returns 画像枚数
 */
export const getImageCount = (level: number): number => {
  return level + LEVELS.BASE_IMAGE_COUNT;
};

/**
 * クリア条件
 */
export const CLEAR_CONDITION = {
  THRESHOLD: 0.8, // クリア条件: 80%以上正解
};

/**
 * レベルnのクリアに必要な正解数を計算
 * @param level レベル番号 (1-20)
 * @returns 必要な正解数
 */
export const getRequiredCorrectCount = (level: number): number => {
  const imageCount = getImageCount(level);
  return Math.ceil(imageCount * CLEAR_CONDITION.THRESHOLD);
};

/**
 * ゲームモード設定
 */
export const GAME_MODE_CONFIG = {
  [GameMode.BEGINNER]: {
    name: '初級',
    description: '正解枚数 + 6枚',
    difficulty: '★☆☆☆',
    getChoiceCount: (correctCount: number, _level: number) => correctCount + 6,
  },
  [GameMode.INTERMEDIATE]: {
    name: '中級',
    description: '正解枚数 × 2倍',
    difficulty: '★★☆☆',
    getChoiceCount: (correctCount: number, _level: number) => correctCount * 2,
  },
  [GameMode.ADVANCED]: {
    name: '上級',
    description: 'レベル帯別（24/48/72/96枚）',
    difficulty: '★★★☆',
    getChoiceCount: (_correctCount: number, level: number) => {
      if (level <= 5) return 24;
      if (level <= 10) return 48;
      if (level <= 15) return 72;
      return 96;
    },
  },
  [GameMode.EXPERT]: {
    name: '超級',
    description: '上級 + 計算問題',
    difficulty: '★★★★',
    getChoiceCount: (_correctCount: number, level: number) => {
      // 上級と同じ選択肢数
      if (level <= 5) return 24;
      if (level <= 10) return 48;
      if (level <= 15) return 72;
      return 96;
    },
  },
};

/**
 * 画像素材設定
 */
export const IMAGE_CONFIG = {
  TOTAL_COUNT: 100, // 最低100種類必要
  CATEGORIES: {
    DAILY: 'daily', // 日常の物
    ANIMAL: 'animal', // 動物
    PLANT: 'plant', // 植物
  },
};

/**
 * UI設定 (高齢者向け)
 */
export const UI_CONFIG = {
  MIN_FONT_SIZE: 18, // 最小フォントサイズ
  IMPORTANT_FONT_SIZE: 24, // 重要な情報のフォントサイズ
  MIN_BUTTON_SIZE: 60, // 最小ボタンサイズ (pt)
  MIN_SPACING: 16, // 最小余白 (pt)
};

/**
 * AsyncStorage キー
 */
export const STORAGE_KEYS = {
  USER_PROGRESS: 'user_progress',
  USER_SETTINGS: 'user_settings',
  PLAY_HISTORY: 'play_history',
};

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS = {
  gameMode: GameMode.BEGINNER,
  hintEnabled: true, // ヒントはデフォルトでON（高齢者向け）
};

/**
 * 計算問題設定（超級モード用）
 */
export const MATH_REQUIRED_CORRECT_COUNT = 3; // 回答フェーズに進むために必要な正解数

/**
 * タイミング設定（ミリ秒）
 */
export const TIMING = {
  // カウントダウン
  COUNTDOWN_INTERVAL: 1000, // 1秒ごとにカウントダウン
  // タイマー更新間隔
  TIMER_UPDATE_INTERVAL: 100, // 100msごとに表示更新
  // フィードバック表示時間
  FEEDBACK_CORRECT_DELAY: 500, // 正解時の遅延
  FEEDBACK_INCORRECT_DELAY: 1000, // 不正解時の遅延
  // ヒント表示時間
  HINT_DURATION_BEGINNER: 4000, // 初級: 4秒
  HINT_DURATION_INTERMEDIATE: 2000, // 中級: 2秒
  // アニメーション
  ANIMATION_PRESS: 200, // タップアニメーション
  ANIMATION_SELECT: 500, // 選択アニメーション
};

/**
 * 正解率の閾値
 */
export const ACCURACY_THRESHOLDS = {
  PERFECT: 100, // パーフェクト
  CLEARED: 80, // クリア
  CLOSE: 60, // 惜しい
};

/**
 * 応援メッセージ
 */
export const ENCOURAGEMENT_MESSAGES = {
  PERFECT: [
    '🎉 パーフェクト！素晴らしい！',
    '✨ 完璧です！すごいですね！',
    '🌟 最高の出来です！',
    '👏 100点満点！素晴らしい！',
  ], // 100%
  CLEARED: [
    '😊 よくできました！',
    '👍 すばらしい！クリアです！',
    '🎊 合格です！よく頑張りました！',
    '✌️ やりましたね！',
  ], // 80-99%
  CLOSE: [
    '💪 もう少しです！頑張って！',
    '😄 いい感じですよ！',
    '⭐ 惜しい！次は必ずできます！',
    '👌 だんだん良くなっています！',
  ], // 60-79%
  FAILED: [
    '📚 練習すればきっとできます！',
    '🌈 次はもっと良くなりますよ！',
    '💫 諦めないで頑張りましょう！',
    '🎯 何度でも挑戦しましょう！',
  ], // 0-59%
};

/**
 * 正解率に応じた応援メッセージを取得
 * @param accuracy 正解率 (0-100)
 * @returns 応援メッセージ
 */
export const getEncouragementMessage = (accuracy: number): string => {
  const messages =
    accuracy === ACCURACY_THRESHOLDS.PERFECT
      ? ENCOURAGEMENT_MESSAGES.PERFECT
      : accuracy >= ACCURACY_THRESHOLDS.CLEARED
        ? ENCOURAGEMENT_MESSAGES.CLEARED
        : accuracy >= ACCURACY_THRESHOLDS.CLOSE
          ? ENCOURAGEMENT_MESSAGES.CLOSE
          : ENCOURAGEMENT_MESSAGES.FAILED;

  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * ミリ秒を「秒.ミリ秒」形式にフォーマット
 * @param ms ミリ秒
 * @returns フォーマットされた時間文字列 (例: "3.45")
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10); // 10ms単位
  return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
};

/**
 * 日付を「YYYY/MM/DD HH:mm」形式にフォーマット
 * @param dateString ISO日付文字列
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

/**
 * グリッドの列数を決定
 * @param count 画像数
 * @returns 列数
 */
export const getGridColumns = (count: number): number => {
  if (count <= 4) return 2;
  return 6;
};

/**
 * ユニークIDを生成
 * @param prefix プレフィックス
 * @returns ユニークID
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};
