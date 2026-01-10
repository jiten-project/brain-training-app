import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Button, Divider, Portal, Dialog, Paragraph, IconButton } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PlayHistory, GameMode } from '../types';
import { useGame } from '../contexts/GameContext';
import { UI_CONFIG, GAME_MODE_CONFIG, LEVELS, formatTime, formatDate } from '../utils/constants';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { playHistory } = useGame();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);

  // 初期選択値を設定
  React.useEffect(() => {
    if (playHistory.length > 0 && selectedLevel === '') {
      const playedLevels = Array.from(new Set(playHistory.map(h => h.level))).sort((a, b) => a - b);
      if (playedLevels.length > 0) {
        setSelectedLevel(String(playedLevels[0]));
      }
    }
    if (playHistory.length > 0 && selectedMode === '') {
      const playedModes = Array.from(new Set(playHistory.map(h => h.gameMode)));
      if (playedModes.length > 0) {
        setSelectedMode(playedModes[0]);
      }
    }
  }, [playHistory, selectedLevel, selectedMode]);

  // レベルと難易度でフィルタリング（メモ化）
  const filteredHistory = useMemo(() => {
    if (!selectedLevel || !selectedMode) {
      return [];
    }

    let filtered = playHistory;

    // レベルでフィルタリング
    filtered = filtered.filter(h => h.level === parseInt(selectedLevel));

    // 難易度でフィルタリング
    filtered = filtered.filter(h => h.gameMode === selectedMode);

    // 並び替え: 最高記録を先頭に、その後は日時降順
    return [...filtered].sort((a, b) => {
      // 最高記録は常に先頭
      if (a.isBestRecord && !b.isBestRecord) return -1;
      if (!a.isBestRecord && b.isBestRecord) return 1;
      // 両方最高記録、または両方通常記録の場合は日時降順
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [selectedLevel, selectedMode, playHistory]);

  // レベル選択肢を生成（メモ化） - 遊んだことのあるレベルのみ表示
  const levelOptions = useMemo(() => {
    // プレイしたことのあるレベルを抽出
    const playedLevels = Array.from(new Set(playHistory.map(h => h.level))).sort((a, b) => a - b);

    return playedLevels.map(level => ({
      value: String(level),
      label: `Lv${level}`,
    }));
  }, [playHistory]);

  // 難易度選択肢を生成（メモ化） - 全難易度を表示
  const modeOptions = useMemo(() => {
    return Object.entries(GAME_MODE_CONFIG).map(([mode, config]) => ({
      value: mode,
      label: config.name,
    }));
  }, []);

  const renderHistoryItem = ({ item }: { item: PlayHistory }) => (
    <Card style={[styles.historyCard, item.isBestRecord && styles.bestRecordCard]}>
      <Card.Content>
        {item.isBestRecord && (
          <View style={styles.bestRecordBadge}>
            <Text style={styles.bestRecordText}>🏆 最高記録</Text>
          </View>
        )}
        <View style={styles.headerRow}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <Text style={[styles.clearBadge, item.isCleared ? styles.cleared : styles.failed]}>
            {item.isCleared ? 'クリア' : '失敗'}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>レベル</Text>
            <Text style={styles.detailValue}>{item.level}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>正解率</Text>
            <Text style={styles.detailValue}>{item.accuracy}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>正解数</Text>
            <Text style={styles.detailValue}>
              {item.correctCount}/{item.totalCount}
            </Text>
          </View>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>記憶: {formatTime(item.memorizeTime)}秒</Text>
          <Text style={styles.timeText}>回答: {formatTime(item.answerTime)}秒</Text>
        </View>

        <Text style={styles.modeText}>
          難易度: {GAME_MODE_CONFIG[item.gameMode].name}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderEmptyList = () => {
    // フィルターが選択されているかどうかで表示メッセージを変える
    const hasSelection = selectedLevel && selectedMode;

    return (
      <Card style={styles.emptyCard}>
        <Card.Content>
          <Text style={styles.emptyText}>
            {hasSelection ? '記録なし' : 'まだプレイ記録がありません'}
          </Text>
          <Text style={styles.emptySubText}>
            {hasSelection
              ? 'このレベル・難易度の記録がまだありません'
              : 'ゲームをプレイすると記録が表示されます'
            }
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.titleCard}>
        <Card.Content>
          <View style={styles.titleRow}>
            <Text style={styles.title}>記録</Text>
            <IconButton
              icon="information-outline"
              size={24}
              onPress={() => setInfoDialogVisible(true)}
            />
          </View>
        </Card.Content>
      </Card>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>レベル</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {levelOptions.map(option => (
              <Button
                key={option.value}
                mode={selectedLevel === option.value ? 'contained' : 'outlined'}
                onPress={() => setSelectedLevel(option.value)}
                style={styles.filterButton}
                compact
              >
                {option.label}
              </Button>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>難易度</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {modeOptions.map(option => (
              <Button
                key={option.value}
                mode={selectedMode === option.value ? 'contained' : 'outlined'}
                onPress={() => setSelectedMode(option.value)}
                style={styles.filterButton}
                compact
              >
                {option.label}
              </Button>
            ))}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Achievements')}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="trophy"
        >
          実績バッジ
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          戻る
        </Button>
      </View>

      <Portal>
        <Dialog visible={infoDialogVisible} onDismiss={() => setInfoDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>記録について</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              各レベル・難易度ごとに、最新100件まで記録を保持します。
            </Paragraph>
            <Paragraph style={styles.dialogText}>
              パーフェクト達成時の最短時間が「最高記録」として常に一番上に表示されます。
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInfoDialogVisible(false)} labelStyle={styles.dialogButtonLabel}>
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
  titleCard: {
    margin: 16,
    marginBottom: 12,
    elevation: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    minWidth: 60,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  historyCard: {
    marginBottom: 12,
    elevation: 2,
  },
  bestRecordCard: {
    borderWidth: 3,
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
  },
  bestRecordBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bestRecordText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cleared: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  failed: {
    backgroundColor: '#F44336',
    color: '#fff',
  },
  divider: {
    marginVertical: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  modeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyCard: {
    marginTop: 20,
    elevation: 2,
  },
  emptyText: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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
  dialog: {
    maxHeight: '80%',
  },
  dialogTitle: {
    fontSize: UI_CONFIG.IMPORTANT_FONT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dialogText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  dialogButtonLabel: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
