/**
 * 画像データ
 * 開発初期用: 絵文字を使用した仮データ
 * 本番では実際の画像ファイルに置き換える
 */

import { ImageData } from '../types';

/**
 * 日常の物の画像データ (50種類)
 */
const dailyImages: ImageData[] = [
  // 果物 (10種類)
  { id: 'daily_01', uri: '🍎', category: 'daily', name: 'りんご' },
  { id: 'daily_02', uri: '🍊', category: 'daily', name: 'みかん' },
  { id: 'daily_03', uri: '🍌', category: 'daily', name: 'バナナ' },
  { id: 'daily_04', uri: '🍇', category: 'daily', name: 'ぶどう' },
  { id: 'daily_05', uri: '🍓', category: 'daily', name: 'いちご' },
  { id: 'daily_06', uri: '🍑', category: 'daily', name: 'もも' },
  { id: 'daily_07', uri: '🍉', category: 'daily', name: 'すいか' },
  { id: 'daily_08', uri: '🍍', category: 'daily', name: 'パイナップル' },
  { id: 'daily_09', uri: '🥝', category: 'daily', name: 'キウイ' },
  { id: 'daily_10', uri: '🍒', category: 'daily', name: 'さくらんぼ' },

  // 野菜 (10種類)
  { id: 'daily_11', uri: '🥕', category: 'daily', name: 'にんじん' },
  { id: 'daily_12', uri: '🥔', category: 'daily', name: 'じゃがいも' },
  { id: 'daily_13', uri: '🧅', category: 'daily', name: 'たまねぎ' },
  { id: 'daily_14', uri: '🥒', category: 'daily', name: 'きゅうり' },
  { id: 'daily_15', uri: '🍅', category: 'daily', name: 'トマト' },
  { id: 'daily_16', uri: '🥦', category: 'daily', name: 'ブロッコリー' },
  { id: 'daily_17', uri: '🌽', category: 'daily', name: 'とうもろこし' },
  { id: 'daily_18', uri: '🍆', category: 'daily', name: 'なす' },
  { id: 'daily_19', uri: '🫑', category: 'daily', name: 'ピーマン' },
  { id: 'daily_20', uri: '🥬', category: 'daily', name: 'レタス' },

  // 食べ物 (10種類)
  { id: 'daily_21', uri: '🍞', category: 'daily', name: 'パン' },
  { id: 'daily_22', uri: '🍚', category: 'daily', name: 'ごはん' },
  { id: 'daily_23', uri: '🍜', category: 'daily', name: 'ラーメン' },
  { id: 'daily_24', uri: '🍕', category: 'daily', name: 'ピザ' },
  { id: 'daily_25', uri: '🍔', category: 'daily', name: 'ハンバーガー' },
  { id: 'daily_26', uri: '🍰', category: 'daily', name: 'ケーキ' },
  { id: 'daily_27', uri: '🍪', category: 'daily', name: 'クッキー' },
  { id: 'daily_28', uri: '🍩', category: 'daily', name: 'ドーナツ' },
  { id: 'daily_29', uri: '🧁', category: 'daily', name: 'カップケーキ' },
  { id: 'daily_30', uri: '🥐', category: 'daily', name: 'クロワッサン' },

  // 飲み物 (5種類)
  { id: 'daily_31', uri: '☕', category: 'daily', name: 'コーヒー' },
  { id: 'daily_32', uri: '🍵', category: 'daily', name: 'お茶' },
  { id: 'daily_33', uri: '🥛', category: 'daily', name: '牛乳' },
  { id: 'daily_34', uri: '🧃', category: 'daily', name: 'ジュース' },
  { id: 'daily_35', uri: '🥤', category: 'daily', name: 'ソーダ' },

  // 道具・日用品 (15種類)
  { id: 'daily_36', uri: '⌚', category: 'daily', name: '時計' },
  { id: 'daily_37', uri: '📱', category: 'daily', name: 'スマホ' },
  { id: 'daily_38', uri: '💻', category: 'daily', name: 'パソコン' },
  { id: 'daily_39', uri: '📷', category: 'daily', name: 'カメラ' },
  { id: 'daily_40', uri: '🔑', category: 'daily', name: '鍵' },
  { id: 'daily_41', uri: '🔦', category: 'daily', name: '懐中電灯' },
  { id: 'daily_42', uri: '🔨', category: 'daily', name: 'ハンマー' },
  { id: 'daily_43', uri: '✂️', category: 'daily', name: 'はさみ' },
  { id: 'daily_44', uri: '📚', category: 'daily', name: '本' },
  { id: 'daily_45', uri: '✏️', category: 'daily', name: '鉛筆' },
  { id: 'daily_46', uri: '🖊️', category: 'daily', name: 'ペン' },
  { id: 'daily_47', uri: '📌', category: 'daily', name: 'ピン' },
  { id: 'daily_48', uri: '🧷', category: 'daily', name: '安全ピン' },
  { id: 'daily_49', uri: '🧲', category: 'daily', name: '磁石' },
  { id: 'daily_50', uri: '🔧', category: 'daily', name: 'レンチ' },
];

/**
 * 動物の画像データ (30種類)
 */
