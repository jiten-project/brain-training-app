/**
 * gameLogic.tsのテスト
 */

import { generateMathProblem, isLevelCleared } from '../utils/gameLogic';

describe('generateMathProblem', () => {
  it('有効な計算問題を生成する', () => {
    const problem = generateMathProblem();

    expect(problem).toHaveProperty('id');
    expect(problem).toHaveProperty('num1');
    expect(problem).toHaveProperty('num2');
    expect(problem).toHaveProperty('operator');
    expect(problem).toHaveProperty('answer');
  });

  it('2桁の数字を使用する', () => {
    // 複数回テストして確率的に確認
    for (let i = 0; i < 100; i++) {
      const problem = generateMathProblem();
      expect(problem.num1).toBeGreaterThanOrEqual(10);
      expect(problem.num1).toBeLessThanOrEqual(99);
    }
  });

  it('足し算の答えが正しい', () => {
    for (let i = 0; i < 50; i++) {
      const problem = generateMathProblem();
      if (problem.operator === '+') {
        expect(problem.answer).toBe(problem.num1 + problem.num2);
      }
    }
  });

  it('引き算の答えが正しい', () => {
    for (let i = 0; i < 50; i++) {
      const problem = generateMathProblem();
      if (problem.operator === '-') {
        expect(problem.answer).toBe(problem.num1 - problem.num2);
      }
    }
  });

  it('引き算の答えは正の数', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateMathProblem();
      if (problem.operator === '-') {
        expect(problem.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('足し算の答えは200以下', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateMathProblem();
      if (problem.operator === '+') {
        expect(problem.answer).toBeLessThanOrEqual(200);
      }
    }
  });

  it('ユニークなIDを持つ', () => {
    const problem1 = generateMathProblem();
    const problem2 = generateMathProblem();
    expect(problem1.id).not.toBe(problem2.id);
  });
});

describe('isLevelCleared', () => {
  it('80%以上でtrueを返す', () => {
    expect(isLevelCleared(80)).toBe(true);
    expect(isLevelCleared(100)).toBe(true);
    expect(isLevelCleared(85)).toBe(true);
  });

  it('80%未満でfalseを返す', () => {
    expect(isLevelCleared(79)).toBe(false);
    expect(isLevelCleared(0)).toBe(false);
    expect(isLevelCleared(50)).toBe(false);
  });

  it('境界値80%でtrueを返す', () => {
    expect(isLevelCleared(80)).toBe(true);
  });

  it('境界値79%でfalseを返す', () => {
    expect(isLevelCleared(79)).toBe(false);
  });
});
