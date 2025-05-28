import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Button, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const fetchFiles = async (folderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `https://0z8hxp4d-5000.inc1.devtunnels.ms/api/files?parentFolder=${folderId || ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(response.data);
    } catch (error) {
      console.error('Fetch files error:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchFiles(currentFolder);
  }, [currentFolder]);

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder._id);
    setBreadcrumb(prev => [...prev, folder]);
  };

  const goBack = () => {
    const updated = [...breadcrumb];
    updated.pop();
    const parent = updated[updated.length - 1];
    setCurrentFolder(parent?._id || null);
    setBreadcrumb(updated);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post('https://0z8hxp4d-5000.inc1.devtunnels.ms/api/files/create-folder',
        {
          folderName: newFolderName,
          parentFolder: currentFolder,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewFolderName('');
      fetchFiles(currentFolder);
    } catch (error) {
      console.error('Error creating folder:', error.response?.data || error.message);
    }
  };

  const filteredFiles = files
    .filter(file =>
      file.filename.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.filename.localeCompare(b.filename);
    });

  const handlePreview = (file) => {
    navigation.navigate('FilePreview', { file });
  };

  const handleDelete = async (item) => {
    const isFolder = item.isFolder;
    Alert.alert(
      isFolder ? 'Delete Folder' : 'Delete File',
      isFolder ? 'Do you want to delete this folder and everything inside it?' : 'Do you want to delete this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`https://0z8hxp4d-5000.inc1.devtunnels.ms/api/files/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchFiles(currentFolder);
            } catch (error) {
              console.error('Error deleting file:', error.response?.data || error.message);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search files..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={() => setIsProfileVisible(!isProfileVisible)} style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={40} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      {isProfileVisible && (
        <View style={styles.profileMenu}>
          <TouchableOpacity style={{ marginBottom: 10 }} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={40} color="#555" />
            <Text style={styles.profileText}>Profile</Text>
          </TouchableOpacity>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      )}

      {/* Folder creation */}
      <View style={styles.folderCreation}>
        <TextInput
          style={styles.folderInput}
          placeholder="New folder name"
          value={newFolderName}
          onChangeText={setNewFolderName}
        />
        <Button title="Create" onPress={createFolder} />
      </View>

      {/* Upload Button */}
      <Button title="Upload" onPress={() => navigation.navigate('FileUpload', { parentFolder: currentFolder ,navigation:navigation})} />

      {/* Breadcrumb Navigation */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => { setCurrentFolder(null); setBreadcrumb([]); }}>
          <Text style={styles.breadcrumb}>Root {'>'} </Text>
        </TouchableOpacity>
        {breadcrumb.map((folder, index) => (
          <TouchableOpacity
            key={folder._id}
            onPress={() => {
              setCurrentFolder(folder._id);
              setBreadcrumb(breadcrumb.slice(0, index + 1));
            }}
          >
            <Text style={styles.breadcrumb}>
              {folder.filename + (index < breadcrumb.length - 1 ? ' > ' : '')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Files and Folders */}
      <FlatList
        data={filteredFiles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.fileItem}
            onPress={() => item.isFolder ? navigateToFolder(item) : handlePreview(item)}
          >
            <Ionicons
              name={item.isFolder ? 'folder-open-outline' : 'document-outline'}
              size={24}
              color={item.isFolder ? '#FFD700' : '#333'}
            />
            <Text style={styles.fileName}>
              {item.filename.length > 20 ? item.filename.substring(0, 20) + '...' : item.filename}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item)} style={{ marginLeft: 'auto' }}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noFilesText}>No files found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  searchBar: {
    flex: 1, height: 40, backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 15, marginRight: 10, borderWidth: 1, borderColor: '#ccc'
  },
  profileButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center'
  },
  profileMenu: {
    position: 'absolute', top: 90, right: 30,
    backgroundColor: '#fff', padding: 40, borderRadius: 5, zIndex: 1
  },
  profileText: { color: '#007AFF', fontSize: 20 },
  folderCreation: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10, gap: 10
  },
  folderInput: {
    flex: 1, borderWidth: 1, borderColor: '#ccc',
    paddingHorizontal: 10, height: 40, borderRadius: 5, backgroundColor: '#fff'
  },
  breadcrumbContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
  breadcrumb: { color: '#007AFF' },
  fileItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e0e0e0', padding: 10,
    marginVertical: 5, borderRadius: 5
  },
  fileName: { flexShrink: 1, marginLeft: 10, fontSize: 16 },
  noFilesText: {
    textAlign: 'center', marginTop: 20,
    color: '#888', fontSize: 16
  },
});