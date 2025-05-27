import { Redirect } from 'expo-router';
import React from 'react';

export default function Home(): React.ReactElement {
  // Redirect to the TodoInput screen
  return <Redirect href="/welcome" />;
}