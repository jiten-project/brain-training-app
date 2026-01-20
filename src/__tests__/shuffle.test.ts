/**
 * shuffle.tsのテスト
 */

import { shuffleArray } from '../utils/shuffle';

describe('shuffleArray', () => {
  it('配列の要素数が変わらない', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled.length).toBe(original.length);
  });

  it('元の配列を変更しない', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    shuffleArray(original);
    expect(original).toEqual(originalCopy);
  });

  it('同じ要素を含む', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('空配列を処理できる', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('1要素の配列を処理できる', () => {
    const result = shuffleArray([42]);
    expect(result).toEqual([42]);
  });

  it('オブジェクト配列を処理できる', () => {
    const original = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const shuffled = shuffleArray(original);
    expect(shuffled.length).toBe(3);
    expect(shuffled.map(o => o.id).sort()).toEqual([1, 2, 3]);
  });

  it('シャッフルにより順序が変わる可能性がある（確率的テスト）', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let differentOrder = false;

    // 10回試行して、少なくとも1回は順序が変わることを確認
    for (let i = 0; i < 10; i++) {
      const shuffled = shuffleArray(original);
      if (shuffled.some((val, idx) => val !== original[idx])) {
        differentOrder = true;
        break;
      }
    }

    expect(differentOrder).toBe(true);
  });
});
