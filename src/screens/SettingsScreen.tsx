import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, RadioButton, Switch, Button, Divider } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, GameMode } from '../types';
import { UI_CONFIG, GAME_MODE_CONFIG } from '../utils/constants';
import { useGame } from '../contexts/GameContext';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { settings, updateSettings, resetProgress } = useGame();

  const [gameMode, setGameMode] = useState<GameMode>(settings.gameMode);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  // 設定が変更された場合、ローカルステートを更新
  useEffect(() => {
    setGameMode(settings.gameMode);
    setSoundEnabled(settings.soundEnabled);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({ gameMode, soundEnabled });
    navigation.goBack();
  };

  const handleReset = () => {
    Alert.alert(
      'データリセット',
      '全ての進捗データがリセットされます。\nよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            Alert.alert('完了', 'データをリセットしました');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ゲームモード設定 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>選択肢モード</Text>
            <Divider style={styles.divider} />

            <RadioButton.Group onValueChange={value => setGameMode(value as GameMode)} value={gameMode}>
              {Object.entries(GAME_MODE_CONFIG).map(([mode, config]) => (
                <View key={mode} style={styles.radioItem}>
                  <RadioButton.Item
                    label={`${config.name} ${config.difficulty}`}
                    value={mode}
                    labelStyle={styles.radioLabel}
                  />
                  <Text style={styles.radioDescription}>{config.description}</Text>
                </View>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* 音声設定 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>音声設定</Text>
            <Divider style={styles.divider} />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>効果音</Text>
              <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
            </View>
          </Card.Content>
        </Card>

        {/* データリセット (将来実装) */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>データ管理</Text>
            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.resetButton}
              labelStyle={styles.resetButtonLabel}
              textColor="#F44336"
            >
              全データをリセット
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* 保存ボタン */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
        >
          保存
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
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  radioItem: {
    marginBottom: 12,
  },
  radioLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
  },
  radioDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 40,
    marginTop: -8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
  resetButton: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  resetButtonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    borderRadius: 12,
  },
  saveButtonContent: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  saveButtonLabel: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
