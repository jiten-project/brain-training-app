/**
 * ヒント機能用カスタムHook
 * 初級・中級モードでのヒント表示を管理
 */

import { useState, useCallback } from 'react';
import { GameMode } from '../types';
import { TIMING } from '../utils/constants';

/**
 * useHintの戻り値
 */
interface UseHintReturn {
  /** ヒントが使用されたかどうか */
  hintUsed: boolean;
  /** ヒント表示中かどうか */
  showingHint: boolean;
  /** ヒントを使用する */
  useHint: () => void;
  /** ヒント状態をリセットする */
  resetHint: () => void;
  /** ヒント表示時間を取得する（ミリ秒） */
  getHintDuration: () => number;
  /** ヒントの説明文を取得する */
  getHintDescription: () => string;
  /** ヒントが使用可能かどうか判定する */
  canUseHint: (gameMode: GameMode, hintEnabled: boolean) => boolean;
}

/**
 * ヒント機能を管理するカスタムHook
 * @param gameMode 現在のゲームモード
 */
export const useHint = (gameMode: GameMode): UseHintReturn => {
  const [hintUsed, setHintUsed] = useState(false);
  const [showingHint, setShowingHint] = useState(false);

  const getHintDuration = useCallback((): number => {
    if (gameMode === GameMode.BEGINNER) return TIMING.HINT_DURATION_BEGINNER;
    if (gameMode === GameMode.INTERMEDIATE) return TIMING.HINT_DURATION_INTERMEDIATE;
    return 0;
  }, [gameMode]);

  const getHintDescription = useCallback((): string => {
    if (gameMode === GameMode.BEGINNER) {
      return '正解の画像を4秒間もう一度表示します。\n記憶を確認できます。';
    }
    if (gameMode === GameMode.INTERMEDIATE) {
      return '正解の画像を2秒間もう一度表示します。\n記憶を確認できます。';
    }
    return '';
  }, [gameMode]);

  const canUseHint = useCallback((mode: GameMode, hintEnabled: boolean): boolean => {
    return hintEnabled && !hintUsed && (mode === GameMode.BEGINNER || mode === GameMode.INTERMEDIATE);
  }, [hintUsed]);

  const useHint = useCallback(() => {
    if (hintUsed) return;

    setHintUsed(true);
    const duration = getHintDuration();

    if (duration > 0) {
      setShowingHint(true);
      setTimeout(() => {
        setShowingHint(false);
      }, duration);
    }
  }, [hintUsed, getHintDuration]);

  const resetHint = useCallback(() => {
    setHintUsed(false);
    setShowingHint(false);
  }, []);

  return {
    hintUsed,
    showingHint,
    useHint,
    resetHint,
    getHintDuration,
    getHintDescription,
    canUseHint,
  };
};
