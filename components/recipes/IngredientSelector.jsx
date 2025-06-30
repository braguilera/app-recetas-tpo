import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const IngredientSelector = ({
  title,
  description,
  ingredients,
  selectedValue,
  onSelect,
  type, 
}) => {
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const initialLimit = 9;

  const displayedIngredients = showAllIngredients
    ? ingredients
    : ingredients.slice(0, initialLimit);

  const hasMoreIngredients = ingredients.length > initialLimit;

  const isRequired = type === 'required';
  const defaultBgColor = isRequired ? "bg-amber-400" : "bg-blue-400"; 
  const selectedBgColor = isRequired ? "bg-amber-400 border-amber-400" : "bg-red-400 border-red-400"; 
  const defaultTextColor = isRequired ? "text-white" : "text-white";
  const selectedTextColor = isRequired ? "text-white font-medium" : "text-white font-medium";

  return (
    <View className="mb-8">
      <Text className="font-semibold text-lg text-gray-800">{title}</Text>
      <Text className="text-sm text-gray-600 mb-3">{description}</Text>

      <View className="flex-row flex-wrap">
        <TouchableOpacity
          onPress={() => onSelect("")}
          className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
            selectedValue === ""
              ? defaultBgColor + (isRequired ? " border-amber-400" : " border-blue-400")
              : "bg-white border-gray-300"
          }`}
        >
          <Text className={`text-sm ${
            selectedValue === ""
              ? defaultTextColor + " font-medium"
              : "text-gray-700"
          }`}>
            {isRequired ? "Todos" : "Ninguno"}
          </Text>
        </TouchableOpacity>

        {displayedIngredients.map(ingredient => (
          <TouchableOpacity
            key={ingredient.idIngrediente}
            onPress={() => onSelect(ingredient.idIngrediente)}
            className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
              selectedValue === ingredient.idIngrediente
                ? selectedBgColor
                : "bg-white border-gray-300"
            }`}
          >
            <Text className={`text-sm ${
              selectedValue === ingredient.idIngrediente
                ? selectedTextColor
                : "text-gray-700"
            }`}>
              {ingredient.nombre}
            </Text>
          </TouchableOpacity>
        ))}

      </View>
        {hasMoreIngredients && !showAllIngredients && (
          <TouchableOpacity
            onPress={() => setShowAllIngredients(true)}
            className="mr-2 mb-2 px-3 self-center items-center py-2 rounded-full border border-gray-300 bg-gray-100"
          >
            <Text className="text-sm text-gray-700 font-medium">Ver más ({ingredients.length - initialLimit} restantes)</Text>
          </TouchableOpacity>
        )}

        {hasMoreIngredients && showAllIngredients && (
          <TouchableOpacity
            onPress={() => setShowAllIngredients(false)}
            className="mr-2 mb-2 px-3 py-2 self-center items-center rounded-full border border-gray-300 bg-gray-100"
          >
            <Text className="text-sm text-gray-700 font-medium">Ver menos</Text>
          </TouchableOpacity>
        )}
    </View>
  );
};

export default IngredientSelector;