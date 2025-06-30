import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CommentForm = ({ newComment, setNewComment, onHandleComment }) => {
  return (
    <View className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <Text className="text-gray-700 font-bold text-lg mb-2">
        Deja tu comentario
      </Text>
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">
          Calificación (estrellas)
        </Text>
        <View className="bg-gray-100 rounded-lg px-3">
          <Picker
            selectedValue={newComment.calificacion}
            onValueChange={(itemValue) =>
              setNewComment((prev) => ({
                ...prev,
                calificacion: itemValue,
              }))
            }
            dropdownIconColor="#F59E0B"
          >
            <Picker.Item
              label="Selecciona una puntuación"
              value=""
            />
            <Picker.Item label="⭐ 1" value="1" />
            <Picker.Item label="⭐⭐ 2" value="2" />
            <Picker.Item label="⭐⭐⭐ 3" value="3" />
            <Picker.Item label="⭐⭐⭐⭐ 4" value="4" />
            <Picker.Item label="⭐⭐⭐⭐⭐ 5" value="5" />
          </Picker>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">
          Comentario
        </Text>
        <TextInput
          value={newComment.comentarios}
          onChangeText={(text) =>
            setNewComment((prev) => ({ ...prev, comentarios: text }))
          }
          placeholder="Escribe aquí tu opinión..."
          multiline
          className="bg-gray-100 rounded-lg px-2 py-4 text-gray-800"
        />
      </View>

      <TouchableOpacity
        className="bg-amber-400 py-3 rounded-full items-center shadow-sm"
        onPress={onHandleComment}
      >
        <Text className="text-white font-semibold">
          Enviar Comentario
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CommentForm;