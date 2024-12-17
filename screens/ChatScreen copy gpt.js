import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { getDatabase, ref, onValue, set } from 'firebase/database'; // Import Firebase Realtime Database functions

const Chatbot = ({ userId }) => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are an expert on eggplants and related topics like diseases, prevention, and cures. Do not answer unrelated questions.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const database = getDatabase(); // Initialize Firebase Realtime Database

  // Load chat history from Firebase
  useEffect(() => {
    if (!userId) return; // Ensure userId is available

    const chatRef = ref(database, `users/${userId}/chats`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const chatData = snapshot.val();
      if (chatData) {
        setMessages(chatData);
      }
    });

    return () => unsubscribe(); // Clean up listener
  }, [userId]);

  const saveChatHistory = (updatedMessages) => {
    if (!userId) return; // Ensure userId is available

    const chatRef = ref(database, `users/${userId}/chats`);
    set(chatRef, updatedMessages).catch((error) => {
      console.error('Error saving chat history:', error);
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setInput('');
    setLoading(true);

    const predefinedResponses = {
      'Insect Pest Disease': 'Insect pests like aphids, whiteflies, and mites can attack eggplants. Use insecticidal soaps or neem oil for effective control.',
      // ... other predefined responses
    };

    const matchedResponse = Object.keys(predefinedResponses).find((disease) =>
      input.toLowerCase().includes(disease.toLowerCase())
    );

    if (matchedResponse) {
      const botMessage = { role: 'assistant', content: predefinedResponses[matchedResponse] };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      setLoading(false);
      return;
    }

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
            Authorization: `Bearer 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`, // Replace with your actual API key
          },
        }
      );

      const botMessage = response.data.choices[0].message;
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Error:', error);
      const errorMessages = [
        ...updatedMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' },
      ];
      setMessages(errorMessages);
      saveChatHistory(errorMessages);
    }
    setLoading(false);
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
