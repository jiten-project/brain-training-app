# Google AdMob セットアップガイド

## 概要

このアプリでは Google AdMob を使用してバナー広告を表示します。
Pro版（広告削除を購入したユーザー）には広告が表示されません。

---

## 実装内容

### 広告配置
- **HomeScreen（上部）**: レベル選択画面のトップ
- **ResultScreen（上部・下部）**: 結果画面の上下

### 広告設定
- **広告タイプ**: バナー広告（320x50）
- **広告評価**: G（全年齢対象） - 高齢者向けアプリに適した設定
- **テストモード**: 開発中は自動的にテスト広告を表示

---

## AdMob アカウント設定

### 1. AdMob アカウント作成

1. https://admob.google.com にアクセス
2. Googleアカウントでログイン
3. 「使ってみる」をクリック
4. 利用規約に同意
5. アカウント情報を入力

### 2. アプリを登録

#### iOS アプリ

1. AdMob ダッシュボード → 「アプリ」→「アプリを追加」
2. 「iOS」を選択
3. アプリ情報を入力:
   - アプリ名: 記憶力トレーニング（または任意）
   - App Store URL: （まだストア公開前なら空欄でOK）
4. 「アプリを追加」をクリック
5. **アプリIDをメモ**: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`

#### Android アプリ

1. AdMob ダッシュボード → 「アプリ」→「アプリを追加」
2. 「Android」を選択
3. アプリ情報を入力:
   - アプリ名: 記憶力トレーニング（または任意）
   - Play Store URL: （まだストア公開前なら空欄でOK）
4. 「アプリを追加」をクリック
5. **アプリIDをメモ**: `ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ`

### 3. 広告ユニットを作成

#### iOS バナー広告

1. 登録したiOSアプリを選択
2. 「広告ユニット」→「広告ユニットを追加」
3. 「バナー」を選択
4. 広告ユニット名を入力: 「ホーム画面バナー」
5. 「広告ユニットを作成」をクリック
6. **広告ユニットIDをメモ**: `ca-app-pub-XXXXXXXXXXXXXXXX/1111111111`

#### Android バナー広告

1. 登録したAndroidアプリを選択
2. 「広告ユニット」→「広告ユニットを追加」
3. 「バナー」を選択
4. 広告ユニット名を入力: 「ホーム画面バナー」
5. 「広告ユニットを作成」をクリック
6. **広告ユニットIDをメモ**: `ca-app-pub-XXXXXXXXXXXXXXXX/2222222222`

---

## コード設定

### 1. app.json の設定

`app.json` を開いて、AdMobアプリIDを置き換えます:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
      }
    }
  }
}
```

**現在の設定（テスト用）**:
- iOS: `ca-app-pub-3940256099942544~1458002511` （Googleのテストアプリ ID）
- Android: `ca-app-pub-3940256099942544~3347511713` （Googleのテストアプリ ID）

**本番用に置き換える**:
- 上記の手順2で取得した実際のアプリIDに置き換えてください

### 2. AdSlot.tsx の設定

`src/components/AdSlot.tsx` を開いて、広告ユニットIDを置き換えます:

```typescript
const AD_UNIT_IDS = {
  ios: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/1111111111',
  },
  android: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/2222222222',
  },
};
```

**現在の設定**:
- 開発中（`__DEV__ = true`）: Googleのテスト広告IDを使用
- 本番（`__DEV__ = false`）: プレースホルダー `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`

**本番用に置き換える**:
- 上記の手順3で取得した実際の広告ユニットIDに置き換えてください

---

## テスト方法

### 開発中のテスト

開発中（`npm run ios` / `npm run android`）は自動的にGoogleのテスト広告が表示されます。

```bash
# Dev Clientをビルド・起動
npx expo run:ios
# または
npx expo run:android

# アプリを起動
# → HomeScreenとResultScreenにテスト広告が表示される
```

