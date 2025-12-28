# セットアップ手順（クイックスタート）

## 1. 依存関係のインストール

```bash
cd brain-training-app
npm install
```

これで以下のライブラリがインストールされます:
- `react-native-iap` - アプリ内課金
- `react-native-google-mobile-ads` - Google AdMob広告

## 2. bundleIdentifier/package名の変更（重要）

`app.json`を開いて、以下を自社の識別子に変更してください:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.braintrainingapp"  // ← ここを変更
    },
    "android": {
      "package": "com.yourcompany.braintrainingapp"  // ← ここを変更
    }
  }
}
```

**例**:
- `com.examplecorp.braintraining`
- `jp.mycompany.brain`

## 3. Dev Clientのビルド

**重要**: Expo Goでは動作しません！Dev Clientが必要です。

### ローカルビルド（推奨・無料）

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### EAS Build（クラウドビルド）

```bash
# EAS CLIインストール
npm install -g eas-cli

# ログイン
eas login

# 初期化
eas build:configure

# Dev Clientビルド
eas build --profile development --platform ios
eas build --profile development --platform android
```

## 4. ストアで商品を登録

### iOS（App Store Connect）
1. https://appstoreconnect.apple.com にログイン
2. アプリを作成（まだの場合）
3. 「機能」→「App内課金」→「+」
4. 非消耗型を選択
5. 商品ID: `remove_ads_pro`
6. 価格を設定（例: ¥250）
7. 保存 → 有効化

### Android（Google Play Console）
1. https://play.google.com/console にログイン
2. アプリを作成（まだの場合）
3. 「収益化」→「アプリ内商品」→「商品を作成」
4. 商品ID: `remove_ads_pro`
5. 価格を設定（例: ¥250）
6. 有効化

## 5. テスト

### iOS Sandboxテスト
1. App Store Connect → 「ユーザーとアクセス」→「Sandboxテスター」
2. テストアカウントを作成
3. デバイスで「設定」→「App Store」→サインアウト
4. アプリを起動 → 購入を試みる → Sandboxアカウントでログイン

### Android内部テスト
1. Play Console → 「テスト」→「内部テスト」
2. AABをアップロード（`eas build --platform android`）
3. テスターに自分のGoogleアカウントを追加
4. デバイスでテストトラックからインストール
5. 購入を試みる

## 6. AdMob設定（広告を表示する場合）

広告を表示する場合は、AdMobアカウントを作成して設定が必要です。

### 簡易手順
1. https://admob.google.com でアカウント作成
2. iOS/Androidアプリを登録
3. バナー広告ユニットを作成
4. `app.json` のAdMobアプリIDを更新
5. `src/components/AdSlot.tsx` の広告ユニットIDを更新

**詳細は [ADMOB_SETUP_GUIDE.md](ADMOB_SETUP_GUIDE.md) を参照**

### テスト広告
開発中は自動的にGoogleのテスト広告が表示されます。
実際の広告IDを設定するのは本番リリース前でOKです。

## 7. 動作確認

### 広告機能
✅ HomeScreen上部にバナー広告が表示される（開発中はテスト広告）
✅ ResultScreen上下にバナー広告が表示される（開発中はテスト広告）
✅ 購入前は広告が表示される
✅ 購入後は広告が非表示になる

### 課金機能
✅ 設定画面に「広告削除（買い切り）」セクションが表示される
✅ 「広告を削除」ボタンが有効
✅ 購入ダイアログで価格が表示される
✅ 購入完了後「✓ 購入済み」が表示される
✅ 購入後、全画面で広告が非表示
✅ アプリ再起動後も購入状態が維持される
✅ 「購入を復元」で復元できる

## トラブルシューティング

### エラー: "Cannot find module 'react-native-iap'"
```bash
npm install
```

### エラー: "商品が見つからない"
- App Store Connect / Play Consoleで商品が有効化されているか確認
- 商品ID が `remove_ads_pro` になっているか確認

### Expo Goで動かない
- Dev Clientをビルドしてください（`npx expo run:ios`）

### 購入テストができない
- iOS: Sandboxテスターアカウントを作成
- Android: 内部テストトラックにアップロード

---

詳細は `IAP_IMPLEMENTATION_GUIDE.md` を参照してください。


### 広告が表示されない
- 開発中はテスト広告が自動表示されます
- 本番用の広告IDはAdMobアカウント作成後に設定
- 詳細は `ADMOB_SETUP_GUIDE.md` を参照

---

**詳細ドキュメント:**
- [IAP_IMPLEMENTATION_GUIDE.md](IAP_IMPLEMENTATION_GUIDE.md) - アプリ内課金の詳細
- [ADMOB_SETUP_GUIDE.md](ADMOB_SETUP_GUIDE.md) - AdMob広告の設定

