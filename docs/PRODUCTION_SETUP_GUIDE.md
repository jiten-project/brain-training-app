# 本番環境設定ガイド（AdMob・IAP）

このガイドでは、アプリをリリースする前に必要なAdMobとIAP（アプリ内課金）の本番設定手順を説明します。

---

## 📱 事前準備

### 必要なアカウント

1. ✅ **Google AdMob アカウント**
   - URL: https://admob.google.com/
   - 審査期間: 通常1〜2営業日

2. ✅ **Apple Developer Program** (iOSリリースの場合)
   - URL: https://developer.apple.com/
   - 年間費用: 12,980円（税込）
   - App Store Connectアカウントも必要

3. ✅ **Google Play Console** (Androidリリースの場合)
   - URL: https://play.google.com/console/
   - 登録費用: $25（一度のみ）

---

## 🎯 Part 1: Google AdMob 本番設定

### Step 1: AdMobでアプリを登録

1. AdMob (https://admob.google.com/) にログイン
2. 「アプリ」→「アプリを追加」をクリック
3. アプリ情報を入力：
   - アプリ名: `記憶力トレーニング`
   - プラットフォーム: iOS / Android（それぞれ別々に登録）
   - ストアのURL: （リリース後に入力可能）

### Step 2: 広告ユニットを作成

1. 作成したアプリを選択
2. 「広告ユニット」→「広告ユニットを追加」
3. **バナー広告**を選択
4. 広告ユニット名: `Home_Banner`（ホーム画面用）
5. 作成をクリック

**重要**: 広告ユニットIDをメモしておく（例: `ca-app-pub-XXXXXXXX/YYYYYYYYYY`）

### Step 3: App IDとAd Unit IDを取得

作成後、以下の情報を確認：

- **iOS App ID**: `ca-app-pub-XXXXXXXX~IIIIIIIIII`
- **Android App ID**: `ca-app-pub-XXXXXXXX~AAAAAAAAAA`
- **Ad Unit ID**: `ca-app-pub-XXXXXXXX/YYYYYYYYYY`

### Step 4: コードに本番IDを設定

#### 4-1. app.jsonを更新

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXX~AAAAAAAAAA",
          "iosAppId": "ca-app-pub-XXXXXXXX~IIIIIIIIII"
        }
      ]
    ]
  }
}
```

#### 4-2. AdSlot.tsxを更新

`brain-training-app/src/components/AdSlot.tsx.disabled` → `AdSlot.tsx` にリネーム

```typescript
// テストIDを本番IDに変更
const AD_UNIT_IDS = {
  ios: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY', // 本番iOS Ad Unit ID
  android: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY', // 本番Android Ad Unit ID
};
```

### Step 5: AdMobの設定を有効化

#### 5-1. App.tsxを更新

```typescript
import { AdMobProvider } from './src/components/AdMobProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AdMobProvider>
          <GameProvider>
            {/* ... */}
          </GameProvider>
        </AdMobProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

#### 5-2. 広告を表示する画面に追加

```typescript
import AdSlot from '../components/AdSlot';

// ホーム画面、結果画面などに追加
<AdSlot position="home" />
```

---

## 💰 Part 2: アプリ内課金（IAP）本番設定

### iOS App Store Connect

#### Step 1: App Store Connectでアプリを作成

