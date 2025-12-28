import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Achievement } from '../types';
import { useGame } from '../contexts/GameContext';
import { calculateAchievements, getCategoryName } from '../utils/achievements';
import { UI_CONFIG } from '../utils/constants';

type AchievementsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Achievements'>;

interface Props {
  navigation: AchievementsScreenNavigationProp;
}

const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const { playHistory, clearedLevels, currentStreak } = useGame();

  // 実績を計算
  const achievements = useMemo(() => {
    return calculateAchievements(playHistory, clearedLevels, currentStreak);
  }, [playHistory, clearedLevels, currentStreak]);

  // 解除済み実績数
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  // カテゴリごとにグループ化
  const achievementsByCategory = useMemo(() => {
    const categories: { [key: string]: Achievement[] } = {
      level: [],
      perfect: [],
      streak: [],
      speed: [],
      total: [],
    };

    achievements.forEach(achievement => {
      categories[achievement.category].push(achievement);
    });

    return categories;
  }, [achievements]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text style={styles.headerTitle}>実績バッジ</Text>
            <Text style={styles.headerSubtitle}>
              解除済み: {unlockedCount} / {totalCount}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(unlockedCount / totalCount) * 100}%` },
                ]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* カテゴリごとに実績を表示 */}
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>
              {getCategoryName(category as Achievement['category'])}
            </Text>
            {categoryAchievements.map(achievement => (
              <Card
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked,
                ]}
              >
                <Card.Content>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <View style={styles.achievementText}>
                      <Text
                        style={[
                          styles.achievementTitle,
                          !achievement.unlocked && styles.lockedText,
                        ]}
                      >
                        {achievement.title}
                      </Text>
                      <Text
                        style={[
                          styles.achievementDescription,
                          !achievement.unlocked && styles.lockedText,
                        ]}
                      >
                        {achievement.description}
                      </Text>
                      {achievement.unlocked && achievement.unlockedDate && (
                        <Text style={styles.achievementDate}>
                          解除日: {new Date(achievement.unlockedDate).toLocaleDateString('ja-JP')}
                        </Text>
                      )}
                    </View>
                    {achievement.unlocked && (
                      <Text style={styles.achievementCheck}>✓</Text>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* 戻るボタン */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          戻る
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 80,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6200EE',
  },
  headerSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  achievementCard: {
    marginBottom: 8,
    elevation: 2,
  },
  achievementUnlocked: {
    backgroundColor: '#FFFFFF',
  },
  achievementLocked: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  lockedText: {
    color: '#999',
  },
  achievementCheck: {
    fontSize: 32,
    color: '#4CAF50',
    marginLeft: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  buttonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
});

export default AchievementsScreen;
