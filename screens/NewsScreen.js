//News screen:

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LottieView } from 'lottie-react-native'; // For animations

const NewsScreen = () => {
  const [eggplantNews, setEggplantNews] = useState([]);
  const [weatherNews, setWeatherNews] = useState([]);
  const [diseasePreventionTips, setDiseasePreventionTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Simulate API calls with static data for now
        const eggplantData = [
          { id: 1, title: 'New Eggplant Variety Increases Yield by 20%', content: 'A new hybrid eggplant has been introduced, promising higher resistance to pests and better yield.' },
          { id: 2, title: 'Common Eggplant Pests to Watch Out For', content: 'Learn how to identify and manage pests affecting eggplant crops.' },
        ];

        const weatherData = [
          { id: 1, title: 'Rainfall Expected in Key Agricultural Areas', content: 'Farmers should prepare for heavy rains over the weekend.' },
          { id: 2, title: 'Drought Alerts in Some Regions', content: 'Monitor soil moisture levels and irrigate as needed.' },
        ];

        const preventionTips = [
          { id: 1, tip: 'Rotate crops regularly to prevent soil-borne diseases.' },
          { id: 2, tip: 'Use disease-resistant eggplant varieties.' },
          { id: 3, tip: 'Avoid overhead watering to reduce the risk of fungal infections.' },
        ];

        setEggplantNews(eggplantData);
        setWeatherNews(weatherData);
        setDiseasePreventionTips(preventionTips);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BE7C4D" />
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#BE7C4D', '#78563D']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Eggplant Crop News</Text>
        </View>

        {/* Add cute animation */}
        {/* <LottieView
          source={require('../assets/animations/cute-animation.json')} // You can use any animation here
          autoPlay
          loop
          style={styles.animation}
        /> */}

        {eggplantNews.map((news) => (
          <View key={news.id} style={styles.newsCard}>
            <Text style={styles.newsTitle}>{news.title}</Text>
            <Text style={styles.newsContent}>{news.content}</Text>
          </View>
        ))}

        <Text style={styles.heading}>Weather Updates</Text>
        {weatherNews.map((news) => (
          <View key={news.id} style={styles.newsCard}>
            <Text style={styles.newsTitle}>{news.title}</Text>
            <Text style={styles.newsContent}>{news.content}</Text>
          </View>
        ))}

        <Text style={styles.heading}>Disease Prevention Tips</Text>
        {diseasePreventionTips.map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" style={styles.tipIcon} />
            <Text style={styles.tipText}>{tip.tip}</Text>
          </View>
        ))}

        {/* Add external links */}
        <Text style={styles.externalLinksHeading}>For more updates, check out these sources:</Text>
        <TouchableOpacity onPress={() => openURL('https://news.google.com/search?q=crop%20news')}>
          <Text style={styles.linkText}>Google News - Crop News</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openURL('https://www.agriculture.com/news')}>
          <Text style={styles.linkText}>Agriculture.com News</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const openURL = (url) => {
  // Open the link in a browser or external webview
  Linking.openURL(url);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  headingContainer: {
    marginTop: 50, // Moves the heading lower
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  animation: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  newsCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  newsContent: {
    fontSize: 16,
    color: '#666',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8C6A7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  externalLinksHeading: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NewsScreen;