const animalImages: ImageData[] = [
  { id: 'animal_01', uri: '🐶', category: 'animal', name: '犬' },
  { id: 'animal_02', uri: '🐱', category: 'animal', name: '猫' },
  { id: 'animal_03', uri: '🐭', category: 'animal', name: 'ねずみ' },
  { id: 'animal_04', uri: '🐹', category: 'animal', name: 'ハムスター' },
  { id: 'animal_05', uri: '🐰', category: 'animal', name: 'うさぎ' },
  { id: 'animal_06', uri: '🦊', category: 'animal', name: 'きつね' },
  { id: 'animal_07', uri: '🐻', category: 'animal', name: 'くま' },
  { id: 'animal_08', uri: '🐼', category: 'animal', name: 'パンダ' },
  { id: 'animal_09', uri: '🐨', category: 'animal', name: 'コアラ' },
  { id: 'animal_10', uri: '🐯', category: 'animal', name: 'とら' },
  { id: 'animal_11', uri: '🦁', category: 'animal', name: 'ライオン' },
  { id: 'animal_12', uri: '🐮', category: 'animal', name: '牛' },
  { id: 'animal_13', uri: '🐷', category: 'animal', name: 'ぶた' },
  { id: 'animal_14', uri: '🐸', category: 'animal', name: 'かえる' },
  { id: 'animal_15', uri: '🐵', category: 'animal', name: 'さる' },
  { id: 'animal_16', uri: '🐔', category: 'animal', name: 'にわとり' },
  { id: 'animal_17', uri: '🐧', category: 'animal', name: 'ペンギン' },
  { id: 'animal_18', uri: '🐦', category: 'animal', name: '鳥' },
  { id: 'animal_19', uri: '🐤', category: 'animal', name: 'ひよこ' },
  { id: 'animal_20', uri: '🦆', category: 'animal', name: 'あひる' },
  { id: 'animal_21', uri: '🦅', category: 'animal', name: '鷲' },
  { id: 'animal_22', uri: '🦉', category: 'animal', name: 'ふくろう' },
  { id: 'animal_23', uri: '🐺', category: 'animal', name: 'おおかみ' },
  { id: 'animal_24', uri: '🐗', category: 'animal', name: 'いのしし' },
  { id: 'animal_25', uri: '🐴', category: 'animal', name: '馬' },
  { id: 'animal_26', uri: '🦄', category: 'animal', name': 'ユニコーン' },
  { id: 'animal_27', uri: '🐝', category: 'animal', name: '蜂' },
  { id: 'animal_28', uri: '🐛', category: 'animal', name: 'いもむし' },
  { id: 'animal_29', uri: '🦋', category: 'animal', name: '蝶' },
  { id: 'animal_30', uri: '🐌', category: 'animal', name: 'かたつむり' },
];

/**
 * 植物の画像データ (20種類)
 */
const plantImages: ImageData[] = [
  { id: 'plant_01', uri: '🌸', category: 'plant', name: '桜' },
  { id: 'plant_02', uri: '🌺', category: 'plant', name: 'ハイビスカス' },
  { id: 'plant_03', uri: '🌻', category: 'plant', name: 'ひまわり' },
  { id: 'plant_04', uri: '🌷', category: 'plant', name: 'チューリップ' },
  { id: 'plant_05', uri: '🌹', category: 'plant', name: 'バラ' },
  { id: 'plant_06', uri: '🥀', category: 'plant', name: 'しおれた花' },
  { id: 'plant_07', uri: '🌼', category: 'plant', name: '花' },
  { id: 'plant_08', uri: '🌿', category: 'plant', name: '葉' },
  { id: 'plant_09', uri: '☘️', category: 'plant', name: 'クローバー' },
  { id: 'plant_10', uri: '🍀', category: 'plant', name: '四つ葉' },
  { id: 'plant_11', uri: '🌾', category: 'plant', name: '稲' },
  { id: 'plant_12', uri: '🌵', category: 'plant', name: 'サボテン' },
  { id: 'plant_13', uri: '🌴', category: 'plant', name: 'ヤシの木' },
  { id: 'plant_14', uri: '🌲', category: 'plant', name: '木' },
  { id: 'plant_15', uri: '🌳', category: 'plant', name: '木' },
  { id: 'plant_16', uri: '🎋', category: 'plant', name: '笹' },
  { id: 'plant_17', uri: '🎍', category: 'plant', name: '門松' },
  { id: 'plant_18', uri: '🍁', category: 'plant', name: 'もみじ' },
  { id: 'plant_19', uri: '🍂', category: 'plant', name: '落ち葉' },
  { id: 'plant_20', uri: '🍃', category: 'plant', name: '葉っぱ' },
];

/**
 * 全画像データ (100種類)
 */
export const ALL_IMAGES: ImageData[] = [...dailyImages, ...animalImages, ...plantImages];

/**
 * カテゴリ別画像データ
 */
export const IMAGES_BY_CATEGORY = {
  daily: dailyImages,
  animal: animalImages,
  plant: plantImages,
};

/**
 * IDから画像データを取得
 * @param id 画像ID
 * @returns 画像データ (見つからない場合はundefined)
 */
export const getImageById = (id: string): ImageData | undefined => {
  return ALL_IMAGES.find(img => img.id === id);
};

/**
 * ランダムに画像を取得
 * @param count 取得する枚数
 * @param excludeIds 除外する画像ID (オプション)
 * @returns ランダムな画像データの配列
 */
export const getRandomImages = (count: number, excludeIds: string[] = []): ImageData[] => {
  const availableImages = ALL_IMAGES.filter(img => !excludeIds.includes(img.id));
  const shuffled = [...availableImages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
