import React from 'react';
import { View, Text } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

const RecipeInfoOverview = ({ author, portions, peopleCount, averageRating }) => {
  return (
    <View className="flex-row items-center justify-around mb-4">
      <View className="flex-row items-center">
        <FontAwesome name="user" size={14} color="#9CA3AF" />
        <Text className="text-sm text-gray-500 ml-1">
          Por {author}
        </Text>
      </View>
      <View className="w-1 h-1 bg-gray-300 rounded-full" />
      <View className="flex-row items-center">
        <AntDesign name="piechart" size={14} color="#9CA3AF" />
        <Text className="text-sm text-gray-500 ml-1">
          {portions} {portions === 1 ? "poción" : "porciones"}
        </Text>
      </View>
      <View className="w-1 h-1 bg-gray-300 rounded-full" />
      <View className="flex-row items-center">
        <FontAwesome name="users" size={14} color="#9CA3AF" />
        <Text className="text-sm text-gray-500 ml-1">
          {peopleCount} {peopleCount === 1 ? "persona" : "personas"}
        </Text>
      </View>
      <View className="w-1 h-1 bg-gray-300 rounded-full" />
      <View className="flex-row items-center">
        <AntDesign name="star" size={14} color="#F59E0B" />
        <Text className="text-sm text-amber-500 ml-1">{averageRating}</Text>
      </View>
    </View>
  );
};

export default RecipeInfoOverview;