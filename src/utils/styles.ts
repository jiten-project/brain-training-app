/**
 * 共有スタイル定義
 * プロジェクト全体で再利用するスタイル
 */

import { StyleSheet } from 'react-native';
import { UI_CONFIG } from './constants';

/**
 * 共通ボタンスタイル
 */
export const buttonStyles = StyleSheet.create({
  content: {
    minHeight: UI_CONFIG.MIN_BUTTON_SIZE,
  },
  label: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    fontWeight: 'bold',
  },
  base: {
    borderRadius: 12,
  },
});

/**
 * 共通グリッドスタイル
 */
export const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

/**
 * 共通コンテナスタイル
 */
export const containerStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 12,
  },
  card: {
    marginBottom: 12,
    elevation: 4,
  },
});
