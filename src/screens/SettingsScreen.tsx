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
  const [hintEnabled, setHintEnabled] = useState(settings.hintEnabled);

  // 設定が変更された場合、ローカルステートを更新
  useEffect(() => {
    setGameMode(settings.gameMode);
    setHintEnabled(settings.hintEnabled);
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({ gameMode, hintEnabled });
      navigation.goBack();
    } catch (error) {
      Alert.alert('エラー', '設定の保存に失敗しました。もう一度お試しください。');
    }
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
            try {
              await resetProgress();
              Alert.alert('完了', 'データをリセットしました');
            } catch (error) {
              Alert.alert('エラー', 'データのリセットに失敗しました。もう一度お試しください。');
            }
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

        {/* ヒント機能設定 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>ヒント機能</Text>
            <Divider style={styles.divider} />

            <View style={styles.switchContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>ヒント機能を使う</Text>
                <Text style={styles.hintDescription}>
                  初級: 間違い選択肢を半分に減らす{'\n'}
                  中級: 正解を2秒間再表示する
                </Text>
              </View>
              <Switch value={hintEnabled} onValueChange={setHintEnabled} />
            </View>
          </Card.Content>
        </Card>

        {/* データリセット */}
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

        {/* 法的情報 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>法的情報</Text>
            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Legal', { type: 'terms' })}
              style={styles.legalButton}
              labelStyle={styles.legalButtonLabel}
              icon="file-document-outline"
            >
              利用規約
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
              style={[styles.legalButton, { marginTop: 12 }]}
              labelStyle={styles.legalButtonLabel}
              icon="shield-account-outline"
            >
              プライバシーポリシー
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Legal', { type: 'licenses' })}
              style={[styles.legalButton, { marginTop: 12 }]}
              labelStyle={styles.legalButtonLabel}
              icon="license"
            >
              オープンソースライセンス
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
  hintDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  resetButton: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  resetButtonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
  },
  legalButton: {
    borderColor: '#6200EE',
    borderWidth: 1,
  },
  legalButtonLabel: {
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
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    marginLeft: 12,
    color: '#666',
  },
  purchasedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  purchasedText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  purchasedSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  purchaseDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  purchaseButton: {
    borderRadius: 12,
    marginBottom: 8,
  },
  purchaseButtonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
  restoreButton: {
    marginTop: 8,
  },
  restoreButtonLabel: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SettingsScreen;
