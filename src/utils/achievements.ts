/**
 * 実績バッジシステム
 */

import { Achievement, PlayHistory, GameMode } from '../types';

/**
 * すべての実績の定義
 */
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // レベル系
  {
    id: 'level_1',
    title: '初めの一歩',
    description: 'レベル1をクリア',
    icon: '🎯',
    unlocked: false,
    category: 'level',
  },
  {
    id: 'level_5',
    title: '順調な滑り出し',
    description: 'レベル5をクリア',
    icon: '⭐',
    unlocked: false,
    category: 'level',
  },
  {
    id: 'level_10',
    title: '中級者',
    description: 'レベル10をクリア',
    icon: '🌟',
    unlocked: false,
    category: 'level',
  },
  {
    id: 'level_15',
    title: '上級者',
    description: 'レベル15をクリア',
    icon: '✨',
    unlocked: false,
    category: 'level',
  },
  {
    id: 'level_20',
    title: '全レベル制覇',
    description: 'レベル20をクリア',
    icon: '🏆',
    unlocked: false,
    category: 'level',
  },

  // パーフェクト系
  {
    id: 'perfect_first',
    title: '初パーフェクト',
    description: '初めて正解率100%を達成',
    icon: '💯',
    unlocked: false,
    category: 'perfect',
  },
  {
    id: 'perfect_5',
    title: 'パーフェクト達人',
    description: 'パーフェクトを5回達成',
    icon: '🎖️',
    unlocked: false,
    category: 'perfect',
  },
  {
    id: 'perfect_10',
    title: 'パーフェクトマスター',
    description: 'パーフェクトを10回達成',
    icon: '👑',
    unlocked: false,
    category: 'perfect',
  },
  {
    id: 'perfect_advanced',
    title: '超級パーフェクト',
    description: '超級モードでパーフェクトを達成',
    icon: '💎',
    unlocked: false,
    category: 'perfect',
  },

  // 連続プレイ系
  {
    id: 'streak_3',
    title: '三日坊主脱却',
    description: '3日連続でプレイ',
    icon: '🔥',
    unlocked: false,
    category: 'streak',
  },
  {
    id: 'streak_7',
    title: '一週間継続',
    description: '7日連続でプレイ',
    icon: '🌈',
    unlocked: false,
    category: 'streak',
  },
  {
    id: 'streak_30',
    title: '継続は力なり',
    description: '30日連続でプレイ',
    icon: '🎊',
    unlocked: false,
    category: 'streak',
  },

  // スピード系
  {
    id: 'speed_fast',
    title: 'スピードスター',
    description: '合計時間10秒以内でクリア',
    icon: '⚡',
    unlocked: false,
    category: 'speed',
  },
  {
    id: 'speed_lightning',
    title: '電光石火',
    description: '合計時間5秒以内でクリア',
    icon: '🚀',
    unlocked: false,
    category: 'speed',
  },

  // 総プレイ回数系
  {
    id: 'total_10',
    title: '初心者卒業',
    description: '10回プレイ',
    icon: '🎮',
    unlocked: false,
    category: 'total',
  },
  {
    id: 'total_50',
    title: '経験豊富',
    description: '50回プレイ',
    icon: '🎪',
    unlocked: false,
    category: 'total',
  },
  {
    id: 'total_100',
    title: '百戦錬磨',
    description: '100回プレイ',
    icon: '🏅',
    unlocked: false,
    category: 'total',
  },
];

/**
 * プレイ履歴から実績の解除状況を計算
 */
export const calculateAchievements = (
  playHistory: PlayHistory[],
  clearedLevels: number[],
  currentStreak: number
): Achievement[] => {
  const achievements = ALL_ACHIEVEMENTS.map(a => ({ ...a }));

  // パーフェクト回数をカウント
  const perfectCount = playHistory.filter(h => h.accuracy === 100).length;
  const hasPerfectInExpert = playHistory.some(h => h.accuracy === 100 && h.gameMode === GameMode.EXPERT);

  // 総プレイ回数
  const totalPlays = playHistory.length;

  achievements.forEach(achievement => {
    let unlocked = false;
    let unlockedDate: string | undefined;

    switch (achievement.id) {
      // レベル系
      case 'level_1':
        unlocked = clearedLevels.includes(1);
        break;
      case 'level_5':
        unlocked = clearedLevels.includes(5);
        break;
      case 'level_10':
        unlocked = clearedLevels.includes(10);
        break;
      case 'level_15':
        unlocked = clearedLevels.includes(15);
        break;
      case 'level_20':
        unlocked = clearedLevels.includes(20);
        break;

      // パーフェクト系
      case 'perfect_first':
        unlocked = perfectCount >= 1;
        if (unlocked) {
          const firstPerfect = playHistory.find(h => h.accuracy === 100);
          unlockedDate = firstPerfect?.date;
        }
        break;
      case 'perfect_5':
        unlocked = perfectCount >= 5;
        break;
      case 'perfect_10':
        unlocked = perfectCount >= 10;
        break;
      case 'perfect_advanced':
        unlocked = hasPerfectInExpert;
        if (unlocked) {
          const firstExpertPerfect = playHistory.find(h => h.accuracy === 100 && h.gameMode === GameMode.EXPERT);
          unlockedDate = firstExpertPerfect?.date;
        }
        break;

      // 連続プレイ系
      case 'streak_3':
        unlocked = currentStreak >= 3;
        break;
      case 'streak_7':
        unlocked = currentStreak >= 7;
        break;
      case 'streak_30':
        unlocked = currentStreak >= 30;
        break;

      // スピード系
      case 'speed_fast':
        unlocked = playHistory.some(h => {
          const totalTime = h.memorizeTime + h.answerTime;
          return totalTime <= 10000 && h.isCleared;
        });
        if (unlocked) {
          const speedRecord = playHistory.find(h => {
            const totalTime = h.memorizeTime + h.answerTime;
            return totalTime <= 10000 && h.isCleared;
          });
          unlockedDate = speedRecord?.date;
        }
        break;
      case 'speed_lightning':
        unlocked = playHistory.some(h => {
          const totalTime = h.memorizeTime + h.answerTime;
          return totalTime <= 5000 && h.isCleared;
        });
        if (unlocked) {
          const speedRecord = playHistory.find(h => {
            const totalTime = h.memorizeTime + h.answerTime;
            return totalTime <= 5000 && h.isCleared;
          });
          unlockedDate = speedRecord?.date;
        }
        break;

      // 総プレイ回数系
      case 'total_10':
        unlocked = totalPlays >= 10;
        break;
      case 'total_50':
        unlocked = totalPlays >= 50;
        break;
      case 'total_100':
        unlocked = totalPlays >= 100;
        break;
    }

    achievement.unlocked = unlocked;
    if (unlocked && unlockedDate) {
      achievement.unlockedDate = unlockedDate;
    }
  });

  return achievements;
};

/**
 * カテゴリ名を日本語に変換
 */
export const getCategoryName = (category: Achievement['category']): string => {
  switch (category) {
    case 'level':
      return 'レベル達成';
    case 'perfect':
      return 'パーフェクト';
    case 'streak':
      return '継続プレイ';
    case 'speed':
      return 'スピード';
    case 'total':
      return 'プレイ回数';
    default:
      return '';
  }
};
