/**
 * 計算問題用カスタムHook（超級モード用）
 * 計算問題の生成・回答・正誤判定を管理
 */

import { useState, useRef, useCallback } from 'react';
import { TextInput } from 'react-native';
import { MathProblem } from '../types';
import { generateMathProblem } from '../utils/gameLogic';
import { MATH_REQUIRED_CORRECT_COUNT, TIMING } from '../utils/constants';

/** 計算問題のフィードバック状態 */
type MathFeedback = 'correct' | 'incorrect' | null;

/**
 * useMathProblemの戻り値
 */
interface UseMathProblemReturn {
  /** 現在の計算問題 */
  currentProblem: MathProblem | null;
  /** 正解数 */
  correctCount: number;
  /** ユーザーの回答入力 */
  answer: string;
  /** 正誤フィードバック */
  feedback: MathFeedback;
  /** 入力フィールドのRef */
  inputRef: React.RefObject<TextInput | null>;
  /** 回答を設定する */
  setAnswer: (value: string) => void;
  /** 回答を送信する（必要数正解したらtrueを返す） */
  submitAnswer: () => boolean;
  /** 計算問題をリセットする */
  resetMath: () => void;
  /** 必要な正解数 */
  requiredCount: number;
}

/**
 * 計算問題を管理するカスタムHook
 */
export const useMathProblem = (): UseMathProblemReturn => {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<MathFeedback>(null);
  const inputRef = useRef<TextInput>(null);

  const resetMath = useCallback(() => {
    setCorrectCount(0);
    setAnswer('');
    setFeedback(null);
    setCurrentProblem(generateMathProblem());
  }, []);

  const submitAnswer = useCallback((): boolean => {
    if (!currentProblem || answer.trim() === '') return false;

    const userAnswerNum = parseInt(answer, 10);
    const isCorrect = userAnswerNum === currentProblem.answer;

    if (isCorrect) {
      setFeedback('correct');
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);

      // 必要数正解したら完了
      if (newCorrectCount >= MATH_REQUIRED_CORRECT_COUNT) {
        return true;
      }

      // 次の問題へ
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
        setCurrentProblem(generateMathProblem());
        inputRef.current?.focus();
      }, TIMING.FEEDBACK_CORRECT_DELAY);
    } else {
      // 不正解の場合は新しい問題を生成
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
        setCurrentProblem(generateMathProblem());
        inputRef.current?.focus();
      }, TIMING.FEEDBACK_INCORRECT_DELAY);
    }

    return false;
  }, [currentProblem, answer, correctCount]);

  return {
    currentProblem,
    correctCount,
    answer,
    feedback,
    inputRef,
    setAnswer,
    submitAnswer,
    resetMath,
    requiredCount: MATH_REQUIRED_CORRECT_COUNT,
  };
};
