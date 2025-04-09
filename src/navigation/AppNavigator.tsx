import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen.tsx';
import TravelEntryScreen from '../screens/TravelEntryScreen.tsx';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Travel Entry" component={TravelEntryScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;