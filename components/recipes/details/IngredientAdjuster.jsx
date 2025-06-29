// components/IngredientAdjuster.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

const IngredientAdjuster = ({
  adjustedIngredients,
  peopleCount,
  originalPeopleCount,
  increasePeople,
  decreasePeople,
  resetPeopleAndIngredients,
}) => {
  return (
    <View>
      {(adjustedIngredients || []).map((ing, index) => (
        <View
          key={ing.idUtilizado} // Asumo que idUtilizado es único para cada ingrediente
          className={`flex-row justify-between py-3 px-2 border-b border-gray-100 ${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          }`}
        >
          <View>
            <Text className="text-gray-700">
              {ing.ingrediente?.nombre || "Ingrediente desconocido"}
            </Text>
            {ing.observaciones && (
              <Text className="text-gray-400 text-xs">
                {ing.observaciones}
              </Text>
            )}
          </View>
          <Text className="text-gray-700 font-medium text-right">
            {ing.cantidad} {ing.unidad?.name || ""}
          </Text>
        </View>
      ))}
      <View className="flex-col gap-4 justify-center items-center mt-6">
        <View className="flex-row items-center bg-gray-100 rounded-full py-2 px-4">
          <TouchableOpacity
            onPress={decreasePeople}
            disabled={peopleCount <= 1}
          >
            <AntDesign
              name="minus"
              size={20}
              color={peopleCount <= 1 ? "#D1D5DB" : "#F59E0B"}
            />
          </TouchableOpacity>
          <View className="flex-row items-center mx-4">
            <FontAwesome name="users" size={16} color="#4B5563" />
            <Text className="text-gray-700 font-bold mx-1">×</Text>
            <Text className="text-gray-700 font-bold">
              {peopleCount}
            </Text>
          </View>
          <TouchableOpacity
            onPress={increasePeople}
            disabled={peopleCount >= 10}
          >
            <AntDesign
              name="plus"
              size={20}
              color={peopleCount >= 10 ? "#D1D5DB" : "#F59E0B"}
            />
          </TouchableOpacity>
        </View>
        {peopleCount !== originalPeopleCount && (
          <TouchableOpacity
            onPress={resetPeopleAndIngredients}
            className="ml-4 bg-amber-200 rounded-full py-2 px-4"
          >
            <Text className="text-amber-700 font-semibold text-sm">
              Restablecer
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default IngredientAdjuster;