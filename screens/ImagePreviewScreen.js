import React, { useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  Alert
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

const IPHONE_14_RATIO = 2532/1170;
const screenWidth = Dimensions.get('window').width;
const previewHeight = screenWidth * IPHONE_14_RATIO;

export default function ImagePreviewScreen({ route }) {
  const { todoList } = route.params;
  const viewShotRef = useRef();

  const saveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status === 'granted') {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert(
          'Success',
          'Image saved to your photo library. You can now set it as your lock screen wallpaper.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permission Required',
          'Please grant permission to save images to your photo library.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1,
          width: 1170,
          height: 2532,
        }}
        style={styles.preview}
      >
        <View style={styles.wallpaper}>
          <Text style={styles.title}>My Todo List</Text>
          {todoList.map((item, index) => (
            <Text key={index} style={styles.todoItem}>
              • {item}
            </Text>
          ))}
        </View>
      </ViewShot>

      <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
        <Text style={styles.buttonText}>Save to Photos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  preview: {
    width: screenWidth,
    height: previewHeight,
    backgroundColor: '#000',
  },
  wallpaper: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  todoItem: {
    fontSize: 20,
    color: '#fff',
    marginVertical: 8,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    width: '90%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});