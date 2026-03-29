import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function ResetPasswordRedirect() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C5CE7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
