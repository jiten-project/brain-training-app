/**
 * データバリデーションユーティリティ
 * AsyncStorageから読み込んだデータの型安全性を確保
 */

import { UserProgress, UserSettings, PlayHistory, GameMode, ModeProgress } from '../types';
import { LEVELS, DEFAULT_SETTINGS } from './constants';

/**
 * 値が数値かどうかを判定
 */
const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);

/**
 * 値が文字列かどうかを判定
 */
const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * 値がブール値かどうかを判定
 */
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

/**
 * 値が配列かどうかを判定
 */
const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

/**
 * 値がオブジェクトかどうかを判定
 */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * 有効なGameModeかどうかを判定
 */
const isValidGameMode = (value: unknown): value is GameMode =>
  value === GameMode.BEGINNER ||
  value === GameMode.INTERMEDIATE ||
  value === GameMode.ADVANCED ||
  value === GameMode.EXPERT;

/**
 * レベル番号をバリデート（1-20の範囲にクランプ）
 */
const validateLevel = (level: unknown): number => {
  if (!isNumber(level)) return LEVELS.MIN;
  return Math.max(LEVELS.MIN, Math.min(LEVELS.MAX, Math.floor(level)));
};

/**
 * クリア済みレベル配列をバリデート
 */
const validateClearedLevels = (levels: unknown): number[] => {
  if (!isArray(levels)) return [];
  return levels
    .filter(isNumber)
    .filter(level => level >= LEVELS.MIN && level <= LEVELS.MAX)
    .map(Math.floor);
};

/**
 * ModeProgressをバリデート
 */
const validateModeProgress = (progress: unknown): ModeProgress => {
  if (!isObject(progress)) {
    return { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] };
  }
  return {
    maxUnlockedLevel: validateLevel(progress.maxUnlockedLevel),
    clearedLevels: validateClearedLevels(progress.clearedLevels),
  };
};

/**
 * 難易度ごとの進捗をバリデート
 */
const validateAllModeProgress = (
  modeProgress: unknown
): {
  [GameMode.BEGINNER]: ModeProgress;
  [GameMode.INTERMEDIATE]: ModeProgress;
  [GameMode.ADVANCED]: ModeProgress;
  [GameMode.EXPERT]: ModeProgress;
} => {
  const defaultProgress = {
    [GameMode.BEGINNER]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] as number[] },
    [GameMode.INTERMEDIATE]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] as number[] },
    [GameMode.ADVANCED]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] as number[] },
    [GameMode.EXPERT]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] as number[] },
  };

  if (!isObject(modeProgress)) return defaultProgress;

  return {
    [GameMode.BEGINNER]: validateModeProgress(modeProgress[GameMode.BEGINNER]),
    [GameMode.INTERMEDIATE]: validateModeProgress(modeProgress[GameMode.INTERMEDIATE]),
    [GameMode.ADVANCED]: validateModeProgress(modeProgress[GameMode.ADVANCED]),
    [GameMode.EXPERT]: validateModeProgress(modeProgress[GameMode.EXPERT]),
  };
};

/**
 * UserProgressをバリデート
 * @param data パースされたJSONデータ
 * @returns バリデート済みのUserProgress（無効な場合はnull）
 */
export const validateUserProgress = (data: unknown): UserProgress | null => {
  if (!isObject(data)) return null;

  const maxUnlockedLevel = validateLevel(data.maxUnlockedLevel);
  const clearedLevels = validateClearedLevels(data.clearedLevels);
  const modeProgress = validateAllModeProgress(data.modeProgress);
  const currentStreak = isNumber(data.currentStreak) ? Math.max(0, Math.floor(data.currentStreak)) : 0;
  const longestStreak = isNumber(data.longestStreak) ? Math.max(0, Math.floor(data.longestStreak)) : 0;
  const lastPlayedDate = isString(data.lastPlayedDate) ? data.lastPlayedDate : '';

  // settingsは別途バリデート
  const settings = validateUserSettings(data.settings) || DEFAULT_SETTINGS;

  return {
    maxUnlockedLevel,
    clearedLevels,
    modeProgress,
    settings,
    currentStreak,
    lastPlayedDate,
    longestStreak,
  };
};

/**
 * UserSettingsをバリデート
 * @param data パースされたJSONデータ
 * @returns バリデート済みのUserSettings（無効な場合はnull）
 */
export const validateUserSettings = (data: unknown): UserSettings | null => {
  if (!isObject(data)) return null;

  const gameMode = isValidGameMode(data.gameMode) ? data.gameMode : DEFAULT_SETTINGS.gameMode;
  const hintEnabled = isBoolean(data.hintEnabled) ? data.hintEnabled : DEFAULT_SETTINGS.hintEnabled;

  return {
    gameMode,
    hintEnabled,
  };
};

/**
 * PlayHistoryをバリデート
 * @param data パースされたJSONデータ
 * @returns バリデート済みのPlayHistory（無効な場合はnull）
 */
export const validatePlayHistory = (data: unknown): PlayHistory | null => {
  if (!isObject(data)) return null;

  // 必須フィールドの検証
  if (!isString(data.id) || !isString(data.date)) return null;
  if (!isNumber(data.level) || !isNumber(data.correctCount) || !isNumber(data.totalCount)) return null;
  if (!isNumber(data.accuracy) || !isNumber(data.memorizeTime) || !isNumber(data.answerTime)) return null;
  if (!isValidGameMode(data.gameMode)) return null;

  return {
    id: data.id,
    date: data.date,
    level: validateLevel(data.level),
    correctCount: Math.max(0, Math.floor(data.correctCount)),
    totalCount: Math.max(1, Math.floor(data.totalCount)),
    accuracy: Math.max(0, Math.min(100, data.accuracy)),
    isCleared: isBoolean(data.isCleared) ? data.isCleared : data.accuracy >= 80,
    memorizeTime: Math.max(0, data.memorizeTime),
    answerTime: Math.max(0, data.answerTime),
    gameMode: data.gameMode,
    isBestRecord: isBoolean(data.isBestRecord) ? data.isBestRecord : false,
  };
};

/**
 * PlayHistory配列をバリデート
 * @param data パースされたJSONデータ
 * @returns バリデート済みのPlayHistory配列
 */
export const validatePlayHistoryArray = (data: unknown): PlayHistory[] => {
  if (!isArray(data)) return [];
  return data.map(validatePlayHistory).filter((item): item is PlayHistory => item !== null);
};

/**
 * JSONを安全にパース
 * @param json JSON文字列
 * @returns パースされたデータ（失敗時はnull）
 */
export const safeJsonParse = (json: string): unknown => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};
