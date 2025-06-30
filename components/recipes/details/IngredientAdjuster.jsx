// components/recipes/details/IngredientAdjuster.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

const IngredientAdjuster = ({
  adjustedIngredients,
  peopleCount,
  originalPeopleCount,
  increasePeople,
  decreasePeople,
  resetPeopleAndIngredients,
  onIngredientUpdate, // <--- Nueva prop para manejar la actualización
}) => {
  const [editingId, setEditingId] = useState(null); // ID del ingrediente en edición
  const [currentValue, setCurrentValue] = useState(''); // Valor temporal del input

  // Maneja el click en una cantidad para empezar a editar
  const handlePressIngredient = (ingredient) => {
    setEditingId(ingredient.idUtilizado);
    setCurrentValue(String(ingredient.cantidad));
  };

  // Cuando se confirma el cambio en el input (al perder el foco)
  const handleBlur = () => {
    if (editingId && currentValue) {
      onIngredientUpdate(editingId, currentValue);
    }
    setEditingId(null); // Termina la edición
  };

  // Formatea el número de personas para mostrarlo de forma legible
  const formattedPeopleCount = () => {
    // Si es un entero, lo muestra sin decimales. Si no, con 2.
    return peopleCount % 1 === 0 ? peopleCount.toFixed(0) : peopleCount.toFixed(2);
  };

  return (
    <View>
      {(adjustedIngredients || []).map((ing, index) => (
        <View
          key={ing.idUtilizado}
          className={`flex-row justify-between items-center py-3 px-2 border-b border-gray-100 ${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          }`}
        >
          {/* Nombre y observaciones del ingrediente */}
          <View className="flex-1 pr-2">
            <Text className="text-gray-700 text-base">
              {ing.ingrediente?.nombre || "Ingrediente"}
            </Text>
            {ing.observaciones && (
              <Text className="text-gray-400 text-xs">
                {ing.observaciones}
              </Text>
            )}
          </View>
          
          {/* Cantidad y unidad (Editable) */}
          <View className="flex-row items-center">
            {editingId === ing.idUtilizado ? (
              <TextInput
                className="text-amber-600 font-medium text-right text-base border-b-2 border-amber-500 px-2"
                style={{ minWidth: 50 }} // Ancho mínimo para el input
                value={currentValue}
                onChangeText={setCurrentValue}
                keyboardType="numeric"
                onBlur={handleBlur} // Llama a handleBlur cuando el input pierde el foco
                autoFocus={true} // El teclado aparece automáticamente
                onSubmitEditing={handleBlur} // También funciona con la tecla "Enter"
              />
            ) : (
              <TouchableOpacity onPress={() => handlePressIngredient(ing)}>
                <Text className="text-gray-700 font-medium text-right text-base">
                  {ing.cantidad}
                </Text>
              </TouchableOpacity>
            )}
            <Text className="text-gray-700 font-medium text-base ml-1">
              {ing.unidad?.name || ""}
            </Text>
          </View>
        </View>
      ))}

      {/* Controles para ajustar por personas y restablecer */}
      <View className="flex-col gap-4 justify-center items-center mt-6">
        <View className="flex-row items-center bg-gray-100 rounded-full py-2 px-4">
          <TouchableOpacity
            onPress={decreasePeople}
            disabled={peopleCount <= 1}
          >
            <AntDesign name="minus" size={20} color={peopleCount <= 1 ? "#D1D5DB" : "#F59E0B"}/>
          </TouchableOpacity>
          <View className="flex-row items-center mx-4">
            <FontAwesome name="users" size={16} color="#4B5563" />
            <Text className="text-gray-700 font-bold mx-1">×</Text>
            <Text className="text-gray-700 font-bold w-12 text-center">
              {formattedPeopleCount()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={increasePeople}
            disabled={peopleCount >= 10}
          >
            <AntDesign name="plus" size={20} color={peopleCount >= 10 ? "#D1D5DB" : "#F59E0B"}/>
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