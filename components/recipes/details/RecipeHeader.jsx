import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import RetrieveMediaFile from '../../utils/RetrieveMediaFile'; 

const RecipeHeader = ({ imageUrl, recipeType, isFavorite, logeado, onToggleFavorite }) => {
  const navigation = useNavigation();

  return (
    <View className="relative h-60">
      <RetrieveMediaFile imageUrl={imageUrl} />
      <View className="absolute top-0 left-0 right-0 p-4 flex-row justify-between">
        <TouchableOpacity
          className="bg-amber-400 w-10 h-10 rounded-full items-center justify-center"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver atrás"
        >
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>
        {logeado && (
          <TouchableOpacity
            className="bg-white w-10 h-10 rounded-full items-center justify-center"
            onPress={onToggleFavorite}
            accessibilityLabel={isFavorite ? "Eliminar de favoritos" : "Guardar receta"}
          >
            {isFavorite ? (
              <AntDesign name="heart" size={20} color="#F59E0B" />
            ) : (
              <AntDesign name="hearto" size={20} color="#F59E0B" />
            )}
          </TouchableOpacity>
        )}
      </View>
      <View className="absolute bottom-4 right-4 bg-amber-400 rounded-full">
        <Text className="text-white px-3 py-1 font-medium">
          {recipeType}
        </Text>
      </View>
    </View>
  );
};

export default RecipeHeader;