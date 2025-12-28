# アプリ内課金（IAP）実装ガイド

## 概要

このドキュメントでは、脳トレアプリに実装した「広告削除（買い切り）」機能の詳細と、iOS/Androidでのテスト手順を説明します。

---

## 実装内容

### 商品情報
- **商品ID**: `remove_ads_pro` (iOS/Android共通)
- **商品タイプ**: 非消耗型（Non-consumable）
- **表示名**: 「広告を削除（買い切り）」
- **説明**: 「一度購入すると、ずっと広告が表示されなくなります」

### 主な機能
1. ✅ 購入処理（確認ダイアログ付き）
2. ✅ 購入復元（機種変更時など）
3. ✅ 購入済み表示
4. ✅ エラーハンドリング（キャンセル/ネット接続/その他）
5. ✅ ローカル永続化（AsyncStorage）
6. ✅ 広告表示制御の土台（AdSlotコンポーネント）

---

## セットアップ手順

### 1. 依存関係のインストール

```bash
cd brain-training-app
npm install
```

### 2. Dev Clientのビルド（Expo Goでは動作しません）

`react-native-iap`はネイティブコードを含むため、Expo Goでは動作しません。
**Dev Clientをビルドする必要があります。**

#### ローカルビルド（推奨・無料）

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

#### EAS Build（クラウドビルド）

```bash
# EAS CLIインストール（初回のみ）
npm install -g eas-cli

# Expoアカウントでログイン
eas login

# プロジェクト初期化
eas build:configure

# Dev Clientビルド
eas build --profile development --platform ios
eas build --profile development --platform android
```

---

## ストア設定

### iOS（App Store Connect）

#### 1. Apple Developer登録
- **必須**: 有料アカウント ($99/年)
- https://developer.apple.com

#### 2. App Store Connectで商品登録

1. App Store Connectにログイン
2. 「マイApp」→ アプリを選択（なければ作成）
3. 「機能」タブ → 「App内課金」
4. 「+」ボタン → 「非消耗型」を選択
5. 以下を入力:
   - **商品ID**: `remove_ads_pro`
   - **参照名**: 広告削除（管理用）
   - **価格**: 適切な価格帯を選択（例: ¥250）
   - **ローカライズ情報**:
     - 表示名: 広告を削除
     - 説明: 一度購入すると、ずっと広告が表示されなくなります
6. 「保存」

#### 3. Sandbox テスターアカウント作成

1. App Store Connect → 「ユーザーとアクセス」
2. 「Sandboxテスター」タブ
3. 「+」ボタン
4. テスト用メールアドレスとパスワードを設定
5. **重要**: 実際のApple IDと同じメールアドレスは使わない

#### 4. デバイスでテスト

```bash
# 1. Dev Clientをビルド・インストール
npx expo run:ios

# 2. デバイスで設定を変更
# 設定 → App Store → Sandboxアカウント → ログアウト
# （本番のApple IDでサインインしている場合）

# 3. アプリ起動
# 設定画面で「広告を削除」ボタンを押す
# → Sandboxアカウントでログイン要求が出る
# → 作成したSandboxテスターアカウントでログイン

# 4. 購入テスト
# 「購入する」をタップ
# → 確認ダイアログで「購入」
# → [Sandbox] マークが表示されるはず
```

---

### Android（Google Play Console）

#### 1. Google Play Developer登録
- **必須**: 有料アカウント ($25 一回のみ)
- https://play.google.com/console

#### 2. Google Play Consoleで商品登録

1. Play Consoleにログイン
2. アプリを選択（なければ作成）
3. 「収益化」→「アプリ内商品」→「商品を作成」
4. 以下を入力:
   - **商品ID**: `remove_ads_pro`
   - **名前**: 広告を削除
   - **説明**: 一度購入すると、ずっと広告が表示されなくなります
   - **価格**: 適切な価格を設定（例: ¥250）
5. 「有効化」

#### 3. ライセンステスター設定