### テスト広告の特徴
- 「Test Ad」と表示される
- クリックしても収益は発生しない
- 本番と同じ動作を確認できる

### Pro版のテスト

1. 設定画面で「広告を削除」を購入（テスト課金）
2. HomeScreenとResultScreenで広告が非表示になることを確認
3. アプリを再起動しても広告が非表示のまま
4. 「購入を復元」をテスト

---

## 本番リリース

### 1. 広告ユニットIDを更新

`src/components/AdSlot.tsx` のプレースホルダーを実際のIDに置き換え:

```typescript
const AD_UNIT_IDS = {
  ios: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1234567890123456/1111111111', // ← 実際のID
  },
  android: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1234567890123456/2222222222', // ← 実際のID
  },
};
```

### 2. app.jsonを更新

AdMobアプリIDを実際のIDに置き換え。

### 3. ビルド

```bash
# 本番ビルド
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 4. ストア審査

#### iOS App Store
- AdMobの実装について特に記載は不要
- 広告が適切に表示されることを確認

#### Google Play Store
- 広告の実装について開示する必要がある場合あり
- Play Console → 「ストアの設定」→「アプリのコンテンツ」→「広告」
- 「はい、広告を含んでいます」を選択

---

## 広告収益の確認

### AdMobダッシュボード

1. https://admob.google.com にログイン
2. ダッシュボードで以下を確認:
   - インプレッション数（広告が表示された回数）
   - クリック数
   - 推定収益
   - eCPM（1000インプレッションあたりの収益）

### 支払い設定

1. AdMob → 「お支払い」
2. 銀行口座情報を登録
3. 税務情報を登録（日本の場合、マイナンバーが必要）
4. 最低支払額（$100）に達すると自動的に振り込まれる

---

## トラブルシューティング

### 広告が表示されない

**原因1**: AdMobアプリIDが正しくない
- `app.json` のアプリIDを確認
- AdMobダッシュボードでアプリIDをコピー

**原因2**: 広告ユニットIDが正しくない
- `AdSlot.tsx` の広告ユニットIDを確認
- AdMobダッシュボードで広告ユニットIDをコピー

**原因3**: 新規アプリの審査待ち
- AdMobは新規アプリの広告配信に数時間〜数日かかる場合がある
- テスト広告は即座に表示される

**原因4**: インターネット接続
- デバイスがインターネットに接続されているか確認

### 「Invalid Ad Unit ID」エラー

- 広告ユニットIDが正しいか確認
- 開発中は `TestIds.BANNER` が使用されているか確認

### Pro版で広告が表示される

- EntitlementsContextの `isPro` が正しく動作しているか確認
- 購入状態がAsyncStorageに保存されているか確認

```bash
# デバッグログを確認
npx react-native log-ios
# または
npx react-native log-android
```

---

## ポリシー遵守

### AdMobポリシー

1. **無効なトラフィック禁止**
   - 自分で広告をクリックしない
   - 他人に広告のクリックを促さない

2. **誤クリック防止**
   - 広告とコンテンツの間に十分なスペースを確保（実装済み）
   - 広告の近くに誘導的なボタンを配置しない

3. **適切な広告配置**
   - アプリの利用を妨げない位置に配置（実装済み）
   - 画面に収まる広告サイズを使用（実装済み）

違反するとアカウント停止の可能性があるため注意してください。

---

## まとめ

### 実装済み
- ✅ AdMob SDK統合
- ✅ バナー広告配置（Home、Result画面）
- ✅ Pro版での広告非表示
- ✅ テスト広告の動作確認
- ✅ 高齢者向け適切な広告設定（G評価）

### 次のステップ
1. AdMobアカウント作成
2. アプリ登録（iOS/Android）
3. 広告ユニット作成
4. app.jsonとAdSlot.tsxにIDを設定
5. テスト
6. 本番リリース

詳細はこのドキュメントを参照してください。
