"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Image, StatusBar, FlatList } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const SaveRecipe = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  const { categoryName = "Favoritos", categoryId = 1 } = route.params || {}

  const [savedRecipes, setSavedRecipes] = useState([
    {
      id: 1,
      title: "Primer receta guardada",
      image: "https://picsum.photos/seed/recipe1/300/200",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Segunda receta guardada",
      image: "https://picsum.photos/seed/recipe2/300/200",
      date: "2024-01-10",
    },
    {
      id: 3,
      title: "Tercer receta guardada",
      image: "https://picsum.photos/seed/recipe3/300/200",
      date: "2024-01-05",
    },
    {
      id: 4,
      title: "Cuarta receta guardada",
      image: "https://picsum.photos/seed/recipe4/300/200",
      date: "2023-12-28",
    },
  ])

  const handleRemoveRecipe = (recipeId) => {
    setSavedRecipes(savedRecipes.filter((recipe) => recipe.id !== recipeId))
  }

  const renderRecipeItem = ({ item }) => (
    <View className="flex-row bg-white rounded-xl mb-4 overflow-hidden border border-gray-100">
      <TouchableOpacity
        className="flex-row flex-1"
        onPress={() => navigation.navigate("DetailsRecipes", { recipeId: item.id })}
      >
        <Image source={{ uri: item.image }} className="w-20 h-20" />
        <View className="flex-1 p-3 justify-center">
          <Text className="text-gray-800 font-medium">{item.title}</Text>
          <Text className="text-gray-500 text-xs mt-1">Guardada el {item.date}</Text>
        </View>
      </TouchableOpacity>

      <View className="border-l border-gray-100 justify-center">
        <TouchableOpacity className="px-3 py-2" onPress={() => handleRemoveRecipe(item.id)}>
          <Text className="text-xs text-center text-amber-500 mb-1">Quitar</Text>
          <Text className="text-xs text-center text-amber-500">Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Mis recetas guardadas</Text>
      </View>

      <View className="flex-1 p-4">
        {savedRecipes.length > 0 ? (
          <FlatList
            data={savedRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <AntDesign name="inbox" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-center">No tienes recetas guardadas en esta categoría</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default SaveRecipe
