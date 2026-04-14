import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/app';
import { supabase } from '../../services/supabase';

export default function DishesPage() {
const router = useRouter();
const tempProfile = useAppStore((s) => s.tempProfile);
const updateTempProfile = useAppStore((s) => s.updateTempProfile);
const setProfile = useAppStore((s) => s.setProfile);
const setFormsCompleted = useAppStore((s) => s.setFormsCompleted);
const setUserId = useAppStore((s) => s.setUserId);

const [input, setInput] = useState('');
const [dishes, setDishes] = useState<string[]>(tempProfile.dishes || []);
const [editingIndex, setEditingIndex] = useState<number | null>(null);
const [editInput, setEditInput] = useState('');
const [isLoading, setIsLoading] = useState(false);

function addDish() {
    const trimmed = input.trim();
    if (trimmed.length === 0) return;

    if (editingIndex !== null) {
    // Edycja
    const newDishes = [...dishes];
    newDishes[editingIndex] = trimmed;
    setDishes(newDishes);
    setEditingIndex(null);
    setEditInput('');
    } else {
    // Dodaj nowe
    if (dishes.length >= 10) {
        Alert.alert('Limit', 'Maximum 10 dishes allowed');
        return;
    }
    setDishes([...dishes, trimmed]);
    }

    setInput('');
}

function removeDish(index: number) {
    setDishes(dishes.filter((_, i) => i !== index));
    if (editingIndex === index) {
    setEditingIndex(null);
    setEditInput('');
    }
}

function startEdit(index: number) {
    setEditInput(dishes[index]);
    setInput(dishes[index]);
}

async function confirm() {
    if (dishes.length === 0) {
    Alert.alert('Required', 'Add at least one favorite dish');
    return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
    // Generuj temp UUID
    const tempUserId = `temp-${Date.now()}-${Math.random().toString(36)}`;

    // Cele już zmapowane jako tablica w goal.tsx
    const goals = (tempProfile.goal || []) as ('lose' | 'muscle' | 'healthy')[];

    // Buduj profil
    const profileData = {
        id: tempUserId,
        name: tempProfile.name || 'User',
        gender: tempProfile.gender || ('male' as const),
        age: tempProfile.age || 25,
        height_cm: tempProfile.height_cm || 170,
        weight_kg: tempProfile.weight_kg || 70,
        goal: goals,
        dishes, // Dodaj ulubione dania
        created_at: new Date().toISOString(),
    };

    // Zapisz do Supabase
    const { error } = await supabase.from('profiles').insert([profileData]);

    if (error) {
        Alert.alert('Error', 'Failed to save profile: ' + error.message);
        setIsLoading(false);
        return;
    }

    // Zaktualizuj Zustand
    updateTempProfile({ dishes });
    setUserId(tempUserId);
    setProfile(profileData as any);
    setFormsCompleted(true);

    // Redirect do home
    router.replace('/');
    } catch (err: any) {
    Alert.alert('Error', err.message || 'Unknown error');
    setIsLoading(false);
    }
}

return (
    <View className="flex-1 px-6 py-12">
    <Text className="text-2xl text-center font-bold mb-6">What's your favorite dishes?</Text>

    {/* Lista kafelków z daniami */}
    {dishes.length > 0 && (
        <ScrollView className="border-2 border-black rounded-xl p-4 mb-6 max-h-56">
        {dishes.map((dish, index) => (
            <View
            key={index}
            className="flex-row justify-between items-center border-2 border-black rounded-xl p-3 mb-2"
            >
            <Text className="flex-1 text-base">{dish}</Text>
            <View className="flex-row gap-2">
                <Pressable
                onPress={() => startEdit(index)}
                className="border-2 border-black rounded-lg px-3 py-2"
                >
                <Text className="text-xs font-semibold">EDIT</Text>
                </Pressable>
                <Pressable
                onPress={() => removeDish(index)}
                className="border-2 border-black rounded-lg px-2 py-2"
                >
                <Text className="text-xs font-semibold">REMOVE</Text>
                </Pressable>
            </View>
            </View>
        ))}
        </ScrollView>
    )}

    {/* Input + Add Button */}
    <View className="flex-row gap-2 mb-6">
        <TextInput
        className="flex-1 border-2 border-black rounded-xl p-4 text-base"
        placeholder="Enter dish name"
        value={input}
        onChangeText={setInput}
        editable={!isLoading}
        />
        <Pressable
        onPress={addDish}
        disabled={input.trim().length === 0 || isLoading || dishes.length >= 10}
        className="border-2 border-black rounded-xl px-4 py-4 items-center justify-center"
        >
        <Text className="font-semibold text-sm">
            SUBMIT
        </Text>
        </Pressable>
    </View>

    {/* Confirm button */}
    <Pressable
        onPress={confirm}
        disabled={dishes.length === 0 || isLoading}
        className={`border-2 border-black rounded-xl p-4 items-center ${
        dishes.length === 0 || isLoading ? 'opacity-30' : ''
        }`}
    >
        <Text className="font-semibold text-base">
        {isLoading ? 'Saving...' : 'Start'}
        </Text>
    </Pressable>

    {/* Info */}
    <Text className="text-xs text-gray-600 text-center mt-4">
        Added: {dishes.length}/10
    </Text>
    </View>
);
}
