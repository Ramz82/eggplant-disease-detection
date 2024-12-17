import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient effect

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Top Image */}
      <Image source={require('../assets/top-bar.png')} style={styles.topImage} />

      {/* Large slogan */}
     

      {/* Two buttons */}
      <View style={styles.buttonContainer}>
         <Text style={styles.slogan}>
        Take care of your plant...{'\n'}
        <Text style={styles.sloganHighlight}>virtually</Text>
      </Text>
        <TouchableOpacity style={styles.topButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.topButton, styles.registerButton]} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Image and bottom gradient */}
      <View style={styles.bottomContainer}>
        <Image source={require('../assets/eggplant-welcone.png')} style={styles.image} />
        <LinearGradient
          colors={['transparent', '#78563D']} // Gradient adjusted to match the theme
          style={styles.gradient}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#BE7C4D', // Light orangish background
    padding: 20,
  },
  topImage: {
    width: 600,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -90, // Adjust the spacing from the top
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems:'center',
    marginBottom: 40,
    marginTop: 100,
  },
  topButton: {
    backgroundColor: '#4CAF50', // Orangish button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 30,
    textAlign:'center',
    width:200,
    height:50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  registerButton: {
    marginTop:'20',
    backgroundColor: '#FF7043', // Green button
  },
  buttonText: {
    color: '#FFF', // White text
    fontSize: 20,
    fontWeight: '900',
    textAlign:'center'
    ,textAlignVertical:'center'
  },
  slogan: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2F2E41', // Dark color for text
    marginBottom: 10,
    marginTop: -100,
    textAlign: 'center', // Center the slogan text
    alignSelf: 'stretch',
  },
  sloganHighlight: {
    color: '#4CAF50', // Highlighted part in green
    fontSize: 50,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 550,
    top:560,
    position: 'absolute',
  },
  image: {
    width: 380,
    height: 330,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: '70%',
    width: '100%',
  },
});

export default WelcomeScreen;
