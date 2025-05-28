// src/screens/FileUploadScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function FileUploadScreen({ route}) {
  const [file, setFile] = useState(null);

  const { parentFolder,navigation } = route.params || {}; // Get parentFolder from route params

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.type === 'cancel') {
        console.log('File selection canceled');
        return;
      }

      setFile(result);
      console.log('Selected file:', result);
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Could not select the file. Please try again.');
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      Alert.alert('No File Selected', 'Please select a file to upload.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Session Expired', 'Please login again.');
        navigation.replace('Login');
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: file.assets[0].uri,
        name: file.assets[0].name,
        type: file.assets[0].mimeType || 'application/octet-stream',
      });
      console.log('File URI:', file);
      // const {parentFolder} = route.params;
      if (parentFolder) {
        formData.append('parentFolder', parentFolder);
      }
      //  formData.append('parentFolder', parentFoldder);

      console.log('Uploading file:', file.assets[0].uri);
      const response = await axios.post('https://0z8hxp4d-5000.inc1.devtunnels.ms/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'File uploaded successfully');
      console.log('Upload response:', response.data);
      setFile(null);  // Reset file after successful upload

      // Navigate back to home screen to refresh the file list
      navigation.replace('Home');
    } catch (error) {
      console.error('File upload error:', error.response || error);
      Alert.alert('Upload Error', error.response?.data?.message || 'Something went wrong while uploading the file');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload File</Text>
      <Button title="Select File" onPress={handleFilePick} />
      {file && <Text style={styles.fileName}>Selected File: {file.assets[0].name}</Text>}
      <Button title="Upload File" onPress={handleFileUpload} disabled={!file} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  fileName: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
  },
});
