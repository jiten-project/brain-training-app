/**
 * ゲームコンテキスト
 * ユーザー進捗と設定を管理
 */

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { UserProgress, UserSettings, GameMode, PlayHistory, ModeProgress } from '../types';
import { loadUserProgress, saveUserProgress, loadUserSettings, saveUserSettings, updateStreak, loadPlayHistory, addPlayHistory } from '../utils/storage';
import { DEFAULT_SETTINGS, LEVELS } from '../utils/constants';
import { handleContextError } from '../utils/logger';

/**
 * 難易度ごとの進捗の型
 */
type AllModeProgress = {
  [GameMode.BEGINNER]: ModeProgress;
  [GameMode.INTERMEDIATE]: ModeProgress;
  [GameMode.ADVANCED]: ModeProgress;
  [GameMode.EXPERT]: ModeProgress;
};

/**
 * デフォルトの難易度別進捗
 */
const DEFAULT_MODE_PROGRESS: AllModeProgress = {
  [GameMode.BEGINNER]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] },
  [GameMode.INTERMEDIATE]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] },
  [GameMode.ADVANCED]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] },
  [GameMode.EXPERT]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] },
};

interface GameContextType {
  // ユーザー進捗（難易度ごと）
  modeProgress: AllModeProgress;
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
  const [modeProgress, setModeProgress] = useState<AllModeProgress>(DEFAULT_MODE_PROGRESS);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [playHistory, setPlayHistory] = useState<PlayHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化: ストレージからデータを読み込み
  useEffect(() => {
    const initializeData = async () => {
      try {
        const progress = await loadUserProgress();
        if (progress) {
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
              [GameMode.INTERMEDIATE]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] },
              [GameMode.ADVANCED]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] },
              [GameMode.EXPERT]: { maxUnlockedLevel: LEVELS.MIN, clearedLevels: [] },
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
        handleContextError('initializeData', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // 進捗更新
  const updateProgress = useCallback(async (level: number, cleared: boolean, gameMode: GameMode) => {
    try {
      setModeProgress(prevModeProgress => {
        const currentModeProgress = prevModeProgress[gameMode];
        let modeMaxUnlocked = currentModeProgress.maxUnlockedLevel;
        let modeClearedLevels = [...currentModeProgress.clearedLevels];

        if (cleared) {
          // 難易度ごとのクリア済みリストに追加
          if (!modeClearedLevels.includes(level)) {
            modeClearedLevels.push(level);
          }

          // 難易度ごとに次のレベルを解放
          if (level === modeMaxUnlocked && level < LEVELS.MAX) {
            modeMaxUnlocked = level + 1;
          }
        }

        return {
          ...prevModeProgress,
          [gameMode]: {
            maxUnlockedLevel: modeMaxUnlocked,
            clearedLevels: modeClearedLevels,
          },
        };
      });

      // ストリーク更新のためにcallbackの外で処理
      setCurrentStreak(prevStreak => {
        setLongestStreak(prevLongest => Math.max(prevStreak + 1, prevLongest));
        return prevStreak;
      });

      // 非同期保存（状態が更新された後にeffectで処理する方がベターだが、
      // 現状の設計を維持するためここで保存）
      const newModeProgress = { ...modeProgress };
      const currentModeProgress = newModeProgress[gameMode];
      let modeMaxUnlocked = currentModeProgress.maxUnlockedLevel;
      let modeClearedLevels = [...currentModeProgress.clearedLevels];

      if (cleared) {
        if (!modeClearedLevels.includes(level)) {
          modeClearedLevels.push(level);
        }
        if (level === modeMaxUnlocked && level < LEVELS.MAX) {
          modeMaxUnlocked = level + 1;
        }
      }

      newModeProgress[gameMode] = {
        maxUnlockedLevel: modeMaxUnlocked,
        clearedLevels: modeClearedLevels,
      };

      // 後方互換性のためのデータを計算
      const allClearedLevels = Object.values(newModeProgress)
        .flatMap(p => p.clearedLevels)
        .filter((v, i, a) => a.indexOf(v) === i);
      const maxLevel = Math.max(...Object.values(newModeProgress).map(p => p.maxUnlockedLevel));

      let progress: UserProgress = {
        maxUnlockedLevel: maxLevel,
        clearedLevels: allClearedLevels,
        modeProgress: newModeProgress,
        settings,
        currentStreak,
        lastPlayedDate: '',
        longestStreak,
      };

      // ストリーク計算
      progress = updateStreak(progress);
      setCurrentStreak(progress.currentStreak);
      setLongestStreak(progress.longestStreak);

      await saveUserProgress(progress);
    } catch (error) {
      handleContextError('updateProgress', error);
      // エラーが発生しても、メモリ上の状態は更新済みなので、
      // 次回の保存時に再試行される
    }
  }, [modeProgress, settings, currentStreak, longestStreak]);

  // 進捗リセット
  const resetProgress = useCallback(async () => {
    try {
      setModeProgress(DEFAULT_MODE_PROGRESS);
      setCurrentStreak(0);
      setLongestStreak(0);

      const progress: UserProgress = {
        maxUnlockedLevel: LEVELS.MIN,
        clearedLevels: [],
        modeProgress: DEFAULT_MODE_PROGRESS,
        settings,
        currentStreak: 0,
        lastPlayedDate: '',
        longestStreak: 0,
      };

      await saveUserProgress(progress);
    } catch (error) {
      handleContextError('resetProgress', error);
      throw error; // リセット失敗時は上位に通知
    }
  }, [settings]);

  // 設定更新
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await saveUserSettings(updatedSettings);
    } catch (error) {
      handleContextError('updateSettings', error);
      throw error; // 設定失敗時は上位に通知
    }
  }, [settings]);

  // プレイ履歴を追加
  const addHistory = useCallback(async (history: PlayHistory) => {
    try {
      await addPlayHistory(history);
      // メモリ上の履歴も更新
      const updatedHistory = await loadPlayHistory();
      setPlayHistory(updatedHistory);
    } catch (error) {
      handleContextError('addHistory', error);
      throw error;
    }
  }, []);

  // プレイ履歴を再読み込み
  const refreshHistory = useCallback(async () => {
    try {
      const history = await loadPlayHistory();
      setPlayHistory(history);
    } catch (error) {
      handleContextError('refreshHistory', error);
    }
  }, []);

  const value: GameContextType = useMemo(() => ({
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
  }), [
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
  ]);

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
