import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TodoInputScreen from './screens/TodoInputScreen';
import ImagePreviewScreen from './screens/ImagePreviewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TodoInput">
        <Stack.Screen 
          name="TodoInput" 
          component={TodoInputScreen}
          options={{ title: 'Create Todo List' }}
        />
        <Stack.Screen 
          name="ImagePreview" 
          component={ImagePreviewScreen}
          options={{ title: 'Preview Wallpaper' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}