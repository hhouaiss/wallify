import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Login screen component that serves as the home page
 * Features email and Google login buttons that redirect to welcome page
 */
export default function LoginScreen(): React.ReactElement {
  const router = useRouter();

  /**
   * Handle email login button press
   * Redirects directly to welcome page without actual authentication
   */
  const handleEmailLogin = (): void => {
    router.push('/welcome');
  };

  /**
   * Handle Google login button press
   * Redirects directly to welcome page without actual authentication
   */
  const handleGoogleLogin = (): void => {
    router.push('/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0c29']}
        style={styles.background}
      >
        {/* Floating Elements for Visual Appeal */}
        <View style={[styles.floatingElement, styles.element1]} />
        <View style={[styles.floatingElement, styles.element2]} />
        <View style={[styles.floatingElement, styles.element3]} />
        
        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo/Brand Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                style={styles.logoGradient}
              >
                <Text style={styles.logoIcon}>📱</Text>
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>Wallify</Text>
            <Text style={styles.tagline}>Create Beautiful Lock Screen Wallpapers</Text>
          </View>

          {/* Login Buttons Section */}
          <View style={styles.loginSection}>
            {/* Email Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleEmailLogin}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.buttonBlur}>
                <LinearGradient
                  colors={['rgba(0, 122, 255, 0.8)', 'rgba(88, 86, 214, 0.8)']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonIcon}>✉️</Text>
                  <Text style={styles.buttonText}>Continue with Email</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>

            {/* Google Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.buttonBlur}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonIcon}>🔍</Text>
                  <Text style={styles.buttonText}>Continue with Google</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Transform your lists into art</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Beautiful Todo Lists</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🛒</Text>
                <Text style={styles.featureText}>Organized Shopping Lists</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎨</Text>
                <Text style={styles.featureText}>Custom Wallpapers</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    position: 'relative',
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  element1: {
    width: 200,
    height: 200,
    backgroundColor: '#007AFF',
    top: '10%',
    right: '-10%',
  },
  element2: {
    width: 150,
    height: 150,
    backgroundColor: '#5856D6',
    top: '60%',
    left: '-10%',
  },
  element3: {
    width: 100,
    height: 100,
    backgroundColor: '#34C759',
    top: '30%',
    left: '80%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 50,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  loginSection: {
    gap: 16,
    marginVertical: 40,
  },
  loginButton: {
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonBlur: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  featuresSection: {
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});