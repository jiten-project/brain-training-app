/**
 * ゲームタイマー用カスタムHook
 * 記憶フェーズと回答フェーズの経過時間を管理
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * useGameTimerの戻り値
 */
interface UseGameTimerReturn {
  /** 経過時間（ミリ秒） */
  elapsedTime: number;
  /** タイマーを開始する */
  startTimer: () => void;
  /** タイマーを停止する */
  stopTimer: () => void;
  /** タイマーをリセットする */
  resetTimer: () => void;
  /** タイマーが動作中かどうか */
  isRunning: boolean;
}

/**
 * 経過時間を管理するカスタムHook
 * @param interval 更新間隔（ミリ秒）デフォルト100ms
 */
export const useGameTimer = (interval: number = 100): UseGameTimerReturn => {
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, interval);

    return () => clearInterval(timer);
  }, [isRunning, startTime, interval]);

  const startTimer = useCallback(() => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setStartTime(0);
    setElapsedTime(0);
    setIsRunning(false);
  }, []);

  return {
    elapsedTime,
    startTimer,
    stopTimer,
    resetTimer,
    isRunning,
  };
};
