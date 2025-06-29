import React from 'react'
import { AntDesign, FontAwesome } from "@expo/vector-icons"
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import RetrieveMediaFile from 'components/utils/RetrieveMediaFile'

const RecipeCardCarrousel = ({recipe}) => {
    const navigation = useNavigation()
    
    return (
        <TouchableOpacity
            key={recipe.idReceta}
            className="mb-4 w-full h-60 rounded-xl relative overflow-hidden bg-slate-100"
            onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.idReceta })}
        >
            <RetrieveMediaFile imageUrl={recipe.fotoPrincipal}></RetrieveMediaFile>
            <View className="p-3 absolute w-[95%] left-2 bottom-2 rounded-lg bg-gray-50">
            <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-700">{recipe.nombreReceta}</Text>
                <View className="flex-row items-center">
                    <AntDesign name="star" size={16} color="#F59E0B" />
                    <Text className="ml-1 text-amber-500 font-medium">{recipe.averageRating}</Text>
                </View>
            </View>
                <Text className="text-gray-400 text-sm mb-2" numberOfLines={2}>{recipe.descripcionReceta}</Text>
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center mr-4">
                    <FontAwesome name="user" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 ml-1">Por {recipe.userNickname}</Text>
                </View>
                <View className="w-1 h-1 bg-gray-300 rounded-full" />
                <View className="flex-row items-center">
                    <AntDesign name="piechart" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 ml-1">{recipe.porciones}</Text>
                </View>
                <View className="w-1 h-1 bg-gray-300 rounded-full" />
                <View className="flex-row items-center">
                    <FontAwesome name="users" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 ml-1">{recipe.cantidadPersonas}</Text>
                </View>
            </View>
            </View>
        </TouchableOpacity>
    )
}

export default RecipeCardCarrousel
