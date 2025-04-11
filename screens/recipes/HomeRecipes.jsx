"use client"

import { useState } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, FlatList, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import recetas from "../../test/recipes"

const HomeRecipes = () => {
  const navigation = useNavigation()
  const [activeFilter, setActiveFilter] = useState("Todo")
  const insets = useSafeAreaInsets()

  // Get the latest 3 recipes
  const latestRecipes = [...recetas].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)).slice(0, 3)

  // Function to get a random recipe
  const getRandomRecipe = () => {
    const randomIndex = Math.floor(Math.random() * recetas.length)
    return recetas[randomIndex]
  }

  // Filter categories
  const categories = ["Todo", "Pollo", "Hamburguesa", "Ensalada", "Pizza"]

  // Icons for categories
  const categoryIcons = {
    Todo: "🍽️",
    Pollo: "🍗",
    Hamburguesa: "🍔",
    Ensalada: "🥗",
    Pizza: "🍕",
  }

  const renderRecipeCard = (recipe, isNew = false, isRandom = false) => {
    // Calculate average rating
    const ratings = recipe.calificaciones || []
    const avgRating =
      ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating.puntuacion, 0) / ratings.length : 0

    return (
      <TouchableOpacity
        key={recipe.idReceta}
        className={`mb-4 rounded-xl overflow-hidden ${isRandom ? "bg-amber-50 p-4 flex-row items-center" : "bg-white"}`}
        onPress={() => navigation.navigate("StackRecipes", { recipeId: recipe.idReceta })}
      >
        {isRandom ? (
          <>
            <View className="mr-4 bg-amber-100 p-3 rounded-full">
              <AntDesign name="star" size={24} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold mb-1">¡Descubre algo nuevo!</Text>
              <Text className="text-sm text-gray-600">Encuentra una receta sorpresa para inspirarte</Text>
            </View>
            <AntDesign name="arrowright" size={24} color="#F59E0B" />
          </>
        ) : (
          <>
            <View className="relative">
              <Image
                source={{ uri: `https://picsum.photos/seed/${recipe.idReceta}/400/300` }}
                className="w-full h-48 rounded-t-xl"
                accessibilityLabel={`Imagen de ${recipe.titulo}`}
              />
              {isNew && (
                <View className="absolute top-2 right-2 bg-amber-400 px-2 py-1 rounded-md">
                  <Text className="text-xs font-bold text-white">Nueva</Text>
                </View>
              )}
              <TouchableOpacity
                className="absolute top-2 right-2"
                onPress={() => {
                  /* Add to favorites */
                }}
                accessibilityLabel="Guardar receta"
              >
                {!isNew && <AntDesign name="heart" size={24} color="white" />}
              </TouchableOpacity>
            </View>
            <View className="p-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-lg font-bold">{recipe.titulo}</Text>
                <View className="flex-row items-center">
                  <AntDesign name="star" size={16} color="#F59E0B" />
                  <Text className="ml-1 text-amber-500 font-medium">{avgRating.toFixed(1)}</Text>
                </View>
              </View>
              <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                {recipe.descripcion}
              </Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-4">
                  <FontAwesome name="user" size={14} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500 ml-1">Por {recipe.usuario.alias}</Text>
                </View>
                <View className="flex-row items-center">
                  <AntDesign name="clockcircleo" size={14} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500 ml-1">15 min</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F3E4", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3E4" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 bg-amber-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-red-600 mr-1 items-center justify-center">
              <Text className="text-white text-xl font-bold">R</Text>
            </View>
            <Text className="text-xl font-bold text-gray-800">YOURI</Text>
          </View>
          <TouchableOpacity>
            <Image
              source={{ uri: "https://picsum.photos/200" }}
              className="w-10 h-10 rounded-full"
              accessibilityLabel="Perfil de usuario"
            />
          </TouchableOpacity>
        </View>

        {/* User Greeting */}
        <View className="p-4 flex-row items-center">
          <Image source={{ uri: "https://picsum.photos/seed/user/200" }} className="w-16 h-16 rounded-full mr-4" />
          <View>
            <Text className="text-xl font-bold text-gray-800">Hola, Julian Bonavota</Text>
            <Text className="text-gray-500">Empecemos a cocinar</Text>
          </View>
        </View>

        {/* Latest Recipes */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Ultimas Recetas</Text>
            <View className="bg-amber-100 px-2 py-1 rounded-md">
              <Text className="text-xs font-medium text-amber-800">Nuevas</Text>
            </View>
          </View>

          {/* Recipe Carousel */}
          <FlatList
            data={latestRecipes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.idReceta.toString()}
            renderItem={({ item }) => <View className="w-300 mr-4">{renderRecipeCard(item, true)}</View>}
            className="mb-4"
          />

          {/* Pagination Dots */}
          <View className="flex-row justify-center mb-4">
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${index === 0 ? "bg-amber-400" : "bg-gray-300"}`}
              />
            ))}
          </View>
        </View>

        {/* Random Recipe */}
        <View className="px-4 mb-6">{renderRecipeCard(getRandomRecipe(), false, true)}</View>

        {/* Recipe Collection */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800 mb-1">Explora Nuestro Recetario</Text>
          <Text className="text-sm text-gray-600 mb-4">Encuentra la receta perfecta para cualquier ocasión</Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-3 py-2 mb-4">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Buscar recetas por nombre..."
              className="flex-1 ml-2"
              accessibilityLabel="Buscar recetas"
            />
            <TouchableOpacity>
              <View className="bg-amber-400 p-1 rounded">
                <AntDesign name="right" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Category Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${
                  activeFilter === category ? "bg-amber-400" : "bg-white border border-gray-200"
                }`}
                onPress={() => setActiveFilter(category)}
                accessibilityLabel={`Filtrar por ${category}`}
                accessibilityState={{ selected: activeFilter === category }}
              >
                <Text className={`mr-1 ${activeFilter === category ? "text-white" : "text-gray-700"}`}>
                  {categoryIcons[category]}
                </Text>
                <Text className={`${activeFilter === category ? "text-white font-medium" : "text-gray-700"}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* All Recipes */}
          {recetas.map((recipe) => renderRecipeCard(recipe))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-20 right-6 bg-amber-400 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          /* Add new recipe */
        }}
        accessibilityLabel="Añadir nueva receta"
        style={{ bottom: insets.bottom + 70 }}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  )
}

export default HomeRecipes
