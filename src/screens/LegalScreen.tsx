import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { UI_CONFIG } from '../utils/constants';

type LegalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Legal'>;
type LegalScreenRouteProp = RouteProp<RootStackParamList, 'Legal'>;

interface Props {
  navigation: LegalScreenNavigationProp;
  route: LegalScreenRouteProp;
}

const LegalScreen: React.FC<Props> = ({ navigation, route }) => {
  const { type } = route.params;
  const isTerms = type === 'terms';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            {isTerms ? (
              <>
                {/* 利用規約 */}
                <Text style={styles.title}>利用規約</Text>
                <Text style={styles.date}>最終更新日: 2025年12月28日</Text>

                <Text style={styles.sectionTitle}>第1条（適用）</Text>
                <Text style={styles.body}>
                  本利用規約（以下「本規約」）は、記憶力トレーニングアプリ（以下「本アプリ」）の利用に関する条件を、本アプリを利用するすべてのユーザー（以下「ユーザー」）と本アプリの提供者（以下「当方」）との間で定めるものです。
                </Text>

                <Text style={styles.sectionTitle}>第2条（利用許諾）</Text>
                <Text style={styles.body}>
                  当方は、本規約に従うことを条件に、ユーザーに対し、本アプリを個人的かつ非商業的な目的で使用することを許諾します。
                </Text>

                <Text style={styles.sectionTitle}>第3条（アプリ内課金）</Text>
                <Text style={styles.body}>
                  本アプリは、広告を削除するためのアプリ内課金機能（370円）を提供しています。購入後の返金は、Apple Inc.またはGoogle LLCのポリシーに従います。
                </Text>

                <Text style={styles.sectionTitle}>第4条（広告表示）</Text>
                <Text style={styles.body}>
                  本アプリは、Google AdMobを使用して広告を表示します。広告の内容や表示方法は、予告なく変更される場合があります。
                </Text>

                <Text style={styles.sectionTitle}>第5条（知的財産権）</Text>
                <Text style={styles.body}>
                  本アプリおよびそのコンテンツに関する一切の知的財産権は、当方または正当な権利者に帰属します。
                </Text>

                <Text style={styles.sectionTitle}>第6条（禁止事項）</Text>
                <Text style={styles.body}>
                  ユーザーは、以下の行為を行ってはなりません：{'\n'}
                  1. 本アプリを不正に改変、リバースエンジニアリング、逆コンパイルする行為{'\n'}
                  2. 本アプリを商業目的で使用する行為{'\n'}
                  3. その他、法令に違反する行為
                </Text>

                <Text style={styles.sectionTitle}>第7条（プライバシー）</Text>
                <Text style={styles.body}>
                  ユーザーの個人情報の取り扱いについては、別途定めるプライバシーポリシーに従うものとします。
                </Text>

                <Text style={styles.sectionTitle}>第8条（免責事項）</Text>
                <Text style={styles.body}>
                  当方は、本アプリの利用により生じたいかなる損害についても、一切の責任を負いません。本アプリは「現状のまま」提供され、明示または黙示を問わず、いかなる保証も行いません。
                </Text>

                <Text style={styles.sectionTitle}>第9条（規約の変更）</Text>
                <Text style={styles.body}>
                  当方は、必要に応じて本規約を変更することができます。変更後の規約は、本アプリ内またはウェブサイト上で公表した時点で効力を生じます。
                </Text>

                <Text style={styles.sectionTitle}>第10条（準拠法および管轄裁判所）</Text>
                <Text style={styles.body}>
                  本規約は日本法に準拠し、本規約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                </Text>

                <Text style={styles.contact}>
                  お問い合わせ: jiten0410@me.com{'\n'}
                  制作: jiten-project{'\n'}
                  バージョン: 1.0.0
                </Text>
              </>
            ) : (
              <>
                {/* プライバシーポリシー */}
                <Text style={styles.title}>プライバシーポリシー</Text>
                <Text style={styles.date}>最終更新日: 2025年12月28日</Text>

                <Text style={styles.sectionTitle}>はじめに</Text>
                <Text style={styles.body}>
                  記憶力トレーニングアプリ（以下「本アプリ」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーでは、本アプリがどのような情報を収集し、どのように使用するかを説明します。
                </Text>

                <Text style={styles.sectionTitle}>収集する情報</Text>
                <Text style={styles.subsectionTitle}>自動的に収集される情報</Text>
                <Text style={styles.body}>
                  本アプリは、以下の情報を自動的に収集する場合があります：{'\n'}
                  • ゲームプレイデータ: レベル進行状況、スコア、プレイ履歴{'\n'}
                  • 設定情報: ゲームモード、ヒント機能のON/OFF設定{'\n'}
                  • デバイス情報: 機種、OS バージョン（広告配信のため）
                </Text>

                <Text style={styles.subsectionTitle}>個人を特定する情報</Text>
                <Text style={styles.body}>
                  本アプリは、以下の個人情報は収集しません：{'\n'}
                  • 氏名{'\n'}
                  • メールアドレス{'\n'}
                  • 電話番号{'\n'}
                  • 住所{'\n'}
                  • その他の個人を特定できる情報
                </Text>

                <Text style={styles.sectionTitle}>情報の使用目的</Text>
                <Text style={styles.body}>
                  収集した情報は、以下の目的でのみ使用されます：{'\n'}
                  1. ゲーム進行状況の保存: プレイデータをデバイスに保存し、次回プレイ時に引き継ぎます{'\n'}
                  2. ゲーム体験の向上: 設定を保存し、ユーザーの好みに合わせた体験を提供します{'\n'}
                  3. 広告の表示: Google AdMobを通じて適切な広告を表示します
                </Text>

                <Text style={styles.sectionTitle}>データの保存場所</Text>
                <Text style={styles.body}>
                  すべてのゲームデータはお客様のデバイス内にのみ保存されます。外部サーバーへのデータ送信は行いません（広告配信を除く）。
                </Text>

                <Text style={styles.sectionTitle}>広告について</Text>
                <Text style={styles.body}>
                  本アプリは、Google AdMobを使用して広告を表示します。{'\n\n'}
                  Google AdMobは、広告配信のために一部のデバイス情報を収集する場合があります。収集される情報には、広告ID、デバイスの種類、OSバージョンなどが含まれます。{'\n\n'}
                  Googleのプライバシーポリシー: https://policies.google.com/privacy{'\n\n'}
                  本アプリ内でアプリ内課金（370円）を行うことで、すべての広告を削除できます。
                </Text>

                <Text style={styles.sectionTitle}>アプリ内課金について</Text>
                <Text style={styles.body}>
                  本アプリは、広告削除のためのアプリ内課金機能を提供しています。{'\n'}
                  • 商品名: 広告削除（Pro版）{'\n'}
                  • 価格: 370円（税込）{'\n'}
                  • 購入情報: Apple/Googleのシステムで管理され、開発者は購入者の個人情報にアクセスできません
                </Text>

                <Text style={styles.sectionTitle}>データの第三者提供</Text>
                <Text style={styles.body}>
                  本アプリは、以下の場合を除き、ユーザーの情報を第三者に提供しません：{'\n'}
                  1. 法令に基づく開示が必要な場合{'\n'}
                  2. 広告配信のためにGoogle AdMobと情報を共有する場合
                </Text>

                <Text style={styles.sectionTitle}>お子様のプライバシー</Text>
                <Text style={styles.body}>
                  本アプリは13歳以上の方を対象としています。13歳未満のお子様が使用する場合は、保護者の方の監督のもとでご利用ください。
                </Text>

                <Text style={styles.sectionTitle}>データの削除</Text>
                <Text style={styles.body}>
                  ゲームデータを削除したい場合は、以下の方法で行えます：{'\n'}
                  1. アプリ内の「設定」→「全データをリセット」{'\n'}
                  2. アプリをアンインストールする{'\n\n'}
                  アプリをアンインストールすると、すべてのデータが削除されます。
                </Text>

                <Text style={styles.sectionTitle}>プライバシーポリシーの変更</Text>
                <Text style={styles.body}>
                  本プライバシーポリシーは、必要に応じて変更される場合があります。変更があった場合は、本ページおよびアプリ内で通知いたします。
                </Text>

                <Text style={styles.contact}>
                  お問い合わせ{'\n'}
                  プライバシーポリシーに関するご質問やご意見がございましたら、以下までご連絡ください：{'\n\n'}
                  メールアドレス: jiten0410@me.com{'\n\n'}
                  制作: jiten-project{'\n'}
                  バージョン: 1.0.0
                </Text>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* 戻るボタン */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          戻る
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 80,
  },
  card: {
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#6200EE',
  },
  date: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#555',
  },
  body: {
    fontSize: UI_CONFIG.MIN_FONT_SIZE,
    lineHeight: 24,
    color: '#444',
    marginBottom: 12,
  },
  contact: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
});

export default LegalScreen;
