import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, GamePhase, ImageData, GameMode } from '../types';
import { UI_CONFIG, formatTime, getGridColumns } from '../utils/constants';
import { generateCorrectImages, generateChoiceImages, evaluateGameResult } from '../utils/gameLogic';
import { shuffleArray } from '../utils/shuffle';
import { useGame } from '../contexts/GameContext';
import { useGameTimer, useMathProblem, useHint } from '../hooks';
import ImageGridItem from '../components/ImageGridItem';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

interface Props {
  navigation: GameScreenNavigationProp;
  route: GameScreenRouteProp;
}

const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { level } = route.params;
  const { settings } = useGame();

  // フェーズ管理
  const [phase, setPhase] = useState<GamePhase>(GamePhase.COUNTDOWN_MEMORIZE);
  const [countdown, setCountdown] = useState<number>(3);

  // 画像管理
  const [correctImages, setCorrectImages] = useState<ImageData[]>([]);
  const [choiceImages, setChoiceImages] = useState<ImageData[]>([]);
  const [shuffledChoiceImages, setShuffledChoiceImages] = useState<ImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);

  // カスタムHook使用
  const memorizeTimer = useGameTimer();
  const answerTimer = useGameTimer();
  const mathProblem = useMathProblem();
  const hint = useHint(settings.gameMode);

  // ゲーム初期化
  useEffect(() => {
    const correct = generateCorrectImages(level);
    setCorrectImages(correct);
    const choices = generateChoiceImages(correct, level, settings.gameMode);
    setChoiceImages(choices);
  }, [level, settings.gameMode]);

  // カウントダウンロジック
  useEffect(() => {
    if (phase !== GamePhase.COUNTDOWN_MEMORIZE && phase !== GamePhase.COUNTDOWN_ANSWER) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      if (phase === GamePhase.COUNTDOWN_MEMORIZE) {
        setPhase(GamePhase.MEMORIZE);
        memorizeTimer.startTimer();
      } else if (phase === GamePhase.COUNTDOWN_ANSWER) {
        setPhase(GamePhase.ANSWER);
        answerTimer.startTimer();
      }
    }
  }, [phase, countdown, memorizeTimer, answerTimer]);

  const handleMemorized = useCallback(() => {
    memorizeTimer.stopTimer();
    setShuffledChoiceImages(shuffleArray(choiceImages));

    if (settings.gameMode === GameMode.EXPERT) {
      mathProblem.resetMath();
      setPhase(GamePhase.CALCULATION);
    } else {
      setCountdown(3);
      setPhase(GamePhase.COUNTDOWN_ANSWER);
    }
  }, [memorizeTimer, choiceImages, settings.gameMode, mathProblem]);

  const handleImageSelect = useCallback((image: ImageData) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.id === image.id);
      if (isSelected) {
        return prev.filter(img => img.id !== image.id);
      }
      if (prev.length < correctImages.length) {
        return [...prev, image];
      }
      return prev;
    });
  }, [correctImages.length]);

  const handleConfirm = useCallback(() => {
    if (selectedImages.length !== correctImages.length) return;

    answerTimer.stopTimer();
    const result = evaluateGameResult(
      correctImages,
      selectedImages,
      choiceImages,
      level,
      memorizeTimer.elapsedTime,
      answerTimer.elapsedTime
    );
    navigation.navigate('Result', { result });
  }, [selectedImages, correctImages, choiceImages, level, memorizeTimer.elapsedTime, answerTimer.elapsedTime, navigation, answerTimer]);

  const handleMathSubmit = useCallback(() => {
    const completed = mathProblem.submitAnswer();
    if (completed) {
      setTimeout(() => {
        setPhase(GamePhase.ANSWER);
        answerTimer.startTimer();
      }, 500);
    }
  }, [mathProblem, answerTimer]);

  const handleUseHint = useCallback(() => {
    if (hint.canUseHint(settings.gameMode, settings.hintEnabled)) {
      hint.useHint();
    }
  }, [hint, settings.gameMode, settings.hintEnabled]);

  const isImageSelected = useCallback((imageId: string) => {
    return selectedImages.some(img => img.id === imageId);
  }, [selectedImages]);

  const displayImages = phase === GamePhase.MEMORIZE ? correctImages : shuffledChoiceImages;
  const columns = getGridColumns(displayImages.length);
  const shouldShowHintButton = phase === GamePhase.ANSWER && hint.canUseHint(settings.gameMode, settings.hintEnabled);

  // 計算フェーズの表示（超級モード）
  if (phase === GamePhase.CALCULATION && mathProblem.currentProblem) {
    return (
      <View style={styles.container}>
        <View style={styles.calculationContainer}>
          <Text style={styles.calculationTitle}>計算問題</Text>
          <Text style={styles.calculationProgress}>
            正解数: {mathProblem.correctCount} / {mathProblem.requiredCount}
          </Text>

          <View style={styles.mathProblemCard}>
            <Text style={styles.mathProblem}>
              {mathProblem.currentProblem.num1} {mathProblem.currentProblem.operator} {mathProblem.currentProblem.num2} = ?
            </Text>
          </View>

          <TextInput
            ref={mathProblem.inputRef}
            style={[
              styles.mathInput,
              mathProblem.feedback === 'correct' && styles.mathInputCorrect,
              mathProblem.feedback === 'incorrect' && styles.mathInputIncorrect,
            ]}
            value={mathProblem.answer}
            onChangeText={mathProblem.setAnswer}
            keyboardType="numeric"
            placeholder="答えを入力"
            placeholderTextColor="#999"
            autoFocus
            onSubmitEditing={handleMathSubmit}
            editable={mathProblem.feedback === null}
          />

          {mathProblem.feedback && (
            <Text style={[
              styles.mathFeedback,
              mathProblem.feedback === 'correct' ? styles.mathFeedbackCorrect : styles.mathFeedbackIncorrect
            ]}>
              {mathProblem.feedback === 'correct' ? '正解！' : `不正解... 答えは ${mathProblem.currentProblem.answer}`}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleMathSubmit}
            style={styles.mathSubmitButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            disabled={mathProblem.answer.trim() === '' || mathProblem.feedback !== null}
          >
            回答する
          </Button>

          <Text style={styles.calculationHint}>
            {mathProblem.requiredCount}問正解すると回答フェーズに進みます
          </Text>
        </View>
      </View>
    );
  }

  // カウントダウン画面の表示
  if (phase === GamePhase.COUNTDOWN_MEMORIZE || phase === GamePhase.COUNTDOWN_ANSWER) {
    return (
      <View style={styles.container}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownTitle}>
            {phase === GamePhase.COUNTDOWN_MEMORIZE ? '記憶フェーズ' : '回答フェーズ'}
          </Text>
          <View style={styles.countdownCircle}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </View>
          <Text style={styles.countdownSubtitle}>
            {phase === GamePhase.COUNTDOWN_MEMORIZE ? '表示された画像をすべて覚えてください' : '覚えた画像をすべて選んでください'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヒント表示中のオーバーレイ */}
      {hint.showingHint && (
        <View style={styles.hintOverlay}>
          <Card style={styles.hintCard}>
            <Card.Content>
              <Text style={styles.hintTitle}>
                正解の画像（{settings.gameMode === GameMode.BEGINNER ? '4' : '2'}秒間表示）
              </Text>
              <View style={[styles.grid, { gap: 8, width: '40%', alignSelf: 'center' }]}>
                {correctImages.map(image => (
                  <ImageGridItem
                    key={image.id}
                    image={image}
                    columns={2}
                    selectable={false}
                    selected={false}
                    onPress={() => {}}
                  />
                ))}
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* ヘッダー情報 */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.levelText}>レベル {level}</Text>
          <Text style={styles.phaseText}>
            {phase === GamePhase.MEMORIZE ? '覚えてください' : '選んでください'}
          </Text>
          {phase === GamePhase.MEMORIZE && (
            <Text style={styles.timerText}>
              経過時間: {formatTime(memorizeTimer.elapsedTime)}秒
            </Text>
          )}
          {phase === GamePhase.ANSWER && (
            <>
              <Text style={styles.selectionCount}>
                選択中: {selectedImages.length} / {correctImages.length}
              </Text>
              <Text style={styles.timerText}>
                経過時間: {formatTime(answerTimer.elapsedTime)}秒
              </Text>
            </>
          )}
        </Card.Content>
      </Card>

      {/* 画像グリッド */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
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
          {displayImages.map(image => (
            <ImageGridItem
              key={image.id}
              image={image}
              columns={columns}
              selectable={phase === GamePhase.ANSWER}
              selected={isImageSelected(image.id)}
              onPress={() => handleImageSelect(image)}
            />
          ))}
        </View>
      </ScrollView>

      {/* ボタン */}
      <View style={styles.buttonContainer}>
        {phase === GamePhase.MEMORIZE ? (
          <Button
            mode="contained"
            onPress={handleMemorized}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            accessibilityLabel="覚えた"
            accessibilityHint="タップして回答フェーズに進む"
          >
            覚えた
          </Button>
        ) : (
          <>
            {shouldShowHintButton && (
              <>
                <Text style={styles.hintDescription} accessibilityRole="text">
                  {hint.getHintDescription()}
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleUseHint}
                  style={[styles.button, styles.hintButton]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon="lightbulb-outline"
                  accessibilityLabel="ヒントを使う"
                  accessibilityHint="正解の画像を一時的に表示します"
                >
                  ヒントを使う
                </Button>
              </>
            )}
            {hint.hintUsed && (
              <Text style={styles.hintUsedText} accessibilityLabel="ヒントを使用済み">
                ✓ ヒントを使用しました
              </Text>
            )}
            <Button
              mode="contained"
              onPress={handleConfirm}
              disabled={selectedImages.length !== correctImages.length}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              accessibilityLabel={`確認する、${selectedImages.length}枚選択中、${correctImages.length}枚必要`}
              accessibilityHint={selectedImages.length === correctImages.length ? 'タップして回答を確認' : `あと${correctImages.length - selectedImages.length}枚選んでください`}
            >
              確認する
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  levelText: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  phaseText: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 8,
  },
  timerText: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    marginTop: 8,
    color: '#2196F3',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    minWidth: 160,
  },
  selectionCount: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
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
    padding: 16,
    paddingBottom: 32,
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
  hintButton: {
    borderColor: '#FF9800',
    borderWidth: 2,
    marginBottom: 8,
  },
  hintDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  hintUsedText: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    color: '#FF9800',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
  },
  countdownTitle: {
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 48,
  },
  countdownCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    elevation: 8,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  countdownNumber: {
    fontSize: 96,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  countdownSubtitle: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 32,
    lineHeight: 28,
  },
  hintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  hintCard: {
    width: '90%',
    maxWidth: 400,
    elevation: 8,
  },
  hintTitle: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FF9800',
  },
  calculationContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  calculationTitle: {
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 16,
  },
  calculationProgress: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  mathProblemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 280,
  },
  mathProblem: {
    fontSize: 48,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  mathInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6200EE',
    fontSize: 32,
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 200,
    marginBottom: 16,
  },
  mathInputCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  mathInputIncorrect: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  mathFeedback: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mathFeedbackCorrect: {
    color: '#4CAF50',
  },
  mathFeedbackIncorrect: {
    color: '#F44336',
  },
  mathSubmitButton: {
    borderRadius: 12,
    marginTop: 8,
    minWidth: 200,
  },
  calculationHint: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
  },
});

export default GameScreen;
