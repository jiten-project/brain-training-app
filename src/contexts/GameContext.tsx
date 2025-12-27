/**
 * ゲームコンテキスト
 * ユーザー進捗と設定を管理
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserProgress, UserSettings, GameMode } from '../types';
import { loadUserProgress, saveUserProgress, loadUserSettings, saveUserSettings } from '../utils/storage';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface GameContextType {
  // ユーザー進捗
  maxUnlockedLevel: number;
  clearedLevels: number[];
  updateProgress: (level: number, cleared: boolean) => Promise<void>;
  resetProgress: () => Promise<void>;

  // ユーザー設定
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // ローディング状態
  isLoading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const GameProvider: React.FC<Props> = ({ children }) => {
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [clearedLevels, setClearedLevels] = useState<number[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化: ストレージからデータを読み込み
  useEffect(() => {
    const initializeData = async () => {
      try {
        const progress = await loadUserProgress();
        if (progress) {
          setMaxUnlockedLevel(progress.maxUnlockedLevel);
          setClearedLevels(progress.clearedLevels);
        }

        const userSettings = await loadUserSettings();
        if (userSettings) {
          setSettings(userSettings);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // 進捗更新
  const updateProgress = async (level: number, cleared: boolean) => {
    try {
      let newMaxUnlockedLevel = maxUnlockedLevel;
      let newClearedLevels = [...clearedLevels];

      if (cleared) {
        // クリア済みリストに追加
        if (!newClearedLevels.includes(level)) {
          newClearedLevels.push(level);
        }

        // 次のレベルを解放
        if (level === maxUnlockedLevel && level < 20) {
          newMaxUnlockedLevel = level + 1;
        }
      }

      setMaxUnlockedLevel(newMaxUnlockedLevel);
      setClearedLevels(newClearedLevels);

      const progress: UserProgress = {
        maxUnlockedLevel: newMaxUnlockedLevel,
        clearedLevels: newClearedLevels,
        settings,
      };

      await saveUserProgress(progress);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // 進捗リセット
  const resetProgress = async () => {
    try {
      setMaxUnlockedLevel(1);
      setClearedLevels([]);

      const progress: UserProgress = {
        maxUnlockedLevel: 1,
        clearedLevels: [],
        settings,
      };

      await saveUserProgress(progress);
    } catch (error) {
      console.error('Failed to reset progress:', error);
    }
  };

  // 設定更新
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await saveUserSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const value: GameContextType = {
    maxUnlockedLevel,
    clearedLevels,
    updateProgress,
    resetProgress,
    settings,
    updateSettings,
    isLoading,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// カスタムフック
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
