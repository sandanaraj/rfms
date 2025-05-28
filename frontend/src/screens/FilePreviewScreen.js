import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import { Buffer } from 'buffer';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

export default function FilePreviewScreen({ route }) {
  const { file } = route.params;
  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [columnWidths, setColumnWidths] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadFileContent();
  }, []);

  const loadFileContent = async () => {
    try {
      const fileUrl = file.filePath;
      const fileName = file.filename;
      const fileType = fileName.split('.').pop().toLowerCase();

      console.log("Loading file:", fileUrl, "as type:", fileType);

      if (fileUrl.startsWith('https')) {
        const localFileUri = `${FileSystem.documentDirectory}${fileName}`;
        const response = await FileSystem.downloadAsync(fileUrl, localFileUri);

        if (fileType === 'xlsx') {
          const fileContent = await FileSystem.readAsStringAsync(response.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const binary = Buffer.from(fileContent, 'base64').toString('binary');
          const workbook = XLSX.read(binary, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          setData(jsonData);
          setEditedData(jsonData);
          calculateColumnWidths(jsonData);
        } else if (fileType === 'csv') {
          const fileContent = await FileSystem.readAsStringAsync(response.uri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          const jsonData = XLSX.utils.sheet_to_json(
            XLSX.read(fileContent, { type: 'string' }).Sheets.Sheet1,
            { header: 1 }
          );
          setData(jsonData);
          setEditedData(jsonData);
          calculateColumnWidths(jsonData);
        } else if (fileType === 'txt') {
          const fileContent = await FileSystem.readAsStringAsync(response.uri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          setData(fileContent);
          setEditedData(fileContent);
        } else {
          Alert.alert("Error", "Unsupported file type.");
        }
        setLoading(false);
      } else {
        Alert.alert("Error", "Unsupported file URL.");
      }
    } catch (error) {
      console.error("Error loading file:", error);
      Alert.alert("Error", "Failed to load file.");
    }
  };

  const calculateColumnWidths = (rows) => {
    if (rows.length === 0) return;

    const colWidths = [];
    rows.forEach(row => {
      row.forEach((cell, colIndex) => {
        const cellLength = (cell ? cell.toString().length : 0) * 12;
        colWidths[colIndex] = Math.max(colWidths[colIndex] || 80, cellLength);
      });
    });

    const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
    if (totalWidth < screenWidth) {
      const extraWidth = (screenWidth - totalWidth) / colWidths.length;
      setColumnWidths(colWidths.map(width => width + extraWidth));
    } else {
      setColumnWidths(colWidths);
    }
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedData = [...editedData];
    updatedData[rowIndex][colIndex] = value;
    setEditedData(updatedData);
  };

  const toggleEditMode = () => {
    setIsEditable(!isEditable);
  };

  const handleSaveChanges = async () => {
    try {
      const worksheet = XLSX.utils.aoa_to_sheet(editedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

      const formData = new FormData();
      formData.append('file', {
        uri: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`,
        name: file.filename,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const token = await AsyncStorage.getItem('token');
      const response = await axios.post('https://0z8hxp4d-5000.inc1.devtunnels.ms/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'File replaced on server successfully.');
        setIsEditable(false);
        const {navigation} = route.params;
        navigation.replace('Home');
      } else {
        Alert.alert('Error', 'Failed to replace file on server.');
      }
    } catch (error) {
      console.error('Error replacing file on server:', error);
      Alert.alert('Error', 'Failed to replace file on server.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const fileType = file.filename.split('.').pop().toLowerCase();
  if (fileType === 'xlsx' || fileType === 'csv') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleEditMode} style={styles.iconButton}>
            <Ionicons
              name={isEditable ? 'checkmark-outline' : 'create-outline'}
              size={30}
              color={isEditable ? 'green' : 'black'}
            />
          </TouchableOpacity>
          {isEditable && (
            <TouchableOpacity onPress={handleSaveChanges} style={styles.iconButton}>
              <Ionicons name="save-outline" size={30} color="blue" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal>
          <ScrollView>
            {editedData.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => (
                  isEditable ? (
                    <TextInput
                      key={colIndex}
                      value={cell ? cell.toString() : ''}
                      onChangeText={(value) => handleCellChange(rowIndex, colIndex, value)}
                      style={[styles.editableCell, { width: columnWidths[colIndex] || 80 }]}
                    />
                  ) : (
                    <Text key={colIndex} style={[styles.cell, { width: columnWidths[colIndex] || 80 }]}>
                      {cell ? cell.toString() : ''}
                    </Text>
                  )
                ))}
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </View>
    );
  } else if (fileType === 'txt') {
    return (
      <ScrollView style={styles.container}>
        <Text style={{ fontFamily: 'monospace' }}>{data}</Text>
      </ScrollView>
    );
  } else {
    return (
      <WebView source={{ uri: file.filePath }} style={{ flex: 1 }} />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  iconButton: {
    marginHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  editableCell: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    backgroundColor: '#e7f3ff',
  },
});