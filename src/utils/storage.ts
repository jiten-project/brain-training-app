/**
 * AsyncStorage ユーティリティ
 * データの保存・読み込み・削除を提供
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, UserSettings, PlayHistory } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS, LEVELS, ACCURACY_THRESHOLDS } from './constants';
import { handleStorageError } from './logger';
import {
  validateUserProgress,
  validateUserSettings,
  validatePlayHistoryArray,
  safeJsonParse,
} from './validation';

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * 日付差分を計算（日単位）
 */
const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * ユーザー進捗を読み込み
 * @returns ユーザー進捗 (存在しない場合はnull)
 */
export const loadUserProgress = async (): Promise<UserProgress | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (!data) return null;

    const parsed = safeJsonParse(data);
    if (parsed === null) {
      handleStorageError('loadUserProgress', 'JSONパースエラー');
      return null;
    }

    const progress = validateUserProgress(parsed);
    if (progress === null) {
      handleStorageError('loadUserProgress', 'バリデーションエラー');
      return null;
    }

    return progress;
  } catch (error) {
    handleStorageError('loadUserProgress', error);
    return null;
  }
};

/**
 * ストリークを更新
 * @param progress 現在の進捗データ
 * @returns 更新された進捗データ
 */
export const updateStreak = (progress: UserProgress): UserProgress => {
  const today = getTodayString();
  const lastPlayed = progress.lastPlayedDate;

  // 初回プレイの場合
  if (!lastPlayed) {
    return {
      ...progress,
      currentStreak: 1,
      lastPlayedDate: today,
      longestStreak: Math.max(1, progress.longestStreak),
    };
  }

  // 今日既にプレイ済みの場合は変更なし
  if (lastPlayed === today) {
    return progress;
  }

  const daysDiff = getDaysDifference(lastPlayed, today);

  // 1日後（連続プレイ）
  if (daysDiff === 1) {
    const newStreak = progress.currentStreak + 1;
    return {
      ...progress,
      currentStreak: newStreak,
      lastPlayedDate: today,
      longestStreak: Math.max(newStreak, progress.longestStreak),
    };
  }

  // 2日以上空いた場合はリセット
  return {
    ...progress,
    currentStreak: 1,
    lastPlayedDate: today,
    // longestStreakは維持
  };
};

/**
 * ユーザー進捗を保存
 * @param progress ユーザー進捗
 */
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    // 保存前にバリデーション
    const validatedProgress: UserProgress = {
      ...progress,
      maxUnlockedLevel: Math.max(
        LEVELS.MIN,
        Math.min(LEVELS.MAX, progress.maxUnlockedLevel)
      ),
      clearedLevels: progress.clearedLevels.filter(
        level => level >= LEVELS.MIN && level <= LEVELS.MAX
      ),
      currentStreak: progress.currentStreak || 0,
      lastPlayedDate: progress.lastPlayedDate || '',
      longestStreak: progress.longestStreak || 0,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(validatedProgress));
  } catch (error) {
    handleStorageError('saveUserProgress', error);
    throw error;
  }
};

/**
 * ユーザー設定を読み込み
 * @returns ユーザー設定 (存在しない場合はデフォルト設定)
 */
export const loadUserSettings = async (): Promise<UserSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!data) return DEFAULT_SETTINGS;

    const parsed = safeJsonParse(data);
    if (parsed === null) {
      handleStorageError('loadUserSettings', 'JSONパースエラー');
      return DEFAULT_SETTINGS;
    }

    const settings = validateUserSettings(parsed);
    return settings || DEFAULT_SETTINGS;
  } catch (error) {
    handleStorageError('loadUserSettings', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * ユーザー設定を保存
 * @param settings ユーザー設定
 */
export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    handleStorageError('saveUserSettings', error);
    throw error;
  }
};

/**
 * 全データを削除
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER_PROGRESS, STORAGE_KEYS.USER_SETTINGS]);
  } catch (error) {
    handleStorageError('clearAllData', error);
    throw error;
  }
};

/**
 * プレイ履歴を読み込み
 * @returns プレイ履歴の配列 (存在しない場合は空配列)
 */
export const loadPlayHistory = async (): Promise<PlayHistory[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAY_HISTORY);
    if (!data) return [];

    const parsed = safeJsonParse(data);
    if (parsed === null) {
      handleStorageError('loadPlayHistory', 'JSONパースエラー');
      return [];
    }

    const history = validatePlayHistoryArray(parsed);
    // 日付の新しい順にソート
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    handleStorageError('loadPlayHistory', error);
    return [];
  }
};

