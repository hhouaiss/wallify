# Wallify

A React Native Expo app that allows users to create a to-do list and generate a stylized image of that list, sized specifically for the iPhone 14 lock screen (1170x2532 pixels).

## Features

- Create and manage a to-do list with a simple, modern UI
- Generate a stylized image of your to-do list formatted for iPhone lock screens
- Save the generated image to your photo library
- Instructions for setting the image as your lock screen wallpaper

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo Go app on your iOS device (for testing)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Usage

1. Add items to your to-do list using the input field and "Add" button
2. Click "Generate Lock Screen Image" to preview your to-do list as a wallpaper
3. On the preview screen, tap "Save to Photos" to save the image to your photo library
4. Follow the instructions to set the image as your lock screen wallpaper

## Technologies Used

- React Native
- Expo
- react-native-view-shot (for capturing the view as an image)
- expo-media-library (for saving the image to the photo library)
- @react-navigation/native (for navigation between screens)

## License

This project is licensed under the MIT License
