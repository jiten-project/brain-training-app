/**
 * constants.tsのテスト
 */

import {
  getImageCount,
  getRequiredCorrectCount,
  getEncouragementMessage,
  formatTime,
  formatDate,
  getGridColumns,
  generateId,
  LEVELS,
  CLEAR_CONDITION,
  ACCURACY_THRESHOLDS,
} from '../utils/constants';

describe('getImageCount', () => {
  it('レベル1で4枚を返す', () => {
    expect(getImageCount(1)).toBe(4);
  });

  it('レベル10で13枚を返す', () => {
    expect(getImageCount(10)).toBe(13);
  });

  it('レベル20で23枚を返す', () => {
    expect(getImageCount(20)).toBe(23);
  });
});

describe('getRequiredCorrectCount', () => {
  it('レベル1で4枚（4 * 0.8 = 3.2 → 4）を返す', () => {
    expect(getRequiredCorrectCount(1)).toBe(4);
  });

  it('レベル5で7枚（8 * 0.8 = 6.4 → 7）を返す', () => {
    expect(getRequiredCorrectCount(5)).toBe(7);
  });

  it('レベル10で11枚（13 * 0.8 = 10.4 → 11）を返す', () => {
    expect(getRequiredCorrectCount(10)).toBe(11);
  });
});

describe('getEncouragementMessage', () => {
  it('100%でパーフェクトメッセージを返す', () => {
    const message = getEncouragementMessage(100);
    expect(message).toMatch(/パーフェクト|完璧|最高|100点/);
  });

  it('80%以上100%未満でクリアメッセージを返す', () => {
    const message = getEncouragementMessage(85);
    expect(message).toMatch(/よくできました|すばらしい|合格|やりましたね/);
  });

  it('60%以上80%未満で惜しいメッセージを返す', () => {
    const message = getEncouragementMessage(70);
    expect(message).toMatch(/もう少し|いい感じ|惜しい|だんだん/);
  });

  it('60%未満で失敗メッセージを返す', () => {
    const message = getEncouragementMessage(50);
    expect(message).toMatch(/練習|次は|諦めないで|何度でも/);
  });
});

describe('formatTime', () => {
  it('0ミリ秒を「0.00」に変換', () => {
    expect(formatTime(0)).toBe('0.00');
  });

  it('1000ミリ秒を「1.00」に変換', () => {
    expect(formatTime(1000)).toBe('1.00');
  });

  it('1234ミリ秒を「1.23」に変換', () => {
    expect(formatTime(1234)).toBe('1.23');
  });

  it('12345ミリ秒を「12.34」に変換', () => {
    expect(formatTime(12345)).toBe('12.34');
  });
});

describe('formatDate', () => {
  it('ISO日付文字列を「YYYY/MM/DD HH:mm」形式に変換', () => {
    const result = formatDate('2024-01-15T14:30:00.000Z');
    // タイムゾーンによって結果が異なるため、形式のみチェック
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });
});

describe('getGridColumns', () => {
  it('4枚以下で2列を返す', () => {
    expect(getGridColumns(1)).toBe(2);
    expect(getGridColumns(4)).toBe(2);
  });

  it('5枚以上で6列を返す', () => {
    expect(getGridColumns(5)).toBe(6);
    expect(getGridColumns(10)).toBe(6);
    expect(getGridColumns(100)).toBe(6);
  });
});

describe('generateId', () => {
  it('ユニークなIDを生成する', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('プレフィックス付きのIDを生成する', () => {
    const id = generateId('test');
    expect(id).toMatch(/^test_\d+_[a-z0-9]+$/);
  });

  it('プレフィックスなしのIDを生成する', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+_[a-z0-9]+$/);
  });
});

describe('定数の値', () => {
  it('LEVELS定数が正しい', () => {
    expect(LEVELS.MIN).toBe(1);
    expect(LEVELS.MAX).toBe(20);
    expect(LEVELS.BASE_IMAGE_COUNT).toBe(3);
  });

  it('CLEAR_CONDITION定数が正しい', () => {
    expect(CLEAR_CONDITION.THRESHOLD).toBe(0.8);
  });

  it('ACCURACY_THRESHOLDS定数が正しい', () => {
    expect(ACCURACY_THRESHOLDS.PERFECT).toBe(100);
    expect(ACCURACY_THRESHOLDS.CLEARED).toBe(80);
    expect(ACCURACY_THRESHOLDS.CLOSE).toBe(60);
  });
});
