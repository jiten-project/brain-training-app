import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Title, Card, Chip, Portal, Dialog, Paragraph } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { UI_CONFIG, LEVELS } from '../utils/constants';
import { useGame } from '../contexts/GameContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { modeProgress, settings } = useGame();
  const [howToPlayVisible, setHowToPlayVisible] = useState(false);

  // 現在の難易度の進捗を取得
  const currentModeProgress = modeProgress[settings.gameMode];
  const maxUnlockedLevel = currentModeProgress.maxUnlockedLevel;
  const clearedLevels = currentModeProgress.clearedLevels;

  // 遊べるレベル + その一つ先のレベルまで表示
  const maxDisplayLevel = Math.min(maxUnlockedLevel + 1, LEVELS.MAX);
  const levels = Array.from({ length: maxDisplayLevel }, (_, i) => i + 1);

  const handleLevelPress = (level: number) => {
    navigation.navigate('Game', { level });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleHistoryPress = () => {
    navigation.navigate('History');
  };

  const handleHowToPlayPress = () => {
    setHowToPlayVisible(true);
  };

  const hideHowToPlayDialog = () => {
    setHowToPlayVisible(false);
  };

  const isLevelUnlocked = (level: number) => level <= maxUnlockedLevel;
  const isLevelCleared = (level: number) => clearedLevels.includes(level);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Button
          mode="contained"
          onPress={handleHowToPlayPress}
          style={styles.howToPlayButton}
          contentStyle={styles.howToPlayButtonContent}
          labelStyle={styles.howToPlayButtonLabel}
          icon="help-circle"
        >
          遊び方
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.levelContainer}>
        {levels.map(level => {
          const unlocked = isLevelUnlocked(level);
          const cleared = isLevelCleared(level);

          return (
            <View key={level} style={styles.levelButtonWrapper}>
              <Button
                mode={unlocked ? 'contained' : 'outlined'}
                onPress={() => handleLevelPress(level)}
                disabled={!unlocked}
                style={[
                  styles.levelButton,
                  !unlocked && styles.levelButtonLocked,
                ]}
                contentStyle={styles.levelButtonContent}
                labelStyle={styles.levelButtonLabel}
              >
                レベル {level}
              </Button>
              {cleared && (
                <Chip icon="check" style={styles.clearedChip} textStyle={styles.clearedChipText}>
                  クリア
                </Chip>
              )}
              {!unlocked && (
                <Chip icon="lock" style={styles.lockedChip} textStyle={styles.lockedChipText}>
                  ロック
                </Chip>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleHistoryPress}
          style={styles.historyButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="history"
        >
          記録
        </Button>
        <Button
          mode="outlined"
          onPress={handleSettingsPress}
          style={styles.settingsButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="cog"
        >
          設定
        </Button>
      </View>

      <Portal>
        <Dialog visible={howToPlayVisible} onDismiss={hideHowToPlayDialog} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>遊び方</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <Paragraph style={styles.dialogText}>
                <Paragraph style={styles.dialogBoldText}>1. 記憶フェーズ</Paragraph>
                {'\n'}表示された絵を覚えてください。
                {'\n'}覚えたら「覚えた」ボタンを押します。
              </Paragraph>

              <Paragraph style={styles.dialogText}>
                <Paragraph style={styles.dialogBoldText}>2. 回答フェーズ</Paragraph>
                {'\n'}記憶した絵を選択肢の中から選んでください。
                {'\n'}すべて選んだら「確認する」ボタンを押します。
              </Paragraph>

              <Paragraph style={styles.dialogText}>
                <Paragraph style={styles.dialogBoldText}>3. 結果</Paragraph>
                {'\n'}正解率が80%以上でクリアです。
                {'\n'}クリアすると次のレベルに進めます。
              </Paragraph>

              <Paragraph style={styles.dialogText}>
                <Paragraph style={styles.dialogBoldText}>レベルについて</Paragraph>
                {'\n'}レベルが上がるほど覚える枚数が増えます。
                {'\n'}レベル1: 4枚 → レベル20: 23枚
              </Paragraph>

              <Paragraph style={styles.dialogText}>
                <Paragraph style={styles.dialogBoldText}>難易度設定</Paragraph>
                {'\n'}設定画面で難易度を変更できます。
                {'\n'}• 初級★☆☆☆: 選択肢が少ない（おすすめ）
                {'\n'}• 中級★★☆☆: 選択肢が中程度
                {'\n'}• 上級★★★☆: 選択肢が多い
                {'\n'}• 超級★★★★: 上級+パネルが動く
              </Paragraph>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={hideHowToPlayDialog} labelStyle={styles.dialogButtonLabel}>
              閉じる
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  howToPlayButton: {
    borderRadius: 12,
  },
  howToPlayButtonContent: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  howToPlayButtonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
  levelContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  levelButtonWrapper: {
    position: 'relative',
  },
  levelButton: {
    borderRadius: 12,
  },
  levelButtonLocked: {
    opacity: 0.5,
  },
  levelButtonContent: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  levelButtonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
  clearedChip: {
    position: 'absolute',
    top: '50%',
    right: 12,
    transform: [{ translateY: -16 }],
    backgroundColor: '#4CAF50',
  },
  clearedChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockedChip: {
    position: 'absolute',
    top: '50%',
    right: 12,
    transform: [{ translateY: -16 }],
    backgroundColor: '#9E9E9E',
  },
  lockedChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  historyButton: {
    borderWidth: 2,
    borderRadius: 12,
  },
  settingsButton: {
    borderWidth: 2,
    borderRadius: 12,
  },
  buttonContent: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  buttonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogTitle: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dialogContent: {
    paddingHorizontal: 24,
  },
  dialogText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  dialogBoldText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  dialogButtonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
