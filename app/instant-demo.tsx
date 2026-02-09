import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { db } from '../src/lib/instant';

export default function InstantDemo() {
  const { isLoading, error, data } = db.useQuery({ todos: {} });
  const [text, setText] = useState('');

  const addTodo = () => {
    if (!text.trim()) return;
    db.transact(
      db.tx.todos[crypto.randomUUID()].update({
        text,
        done: false,
        createdAt: Date.now(),
      })
    );
    setText('');
  };

  const toggleTodo = (todo: { id: string; done: boolean }) => {
    db.transact(db.tx.todos[todo.id].update({ done: !todo.done }));
  };

  const deleteTodo = (todo: { id: string }) => {
    db.transact(db.tx.todos[todo.id].delete());
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4 dark:bg-black">
        <Text className="text-red-500">Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4 dark:bg-black">
      <Stack.Screen options={{ title: 'InstantDB Demo' }} />

      <View className="mb-4 flex-row space-x-2">
        <TextInput
          accessibilityLabel="Todo input"
          accessibilityHint="Enter a new todo item"
          className="flex-1 rounded border border-gray-300 p-2 text-black dark:border-gray-700 dark:text-white"
          placeholder="Add a todo..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
        />
        <Pressable
          accessibilityRole="button"
          onPress={addTodo}
          className="justify-center rounded bg-blue-500 px-4"
        >
          <Text className="font-bold text-white">Add</Text>
        </Pressable>
      </View>

      <FlashList
        data={data?.todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center border-b border-gray-200 py-3 dark:border-gray-800">
            <Pressable
              accessibilityRole="button"
              onPress={() => toggleTodo(item)}
              className="flex-1"
            >
              <Text
                className={`text-lg ${item.done ? 'text-gray-400 line-through' : 'text-black dark:text-white'}`}
              >
                {item.text}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => deleteTodo(item)}
              className="ml-2"
            >
              <Text className="text-red-500">Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
