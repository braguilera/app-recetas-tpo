import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

/**
 * Componente para mostrar y permitir la edición de una cantidad de ingrediente.
 * Al tocar el texto, se convierte en un TextInput.
 *
 * @param {object} props - Propiedades del componente.
 * @param {string} props.value - La cantidad actual del ingrediente (string).
 * @param {function} props.onValueChange - Callback cuando la cantidad es modificada (newValue: string).
 * @param {string} props.unit - La unidad del ingrediente (ej: "gramos", "ml", "unidad").
 * @param {string} props.name - El nombre del ingrediente.
 */
const IngredientInput = ({ value, onValueChange, unit, name }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());

    const handleEditStart = () => {
        setIsEditing(true);
    };

    const handleEditEnd = () => {
        setIsEditing(false);
        const parsedValue = parseFloat(inputValue);
        // Solo llamar a onValueChange si el valor cambió y es un número válido
        if (!isNaN(parsedValue) && parsedValue > 0 && parseFloat(value) !== parsedValue) {
            onValueChange(parsedValue.toString()); // Convertir a string para consistencia
        } else {
            setInputValue(value.toString()); // Revertir si no es válido o no cambió
        }
        Keyboard.dismiss(); // Ocultar el teclado al finalizar la edición
    };

    return (
        <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
            <View className="flex-row items-center flex-1 pr-2">
                <AntDesign name="caretright" size={12} color="#F59E0B" className="mr-2" />
                <Text className="text-gray-700 font-medium flex-1" numberOfLines={1}>{name}</Text>
            </View>
            <TouchableOpacity onPress={handleEditStart} disabled={isEditing}>
                {isEditing ? (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        className="flex-row items-center"
                    >
                        <TextInput
                            className="bg-white border border-amber-300 rounded-md px-2 py-1 text-base text-gray-800 text-right w-20"
                            keyboardType="numeric"
                            value={inputValue}
                            onChangeText={setInputValue}
                            onBlur={handleEditEnd} // Cuando el input pierde el foco
                            onSubmitEditing={handleEditEnd} // Cuando se presiona "Enter" en el teclado
                            autoFocus
                        />
                        <Text className="ml-1 text-gray-600 text-base">{unit}</Text>
                    </KeyboardAvoidingView>
                ) : (
                    <View className="flex-row items-center">
                        <Text className="text-gray-800 font-bold text-base text-right">{value}</Text>
                        <Text className="ml-1 text-gray-600 text-base">{unit}</Text>
                        <AntDesign name="edit" size={14} color="#9CA3AF" className="ml-2" />
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default IngredientInput;