1. Play Console → 「設定」→「ライセンステスト」
2. 「ライセンステスターを追加」
3. テスト用Googleアカウントのメールアドレスを入力
4. 「保存」

#### 4. アプリをアップロード（内部テストトラック）

```bash
# 1. AAB（App Bundle）をビルド
eas build --platform android --profile preview

# 2. Play Consoleで内部テストトラックを作成
# 「テスト」→「内部テスト」→「新しいリリースを作成」

# 3. ビルドしたAABをアップロード
# 4. テスターに自分のGoogleアカウントを追加
# 5. 「リリースをロールアウト」
```

#### 5. デバイスでテスト

```bash
# 1. テスターとして登録したGoogleアカウントでログイン
# 2. 内部テストトラックのURLからアプリをインストール
# 3. アプリ起動
# 4. 設定画面で「広告を削除」ボタンを押す
# 5. 購入テスト
```

---

## テストシナリオ

### 基本フロー

1. **初回起動**
   - ✅ 設定画面に「広告削除（買い切り）」セクションが表示
   - ✅ 「広告を削除」ボタンが有効
   - ✅ 結果画面に広告スロットのプレースホルダーが表示

2. **購入フロー**
   - ✅ 「広告を削除」ボタンをタップ
   - ✅ 確認ダイアログが表示（価格が表示される）
   - ✅ 「購入する」をタップ
   - ✅ ストアの購入ダイアログが表示
   - ✅ 購入完了後「購入完了」アラートが表示
   - ✅ 設定画面に「✓ 購入済み」が表示
   - ✅ 結果画面の広告スロットが非表示

3. **アプリ再起動**
   - ✅ 購入状態が維持される（AsyncStorageから復元）
   - ✅ 広告スロットが非表示のまま

4. **購入復元**
   - ✅ アプリをアンインストール→再インストール
   - ✅ 「購入を復元」ボタンをタップ
   - ✅ 購入状態が復元される
   - ✅ 「復元完了」アラートが表示

### エラーケース

1. **キャンセル**
   - ✅ 購入ダイアログで「キャンセル」
   - ✅ エラーメッセージが表示されない
   - ✅ 購入状態が変わらない

2. **ネット接続エラー**
   - ✅ 機内モードにする
   - ✅ 「購入する」or「購入を復元」をタップ
   - ✅ 「インターネット接続を確認してください」と表示

3. **既に購入済み**
   - ✅ 同じアカウントで2回目の購入を試みる
   - ✅ ストアが「既に購入済み」エラーを返す
   - ✅ アプリ内で購入状態が有効になる

---

## よくある詰まりポイントと解決策

### 1. 「商品が見つからない」エラー

**原因**:
- App Store Connect / Play Console で商品が有効化されていない
- 商品IDが一致していない
- iOSの場合、有料契約（Paid Applications Agreement）が未完了

**解決策**:
```bash
# 1. 商品IDを確認
grep "PRODUCT_ID" src/contexts/EntitlementsContext.tsx
# → "remove_ads_pro" であることを確認

# 2. App Store Connect / Play Consoleで商品の状態を確認
# → 「準備完了」or「有効」になっているか

# 3. iOS: 有料契約を確認
# App Store Connect → 契約、税金、銀行情報
```

### 2. Sandboxアカウントでログインできない（iOS）

**原因**:
- 実際のApple IDでサインインしたままになっている
- Sandboxアカウントが正しく作成されていない

**解決策**:
```bash
# 1. デバイスの設定を確認
# 設定 → App Store → Apple ID → サインアウト
# ※本番のApple IDは完全にサインアウトしない

# 2. アプリ内で購入を試みる
# → Sandboxアカウントでログイン要求が出る

# 3. Sandboxアカウントでログイン
```

### 3. 「ビルドがクラッシュする」

**原因**:
- Expo Goで実行しようとしている
- `react-native-iap`はネイティブコードを含むため、Dev Clientが必要

