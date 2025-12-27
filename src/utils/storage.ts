/**
 * AsyncStorage ユーティリティ
 * データの保存・読み込み・削除を提供
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, UserSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';

/**
 * ユーザー進捗を読み込み
 * @returns ユーザー進捗 (存在しない場合はnull)
 */
export const loadUserProgress = async (): Promise<UserProgress | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Failed to load user progress:', error);
    return null;
  }
};

/**
 * ユーザー進捗を保存
 * @param progress ユーザー進捗
 */
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
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
    const keys = await AsyncStorage.getAllKeys();
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
