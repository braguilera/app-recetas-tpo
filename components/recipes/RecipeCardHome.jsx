import React from 'react'
import { AntDesign, FontAwesome } from "@expo/vector-icons"
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import RetrieveMediaFile from 'components/utils/RetrieveMediaFile'

const RecipeCardHome = ({recipe}) => {
const navigation = useNavigation()

  return (
    <TouchableOpacity
        key={recipe.idReceta}
        className="flex-row mb-4 p-2 rounded-xl  bg-white w-full"
        onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.idReceta, rating:recipe.averageRating })}
    >
        <View className="w-28 h-28 relative">
        <RetrieveMediaFile imageUrl={recipe.fotoPrincipal}></RetrieveMediaFile>
        <Text className="absolute top-1 left-1 font-bold text-amber-500 text-sm bg-amber-100 px-2 py-1 rounded-lg">{recipe.tipoRecetaDescripcion}</Text>
        </View>
        <View className="flex-1 p-3">
        <View className="flex-row justify-between items-center mb-1">
            <Text className="text-lg font-bold">{recipe.nombreReceta}</Text>
            <View className="flex-row items-center">
            <AntDesign name="star" size={16} color="#F59E0B" />
            <Text className="ml-1 text-amber-500 font-medium">{recipe.averageRating}</Text>
            </View>
        </View>
        <Text className="text-gray-600 text-sm" numberOfLines={2}>
            Descripción breve de la receta que se muestra aquí para dar una idea del contenido.
        </Text>
        <View className="flex-row items-center">
            <View className="flex-row items-center mr-4">
            <FontAwesome name="user" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1">Por {recipe.userNickname}</Text>
            </View>
            {/*<View className="flex-row items-center">
            <AntDesign name="piechart" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1">{recipe.porciones}</Text>
            </View>
            <View className="flex-row items-center">
            <AntDesign name="team" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1">{recipe.cantidadPersonas}</Text>
            </View>*/}
        </View>
        </View>
    </TouchableOpacity>
  )
}

export default RecipeCardHome
