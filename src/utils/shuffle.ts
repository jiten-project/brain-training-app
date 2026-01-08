/**
 * 配列シャッフルユーティリティ
 */

/**
 * 配列をシャッフル (Fisher-Yatesアルゴリズム)
 * @param array シャッフルする配列
 * @returns シャッフルされた新しい配列（元の配列は変更しない）
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
