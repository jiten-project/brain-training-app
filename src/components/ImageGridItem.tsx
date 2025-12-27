import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ImageData } from '../types';

const screenWidth = Dimensions.get('window').width;

interface Props {
  image: ImageData;
  columns: number;
  selectable?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

const ImageGridItem: React.FC<Props> = ({
  image,
  columns,
  selectable = false,
  selected = false,
  onPress,
}) => {
  const itemSize = (screenWidth - 32 - (columns - 1) * 12) / columns;

  return (
    <TouchableOpacity
      onPress={selectable ? onPress : undefined}
      disabled={!selectable}
      activeOpacity={selectable ? 0.7 : 1}
    >
      <Surface
        style={[
          styles.surface,
          {
            width: itemSize,
            height: itemSize,
          },
          selected && styles.selected,
        ]}
        elevation={selected ? 8 : 4}
      >
        <Text style={styles.emoji}>{image.uri}</Text>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  surface: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  emoji: {
    fontSize: 48,
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
});

export default ImageGridItem;
