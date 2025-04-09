import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../context/globalContext.tsx';
import { globalStyles } from '../styles/globalStyles.ts'; 

interface TravelEntry {
  image: string;
  address: string;
}

const HomeScreen = () => {
  const { theme, isDarkMode, toggleDarkMode }  = useGlobalContext();
  const navigation = useNavigation();
  const { getItem, setItem } = useAsyncStorage('travelEntries');
  const [entries, setEntries] = useState<TravelEntry[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadEntries = async () => {
        try {
          const stored = await getItem();
          const parsed = stored ? JSON.parse(stored) : [];
          setEntries(parsed);
        } catch (error) {
          console.error("Error retrieving entries:", error);
        }
      };
      loadEntries();
    }, [getItem])
  );

  const deleteEntry = async (index: number) => {
    try {
      const updatedEntries = entries.filter((_, i) => i !== index);
      await setItem(JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const renderItem = ({ item, index }: { item: TravelEntry; index: number }) => (
    <View style={[styles.entryContainer, { backgroundColor: theme.cardBackground }]}>
      <Image
        source={{ uri: 'data:image/jpeg;base64,' + item.image }}
        style={styles.image}
      />
      <Text style={[styles.address, { color: theme.text }]}>{item.address}</Text>
      <TouchableOpacity onPress={() => deleteEntry(index)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>Travel Entries</Text>

      <TouchableOpacity
        style={[styles.botButtons, { backgroundColor: theme.toggleBackground }]}
        onPress={() => navigation.navigate('Travel Entry')}
      >
        <Text style={styles.buttonText}>Go to Travel Entry</Text>
      </TouchableOpacity>

      {entries.length > 0 ? (
        <FlatList
          data={entries}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={[styles.text, { color: theme.text }]}>No Entries Yet</Text>
      )}

      <TouchableOpacity onPress={toggleDarkMode} style={[globalStyles.toggleButton, { backgroundColor: theme.toggleBackground }]}>
        <Text style={[globalStyles.buttonText, { color: theme.text }]}>{isDarkMode ? "☾" : "✹"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  botButtons: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  entryContainer: {
    marginBottom: 20,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  address: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
