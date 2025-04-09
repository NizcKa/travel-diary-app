import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Button } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

interface TravelEntry {
  image: string;
  address: string;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const { getItem, setItem } = useAsyncStorage('travelEntries');
  const [entries, setEntries] = useState<TravelEntry[]>([]);

  // Load entries when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadEntries = async () => {
        try {
          const stored = await getItem();
          if (stored) {
            const parsed: TravelEntry[] = JSON.parse(stored);
            setEntries(parsed);
          } else {
            console.log("No entries found in AsyncStorage");
          }
        } catch (error) {
          console.error("Error retrieving entries:", error);
        }
      };

      loadEntries();
    }, [getItem]) // Re-run this effect whenever `getItem` changes
  );

  // Delete entry from AsyncStorage
  const deleteEntry = async (index: number) => {
    try {
      const updatedEntries = [...entries];
      updatedEntries.splice(index, 1); // Remove the entry at the given index
      await setItem(JSON.stringify(updatedEntries)); // Save the updated entries to AsyncStorage
      setEntries(updatedEntries); // Update the local state to reflect the change
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const renderItem = ({ item, index }: { item: TravelEntry; index: number }) => (
    <View style={styles.entryContainer}>
      <Image
        source={{ uri: 'data:image/jpeg;base64,' + item.image }}
        style={styles.image}
      />
      <Text style={styles.address}>{item.address}</Text>
      <TouchableOpacity onPress={() => deleteEntry(index)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Travel Entries</Text>

      <TouchableOpacity
        style={styles.botButtons}
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
        <Text style={styles.text}>No travel entries yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  botButtons: {
    backgroundColor: '#0066CC',
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
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  address: {
    marginTop: 5,
    fontSize: 14,
    color: '#444',
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
