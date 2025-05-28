// src/navigation/Navigation.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FileUploadScreen from '../screens/FileUploadScreen';
import FilePreviewScreen from '../screens/FilePreviewScreen';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false,animation:'slide_from_right'}}/>
        <Stack.Screen name="FileUpload" component={FileUploadScreen} />
        <Stack.Screen name="FilePreview" component={FilePreviewScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
