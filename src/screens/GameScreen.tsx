import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, GamePhase, ImageData, GameMode, MathProblem } from '../types';
import { UI_CONFIG, formatTime, MATH_REQUIRED_CORRECT_COUNT, getGridColumns } from '../utils/constants';
import { generateCorrectImages, generateChoiceImages, evaluateGameResult, generateMathProblem } from '../utils/gameLogic';
import { shuffleArray } from '../utils/shuffle';
import { useGame } from '../contexts/GameContext';
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

  const [phase, setPhase] = useState<GamePhase>(GamePhase.COUNTDOWN_MEMORIZE);
  const [countdown, setCountdown] = useState<number>(3); // カウントダウン用
  const [correctImages, setCorrectImages] = useState<ImageData[]>([]);
  const [choiceImages, setChoiceImages] = useState<ImageData[]>([]);
  const [shuffledChoiceImages, setShuffledChoiceImages] = useState<ImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [memorizeStartTime, setMemorizeStartTime] = useState<number>(0);
  const [memorizeElapsedTime, setMemorizeElapsedTime] = useState<number>(0);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);
  const [answerElapsedTime, setAnswerElapsedTime] = useState<number>(0);

  // ヒント機能の状態
  const [hintUsed, setHintUsed] = useState(false); // ヒントが使用されたか
  const [showingHint, setShowingHint] = useState(false); // ヒント表示中か

  // 計算フェーズの状態（超級モード用）
  const [currentMathProblem, setCurrentMathProblem] = useState<MathProblem | null>(null);
  const [mathCorrectCount, setMathCorrectCount] = useState(0); // 正解した問題数
  const [mathAnswer, setMathAnswer] = useState(''); // ユーザーの回答入力
  const [mathFeedback, setMathFeedback] = useState<'correct' | 'incorrect' | null>(null); // 正誤フィードバック
  const mathInputRef = useRef<TextInput>(null);

  // ゲーム初期化
  useEffect(() => {
    const initGame = () => {
      // 正解の画像をランダムに選択
      const correct = generateCorrectImages(level);
      setCorrectImages(correct);

      // 設定に応じた選択肢を生成
      const choices = generateChoiceImages(correct, level, settings.gameMode);
      setChoiceImages(choices);
    };

    initGame();
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
      // カウントダウン終了後の処理
      if (phase === GamePhase.COUNTDOWN_MEMORIZE) {
        setPhase(GamePhase.MEMORIZE);
        setMemorizeStartTime(Date.now());
      } else if (phase === GamePhase.COUNTDOWN_ANSWER) {
        setPhase(GamePhase.ANSWER);
        setAnswerStartTime(Date.now());
      }
    }
  }, [phase, countdown]);

  // 記憶フェーズの経過時間の更新
  useEffect(() => {
    if (phase !== GamePhase.MEMORIZE) return;

    const interval = setInterval(() => {
      setMemorizeElapsedTime(Date.now() - memorizeStartTime);
    }, 100); // 100msごとに更新（パフォーマンス最適化）

    return () => clearInterval(interval);
  }, [phase, memorizeStartTime]);

  // 回答フェーズの経過時間の更新
  useEffect(() => {
    if (phase !== GamePhase.ANSWER) return;

    const interval = setInterval(() => {
      setAnswerElapsedTime(Date.now() - answerStartTime);
    }, 100); // 100msごとに更新（パフォーマンス最適化）

    return () => clearInterval(interval);
  }, [phase, answerStartTime]);

  const handleMemorized = () => {
    // 回答フェーズの画像をシャッフル
    setShuffledChoiceImages(shuffleArray(choiceImages));

    // 超級モードの場合、計算フェーズに遷移
    if (settings.gameMode === GameMode.EXPERT) {
      setMathCorrectCount(0);
      setMathAnswer('');
      setMathFeedback(null);
      setCurrentMathProblem(generateMathProblem());
      setPhase(GamePhase.CALCULATION);
    } else {
      // その他のモードはカウントダウンフェーズに遷移
      setCountdown(3);
      setPhase(GamePhase.COUNTDOWN_ANSWER);
    }
  };

  const handleImageSelect = (image: ImageData) => {
    const isSelected = selectedImages.some(img => img.id === image.id);
    if (isSelected) {
      // 選択解除
      setSelectedImages(selectedImages.filter(img => img.id !== image.id));
    } else {
      // 選択数が上限に達していない場合のみ追加
      if (selectedImages.length < correctImages.length) {
        setSelectedImages([...selectedImages, image]);
      }
    }
  };

  const handleConfirm = () => {
    // 正しい枚数が選択されているか確認
    if (selectedImages.length !== correctImages.length) {
      return;
    }
    // ゲーム結果を評価
    const result = evaluateGameResult(
      correctImages,
      selectedImages,
      choiceImages,
      level,
      memorizeElapsedTime,
      answerElapsedTime
    );
    navigation.navigate('Result', { result });
  };

  // 計算問題の回答を送信
  const handleMathSubmit = () => {
    if (!currentMathProblem || mathAnswer.trim() === '') return;

    const userAnswerNum = parseInt(mathAnswer, 10);
    const isCorrect = userAnswerNum === currentMathProblem.answer;

    if (isCorrect) {
      setMathFeedback('correct');
      const newCorrectCount = mathCorrectCount + 1;
      setMathCorrectCount(newCorrectCount);

      // 必要数正解したら回答フェーズへ
      if (newCorrectCount >= MATH_REQUIRED_CORRECT_COUNT) {
        setTimeout(() => {
          setPhase(GamePhase.ANSWER);
          setAnswerStartTime(Date.now());
        }, 500);
      } else {
        // 次の問題へ
        setTimeout(() => {
          setMathFeedback(null);
          setMathAnswer('');
          setCurrentMathProblem(generateMathProblem());
          mathInputRef.current?.focus();
        }, 500);
      }
    } else {
      // 不正解の場合は新しい問題を生成
      setMathFeedback('incorrect');
      setTimeout(() => {
        setMathFeedback(null);
        setMathAnswer('');
        setCurrentMathProblem(generateMathProblem());
        mathInputRef.current?.focus();
      }, 1000);
    }
  };

  // ヒント機能
  const handleUseHint = () => {
    if (hintUsed || !settings.hintEnabled) return;

    setHintUsed(true);

    if (settings.gameMode === GameMode.BEGINNER) {
      // 初級: 4秒間正解画像を再表示
      setShowingHint(true);
      setTimeout(() => {
        setShowingHint(false);
      }, 4000);
    } else if (settings.gameMode === GameMode.INTERMEDIATE) {
      // 中級: 2秒間正解画像を再表示
      setShowingHint(true);
      setTimeout(() => {
        setShowingHint(false);
      }, 2000);
    }
  };

  const isImageSelected = (imageId: string) => {
    return selectedImages.some(img => img.id === imageId);
  };

  const displayImages = phase === GamePhase.MEMORIZE
    ? correctImages
    : shuffledChoiceImages;
  const columns = getGridColumns(displayImages.length);

  // ヒントボタンを表示するかどうか
  const shouldShowHintButton =
    phase === GamePhase.ANSWER &&
    settings.hintEnabled &&
    !hintUsed &&
    (settings.gameMode === GameMode.BEGINNER || settings.gameMode === GameMode.INTERMEDIATE);

  // ヒント説明テキストを取得
  const getHintDescription = () => {
    if (settings.gameMode === GameMode.BEGINNER) {
      return '正解の画像を4秒間もう一度表示します。\n記憶を確認できます。';
    } else if (settings.gameMode === GameMode.INTERMEDIATE) {
      return '正解の画像を2秒間もう一度表示します。\n記憶を確認できます。';
    }
    return '';
  };

  // 計算フェーズの表示（超級モード）
  if (phase === GamePhase.CALCULATION && currentMathProblem) {
    return (
      <View style={styles.container}>
        <View style={styles.calculationContainer}>
          <Text style={styles.calculationTitle}>計算問題</Text>
          <Text style={styles.calculationProgress}>
            正解数: {mathCorrectCount} / {MATH_REQUIRED_CORRECT_COUNT}
          </Text>

          <View style={styles.mathProblemCard}>
            <Text style={styles.mathProblem}>
              {currentMathProblem.num1} {currentMathProblem.operator} {currentMathProblem.num2} = ?
            </Text>
          </View>

          <TextInput
            ref={mathInputRef}
            style={[
              styles.mathInput,
              mathFeedback === 'correct' && styles.mathInputCorrect,
              mathFeedback === 'incorrect' && styles.mathInputIncorrect,
            ]}
            value={mathAnswer}
            onChangeText={setMathAnswer}
            keyboardType="numeric"
            placeholder="答えを入力"
            placeholderTextColor="#999"
            autoFocus
            onSubmitEditing={handleMathSubmit}
            editable={mathFeedback === null}
          />

          {mathFeedback && (
            <Text style={[
              styles.mathFeedback,
              mathFeedback === 'correct' ? styles.mathFeedbackCorrect : styles.mathFeedbackIncorrect
            ]}>
              {mathFeedback === 'correct' ? '正解！' : `不正解... 答えは ${currentMathProblem.answer}`}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleMathSubmit}
            style={styles.mathSubmitButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            disabled={mathAnswer.trim() === '' || mathFeedback !== null}
          >
            回答する
          </Button>

          <Text style={styles.calculationHint}>
            {MATH_REQUIRED_CORRECT_COUNT}問正解すると回答フェーズに進みます
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
      {showingHint && (
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
              経過時間: {formatTime(memorizeElapsedTime)}秒
            </Text>
          )}
          {phase === GamePhase.ANSWER && (
            <>
              <Text style={styles.selectionCount}>
                選択中: {selectedImages.length} / {correctImages.length}
              </Text>
              <Text style={styles.timerText}>
                経過時間: {formatTime(answerElapsedTime)}秒
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
          >
            覚えた
          </Button>
        ) : (
          <>
            {shouldShowHintButton && (
              <>
                <Text style={styles.hintDescription}>
                  {getHintDescription()}
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleUseHint}
                  style={[styles.button, styles.hintButton]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon="lightbulb-outline"
                >
                  ヒントを使う
                </Button>
              </>
            )}
            {hintUsed && (
              <Text style={styles.hintUsedText}>
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
  // 計算フェーズのスタイル
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
