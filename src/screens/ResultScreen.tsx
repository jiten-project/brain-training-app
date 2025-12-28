import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { UI_CONFIG, getEncouragementMessage, LEVELS, formatTime } from '../utils/constants';
import { useGame } from '../contexts/GameContext';
import ImageGridItem from '../components/ImageGridItem';
import { PlayHistory } from '../types';

type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  navigation: ResultScreenNavigationProp;
  route: ResultScreenRouteProp;
}

const ResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { result } = route.params;
  const { level, totalCount, correctCount, accuracy, isCleared, selectedResults, choiceImages, correctImages, memorizeTime, answerTime } = result;
  const { updateProgress, maxUnlockedLevel, addHistory, settings, playHistory, clearedLevels } = useGame();

  const encouragementMessage = getEncouragementMessage(accuracy);

  // 前回の同レベル・同難易度の記録を取得
  const previousRecord = playHistory
    .filter(h => h.level === level && h.gameMode === settings.gameMode)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // 前回との比較メッセージ
  const getComparisonMessage = () => {
    if (!previousRecord) return null;

    if (accuracy > previousRecord.accuracy) {
      return `✨ 前回より${accuracy - previousRecord.accuracy}%上達しました！`;
    } else if (accuracy === previousRecord.accuracy && accuracy === 100) {
      return '🎯 完璧な記録を維持しています！';
    } else if (accuracy === previousRecord.accuracy) {
      return '👍 前回と同じ成績です！安定していますね！';
    }
    return null;
  };

  const comparisonMessage = getComparisonMessage();

  // パーフェクト記録の最高記録（最短時間）を確認
  const isPerfectGame = accuracy === 100;
  const totalTime = memorizeTime + answerTime;

  // 同レベル・同難易度のパーフェクト記録を取得
  const perfectRecords = playHistory
    .filter(h =>
      h.level === level &&
      h.gameMode === settings.gameMode &&
      h.accuracy === 100
    )
    .sort((a, b) => (a.memorizeTime + a.answerTime) - (b.memorizeTime + b.answerTime));

  const previousBestPerfect = perfectRecords.length > 0 ? perfectRecords[0] : null;
  const previousBestTime = previousBestPerfect ? previousBestPerfect.memorizeTime + previousBestPerfect.answerTime : null;

  const isNewPerfectRecord = isPerfectGame && (!previousBestTime || totalTime < previousBestTime);

  // 同レベル・同難易度の全記録から最高記録を取得
  const allRecords = playHistory.filter(h =>
    h.level === level &&
    h.gameMode === settings.gameMode
  );

  // 最高正解率を取得
  const bestAccuracy = allRecords.length > 0
    ? Math.max(...allRecords.map(h => h.accuracy))
    : 0;

  // 最高正解率の中で最短時間を取得
  const bestRecordsWithSameAccuracy = allRecords
    .filter(h => h.accuracy === bestAccuracy)
    .sort((a, b) => (a.memorizeTime + a.answerTime) - (b.memorizeTime + b.answerTime));

  const bestRecord = bestRecordsWithSameAccuracy.length > 0 ? bestRecordsWithSameAccuracy[0] : null;
  const bestTime = bestRecord ? bestRecord.memorizeTime + bestRecord.answerTime : null;

  // 今回が最高記録かどうか
  const isNewBestRecord = allRecords.length === 0 ||
    accuracy > bestAccuracy ||
    (accuracy === bestAccuracy && totalTime < (bestTime || Infinity));

  // このレベルを過去にクリアしたことがあるか
  const hasBeenCleared = clearedLevels.includes(level);

  // 各画像が選択されたか、正解かを判定
  const getImageStatus = (imageId: string) => {
    const wasSelected = selectedResults.some(sr => sr.image.id === imageId);
    const isCorrect = correctImages.some(ci => ci.id === imageId);
    return { wasSelected, isCorrect };
  };

  // グリッドの列数を決定
  const getGridColumns = (count: number) => {
    if (count <= 4) return 2;
    return 6;
  };

  const columns = getGridColumns(choiceImages.length);

  // 進捗を保存 & 効果音再生 & 履歴を保存
  useEffect(() => {
    const saveProgress = async () => {
      await updateProgress(level, isCleared, settings.gameMode);

      // プレイ履歴を保存
      const historyRecord: PlayHistory = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        level,
        totalCount,
        correctCount,
        accuracy,
        isCleared,
        memorizeTime,
        answerTime,
        gameMode: settings.gameMode,
      };
      await addHistory(historyRecord);
    };
    saveProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, isCleared, accuracy]);

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
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>レベル {level}</Text>
              {isNewBestRecord && (
                <Text style={styles.recordUpdateBadge}>記録更新！</Text>
              )}
            </View>

            {/* 応援メッセージ */}
            <Text style={styles.encouragementText}>{encouragementMessage}</Text>

            {/* パーフェクト最短記録更新メッセージ */}
            {!isNewBestRecord && isNewPerfectRecord && (
              <View style={styles.perfectRecordBadge}>
                <Text style={styles.perfectRecordText}>
                  🎯 パーフェクト最短記録更新！
                </Text>
                <Text style={styles.perfectRecordSubText}>
                  合計時間: {formatTime(totalTime)}秒
                </Text>
              </View>
            )}

            {/* 前回との比較メッセージ */}
            {comparisonMessage && (
              <Text style={styles.comparisonText}>{comparisonMessage}</Text>
            )}

            {/* 最高記録の表示（更新していない場合） */}
            {!isNewBestRecord && bestRecord && (
              <Text style={styles.bestRecordInfoText}>
                最高記録: 正解率 {bestAccuracy}% / {formatTime(bestTime!)}秒
              </Text>
            )}

            {/* 正解数と正解率 */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                {correctCount} / {totalCount} 問正解
              </Text>
              <Text style={styles.accuracyText}>正解率: {accuracy}%</Text>
            </View>

            {/* 時間情報 */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                記憶: {formatTime(memorizeTime)}秒
              </Text>
              <Text style={styles.timeText}>
                回答: {formatTime(answerTime)}秒
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 画像グリッド（結果表示） */}
        <View style={styles.gridContainer}>
          <View
            style={[
              styles.grid,
              {
                gap: 8,
                width: columns === 2 ? '40%' : '100%',
                alignSelf: 'center',
              }
            ]}
          >
            {choiceImages.map(image => {
              const { wasSelected, isCorrect } = getImageStatus(image.id);
              return (
                <ImageGridItem
                  key={image.id}
                  image={image}
                  columns={columns}
                  resultMode={true}
                  wasSelected={wasSelected}
                  isCorrect={isCorrect}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ボタン */}
      <View style={styles.buttonContainer}>
        {/* 今回クリアまたは過去にクリア済みなら次のレベルへボタンを表示 */}
        {(isCleared || hasBeenCleared) && level < LEVELS.MAX && (
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

        {(isCleared || hasBeenCleared) && level === LEVELS.MAX && (
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
          onPress={() => navigation.navigate('History')}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="history"
        >
          記録を見る
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
    padding: 12,
  },
  resultCard: {
    marginBottom: 12,
    elevation: 4,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  recordUpdateBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  perfectRecordBadge: {
    marginVertical: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    borderWidth: 2,
    borderColor: '#03A9F4',
  },
  perfectRecordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0277BD',
    textAlign: 'center',
  },
  perfectRecordSubText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0288D1',
    marginTop: 4,
    textAlign: 'center',
  },
  bestRecordInfoText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  accuracyText: {
    fontSize: 18,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  encouragementText: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  comparisonText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buttonContainer: {
    padding: 12,
    paddingBottom: 24,
    gap: 10,
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
    marginBottom: 12,
    backgroundColor: '#FFD700',
    elevation: 8,
  },
  congratsText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  congratsSubText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 6,
    color: '#333',
  },
});

export default ResultScreen;
