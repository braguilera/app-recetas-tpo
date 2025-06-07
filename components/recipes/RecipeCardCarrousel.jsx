import React from 'react'
import { AntDesign, FontAwesome } from "@expo/vector-icons"
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const RecipeCardCarrousel = ({recipe}) => {
    const navigation = useNavigation()
    
    return (
        <TouchableOpacity
            key={recipe.idReceta}
            className="mb-4 w-full rounded-xl relative overflow-hidden bg-slate-100"
            onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.idReceta })}
        >
            <Image
            source={{ uri: `https://picsum.photos/seed/${recipe.idReceta}/400/300` }}
            className="w-full h-60"
            accessibilityLabel={`Imagen de ${recipe.nombreReceta}`}
            />
            <View className="p-3 absolute w-[95%] left-2 bottom-2 rounded-lg bg-gray-50">
                <Text className="text-lg font-bold text-gray-700">{recipe.nombreReceta}</Text>
                <Text className="text-gray-400 text-sm mb-2" numberOfLines={2}>Descripción breve de la receta que se muestra aquí para dar una idea del contenido.</Text>
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center mr-4">
                    <FontAwesome name="user" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 ml-1">Por {recipe.nombreUsuario}</Text>
                </View>
                <View className="flex-row items-center">
                    <AntDesign name="star" size={16} color="#F59E0B" />
                    <Text className="ml-1 text-amber-400 font-medium">{recipe.averageRating}</Text>
                </View>
            </View>
            </View>
        </TouchableOpacity>
    )
}

export default RecipeCardCarrousel
