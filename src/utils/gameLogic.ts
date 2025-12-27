/**
 * ゲームロジック
 * ゲームの各種処理を提供
 */

import { ImageData, GameMode, GameResult, SelectedResult } from '../types';
import { getRandomImages } from './imageData';
import { getImageCount, GAME_MODE_CONFIG, CLEAR_CONDITION } from './constants';

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
 * 配列をシャッフル (Fisher-Yatesアルゴリズム)
 * @param array シャッフルする配列
 * @returns シャッフルされた配列
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * ゲーム結果を判定
 * @param correctImages 正解画像
 * @param selectedImages ユーザーが選択した画像
 * @param level レベル番号
 * @returns ゲーム結果
 */
export const evaluateGameResult = (
  correctImages: ImageData[],
  selectedImages: ImageData[],
  level: number
): GameResult => {
  const correctIds = correctImages.map(img => img.id);
  const selectedIds = selectedImages.map(img => img.id);

  // 正解数を計算
  const correctCount = selectedIds.filter(id => correctIds.includes(id)).length;

  // 全体の枚数
  const totalCount = correctImages.length;

  // 正解率を計算
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
 * 次のレベルが利用可能か判定
 * @param currentLevel 現在のレベル
 * @param maxUnlockedLevel 最高到達レベル
 * @returns 次のレベルがプレイ可能かどうか
 */
export const isNextLevelAvailable = (
  currentLevel: number,
  maxUnlockedLevel: number
): boolean => {
  return currentLevel < 20 && currentLevel < maxUnlockedLevel;
};
