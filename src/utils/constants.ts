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
    description: '正解枚数 + 10枚',
    difficulty: '★☆☆',
    getChoiceCount: (correctCount: number, _level: number) => correctCount + 10,
  },
  [GameMode.INTERMEDIATE]: {
    name: '中級',
    description: '正解枚数 × 3倍',
    difficulty: '★★☆',
    getChoiceCount: (correctCount: number, _level: number) => correctCount * 3,
  },
  [GameMode.ADVANCED]: {
    name: '上級',
    description: 'レベル1-10: 50枚 / レベル11-20: 100枚',
    difficulty: '★★★',
    getChoiceCount: (_correctCount: number, level: number) => (level <= 10 ? 50 : 100),
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
};

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS = {
  gameMode: GameMode.BEGINNER,
  soundEnabled: true,
};

/**
 * 応援メッセージ
 */
export const ENCOURAGEMENT_MESSAGES = {
  PERFECT: ['パーフェクト！', '素晴らしい！', '完璧です！'], // 100%
  CLEARED: ['よくできました！', '次も頑張りましょう！', 'クリアです！'], // 80-99%
  CLOSE: ['あと少し！', 'もう一度挑戦！', '惜しい！'], // 60-79%
  FAILED: ['次は頑張りましょう！', '練習あるのみ！', 'もう一度！'], // 0-59%
};

/**
 * 正解率に応じた応援メッセージを取得
 * @param accuracy 正解率 (0-100)
 * @returns 応援メッセージ
 */
export const getEncouragementMessage = (accuracy: number): string => {
  const messages =
    accuracy === 100
      ? ENCOURAGEMENT_MESSAGES.PERFECT
      : accuracy >= 80
        ? ENCOURAGEMENT_MESSAGES.CLEARED
        : accuracy >= 60
          ? ENCOURAGEMENT_MESSAGES.CLOSE
          : ENCOURAGEMENT_MESSAGES.FAILED;

  return messages[Math.floor(Math.random() * messages.length)];
};
