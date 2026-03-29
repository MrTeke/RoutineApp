import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';

export default function ResetPasswordRedirect() {
  const local = useLocalSearchParams();
  const global = useGlobalSearchParams();
  const [initialURL, setInitialURL] = useState<string>('loading...');

  useEffect(() => {
    Linking.getInitialURL().then((u) => setInitialURL(u ?? 'NULL'));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>getInitialURL:</Text>
      <Text style={styles.value}>{initialURL}</Text>

      <Text style={styles.label}>useLocalSearchParams:</Text>
      <Text style={styles.value}>{JSON.stringify(local)}</Text>

      <Text style={styles.label}>useGlobalSearchParams:</Text>
      <Text style={styles.value}>{JSON.stringify(global)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#000', flexGrow: 1 },
  label: { color: '#6C5CE7', fontWeight: 'bold', marginTop: 20, fontSize: 14 },
  value: { color: '#fff', fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
});
