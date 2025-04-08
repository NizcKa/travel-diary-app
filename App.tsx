import { Text, View, Image, ScrollView, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { styles } from './src/styles/globalStyles.ts';
import { GlobalProvider } from './src/context/globalContext.tsx';
import AppNavigator from './src/navigation/AppNavigator.tsx';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, marginTop: StatusBar.currentHeight }}>
      <GlobalProvider>
        <AppNavigator />
      </GlobalProvider>
    </SafeAreaView>
  )
}
