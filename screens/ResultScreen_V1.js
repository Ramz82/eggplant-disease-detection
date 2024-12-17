import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { sendEmailVerification, fetchSignInMethodsForEmail } from 'firebase/auth'; // Add this
import { auth, database, storage } from '../firebaseConfig';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [otpSent, setOtpSent] = useState(false); // To handle OTP flow
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false); // Track OTP verification

  const navigation = useNavigation();

  const handleEmailValidation = async () => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0) {
        Alert.alert('Error', 'This email is already in use.');
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert('Error', 'Invalid email address.');
      return false;
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
  
    const isEmailValid = await handleEmailValidation();
    if (!isEmailValid) return;
  
    // Generate OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generatedOtp); // Store OTP for comparison
    console.log(`Server running on port ${generatedOtp}=`);
    // Send OTP to backend
    try {
      const response = await fetch('http://localhost:3000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: generatedOtp }),
      });
  
      if (response.ok) {
        Alert.alert('Success', 'OTP sent to your email.');
        setOtpSent(true);
      } else {
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while sending OTP.');
    }
  };
  

  const handleVerifyOTP = () => {
    if (otp.trim() === otp.trim()) { // Replace with real OTP comparison
      setOtpVerified(true);
      Alert.alert('Success', 'Email verified.');
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  const handleRegister = async () => {
    if (!otpVerified) {
      Alert.alert('Error', 'Please verify your email first.');
      return;
    }

    if (name === '' || email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true); // Start loading

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profileImageUrl = null;

      if (profileImage) {
        const imageRef = storageRef(storage, `profileImages/${user.uid}`);
        const response = await fetch(profileImage);
        const blob = await response.blob();

        await uploadBytes(imageRef, blob);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      await set(ref(database, 'users/' + user.uid), {
        name: name,
        email: email,
        profileImage: profileImageUrl,
      });

      await sendEmailVerification(user); // Send email verification link

      Alert.alert('Success', 'Registration complete. Please verify your email.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 2],
      quality: 1,
    });

    if (result.canceled) {
      Alert.alert('No image selected', 'Please select an image to proceed.');
    } else {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <LinearGradient colors={['#BE7C4D', '#BE7C4D']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!otpSent ? (
            <TouchableOpacity style={styles.imageButton} onPress={handleSendOTP}>
              <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
          ) : !otpVerified ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor="#666"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
              <TouchableOpacity style={styles.imageButton} onPress={handleVerifyOTP}>
                <Text style={styles.buttonText}>Verify OTP</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.verifiedText}>Email Verified ✅</Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            value={confirmPassword}
            secureTextEntry
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.buttonText}>{profileImage ? 'Change Profile Image' : 'Upload Profile Image'}</Text>
          </TouchableOpacity>
          {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading || !otpVerified}>
            <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#FF7043" style={styles.loadingIndicator} />}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  topImage: {
    width: 600,
    height: 200,
    position: 'absolute',
    top: -14,
    left: -120,
    resizeMode: 'contain',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 220,
    paddingHorizontal: 16,
  },
  formContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginTop: -100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7043',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  imageButton: {
    width: '100%',
    backgroundColor: '#FF7043',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  switchText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  linkText: {
    color: '#FF7043',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