1. App Store Connect (https://appstoreconnect.apple.com/) にログイン
2. 「マイApp」→「新規App」をクリック
3. アプリ情報を入力：
   - プラットフォーム: iOS
   - 名前: 記憶力トレーニング
   - プライマリ言語: 日本語
   - Bundle ID: `com.yourname.braintraining`
   - SKU: `brain-training-001`

#### Step 2: アプリ内課金商品を作成

1. 作成したアプリを選択
2. 「機能」タブ → 「アプリ内課金」
3. 「作成」ボタン→「消費型」を選択
4. 商品情報を入力：
   - **商品ID**: `remove_ads_pro`（コードと同じ）
   - 参照名: 広告削除（Pro版）
   - 価格: ¥370（税込）
   - レビュー用のスクリーンショット: 広告削除後の画面

5. ローカライズ情報（日本語）:
   - 表示名: `広告削除（Pro版）`
   - 説明: `すべての広告を削除して、快適にご利用いただけます。`

6. 保存して審査に提出

#### Step 3: サンドボックステスター作成

1. App Store Connect → 「ユーザーとアクセス」
2. 「サンドボックス」タブ
3. 「テスター」を追加
4. テスト用AppleIDを作成
5. 実機でサインインしてテスト

---

### Android Google Play Console

#### Step 1: Google Play Consoleでアプリを作成

1. Google Play Console (https://play.google.com/console/) にログイン
2. 「アプリを作成」をクリック
3. アプリ情報を入力：
   - アプリ名: 記憶力トレーニング
   - デフォルトの言語: 日本語
   - アプリまたはゲーム: ゲーム
   - 無料または有料: 無料

#### Step 2: アプリ内商品を作成

1. 「収益化」→「アプリ内商品」→「商品を作成」
2. 商品情報を入力：
   - **商品ID**: `remove_ads_pro`（iOSと同じ）
   - 名前: 広告削除（Pro版）
   - 説明: すべての広告を削除して、快適にご利用いただけます。
   - 価格: ¥370
   - ステータス: 有効

3. 保存

#### Step 3: ライセンステスト

1. 「設定」→「ライセンステスト」
2. テスト用のGoogleアカウントを追加
3. 内部テストトラックにアップロードしてテスト

---

### Part 3: IAPコードの有効化

#### Step 1: EntitlementsContext.tsxを有効化

`brain-training-app/src/contexts/EntitlementsContext.tsx.disabled` → `EntitlementsContext.tsx` にリネーム

#### Step 2: App.tsxを更新

```typescript
import { EntitlementsProvider } from './src/contexts/EntitlementsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AdMobProvider>
          <GameProvider>
            <EntitlementsProvider>
              {/* ... */}
            </EntitlementsProvider>
          </GameProvider>
        </AdMobProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

#### Step 3: SettingsScreenを更新

設定画面に課金UIを追加（既に実装済みの場合はスキップ）

```typescript
import { useEntitlements } from '../contexts/EntitlementsContext';

const { isPro, requestPurchase, restorePurchases } = useEntitlements();
```

---

## 🚀 Part 4: ビルドとテスト

### Step 1: 依存関係のインストール

```bash
cd brain-training-app
npm install react-native-google-mobile-ads react-native-iap
```

### Step 2: ネイティブビルド

```bash
npx expo prebuild --clean
```

### Step 3: iOS実機ビルド

```bash
npx expo run:ios --device
```

### Step 4: Android実機ビルド

```bash
npx expo run:android --device
```

### Step 5: テスト項目

- [ ] 広告が表示されるか
- [ ] 広告が高齢者向け（G指定）か
- [ ] 課金画面が表示されるか
- [ ] サンドボックス/テストで購入できるか
- [ ] 購入後に広告が消えるか
- [ ] 購入復元が機能するか

---

## ⚠️ 重要な注意事項

### AdMobについて

1. **審査に時間がかかる場合がある**
   - アプリ登録後、AdMobの審査に数日かかる場合があります
   - 審査中も広告は表示されますが、収益は発生しません

2. **テストIDと本番IDを混在させない**
   - 開発中はテストID
   - リリース時は本番ID
   - 絶対に本番アプリにテストIDを使用しない

3. **ポリシー違反に注意**
   - 高齢者向けなので、MaxAdContentRating.G を維持
   - 不適切な広告が表示される場合はブロック

### IAPについて

1. **商品IDは変更できない**
   - 一度作成した商品IDは削除・変更不可
   - 慎重に命名する

2. **価格設定**
   - iOS: ¥370
   - Android: ¥370
   - 税込み価格で統一

3. **購入復元機能は必須**
   - iOSの審査で必須要件
   - 実装済み（EntitlementsContextで対応）

---

## 📋 チェックリスト

リリース前に以下を確認：

### AdMob
- [ ] AdMobアカウント作成済み
- [ ] iOSアプリ登録済み
- [ ] Androidアプリ登録済み
- [ ] バナー広告ユニット作成済み
- [ ] App IDをapp.jsonに設定
- [ ] Ad Unit IDをAdSlot.tsxに設定
- [ ] AdMobProvider有効化
- [ ] 実機で広告表示確認

### IAP
- [ ] App Store Connect でアプリ作成済み
- [ ] Google Play Console でアプリ作成済み
- [ ] iOS商品ID `remove_ads_pro` 作成済み
- [ ] Android商品ID `remove_ads_pro` 作成済み
- [ ] 価格¥370に設定
- [ ] EntitlementsProvider有効化
- [ ] サンドボックステストで購入確認
- [ ] 購入後に広告が消えることを確認
- [ ] 購入復元機能の動作確認

---

## 🆘 トラブルシューティング

### 広告が表示されない

1. App IDが正しいか確認
2. AdMobの審査が完了しているか確認
3. ネットワーク接続を確認
4. エラーログを確認（`console.log`）

### 購入できない

1. 商品IDが正しいか確認（`remove_ads_pro`）
2. サンドボックス/テストアカウントでサインインしているか
3. 商品が「有効」ステータスになっているか
4. ネイティブビルドしているか（Expo Goでは動作しない）

---

## 📞 サポート

- **AdMob ヘルプ**: https://support.google.com/admob/
- **App Store Connect ヘルプ**: https://developer.apple.com/support/app-store-connect/
- **Google Play Console ヘルプ**: https://support.google.com/googleplay/android-developer/

---

**最終更新**: 2025年12月28日
