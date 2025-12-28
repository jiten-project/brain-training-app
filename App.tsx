import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList } from './src/types';
import { GameProvider } from './src/contexts/GameContext';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import LegalScreen from './src/screens/LegalScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <GameProvider>
          <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#6200EE',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 20,
              },
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: '記憶力トレーニング',
                headerLeft: () => null,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ title: 'ゲーム' }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{
                title: '結果',
                headerLeft: () => null,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: '設定' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: '記録' }}
            />
            <Stack.Screen
              name="Achievements"
              component={AchievementsScreen}
              options={{ title: '実績バッジ' }}
            />
            <Stack.Screen
              name="Legal"
              component={LegalScreen}
              options={({ route }) => ({
                title: route.params.type === 'terms' ? '利用規約' : 'プライバシーポリシー',
              })}
            />
          </Stack.Navigator>
          </NavigationContainer>
        </GameProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
