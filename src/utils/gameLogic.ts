/**
 * ゲームロジック
 * ゲームの各種処理を提供
 */

import { ImageData, GameMode, GameResult, SelectedResult, MathProblem } from '../types';
import { getRandomImages } from './imageData';
import { getImageCount, GAME_MODE_CONFIG, CLEAR_CONDITION } from './constants';
import { shuffleArray } from './shuffle';

/**
 * ゲーム用の正解画像をランダムに選択
 * @param level レベル番号
 * @returns 正解画像の配列
 */
export const generateCorrectImages = (level: number): ImageData[] => {
  const count = getImageCount(level);
  return getRandomImages(count);
};

/**
 * 選択肢画像を生成
 * @param correctImages 正解画像
 * @param level レベル番号
 * @param mode ゲームモード
 * @returns 選択肢画像の配列 (正解画像 + ダミー画像をシャッフル)
 */
export const generateChoiceImages = (
  correctImages: ImageData[],
  level: number,
  mode: GameMode
): ImageData[] => {
  const correctCount = correctImages.length;
  const correctIds = correctImages.map(img => img.id);

  // モードに応じた選択肢数を計算
  const totalChoiceCount = GAME_MODE_CONFIG[mode].getChoiceCount(correctCount, level);

  // ダミー画像の数 = 全選択肢数 - 正解画像数
  const distractorCount = totalChoiceCount - correctCount;

  // ダミー画像をランダムに選択
  const distractors = getRandomImages(distractorCount, correctIds);

  // 正解画像とダミー画像を混ぜてシャッフル
  const allImages = [...correctImages, ...distractors];
  return shuffleArray(allImages);
};

/**
 * ゲーム結果を判定
 * @param correctImages 正解画像
 * @param selectedImages ユーザーが選択した画像
 * @param choiceImages 選択肢の全画像
 * @param level レベル番号
 * @param memorizeTime 記憶時間（ミリ秒）
 * @param answerTime 回答時間（ミリ秒）
 * @returns ゲーム結果
 */
export const evaluateGameResult = (
  correctImages: ImageData[],
  selectedImages: ImageData[],
  choiceImages: ImageData[],
  level: number,
  memorizeTime: number,
  answerTime: number
): GameResult => {
  const correctIds = correctImages.map(img => img.id);
  const selectedIds = selectedImages.map(img => img.id);

  // 正解数を計算（正しく選択された枚数）
  const correctCount = selectedIds.filter(id => correctIds.includes(id)).length;

  // 全体の枚数
  const totalCount = correctImages.length;

  // 正解率を計算: 正解数 / 全体の枚数 × 100
  const accuracy = Math.round((correctCount / totalCount) * 100);

  // クリア判定 (80%以上)
  const isCleared = accuracy >= CLEAR_CONDITION.THRESHOLD * 100;

  // 各選択の正誤
  const selectedResults: SelectedResult[] = selectedImages.map(img => ({
    image: img,
    isCorrect: correctIds.includes(img.id),
  }));

  return {
    level,
    totalCount,
    correctCount,
    accuracy,
    isCleared,
    selectedResults,
    choiceImages,
    correctImages,
    memorizeTime,
    answerTime,
  };
};

/**
 * レベルがクリアされているか判定
 * @param accuracy 正解率 (0-100)
 * @returns クリアしたかどうか
 */
export const isLevelCleared = (accuracy: number): boolean => {
  return accuracy >= CLEAR_CONDITION.THRESHOLD * 100;
};

/**
 * 2桁の足し算・引き算の計算問題を生成
 * @returns 計算問題
 */
export const generateMathProblem = (): MathProblem => {
  const id = `math_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const operator = Math.random() < 0.5 ? '+' : '-';

  let num1: number;
  let num2: number;
  let answer: number;

  if (operator === '+') {
    // 足し算: 10〜99の2桁の数字同士、答えが200以下
    num1 = Math.floor(Math.random() * 90) + 10; // 10〜99
    // 答えが200以下になるように調整
    const maxNum2 = Math.min(99, 200 - num1);
    const minNum2 = 10;
    if (maxNum2 < minNum2) {
      // num1が大きすぎる場合は調整
      num2 = Math.floor(Math.random() * (maxNum2 - 1)) + 1;
    } else {
      num2 = Math.floor(Math.random() * (maxNum2 - minNum2 + 1)) + minNum2;
    }
    answer = num1 + num2;
  } else {
    // 引き算: num1とnum2両方が2桁(10〜99)で、答えが正の数になる
    // num1: 20〜99（num2が10以上になるように）
    num1 = Math.floor(Math.random() * 80) + 20; // 20〜99
    // num2: 10〜(num1-1)の範囲で2桁の数（最大でもnum1-1）
    const maxNum2 = Math.min(99, num1 - 1);
    num2 = Math.floor(Math.random() * (maxNum2 - 10 + 1)) + 10; // 10〜maxNum2
    answer = num1 - num2;
  }

  return { id, num1, num2, operator, answer };
};
