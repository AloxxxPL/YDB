import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { geminiModel } from '../services/gemini';

type Message = {
id: string;
role: 'user' | 'assistant';
text: string;
};

const SYSTEM_PROMPT = `You are a friendly and knowledgeable nutrition assistant. Help users with:
- Diet advice and healthy eating tips
- Recipe suggestions
- Nutritional information
- Healthy habits and lifestyle tips
- Motivation and support for their fitness goals

Keep responses concise and practical. Be encouraging and supportive.`;

export default function ChatScreen() {
const [messages, setMessages] = useState<Message[]>([
    {
    id: '0',
    role: 'assistant',
    text: "Hi! I'm your nutrition assistant. Ask me anything about healthy eating, recipes, or fitness habits!",
    },
]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const scrollViewRef = useRef<ScrollView>(null);

useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
}, [messages]);

async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
    const conversationHistory = messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');

    const prompt = `${SYSTEM_PROMPT}

Previous conversation:
${conversationHistory}

User: ${userMessage.text}

Respond helpfully and concisely.`;

    const result = await geminiModel.generateContent(prompt);
    const assistantText = result.response.text();

    const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: assistantText,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
    const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        text: "Sorry, I couldn't process that. Please try again.",
    };
    setMessages((prev) => [...prev, errorMessage]);
    console.error('Chat error:', error);
    } finally {
    setIsLoading(false);
    }
}

return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
        <View
            key={msg.id}
            className={`mb-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
            <View
            className={`max-w-xs rounded-lg px-4 py-3 ${
                msg.role === 'user'
                ? 'bg-black'
                : 'bg-gray-200 border-2 border-black'
            }`}
            >
            <Text
                className={`text-base ${
                msg.role === 'user'
                    ? 'text-white'
                    : 'text-black'
                }`}
            >
                {msg.text}
            </Text>
            </View>
        </View>
        ))}

        {isLoading && (
        <View className="items-start mb-4">
            <ActivityIndicator size="small" color="#000" />
        </View>
        )}
    </ScrollView>

    {/* Input area */}
    <View className="border-t-2 border-black px-4 py-4 flex-row gap-2">
        <TextInput
        className="flex-1 border-2 border-black rounded-lg px-4 py-10 text-base"
        placeholder="Ask me about nutrition..."
        value={input}
        onChangeText={setInput}
        editable={!isLoading}
        />
        <Pressable
        onPress={sendMessage}
        disabled={!input.trim() || isLoading}
        className={`border-2 border-black rounded-lg px-4 py-3 items-center justify-center ${
            !input.trim() || isLoading ? 'opacity-30' : ''
        }`}
        >
        <Text className="font-semibold text-base">Send</Text>
        </Pressable>
    </View>
    </KeyboardAvoidingView>
);
}