/**
 * プレイ履歴を保存
 * @param history プレイ履歴の配列
 */
export const savePlayHistory = async (history: PlayHistory[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAY_HISTORY, JSON.stringify(history));
  } catch (error) {
    handleStorageError('savePlayHistory', error);
    throw error;
  }
};

// --- プレイ履歴管理のヘルパー関数 ---

/**
 * 同レベル・同難易度の記録を抽出
 */
const filterRecordsByLevelAndMode = (
  history: PlayHistory[],
  level: number,
  gameMode: PlayHistory['gameMode']
): { sameLevelModeRecords: PlayHistory[]; otherRecords: PlayHistory[] } => {
  const sameLevelModeRecords = history.filter(
    h => h.level === level && h.gameMode === gameMode
  );
  const otherRecords = history.filter(
    h => h.level !== level || h.gameMode !== gameMode
  );
  return { sameLevelModeRecords, otherRecords };
};

/**
 * 最高記録を判定し、フラグを更新
 */
const updateBestRecordFlag = (
  records: PlayHistory[],
  newRecord: PlayHistory
): { updatedRecords: PlayHistory[]; newIsBestRecord: boolean } => {
  // パーフェクトでない場合は最高記録にならない
  if (newRecord.accuracy !== ACCURACY_THRESHOLDS.PERFECT) {
    return { updatedRecords: records, newIsBestRecord: false };
  }

  const totalTime = newRecord.memorizeTime + newRecord.answerTime;

  // 既存の最高記録を探す（同レベル・同難易度のパーフェクト記録）
  const currentBestRecordIndex = records.findIndex(
    r => r.isBestRecord && r.accuracy === ACCURACY_THRESHOLDS.PERFECT
  );

  if (currentBestRecordIndex !== -1) {
    const currentBestRecord = records[currentBestRecordIndex];
    const currentBestTotalTime = currentBestRecord.memorizeTime + currentBestRecord.answerTime;

    if (totalTime < currentBestTotalTime) {
      // 新記録！既存の最高記録フラグを解除（イミュータブルに更新）
      const updatedRecords = [...records];
      updatedRecords[currentBestRecordIndex] = {
        ...currentBestRecord,
        isBestRecord: false,
      };
      return { updatedRecords, newIsBestRecord: true };
    }
    return { updatedRecords: records, newIsBestRecord: false };
  }

  // 初のパーフェクト記録
  return { updatedRecords: records, newIsBestRecord: true };
};

/**
 * 記録を整理（最高記録を保持しつつ、通常記録を制限）
 */
const organizeRecords = (records: PlayHistory[], maxRegularRecords: number = 100): PlayHistory[] => {
  const bestRecord = records.find(r => r.isBestRecord);
  const regularRecords = records.filter(r => !r.isBestRecord);

  // 最高記録以外の記録を最新N個に制限
  const trimmedRegularRecords = regularRecords.slice(0, maxRegularRecords);

  // 最高記録がある場合は先頭に配置、その後に通常記録
  return bestRecord ? [bestRecord, ...trimmedRegularRecords] : trimmedRegularRecords;
};

/**
 * プレイ履歴に新しい記録を追加
 * レベル・難易度ごとに最新100個と最高記録（パーフェクト達成の最短時間）を保持
 * @param newRecord 新しいプレイ記録
 */
export const addPlayHistory = async (newRecord: PlayHistory): Promise<void> => {
  try {
    const history = await loadPlayHistory();
    const { level, gameMode } = newRecord;

    // 同レベル・同難易度の記録を抽出
    const { sameLevelModeRecords, otherRecords } = filterRecordsByLevelAndMode(history, level, gameMode);

    // 最高記録を判定
    const { updatedRecords, newIsBestRecord } = updateBestRecordFlag(sameLevelModeRecords, newRecord);

    // 新しい記録に最高記録フラグを設定（イミュータブルに）
    const recordToAdd: PlayHistory = {
      ...newRecord,
      isBestRecord: newIsBestRecord,
    };

    // 新しい記録を追加
    const recordsWithNew = [recordToAdd, ...updatedRecords];

    // 記録を整理
    const organizedRecords = organizeRecords(recordsWithNew);

    // 全記録を結合
    const finalHistory = [...organizedRecords, ...otherRecords];

    await savePlayHistory(finalHistory);
  } catch (error) {
    handleStorageError('addPlayHistory', error);
    throw error;
  }
};

/**
 * プレイ履歴をクリア
 */
export const clearPlayHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PLAY_HISTORY);
  } catch (error) {
    handleStorageError('clearPlayHistory', error);
    throw error;
  }
};
