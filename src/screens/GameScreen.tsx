import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Card, IconButton, Portal, Dialog } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, GamePhase, ImageData, GameMode } from '../types';
import { UI_CONFIG, formatTime } from '../utils/constants';
import { generateCorrectImages, generateChoiceImages, evaluateGameResult } from '../utils/gameLogic';
import { useGame } from '../contexts/GameContext';
import ImageGridItem from '../components/ImageGridItem';

const screenWidth = Dimensions.get('window').width;

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
  const [shufflePositions, setShufflePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [displayCorrectImages, setDisplayCorrectImages] = useState<ImageData[]>([]); // 超級モード用: 表示する画像（中身だけシャッフル）

  // ヒント機能の状態
  const [hintUsed, setHintUsed] = useState(false); // ヒントが使用されたか
  const [showingHint, setShowingHint] = useState(false); // ヒント表示中か

  // ゲーム初期化
  useEffect(() => {
    const initGame = () => {
      // 正解の画像をランダムに選択
      const correct = generateCorrectImages(level);
      setCorrectImages(correct);
      setDisplayCorrectImages(correct); // 最初は元のまま表示

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
    }, 10); // 10msごとに更新

    return () => clearInterval(interval);
  }, [phase, memorizeStartTime]);

  // 回答フェーズの経過時間の更新
  useEffect(() => {
    if (phase !== GamePhase.ANSWER) return;

    const interval = setInterval(() => {
      setAnswerElapsedTime(Date.now() - answerStartTime);
    }, 10); // 10msごとに更新

    return () => clearInterval(interval);
  }, [phase, answerStartTime]);

  // 超級モードで記憶フェーズ時に3秒ごとに画像の中身だけをシャッフル
  useEffect(() => {
    if (phase !== GamePhase.MEMORIZE || settings.gameMode !== GameMode.EXPERT) return;

    const shuffleInterval = setInterval(() => {
      setDisplayCorrectImages(prevImages => {
        // 位置（インデックス）は固定、中身（uri）だけをシャッフル
        const uris = prevImages.map(img => img.uri);

        // Fisher-Yatesアルゴリズムでuriだけをシャッフル
        for (let i = uris.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [uris[i], uris[j]] = [uris[j], uris[i]];
        }

        // 元の位置（ID）は保持したまま、uriだけを入れ替えた新しい配列を返す
        return prevImages.map((img, index) => ({
          ...img,
          uri: uris[index],
        }));
      });
    }, 3000); // 3秒ごと

    return () => clearInterval(shuffleInterval);
  }, [phase, settings.gameMode]);

  const handleMemorized = () => {
    // シャッフル位置をクリア（回答フェーズでは動かさない）
    setShufflePositions(new Map());

    // 超級モードの場合、回答フェーズの画像をランダムに並び替え
    if (settings.gameMode === GameMode.EXPERT) {
      const shuffled = [...choiceImages];
      // Fisher-Yatesアルゴリズムでシャッフル
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledChoiceImages(shuffled);
    } else {
      setShuffledChoiceImages(choiceImages);
    }

    // カウントダウンフェーズに遷移
    setCountdown(3);
    setPhase(GamePhase.COUNTDOWN_ANSWER);
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

  const getGridColumns = (count: number) => {
    if (count <= 4) return 2;
    return 6;
  };

  const displayImages = phase === GamePhase.MEMORIZE
    ? (settings.gameMode === GameMode.EXPERT ? displayCorrectImages : correctImages)
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
  hintButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
});

export default GameScreen;
