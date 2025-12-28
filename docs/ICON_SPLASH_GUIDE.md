# アプリアイコン・スプラッシュ画面作成ガイド

## アプリアイコンのデザイン案

### デザインコンセプト
- **シンプルで分かりやすい**: 高齢者にも認識しやすいデザイン
- **記憶力を連想させる**: 脳、パズル、電球などのモチーフ
- **明るく親しみやすい色**: 紫をメインカラーに

### 推奨デザイン案

#### 案1: 脳とパズルピース
```
背景: グラデーション（#6200EE → #9C27B0）
中央: 白い脳のシルエット
脳の一部: 明るい黄色のパズルピース（記憶のシンボル）
```

#### 案2: 電球（ひらめき）
```
背景: 紫色（#6200EE）
中央: 大きな黄色い電球（#FFC107）
電球の周り: キラキラエフェクト
```

#### 案3: 絵文字とグリッド
```
背景: 白またはライトグレー
中央: 2x2のグリッド
各グリッド: カラフルな絵文字（🌸🐶🍎🌈）
```

---

## 必要な画像サイズ

### iOS (App Store)
- **1024x1024px** - App Store用アイコン（必須）
- その他のサイズは自動生成

### Android (Google Play)
- **512x512px** - Google Play用アイコン（必須）
- その他のサイズは自動生成

---

## アイコン作成手順

### 方法1: Canva（無料・簡単）

1. Canva (https://www.canva.com) にアクセス
2. 「カスタムサイズ」で 1024x1024px を作成
3. テンプレートから「アプリアイコン」を検索
4. 上記のデザイン案を参考にカスタマイズ
5. PNG形式でダウンロード

### 方法2: Figma（無料・プロフェッショナル）

1. Figma (https://www.figma.com) でアカウント作成
2. 1024x1024px のフレームを作成
3. デザイン作成
4. Export → PNG → 1x でエクスポート

### 方法3: デザイナーに依頼

- Fiverr: https://www.fiverr.com
- Coconala: https://coconala.com
- 予算: 3,000円〜10,000円程度

---

## スプラッシュ画面のデザイン案

### デザインコンセプト
- **シンプル**: アプリアイコンとアプリ名のみ
- **ブランドカラー**: 紫（#6200EE）を基調
- **読み込み感**: 控えめなアニメーション

### 推奨デザイン

```
背景: 紫のグラデーション（#6200EE → #9C27B0）

中央（垂直方向）:
  - アプリアイコン（180x180px）
  - 下に20pxのスペース
  - アプリ名「記憶力トレーニング」（白、太字、24pt）
  - 下に10pxのスペース
  - サブタイトル「脳トレゲーム」（白、16pt、透明度80%）

下部:
  - 「Loading...」または読み込みスピナー（オプション）
```

---

## Expoでの設定方法

### 1. app.json の編集

```json
{
  "expo": {
    "name": "記憶力トレーニング",
    "slug": "brain-training-app",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6200EE"
    },
    "ios": {
      "icon": "./assets/icon.png",
      "bundleIdentifier": "com.yourname.braintraining"
    },
    "android": {
      "icon": "./assets/icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6200EE"
      },
      "package": "com.yourname.braintraining"
    }
  }
}
```

### 2. 必要な画像ファイル

以下のファイルを `brain-training-app/assets/` に配置：

- **icon.png**: 1024x1024px（iOS/Android共通）
- **splash.png**: 2732x2732px（スプラッシュ画面）
- **adaptive-icon.png**: 1024x1024px（Android用、透過PNG）

### 3. アイコン自動生成

画像を配置したら、以下のコマンドで各サイズを自動生成：

```bash
npx expo prebuild --clean
```

---

## 画像作成の注意点

### アイコン
- ✅ 正方形（1:1）
- ✅ 角丸不要（自動で適用されます）
- ✅ 透過背景不可（iOSでは不可、Androidはadaptive-iconで対応）
- ✅ テキストは大きく読みやすく
- ✅ 細かいディテールは避ける（小さく表示されても認識可能に）

### スプラッシュ画面
- ✅ 正方形（2732x2732px）推奨
- ✅ 重要な要素は中央に配置（セーフエリア考慮）
- ✅ アニメーション不要（静止画のみ）
- ✅ 表示時間: 1〜3秒程度

---

## カラーパレット（参考）

```
メインカラー: #6200EE（紫）
セカンダリ: #03DAC6（青緑）
アクセント: #FF9800（オレンジ）- ヒント機能用
背景: #FFFFFF（白）
テキスト: #000000（黒）
```

---

## 完成後のチェックリスト

- [ ] アイコンは1024x1024pxのPNG形式
- [ ] スプラッシュ画面は2732x2732pxのPNG形式
- [ ] 透過背景でないことを確認（アイコン）
- [ ] 小さいサイズ（60x60px）でも認識できるか確認
- [ ] 白背景、黒背景の両方で見やすいか確認
- [ ] app.jsonに正しいパスを設定
- [ ] `npx expo prebuild` で自動生成を実行

---

## 参考リンク

- [Apple Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android - Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [Expo - App Icons](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo - Splash Screens](https://docs.expo.dev/develop/user-interface/splash-screen/)

---

## 簡易テンプレート（Canva用）

Canvaで「アプリアイコン」と検索して以下のような要素を組み合わせてください：

1. 背景：紫のグラデーション
2. 図形：円または角丸四角
3. アイコン：脳、電球、パズル、絵文字など
4. テキスト：なし、またはアプリ名の頭文字「記」

シンプルが一番！高齢者にも分かりやすいデザインを心がけましょう。
