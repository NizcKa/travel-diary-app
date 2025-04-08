import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TravelEntryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is a blank screen.</Text>
    </View>
  );
};

export default TravelEntryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});