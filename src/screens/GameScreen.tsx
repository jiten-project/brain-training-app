import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, GamePhase, ImageData } from '../types';
import { UI_CONFIG } from '../utils/constants';
import { generateCorrectImages, generateChoiceImages, evaluateGameResult } from '../utils/gameLogic';
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

  const [phase, setPhase] = useState<GamePhase>(GamePhase.MEMORIZE);
  const [correctImages, setCorrectImages] = useState<ImageData[]>([]);
  const [choiceImages, setChoiceImages] = useState<ImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);

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

  const handleMemorized = () => {
    setPhase(GamePhase.ANSWER);
  };

  const handleImageSelect = (image: ImageData) => {
    const isSelected = selectedImages.some(img => img.id === image.id);
    if (isSelected) {
      setSelectedImages(selectedImages.filter(img => img.id !== image.id));
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const handleConfirm = () => {
    // ゲーム結果を評価
    const result = evaluateGameResult(correctImages, selectedImages, level);
    navigation.navigate('Result', { result });
  };

  const isImageSelected = (imageId: string) => {
    return selectedImages.some(img => img.id === imageId);
  };

  const getGridColumns = (count: number) => {
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    if (count <= 16) return 4;
    return 5;
  };

  const columns = getGridColumns(
    phase === GamePhase.MEMORIZE ? imageCount : choiceImages.length
  );

  return (
    <View style={styles.container}>
      {/* ヘッダー情報 */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.levelText}>レベル {level}</Text>
          <Text style={styles.phaseText}>
            {phase === GamePhase.MEMORIZE ? '覚えてください' : '選んでください'}
          </Text>
          {phase === GamePhase.ANSWER && (
            <Text style={styles.selectionCount}>
              選択中: {selectedImages.length} / {correctImages.length}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* 画像グリッド */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        <View style={[styles.grid, { gap: 12 }]}>
          {phase === GamePhase.MEMORIZE
            ? correctImages.map(image => (
                <ImageGridItem
                  key={image.id}
                  image={image}
                  columns={columns}
                  selectable={false}
                />
              ))
            : choiceImages.map(image => (
                <ImageGridItem
                  key={image.id}
                  image={image}
                  columns={columns}
                  selectable={true}
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
  selectionCount: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  gridContainer: {
    padding: 16,
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
    elevation: 4,
  },
  buttonContent: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  buttonLabel: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    fontWeight: 'bold',
  },
});

export default GameScreen;
