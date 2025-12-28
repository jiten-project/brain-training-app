/**
 * AsyncStorage ユーティリティ
 * データの保存・読み込み・削除を提供
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, UserSettings, PlayHistory } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS, LEVELS } from './constants';

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
    if (data) {
      const progress: UserProgress = JSON.parse(data);

      // データのバリデーション
      // maxUnlockedLevelを1-20の範囲にクランプ
      progress.maxUnlockedLevel = Math.max(
        LEVELS.MIN,
        Math.min(LEVELS.MAX, progress.maxUnlockedLevel || LEVELS.MIN)
      );

      // clearedLevelsを1-20の範囲でフィルタリング
      progress.clearedLevels = (progress.clearedLevels || []).filter(
        level => level >= LEVELS.MIN && level <= LEVELS.MAX
      );

      // ストリーク関連のデフォルト値設定（後方互換性）
      progress.currentStreak = progress.currentStreak || 0;
      progress.lastPlayedDate = progress.lastPlayedDate || '';
      progress.longestStreak = progress.longestStreak || 0;

      return progress;
    }
    return null;
  } catch (error) {
    console.error('Failed to load user progress:', error);
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
    console.error('Failed to save user progress:', error);
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
    if (data) {
      return JSON.parse(data);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load user settings:', error);
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
    console.error('Failed to save user settings:', error);
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
    console.error('Failed to clear all data:', error);
    throw error;
  }
};

/**
 * ストレージのデータサイズを取得 (デバッグ用)
 */
export const getStorageInfo = async (): Promise<{ keys: string[]; size: number }> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keys = [...allKeys]; // Convert readonly array to mutable array
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }

    return { keys, size: totalSize };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { keys: [], size: 0 };
  }
};

/**
 * プレイ履歴を読み込み
 * @returns プレイ履歴の配列 (存在しない場合は空配列)
 */
export const loadPlayHistory = async (): Promise<PlayHistory[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAY_HISTORY);
    if (data) {
      const history: PlayHistory[] = JSON.parse(data);
      // 日付の新しい順にソート
      return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return [];
  } catch (error) {
    console.error('Failed to load play history:', error);
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
    console.error('Failed to save play history:', error);
    throw error;
  }
};

/**
 * プレイ履歴に新しい記録を追加
 * レベル・難易度ごとに最新100個と最高記録（パーフェクト達成の最短時間）を保持
 * @param newRecord 新しいプレイ記録
 */
export const addPlayHistory = async (newRecord: PlayHistory): Promise<void> => {
  try {
    const history = await loadPlayHistory();
    const level = newRecord.level;
    const gameMode = newRecord.gameMode;

    // 同レベル・同難易度の記録を抽出
    const sameLevelModeRecords = history.filter(
      h => h.level === level && h.gameMode === gameMode
    );
    const otherRecords = history.filter(
      h => h.level !== level || h.gameMode !== gameMode
    );

    // 最高記録を判定（パーフェクト達成の最短時間）
    let newIsBestRecord = false;
    if (newRecord.accuracy === 100) {
      const totalTime = newRecord.memorizeTime + newRecord.answerTime;

      // 既存の最高記録を探す（同レベル・同難易度のみ）
      const currentBestRecordIndex = sameLevelModeRecords.findIndex(
        r => r.isBestRecord && r.accuracy === 100
      );

      if (currentBestRecordIndex !== -1) {
        const currentBestRecord = sameLevelModeRecords[currentBestRecordIndex];
        const currentBestTotalTime = currentBestRecord.memorizeTime + currentBestRecord.answerTime;
        if (totalTime < currentBestTotalTime) {
          // 新記録！既存の最高記録フラグを解除（イミュータブルに更新）
          sameLevelModeRecords[currentBestRecordIndex] = {
            ...currentBestRecord,
            isBestRecord: false,
          };
          newIsBestRecord = true;
        }
      } else {
        // 初のパーフェクト記録
        newIsBestRecord = true;
      }
    }

    // 新しい記録に最高記録フラグを設定（イミュータブルに）
    const recordToAdd: PlayHistory = {
      ...newRecord,
      isBestRecord: newIsBestRecord,
    };

    // 新しい記録を追加
    sameLevelModeRecords.unshift(recordToAdd);

    // レベル・難易度ごとの記録を整理
    const bestRecord = sameLevelModeRecords.find(r => r.isBestRecord);
    const regularRecords = sameLevelModeRecords.filter(r => !r.isBestRecord);

    // 最高記録以外の記録を最新100個に制限
    const trimmedRegularRecords = regularRecords.slice(0, 100);

    // 最高記録がある場合は先頭に配置、その後に通常記録
    const finalSameLevelModeRecords = bestRecord
      ? [bestRecord, ...trimmedRegularRecords]
      : trimmedRegularRecords;

    // 全記録を結合
    const finalHistory = [...finalSameLevelModeRecords, ...otherRecords];

    await savePlayHistory(finalHistory);
  } catch (error) {
    console.error('Failed to add play history:', error);
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
    console.error('Failed to clear play history:', error);
    throw error;
  }
};
