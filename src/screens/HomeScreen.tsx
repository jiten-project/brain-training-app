import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Title, Card, Chip } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { UI_CONFIG, LEVELS } from '../utils/constants';
import { useGame } from '../contexts/GameContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { maxUnlockedLevel, clearedLevels } = useGame();

  // レベル1-20の配列を生成
  const levels = Array.from({ length: LEVELS.MAX }, (_, i) => i + 1);

  const handleLevelPress = (level: number) => {
    navigation.navigate('Game', { level });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const isLevelUnlocked = (level: number) => level <= maxUnlockedLevel;
  const isLevelCleared = (level: number) => clearedLevels.includes(level);

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.title}>レベルを選択してください</Title>
        </Card.Content>
      </Card>

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
          onPress={handleSettingsPress}
          style={styles.settingsButton}
          contentStyle={styles.settingsButtonContent}
          labelStyle={styles.settingsButtonLabel}
          icon="cog"
        >
          設定
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
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  levelContainer: {
    padding: 16,
    gap: 16,
  },
  levelButtonWrapper: {
    position: 'relative',
  },
  levelButton: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
    borderRadius: 12,
    elevation: 4,
  },
  levelButtonLocked: {
    opacity: 0.5,
  },
  levelButtonContent: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  levelButtonLabel: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    fontWeight: 'bold',
  },
  clearedChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
  },
  clearedChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockedChip: {
    position: 'absolute',
    top: 8,
    right: 8,
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
  },
  settingsButton: {
    borderWidth: 2,
    borderRadius: 12,
  },
  settingsButtonContent: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  settingsButtonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
