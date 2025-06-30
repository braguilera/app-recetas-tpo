import React from 'react';
import { View, Text } from 'react-native';

const CommentList = ({ comments, logeado }) => {
  if (!comments || comments.length === 0) {
    return (
      <View className="items-center justify-center p-10">
        <Text className="text-gray-400 text-base italic text-center">
          Aún no hay calificaciones para esta receta.
          {logeado && (
            <Text className="text-amber-500">
              {" "}
              ¡Sé el primero en dejar tu opinión!
            </Text>
          )}
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-8">
      {comments.map((r, i) => (
        <View
          key={i} 
          className={`mb-4 p-4 rounded-xl shadow-sm ${
            i % 2 === 0 ? "bg-white" : "bg-gray-50"
          }`}
        >
          <Text className="text-gray-400 text-sm mb-1">
            “{r.nombreUsuario}”
          </Text>
          <Text className="text-gray-700 font-semibold mb-1">
            “{r.comentarios}”
          </Text>
          <Text className="text-sm text-gray-400">
            Puntaje:{" "}
            <Text className="text-amber-500 font-bold">
              {r.calificacion}
            </Text>
          </Text>
        </View>
      ))}
    </View>
  );
};

export default CommentList;