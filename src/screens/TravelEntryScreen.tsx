import React, { useState, useEffect } from "react";
import { View, Button, Image, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../context/globalContext.tsx';
import { globalStyles } from '../styles/globalStyles.ts'; 

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface TravelEntry {
  image: string;    
  address: string;  
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const TravelEntryScreen = () => {
  const { theme, isDarkMode, toggleDarkMode }  = useGlobalContext();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [base64Image, setBase64Image] = useState<string | null>(null); 
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { getItem, setItem } = useAsyncStorage('travelEntries');

  useEffect(() => {
    requestPermissions();
    registerForPushNotificationsAsync();
  }, []);


  useEffect(() => {   //automatically gets address when location is updated
    if (location) {
      getAddress(); 
    }
  }, [location]);
  

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied.');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });
    } catch (error) {
      setErrorMsg('Error fetching location.');
      console.error(error);
    }
  };

  const getAddress = async () => {
    if (!location) return;
    const address = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setAddress(
      formatAddress(
        address[0].name ?? '',
        address[0].city ?? '',
        address[0].region ?? '',
        address[0].postalCode ?? ''
      )
    );
  };

  function formatAddress(
    name: string,
    city: string,
    region: string,
    postalCode: string
  ): string {
    return name + ', ' + city + ', ' + region + ' ' + postalCode;
  }


  const takePicture = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required to take pictures.");
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1, // Highest quality
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
  
      const base64Image = await FileSystem.readAsStringAsync(result.assets[0].uri, {  // converts image into base64 string
        encoding: FileSystem.EncodingType.Base64,
      });
      
      setIsSaved(false);
      setBase64Image(base64Image); // Store the base64 image temporarily
      await getCurrentLocation();
    } 
  };

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Travel Entry',
        body: 'You have successfully saved a new travel entry!',
        sound: 'default',
      },
      trigger: null, // Immediate notification
    });
  };

  const saveEntry = async () => {
    if (base64Image && address) {
      try {
        const existing = await getItem(); 
        const parsed = existing ? JSON.parse(existing) : [];  //parses through the existing entries to initialize an empty array

        const newEntry: TravelEntry = {
          image: base64Image,
          address: address,
        };

        const updatedEntries = [...parsed, newEntry]; //takes the parsed empty array and updates it with the new travel entry
        await setItem(JSON.stringify(updatedEntries));  // converts the new entry into a json string to store

        alert('Travel entry saved!');
        sendNotification(); 
        setIsSaved(true);
      } catch (error) {
        console.error('Error Saving Image:', error);
      }
    } else {
      alert('No image to save!');
    }
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      alert('Must use a physical device for push notifications');
      return;
    }

    // ** Fetch current notification permissions properly **
    const { granted: existingPermission } =
      await Notifications.getPermissionsAsync();

    let finalPermission = existingPermission;

    if (!existingPermission) {
      const { granted: newPermission } =
        await Notifications.requestPermissionsAsync();
      finalPermission = newPermission;
    }

    if (!finalPermission) {
      alert('Failed to get push token for push notifications!');
      return;
    }

    token = await Notifications.getExpoPushTokenAsync();

    console.log('Expo Push Token:', token);

    return token;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>Take a photo!.</Text>
      <Button
        title={imageUri ? "Take Another Picture" : "Take a Picture"}
        onPress={takePicture}
      />
      {imageUri && <Image source={{ uri: imageUri }} style={globalStyles.image} />}

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      {address && <Text style={[styles.text, { color: theme.text }]}>{address}</Text>}

      {imageUri && (
        <Button
          title={isSaved ? 'Entry Saved' : 'Save Entry'} // Change button text based on save status
          onPress={saveEntry}
          disabled={isSaved} // Disable button after entry is saved
        />
      )}

      <TouchableOpacity onPress={toggleDarkMode} style={[globalStyles.toggleButton, { backgroundColor: theme.toggleBackground }]}>
        <Text style={[globalStyles.buttonText, { color: theme.text }]}>{isDarkMode ? "☾" : "✹"}</Text>
      </TouchableOpacity>

    </View>
  );
};

export default TravelEntryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  error: {
    color: 'red',
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 15,
    width: '80%',
    borderRadius: 10,
    overflow: 'hidden',
  },
});