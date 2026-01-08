/**
 * ゲームコンテキスト
 * ユーザー進捗と設定を管理
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserProgress, UserSettings, GameMode, PlayHistory, ModeProgress } from '../types';
import { loadUserProgress, saveUserProgress, loadUserSettings, saveUserSettings, updateStreak, loadPlayHistory, addPlayHistory } from '../utils/storage';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface GameContextType {
  // ユーザー進捗
  maxUnlockedLevel: number; // 後方互換性のため残す
  clearedLevels: number[]; // 後方互換性のため残す
  modeProgress: {
    [GameMode.BEGINNER]: ModeProgress;
    [GameMode.INTERMEDIATE]: ModeProgress;
    [GameMode.ADVANCED]: ModeProgress;
    [GameMode.EXPERT]: ModeProgress;
  };
  currentStreak: number;
  longestStreak: number;
  updateProgress: (level: number, cleared: boolean, gameMode: GameMode) => Promise<void>;
  resetProgress: () => Promise<void>;

  // ユーザー設定
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // プレイ履歴
  playHistory: PlayHistory[];
  addHistory: (history: PlayHistory) => Promise<void>;
  refreshHistory: () => Promise<void>;

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
  const [modeProgress, setModeProgress] = useState<{
    [GameMode.BEGINNER]: ModeProgress;
    [GameMode.INTERMEDIATE]: ModeProgress;
    [GameMode.ADVANCED]: ModeProgress;
    [GameMode.EXPERT]: ModeProgress;
  }>({
    [GameMode.BEGINNER]: { maxUnlockedLevel: 1, clearedLevels: [] },
    [GameMode.INTERMEDIATE]: { maxUnlockedLevel: 1, clearedLevels: [] },
    [GameMode.ADVANCED]: { maxUnlockedLevel: 1, clearedLevels: [] },
    [GameMode.EXPERT]: { maxUnlockedLevel: 1, clearedLevels: [] },
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [playHistory, setPlayHistory] = useState<PlayHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化: ストレージからデータを読み込み & 音声システム初期化
  useEffect(() => {
    const initializeData = async () => {
      try {
        const progress = await loadUserProgress();
        if (progress) {
          setMaxUnlockedLevel(progress.maxUnlockedLevel);
          setClearedLevels(progress.clearedLevels);
          setCurrentStreak(progress.currentStreak || 0);
          setLongestStreak(progress.longestStreak || 0);

          // 難易度ごとの進捗を設定（存在しない場合はデフォルト値）
          if (progress.modeProgress) {
            setModeProgress(progress.modeProgress);
          } else {
            // 旧データの場合は、初級モードに既存の進捗を割り当て
            setModeProgress({
              [GameMode.BEGINNER]: {
                maxUnlockedLevel: progress.maxUnlockedLevel,
                clearedLevels: progress.clearedLevels,
              },
              [GameMode.INTERMEDIATE]: { maxUnlockedLevel: 1, clearedLevels: [] },
              [GameMode.ADVANCED]: { maxUnlockedLevel: 1, clearedLevels: [] },
              [GameMode.EXPERT]: { maxUnlockedLevel: 1, clearedLevels: [] },
            });
          }
        }

        const userSettings = await loadUserSettings();
        if (userSettings) {
          setSettings(userSettings);
        }

        // プレイ履歴を読み込み
        const history = await loadPlayHistory();
        setPlayHistory(history);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // 進捗更新
  const updateProgress = async (level: number, cleared: boolean, gameMode: GameMode) => {
    try {
      let newMaxUnlockedLevel = maxUnlockedLevel;
      let newClearedLevels = [...clearedLevels];
      const newModeProgress = { ...modeProgress };

      // 現在の難易度の進捗を取得
      const currentModeProgress = newModeProgress[gameMode];
      let modeMaxUnlocked = currentModeProgress.maxUnlockedLevel;
      let modeClearedLevels = [...currentModeProgress.clearedLevels];

      if (cleared) {
        // 難易度ごとのクリア済みリストに追加
        if (!modeClearedLevels.includes(level)) {
          modeClearedLevels.push(level);
        }

        // 難易度ごとに次のレベルを解放
        if (level === modeMaxUnlocked && level < 20) {
          modeMaxUnlocked = level + 1;
        }

        // 後方互換性のため、全体の進捗も更新
        if (!newClearedLevels.includes(level)) {
          newClearedLevels.push(level);
        }
        if (level === maxUnlockedLevel && level < 20) {
          newMaxUnlockedLevel = level + 1;
        }
      }

      // 難易度ごとの進捗を更新
      newModeProgress[gameMode] = {
        maxUnlockedLevel: modeMaxUnlocked,
        clearedLevels: modeClearedLevels,
      };

      // ストリークを更新
      let progress: UserProgress = {
        maxUnlockedLevel: newMaxUnlockedLevel,
        clearedLevels: newClearedLevels,
        modeProgress: newModeProgress,
        settings,
        currentStreak,
        lastPlayedDate: '',
        longestStreak,
      };

      // ストリーク計算（初回プレイ時に1になる）
      progress = updateStreak(progress);

      setMaxUnlockedLevel(newMaxUnlockedLevel);
      setClearedLevels(newClearedLevels);
      setModeProgress(newModeProgress);
      setCurrentStreak(progress.currentStreak);
      setLongestStreak(progress.longestStreak);

      await saveUserProgress(progress);
    } catch (error) {
      console.error('進捗の保存に失敗しました:', error);
      // エラーが発生しても、メモリ上の状態は更新済みなので、
      // 次回の保存時に再試行される
    }
  };

  // 進捗リセット
  const resetProgress = async () => {
    try {
      setMaxUnlockedLevel(1);
      setClearedLevels([]);
      setCurrentStreak(0);
      setLongestStreak(0);

      const resetModeProgress = {
        [GameMode.BEGINNER]: { maxUnlockedLevel: 1, clearedLevels: [] as number[] },
        [GameMode.INTERMEDIATE]: { maxUnlockedLevel: 1, clearedLevels: [] as number[] },
        [GameMode.ADVANCED]: { maxUnlockedLevel: 1, clearedLevels: [] as number[] },
        [GameMode.EXPERT]: { maxUnlockedLevel: 1, clearedLevels: [] as number[] },
      };
      setModeProgress(resetModeProgress);

      const progress: UserProgress = {
        maxUnlockedLevel: 1,
        clearedLevels: [],
        modeProgress: resetModeProgress,
        settings,
        currentStreak: 0,
        lastPlayedDate: '',
        longestStreak: 0,
      };

      await saveUserProgress(progress);
    } catch (error) {
      console.error('進捗のリセットに失敗しました:', error);
      throw error; // リセット失敗時は上位に通知
    }
  };

  // 設定更新
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await saveUserSettings(updatedSettings);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      throw error; // 設定失敗時は上位に通知
    }
  };

  // プレイ履歴を追加
  const addHistory = async (history: PlayHistory) => {
    try {
      await addPlayHistory(history);
      // メモリ上の履歴も更新
      const updatedHistory = await loadPlayHistory();
      setPlayHistory(updatedHistory);
    } catch (error) {
      console.error('履歴の保存に失敗しました:', error);
      throw error;
    }
  };

  // プレイ履歴を再読み込み
  const refreshHistory = async () => {
    try {
      const history = await loadPlayHistory();
      setPlayHistory(history);
    } catch (error) {
      console.error('履歴の読み込みに失敗しました:', error);
    }
  };

  const value: GameContextType = {
    maxUnlockedLevel,
    clearedLevels,
    modeProgress,
    currentStreak,
    longestStreak,
    updateProgress,
    resetProgress,
    settings,
    updateSettings,
    playHistory,
    addHistory,
    refreshHistory,
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
