import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function Layout(): React.ReactElement {
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#000000',
          }
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Welcome to Wallify',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="welcome" 
          options={{ 
            title: 'Choose Category',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="todo" 
          options={{ 
            title: 'Tasks',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="grocery" 
          options={{ 
            title: 'Grocery List',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="preview" 
          options={{ 
            title: 'Preview',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="grocery-preview" 
          options={{ 
            title: 'Grocery Preview',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}