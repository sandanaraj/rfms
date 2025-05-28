// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Replace 'YOUR_LOCAL_IP' with your local machine's IP address
const BASE_URL = 'https://0z8hxp4d-5000.inc1.devtunnels.ms/api/auth/login';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(BASE_URL, {
        username,
        password,
      });

      const { token } = response.data;
      // console.log('Token:', token);
      // Store token securely
      await AsyncStorage.setItem('token', token);
      console.log('Token:', AsyncStorage.getItem('token'));
      
      // Navigate to Home screen
      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error);
      const status = error.response?.status;
      
      if (status === 401) {
        Alert.alert(token, 'Invalid credentials');
        // Alert.alert('Login Failed',  'Something went wrong',token);
        await AsyncStorage.removeItem('token');
      } else {
        Alert.alert('Login Failed',  'Something went wrong',token);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
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
  input: {
    width: 300,
    height: 50,
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
