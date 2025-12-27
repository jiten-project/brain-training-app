import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { UI_CONFIG, getEncouragementMessage, LEVELS } from '../utils/constants';
import { useGame } from '../contexts/GameContext';

type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  navigation: ResultScreenNavigationProp;
  route: ResultScreenRouteProp;
}

const ResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { result } = route.params;
  const { level, totalCount, correctCount, accuracy, isCleared, selectedResults } = result;
  const { updateProgress, maxUnlockedLevel } = useGame();

  const encouragementMessage = getEncouragementMessage(accuracy);

  // 進捗を保存
  useEffect(() => {
    const saveProgress = async () => {
      await updateProgress(level, isCleared);
    };
    saveProgress();
  }, [level, isCleared, updateProgress]);

  const handleNextLevel = () => {
    navigation.navigate('Game', { level: level + 1 });
  };

  const handleRetry = () => {
    navigation.navigate('Game', { level });
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 結果カード */}
        <Card style={styles.resultCard}>
          <Card.Content>
            <Text style={styles.levelText}>レベル {level}</Text>

            {/* クリア判定 */}
            <View style={[styles.clearBadge, isCleared ? styles.cleared : styles.failed]}>
              <Text style={styles.clearText}>{isCleared ? 'クリア！' : '失敗'}</Text>
            </View>

            {/* 正解数 */}
            <Text style={styles.scoreText}>
              {correctCount} / {totalCount} 問正解
            </Text>

            {/* 正解率 */}
            <Text style={styles.accuracyText}>正解率: {accuracy}%</Text>

            {/* 応援メッセージ */}
            <Text style={styles.encouragementText}>{encouragementMessage}</Text>
          </Card.Content>
        </Card>

        {/* 各選択の正誤 */}
        <Card style={styles.detailCard}>
          <Card.Content>
            <Text style={styles.detailTitle}>選択した絵</Text>
            <Divider style={styles.divider} />
            <View style={styles.resultsContainer}>
              {selectedResults.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultEmoji}>{result.image.uri}</Text>
                  <Text style={styles.resultIcon}>{result.isCorrect ? '⭕️' : '❌'}</Text>
                  <Text style={styles.resultName}>{result.image.name}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* ボタン */}
      <View style={styles.buttonContainer}>
        {isCleared && level < LEVELS.MAX && (
          <Button
            mode="contained"
            onPress={handleNextLevel}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            次のレベルへ
          </Button>
        )}

        {isCleared && level === LEVELS.MAX && (
          <Card style={styles.congratsCard}>
            <Card.Content>
              <Text style={styles.congratsText}>🎉 全レベルクリア！🎉</Text>
              <Text style={styles.congratsSubText}>おめでとうございます！</Text>
            </Card.Content>
          </Card>
        )}

        <Button
          mode={isCleared ? 'outlined' : 'contained'}
          onPress={handleRetry}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          再挑戦
        </Button>

        <Button
          mode="outlined"
          onPress={handleBackToHome}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          レベル選択に戻る
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
    padding: 16,
  },
  resultCard: {
    marginBottom: 16,
    elevation: 4,
  },
  levelText: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  clearBadge: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cleared: {
    backgroundColor: '#4CAF50',
  },
  failed: {
    backgroundColor: '#F44336',
  },
  clearText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreText: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 16,
  },
  accuracyText: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  encouragementText: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  detailCard: {
    marginBottom: 16,
    elevation: 4,
  },
  detailTitle: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  resultsContainer: {
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  resultEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resultName: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
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
  congratsCard: {
    marginBottom: 16,
    backgroundColor: '#FFD700',
    elevation: 8,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  congratsSubText: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    textAlign: 'center',
    marginTop: 8,
    color: '#333',
  },
});

export default ResultScreen;
