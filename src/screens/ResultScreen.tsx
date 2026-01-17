import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { UI_CONFIG, getEncouragementMessage, LEVELS, formatTime, getGridColumns, generateId } from '../utils/constants';
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
  const { updateProgress, addHistory, settings, playHistory, modeProgress, isLoading } = useGame();
  const clearedLevels = modeProgress[settings.gameMode].clearedLevels;

  const encouragementMessage = getEncouragementMessage(accuracy);


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

  // パーフェクト最短記録かどうか - 履歴読み込み完了後に判定を固定
  const isNewPerfectRecordRef = useRef<boolean | null>(null);
  if (isNewPerfectRecordRef.current === null && !isLoading) {
    isNewPerfectRecordRef.current = isPerfectGame && (!previousBestTime || totalTime < previousBestTime);
  }
  const isNewPerfectRecord = isNewPerfectRecordRef.current ?? false;

  // 同レベル・同難易度のクリア済み記録から最高記録を取得
  const clearedRecords = playHistory.filter(h =>
    h.level === level &&
    h.gameMode === settings.gameMode &&
    h.isCleared
  );

  // 最高正解率を取得（クリア済み記録のみ）
  const bestAccuracy = clearedRecords.length > 0
    ? Math.max(...clearedRecords.map(h => h.accuracy))
    : 0;

  // 最高正解率の中で最短時間を取得
  const bestRecordsWithSameAccuracy = clearedRecords
    .filter(h => h.accuracy === bestAccuracy)
    .sort((a, b) => (a.memorizeTime + a.answerTime) - (b.memorizeTime + b.answerTime));

  const bestRecord = bestRecordsWithSameAccuracy.length > 0 ? bestRecordsWithSameAccuracy[0] : null;
  const bestTime = bestRecord ? bestRecord.memorizeTime + bestRecord.answerTime : null;

  // 今回が最高記録かどうか（クリア時のみ更新）- 履歴読み込み完了後に判定を固定
  const isNewBestRecordRef = useRef<boolean | null>(null);
  if (isNewBestRecordRef.current === null && !isLoading) {
    isNewBestRecordRef.current = isCleared && (
      clearedRecords.length === 0 ||
      accuracy > bestAccuracy ||
      (accuracy === bestAccuracy && totalTime < (bestTime || Infinity))
    );
  }
  const isNewBestRecord = isNewBestRecordRef.current ?? false;

  // このレベルを過去にクリアしたことがあるか
  const hasBeenCleared = clearedLevels.includes(level);

  // 各画像が選択されたか、正解かを判定
  const getImageStatus = (imageId: string) => {
    const wasSelected = selectedResults.some(sr => sr.image.id === imageId);
    const isCorrect = correctImages.some(ci => ci.id === imageId);
    return { wasSelected, isCorrect };
  };

  const columns = getGridColumns(choiceImages.length);

  // 保存処理が実行されたかどうかを追跡
  const hasSavedRef = useRef(false);

  // 進捗保存関数（useCallbackでメモ化）
  const saveProgressAndHistory = useCallback(async () => {
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    await updateProgress(level, isCleared, settings.gameMode);

    const historyRecord: PlayHistory = {
      id: generateId(),
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
  }, [level, isCleared, settings.gameMode, updateProgress, addHistory, totalCount, correctCount, accuracy, memorizeTime, answerTime]);

  // 進捗を保存 & 履歴を保存（マウント時に一度だけ実行）
  useEffect(() => {
    saveProgressAndHistory();
  }, [saveProgressAndHistory]);

  const handleNextLevel = useCallback(() => {
    navigation.navigate('Game', { level: level + 1 });
  }, [navigation, level]);

  const handleRetry = useCallback(() => {
    navigation.navigate('Game', { level });
  }, [navigation, level]);

  const handleBackToHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 結果カード */}
        <Card style={styles.resultCard}>
          <Card.Content>
            <Text style={styles.levelText}>レベル {level}</Text>

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


            {/* 最高記録の表示 */}
            {isNewBestRecord ? (
              <View style={styles.bestRecordRow}>
                <Text style={styles.bestRecordInfoText}>
                  最高記録: 正解率 {accuracy}% / {formatTime(totalTime)}秒
                </Text>
                <Text style={styles.recordUpdateText}>記録更新</Text>
              </View>
            ) : bestRecord && (
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
              <Text style={styles.totalTimeText}>
                合計: {formatTime(totalTime)}秒
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
  levelText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
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
  bestRecordRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  bestRecordInfoText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  recordUpdateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0000',
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
  totalTimeText: {
    fontSize: 16,
    color: '#4CAF50',
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
