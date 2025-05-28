// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('https://0z8hxp4d-5000.inc1.devtunnels.ms/api/auth/register', {
        username,
        password,
      });

      Alert.alert('Success', 'User registered successfully');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
      <Button title="Register" onPress={handleRegister} />
      {/* <Button title="Back to Welcome" onPress={() => navigation.navigate('Welcome')} /> */}
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
