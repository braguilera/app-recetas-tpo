import React from 'react'
import { AntDesign } from "@expo/vector-icons"
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const RecipeCardCarrousel = ({recipe}) => {
    const navigation = useNavigation()
    
  return (
    <TouchableOpacity
        key={recipe.idReceta}
        className="mb-4 w-full rounded-xl overflow-hidden bg-slate-500"
        onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.idReceta })}
    >
        <Image
        source={{ uri: `https://picsum.photos/seed/${recipe.idReceta}/400/300` }}
        className="w-full h-40"
        accessibilityLabel={`Imagen de ${recipe.recipeName}`}
        />
        <View className="p-3">
        <Text className="text-lg font-bold text-white">{recipe.recipeName}</Text>
        <Text className="text-gray-300 text-sm mb-2" numberOfLines={2}>
            Descripción breve de la receta que se muestra aquí para dar una idea del contenido.
        </Text>
        <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
            <AntDesign name="star" size={16} color="#F59E0B" />
            <Text className="ml-1 text-amber-400 font-medium">{recipe.averageRating}</Text>
            </View>
            <View className="flex-row items-center">
            <AntDesign name="clockcircleo" size={14} color="#D1D5DB" />
            <Text className="text-xs text-gray-300 ml-1">15 min</Text>
            </View>
        </View>
        </View>
    </TouchableOpacity>
  )
}

export default RecipeCardCarrousel