**解決策**:
```bash
# Dev Clientをビルド
npx expo run:ios
# または
npx expo run:android
```

### 4. 「価格が表示されない」

**原因**:
- ストアとの接続に失敗している
- 商品情報の取得に失敗している

**解決策**:
```bash
# 1. コンソールログを確認
# → "Available products:" が表示されているか

# 2. ストアの商品IDを確認
# iOS: App Store Connect
# Android: Play Console

# 3. ネット接続を確認
```

### 5. 審査時の注意点

#### iOS審査
- ✅ App Store Reviewガイドラインに準拠
- ✅ 購入復元ボタンが必須（実装済み）
- ✅ 価格を明示すること（実装済み）
- ✅ テスト用アカウント情報を提供（必要に応じて）

#### Android審査
- ✅ Google Playポリシーに準拠
- ✅ 広告の実装がない場合、審査時に指摘される可能性
  - 「現在広告SDK未導入」と説明する必要あり
  - または最初から広告SDKを入れておく

---

## コード構成

### 主要ファイル

```
src/
├── contexts/
│   └── EntitlementsContext.tsx  # 課金状態管理
├── components/
│   └── AdSlot.tsx                # 広告表示コンポーネント
└── screens/
    ├── SettingsScreen.tsx        # 購入UI
    └── ResultScreen.tsx          # 広告スロット配置

App.tsx                            # EntitlementsProvider追加
package.json                       # react-native-iap追加
app.json                           # bundleIdentifier/package追加
```

### EntitlementsContext API

```typescript
const {
  isPro,                // boolean - Pro版か
  loading,              // boolean - 初期化中か
  products,             // Product[] - 利用可能な商品
  purchaseRemoveAds,    // () => Promise<void> - 購入処理
  restorePurchases,     // () => Promise<void> - 購入復元
  lastError,            // string | undefined - エラーメッセージ
} = useEntitlements();
```

---

## 将来の拡張

### 広告SDKの導入

`AdSlot`コンポーネントを修正して広告SDKを組み込む:

```tsx
// src/components/AdSlot.tsx
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const AdSlot: React.FC<Props> = ({ position = 'bottom' }) => {
  const { isPro, loading } = useEntitlements();

  if (isPro || loading) {
    return null;
  }

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxx/yyyyy'}
        size={BannerAdSize.BANNER}
      />
    </View>
  );
};
```

### 複数商品の追加

```typescript
// src/contexts/EntitlementsContext.tsx
export const PRODUCT_ID_REMOVE_ADS = 'remove_ads_pro';
export const PRODUCT_ID_PREMIUM = 'premium_features';

// 商品IDリストを拡張
const productIds = [
  PRODUCT_ID_REMOVE_ADS,
  PRODUCT_ID_PREMIUM,
];
```

---

## トラブルシューティング

### ログの確認方法

```bash
# iOS
npx expo run:ios
# → Xcode Console でログを確認

# Android
npx expo run:android
# → Android Studio Logcat でログを確認

# または
npx react-native log-ios
npx react-native log-android
```

### デバッグ用のログ出力

```typescript
// src/contexts/EntitlementsContext.tsx
console.log('IAP connection initialized');
console.log('Available products:', availableProducts);
console.log('Purchase updated:', purchase);
console.log('Purchase error:', error);
```

---

## まとめ

これで以下の機能が実装されました:

✅ **アプリ内課金の基本機能**
- 非消耗型商品（広告削除）の購入
- 購入復元
- エラーハンドリング

✅ **高齢者向けUI**
- 大きなボタン
- わかりやすい確認ダイアログ
- 明確なエラーメッセージ

✅ **将来の拡張性**
- AdSlotコンポーネントで広告SDK導入が容易
- 複数商品への拡張が可能

次のステップ:
1. ストアに商品を登録
2. Dev Clientでテスト
3. 広告SDKを導入（必要に応じて）
4. App Store / Play Storeにリリース
