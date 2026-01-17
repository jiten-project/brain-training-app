/**
 * validation.tsのテスト
 */

import {
  validateUserProgress,
  validateUserSettings,
  validatePlayHistory,
  validatePlayHistoryArray,
  safeJsonParse,
} from '../utils/validation';
import { GameMode } from '../types';
import { LEVELS, DEFAULT_SETTINGS } from '../utils/constants';

describe('safeJsonParse', () => {
  it('有効なJSONをパースできる', () => {
    const result = safeJsonParse('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('配列JSONをパースできる', () => {
    const result = safeJsonParse('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('無効なJSONでnullを返す', () => {
    const result = safeJsonParse('invalid json');
    expect(result).toBeNull();
  });

  it('空文字でnullを返す', () => {
    const result = safeJsonParse('');
    expect(result).toBeNull();
  });
});

describe('validateUserProgress', () => {
  it('有効なUserProgressをバリデートできる', () => {
    const data = {
      maxUnlockedLevel: 5,
      clearedLevels: [1, 2, 3, 4],
      modeProgress: {
        [GameMode.BEGINNER]: { maxUnlockedLevel: 5, clearedLevels: [1, 2, 3, 4] },
        [GameMode.INTERMEDIATE]: { maxUnlockedLevel: 1, clearedLevels: [] },
        [GameMode.ADVANCED]: { maxUnlockedLevel: 1, clearedLevels: [] },
        [GameMode.EXPERT]: { maxUnlockedLevel: 1, clearedLevels: [] },
      },
      settings: { gameMode: GameMode.BEGINNER, hintEnabled: true },
      currentStreak: 3,
      lastPlayedDate: '2026-01-15',
      longestStreak: 5,
    };

    const result = validateUserProgress(data);
    expect(result).not.toBeNull();
    expect(result?.maxUnlockedLevel).toBe(5);
    expect(result?.clearedLevels).toEqual([1, 2, 3, 4]);
    expect(result?.currentStreak).toBe(3);
  });

  it('nullを渡すとnullを返す', () => {
    const result = validateUserProgress(null);
    expect(result).toBeNull();
  });

  it('オブジェクト以外を渡すとnullを返す', () => {
    expect(validateUserProgress('string')).toBeNull();
    expect(validateUserProgress(123)).toBeNull();
    expect(validateUserProgress([])).toBeNull();
  });

  it('範囲外のmaxUnlockedLevelをクランプする', () => {
    const data = {
      maxUnlockedLevel: 100,
      clearedLevels: [],
    };

    const result = validateUserProgress(data);
    expect(result?.maxUnlockedLevel).toBe(LEVELS.MAX);
  });

  it('負のmaxUnlockedLevelをクランプする', () => {
    const data = {
      maxUnlockedLevel: -5,
      clearedLevels: [],
    };

    const result = validateUserProgress(data);
    expect(result?.maxUnlockedLevel).toBe(LEVELS.MIN);
  });

  it('範囲外のclearedLevelsをフィルタリングする', () => {
    const data = {
      maxUnlockedLevel: 5,
      clearedLevels: [-1, 0, 1, 2, 21, 100],
    };

    const result = validateUserProgress(data);
    expect(result?.clearedLevels).toEqual([1, 2]);
  });

  it('currentStreakがない場合は0を設定', () => {
    const data = {
      maxUnlockedLevel: 1,
      clearedLevels: [],
    };

    const result = validateUserProgress(data);
    expect(result?.currentStreak).toBe(0);
  });

  it('settingsがない場合はデフォルト設定を使用', () => {
    const data = {
      maxUnlockedLevel: 1,
      clearedLevels: [],
    };

    const result = validateUserProgress(data);
    expect(result?.settings).toEqual(DEFAULT_SETTINGS);
  });
});

describe('validateUserSettings', () => {
  it('有効なUserSettingsをバリデートできる', () => {
    const data = {
      gameMode: GameMode.INTERMEDIATE,
      hintEnabled: false,
    };

    const result = validateUserSettings(data);
    expect(result).not.toBeNull();
    expect(result?.gameMode).toBe(GameMode.INTERMEDIATE);
    expect(result?.hintEnabled).toBe(false);
  });

  it('nullを渡すとnullを返す', () => {
    const result = validateUserSettings(null);
    expect(result).toBeNull();
  });

  it('無効なgameModeの場合はデフォルトを使用', () => {
    const data = {
      gameMode: 'INVALID_MODE',
      hintEnabled: true,
    };

    const result = validateUserSettings(data);
    expect(result?.gameMode).toBe(DEFAULT_SETTINGS.gameMode);
  });

  it('hintEnabledがブール値でない場合はデフォルトを使用', () => {
    const data = {
      gameMode: GameMode.BEGINNER,
      hintEnabled: 'yes',
    };

    const result = validateUserSettings(data);
    expect(result?.hintEnabled).toBe(DEFAULT_SETTINGS.hintEnabled);
  });
});

describe('validatePlayHistory', () => {
  const validPlayHistory = {
    id: 'test_123',
    date: '2026-01-15T10:00:00Z',
    level: 5,
    correctCount: 4,
    totalCount: 5,
    accuracy: 80,
    isCleared: true,
    memorizeTime: 5000,
    answerTime: 10000,
    gameMode: GameMode.BEGINNER,
    isBestRecord: false,
  };

  it('有効なPlayHistoryをバリデートできる', () => {
    const result = validatePlayHistory(validPlayHistory);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('test_123');
    expect(result?.level).toBe(5);
    expect(result?.accuracy).toBe(80);
  });

  it('nullを渡すとnullを返す', () => {
    const result = validatePlayHistory(null);
    expect(result).toBeNull();
  });

  it('必須フィールドがない場合はnullを返す', () => {
    const data = { id: 'test' };
    const result = validatePlayHistory(data);
    expect(result).toBeNull();
  });

  it('無効なgameModeの場合はnullを返す', () => {
    const data = { ...validPlayHistory, gameMode: 'INVALID' };
    const result = validatePlayHistory(data);
    expect(result).toBeNull();
  });

  it('範囲外のlevelをクランプする', () => {
    const data = { ...validPlayHistory, level: 50 };
    const result = validatePlayHistory(data);
    expect(result?.level).toBe(LEVELS.MAX);
  });

  it('負の値を0以上にクランプする', () => {
    const data = { ...validPlayHistory, correctCount: -5, memorizeTime: -1000 };
    const result = validatePlayHistory(data);
    expect(result?.correctCount).toBe(0);
    expect(result?.memorizeTime).toBe(0);
  });

  it('accuracyを0-100の範囲にクランプする', () => {
    const dataOver = { ...validPlayHistory, accuracy: 150 };
    const resultOver = validatePlayHistory(dataOver);
    expect(resultOver?.accuracy).toBe(100);

    const dataUnder = { ...validPlayHistory, accuracy: -50 };
    const resultUnder = validatePlayHistory(dataUnder);
    expect(resultUnder?.accuracy).toBe(0);
  });

  it('isBestRecordがブール値でない場合はfalseを設定', () => {
    const data = { ...validPlayHistory, isBestRecord: 'yes' };
    const result = validatePlayHistory(data);
    expect(result?.isBestRecord).toBe(false);
  });

  it('isClearedがない場合はaccuracyから推定する', () => {
    const dataCleared = { ...validPlayHistory, accuracy: 80 };
    delete (dataCleared as Record<string, unknown>).isCleared;
    const resultCleared = validatePlayHistory(dataCleared);
    expect(resultCleared?.isCleared).toBe(true);

    const dataNotCleared = { ...validPlayHistory, accuracy: 79 };
    delete (dataNotCleared as Record<string, unknown>).isCleared;
    const resultNotCleared = validatePlayHistory(dataNotCleared);
    expect(resultNotCleared?.isCleared).toBe(false);
  });
});

describe('validatePlayHistoryArray', () => {
  const validHistory = {
    id: 'test_123',
    date: '2026-01-15T10:00:00Z',
    level: 5,
    correctCount: 4,
    totalCount: 5,
    accuracy: 80,
    isCleared: true,
    memorizeTime: 5000,
    answerTime: 10000,
    gameMode: GameMode.BEGINNER,
    isBestRecord: false,
  };

  it('有効な配列をバリデートできる', () => {
    const data = [validHistory, { ...validHistory, id: 'test_456' }];
    const result = validatePlayHistoryArray(data);
    expect(result.length).toBe(2);
  });

  it('配列以外は空配列を返す', () => {
    expect(validatePlayHistoryArray(null)).toEqual([]);
    expect(validatePlayHistoryArray('string')).toEqual([]);
    expect(validatePlayHistoryArray(123)).toEqual([]);
  });

  it('無効な要素を除外する', () => {
    const data = [validHistory, null, { invalid: true }, { ...validHistory, id: 'test_789' }];
    const result = validatePlayHistoryArray(data);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('test_123');
    expect(result[1].id).toBe('test_789');
  });

  it('空配列を処理できる', () => {
    const result = validatePlayHistoryArray([]);
    expect(result).toEqual([]);
  });
});
