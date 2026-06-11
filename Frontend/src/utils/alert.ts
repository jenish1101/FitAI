import { Alert, Platform } from 'react-native';

/** Cross-platform alert — Alert.alert is unreliable on web. */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  if (message) {
    Alert.alert(title, message);
    return;
  }
  Alert.alert(title);
}
