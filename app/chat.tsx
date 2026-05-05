import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { geminiModel } from '../services/gemini';
import { useAppStore } from '../store/app';
import type { ChatMessage } from '../types';

const getSystemPrompt = (profile: any): string => {
if (!profile) {
    return `You are a friendly and knowledgeable nutrition assistant. Help users with:
- Diet advice and healthy eating tips
- Recipe suggestions
- Nutritional information
- Healthy habits and lifestyle tips
- Motivation and support for their fitness goals

Keep responses concise and practical. Be encouraging and supportive.`;
}

return `You are a friendly and knowledgeable nutrition assistant for ${profile.name}.

User Profile:
- Age: ${profile.age}, Gender: ${profile.gender}
- Height: ${profile.height_cm}cm, Weight: ${profile.weight_kg}kg
- Goals: ${profile.goal.join(', ')}
- Favorite dishes: ${profile.dishes.join(', ')}

Help them with:
- Diet advice and healthy eating tips tailored to their goals
- Recipe suggestions using their favorite ingredients
- Nutritional information relevant to their metrics
- Healthy habits and lifestyle tips
- Motivation and support for their fitness goals

Keep responses concise and practical. Be encouraging and supportive. Reference their goals and preferences when relevant.`;
};

export default function ChatScreen() {
const profile = useAppStore((s) => s.profile);
const storedMessages = useAppStore((s) => s.chatMessages);
const addChatMessage = useAppStore((s) => s.addChatMessage);

const initialMessages: ChatMessage[] = storedMessages.length > 0
    ? storedMessages
    : [{
        id: '0',
        role: 'assistant',
        text: "Hi! I'm your nutrition assistant. Ask me anything about healthy eating, recipes, or fitness habits!",
    }];

const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const scrollViewRef = useRef<ScrollView>(null);

useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
}, [messages]);

async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
    const conversationHistory = messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');

    const systemPrompt = getSystemPrompt(profile);

    const prompt = `${systemPrompt}

Previous conversation:
${conversationHistory}

User: ${userMessage.text}

Respond helpfully and concisely.`;

    const result = await geminiModel.generateContent(prompt);
    const assistantText = result.response.text();

    const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: assistantText,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    addChatMessage(assistantMessage);
    } catch (error: any) {
    const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        text: "Sorry, I couldn't process that. Please try again.",
    };
    setMessages((prev) => [...prev, errorMessage]);
    addChatMessage(errorMessage);
    console.error('Chat error:', error);
    } finally {
    setIsLoading(false);
    }
}

return (
    <KeyboardAvoidingView
    behavior="padding"
    className="flex-1 bg-white"
    >
    <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

    <View className="border-t-2 border-black px-4 py-3 flex-row gap-2 bg-white">
        <TextInput
        className="flex-1 border-2 border-black rounded-lg px-3 text-base"
        style={{ height: 48, textAlignVertical: 'center' }}
        placeholder="Ask me about nutrition..."
        value={input}
        onChangeText={setInput}
        editable={!isLoading}
        />
        <Pressable
        onPress={sendMessage}
        disabled={!input.trim() || isLoading}
        className={`border-2 border-black rounded-lg px-4 py-2 items-center justify-center ${
            !input.trim() || isLoading ? 'opacity-30' : ''
        }`}
        >
        <Text className="font-semibold text-base">Send</Text>
        </Pressable>
    </View>
    </KeyboardAvoidingView>
);
}