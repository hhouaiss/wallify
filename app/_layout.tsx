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
          name="todo" 
          options={{ 
            title: 'Wallify',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="preview" 
          options={{ 
            title: 'Preview',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}