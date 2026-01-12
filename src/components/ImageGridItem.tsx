import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ImageData } from '../types';
import { TIMING } from '../utils/constants';

const screenWidth = Dimensions.get('window').width;

interface Props {
  image: ImageData;
  columns: number;
  selectable?: boolean;
  selected?: boolean;
  onPress?: () => void;
  resultMode?: boolean; // 結果表示モード
  isCorrect?: boolean; // 正解かどうか（結果モード用）
  wasSelected?: boolean; // 選択されたかどうか（結果モード用）
  shufflePosition?: { x: number; y: number }; // シャッフル時の移動先座標
}

const ImageGridItem: React.FC<Props> = React.memo(({
  image,
  columns,
  selectable = false,
  selected = false,
  onPress,
  resultMode = false,
  isCorrect = false,
  wasSelected = false,
  shufflePosition,
}) => {
  // 常に6列のサイズで計算（2列の場合も同じサイズ）
  const itemSize = (screenWidth - 32 - (6 - 1) * 12) / 6;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // 初回表示時のフェードインアニメーション（控えめ）
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: TIMING.ANIMATION_PRESS,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  // 選択時のスケールアニメーション
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 1.05 : 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [selected, scaleAnim]);

  // シャッフル位置が変更された時のアニメーション
  useEffect(() => {
    if (shufflePosition) {
      Animated.parallel([
        Animated.timing(translateXAnim, {
          toValue: shufflePosition.x,
          duration: TIMING.ANIMATION_SELECT,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: shufflePosition.y,
          duration: TIMING.ANIMATION_SELECT,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shufflePosition, translateXAnim, translateYAnim]);

  // 結果モードでの背景色とマーク
  const getResultStyle = () => {
    if (!resultMode) return null;

    if (wasSelected && isCorrect) {
      // 選択した & 正解 → 緑背景 + ○
      return styles.resultCorrect;
    } else if (wasSelected && !isCorrect) {
      // 選択した & 不正解 → 赤背景 + ×
      return styles.resultIncorrect;
    } else if (!wasSelected && isCorrect) {
      // 選択してない & 正解（見逃し） → 青背景 + ○
      return styles.resultMissed;
    }
    // 選択してない & 不正解 → 通常
    return null;
  };

  const getResultMark = () => {
    if (!resultMode) return null;

    if (wasSelected && isCorrect) {
      return <Text style={styles.correctMark}>⭕️</Text>;
    } else if (wasSelected && !isCorrect) {
      return <Text style={styles.incorrectMark}>❌</Text>;
    }
    // 選択されなかった正解にはマークをつけない（背景色のみ）
    return null;
  };

  // アクセシビリティラベルを生成
  const getAccessibilityLabel = () => {
    const baseName = image.name || '画像';
    if (resultMode) {
      if (wasSelected && isCorrect) return `${baseName}、正解`;
      if (wasSelected && !isCorrect) return `${baseName}、不正解`;
      if (!wasSelected && isCorrect) return `${baseName}、見逃し`;
      return baseName;
    }
    if (selected) return `${baseName}、選択中`;
    return baseName;
  };

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [
          { scale: scaleAnim },
          { translateX: translateXAnim },
          { translateY: translateYAnim },
        ],
      }}
    >
      <TouchableOpacity
        onPress={selectable ? onPress : undefined}
        disabled={!selectable}
        activeOpacity={selectable ? 0.7 : 1}
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled: !selectable }}
      >
        <Surface
          style={[
            styles.surface,
            {
              width: itemSize,
              height: itemSize,
            },
            selected && styles.selected,
            getResultStyle(),
          ]}
          elevation={selected ? 4 : 2}
        >
          <Text style={styles.emoji}>{image.uri}</Text>
          {selected && !resultMode && <Text style={styles.checkmark}>✓</Text>}
          {getResultMark()}
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  surface: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
    padding: 0,
  },
  emoji: {
    fontSize: 42,
  },
  selected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 24,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  resultCorrect: {
    backgroundColor: '#C8E6C9',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  resultIncorrect: {
    backgroundColor: '#FFCDD2',
    borderWidth: 3,
    borderColor: '#F44336',
  },
  resultMissed: {
    backgroundColor: '#BBDEFB',
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  correctMark: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 24,
  },
  incorrectMark: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 24,
  },
});

export default ImageGridItem;
