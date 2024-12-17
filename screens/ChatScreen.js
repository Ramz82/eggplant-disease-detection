import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { getDatabase, ref, onValue, set } from 'firebase/database'; // Import Firebase Realtime Database functions

const Chatbot = ({ route }) => {
  const { userId } = route.params;
  // console.log(userId);

  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are an expert on eggplants and related topics like diseases, prevention, and cures. Do not answer unrelated questions.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const database = getDatabase(); // Initialize Firebase Realtime Database

  // Load chat history from Firebase when component mounts
  useEffect(() => {
    if (!userId) return; // Ensure userId is available

    const chatRef = ref(database, `users/${userId}/chats`); // Reference to user's chat in Firebase

    // Listener to fetch chat history in real-time
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const chatData = snapshot.val(); // Retrieve chat data from Firebase
      if (chatData) {
        setMessages(chatData); // Update the state with fetched messages
      }
    });

    return () => unsubscribe(); // Clean up listener on component unmount
  }, [userId]);

  // Method to save chat messages to Firebase
  const saveChatHistory = (updatedMessages) => {
    if (!userId) return; // Ensure userId is available

    const chatRef = ref(database, `users/${userId}/chats`); // Reference to user's chat in Firebase

    // Save updated messages to Firebase
    set(chatRef, updatedMessages).catch((error) => {
      // console.error('Error saving chat history:', error);
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return; // Prevent sending empty messages

    const userMessage = { role: 'user', content: input }; // Format user message
    const updatedMessages = [...messages, userMessage]; // Add user message to message history

    setMessages(updatedMessages); // Update local state
    saveChatHistory(updatedMessages); // Save updated messages to Firebase

    setInput(''); // Clear input field
    setLoading(true); // Show loading indicator

    // Check predefined responses
    const predefinedResponses = {
      'Insect Pest Disease': 'Insect pests like aphids, whiteflies, and mites can attack eggplants. Use insecticidal soaps or neem oil for effective control.',
      'Leaf Spot Disease': 'Leaf Spot Disease is caused by fungi or bacteria, leading to brown or black spots on leaves. Apply fungicides and maintain proper spacing between plants to prevent it.',
      'Mosaic Virus Disease': 'Mosaic Virus Disease causes mottled patterns on leaves and stunted growth. Remove infected plants and control insect vectors like aphids.',
      'Small Leaf Disease': 'Small Leaf Disease leads to reduced leaf size and poor growth. Ensure proper nutrient supply and monitor for pest infestations.',
      'White Mold Disease': 'White Mold Disease causes white, cottony growth on stems and leaves. Avoid overwatering and use fungicides as needed.',
      'Wilt Disease': 'Wilt Disease can be caused by fungi like Fusarium or bacteria. Ensure well-drained soil and rotate crops to prevent buildup of pathogens.',

      // ... other predefined responses
    };

    const matchedResponse = Object.keys(predefinedResponses).find((disease) =>
      input.toLowerCase().includes(disease.toLowerCase())
    );

    if (matchedResponse) {
      const botMessage = { role: 'assistant', content: predefinedResponses[matchedResponse] };
      const finalMessages = [...updatedMessages, botMessage]; // Append bot response to messages

      setMessages(finalMessages); // Update local state
      saveChatHistory(finalMessages); // Save updated messages to Firebase

      setLoading(false); // Hide loading indicator
      return;
    }

    // Handle OpenAI API response
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'ft:gpt-4o-2024-08-06:comsats-university-islamabad:eggplant:AXBw13d2',
          messages: updatedMessages,
          temperature: 0.2,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `sk-1234567890abcdef1234567890abcdef`, // Replace with your actual API key
          },
        }
      );

      const botMessage = response.data.choices[0].message; // Get bot response
      const finalMessages = [...updatedMessages, botMessage]; // Append bot response to messages

      setMessages(finalMessages); // Update local state
      saveChatHistory(finalMessages); // Save updated messages to Firebase
    } catch (error) {
      // console.error('Error:', error);

      const errorMessages = [
        ...updatedMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' },
      ];

      setMessages(errorMessages); // Update local state with error message
      saveChatHistory(errorMessages); // Save updated messages to Firebase
    }

    setLoading(false); // Hide loading indicator
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              {
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.role === 'user' ? '#D0F0C0' : '#EAEAEA',
              },
            ]}
          >
            <Text style={styles.messageText}>
              {message.role === 'user' ? 'You: ' : 'Bot: '}
              {message.content}
            </Text>
          </View>
        ))}
      </ScrollView>
      {loading && <ActivityIndicator size="large" color="#FF7043" />}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about eggplant diseases..."
          placeholderTextColor="black"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BE7C4D',
    padding: 10,
  },
  chatContainer: {
    flex: 1,
    marginTop: 30,
    marginBottom: 30,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D0F0C0',
    borderRadius: 25,
    padding: 10,
  },
  input: {
    flex: 1,
    color: 'black',
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#FF7043',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Chatbot;
