import { useEffect, useState } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, FlatList, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatos } from "api/crud"

const HomeRecipes = () => {
  const navigation = useNavigation()
  const [activeFilter, setActiveFilter] = useState("Todo")
  const insets = useSafeAreaInsets()
  const [recipeList, setRecipeList] = useState({})

  const categories = ["Todasdo", "Pollo", "Hamburguesa", "Ensalada", "Pizza"]

  const categoryIcons = {
    Todo: "🍽️",
    Pollo: "🍗",
    Hamburguesa: "🍔",
    Ensalada: "🥗",
    Pizza: "🍕",
  }

      
  const fetchRecipes = async () => {
    try {
      const data = await getDatos('recipe/page', 'Error al cargar recetas')
      setRecipeList(data)
      console.log("Recetas cargadas", data)
    } catch (error) {
      console.error("Error fetching recipes:", error.message)
    }

  }

    useEffect(() => {
    fetchRecipes();
  },[])

  const renderRecipeCard = (recipe, news = false) => {
  if (news) {
    return (
      <TouchableOpacity
        key={recipe.id}
        className="mb-4 w-full rounded-xl overflow-hidden bg-slate-500"
        onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.id })}
      >
        <Image
          source={{ uri: `https://picsum.photos/seed/${recipe.id}/400/300` }}
          className="w-full h-40"
          accessibilityLabel={`Imagen de ${recipe.recipeName}`}
        />
        <View className="p-3">
          <Text className="text-lg font-bold text-white">{recipe.recipeName}</Text>
          <Text className="text-gray-300 text-sm mb-2" numberOfLines={2}>
            {/*recipe.descripcion*/} Descripción breve de la receta que se muestra aquí para dar una idea del contenido.
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
  } else {
    return (
      <TouchableOpacity
        key={recipe.id}
        className="flex-row mb-4 rounded-xl overflow-hidden bg-white w-full"
        onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.id })}
      >
        <Image
          source={{ uri: `https://picsum.photos/seed/${recipe.id}/200/200` }}
          className="w-28 h-28"
          accessibilityLabel={`Imagen de ${recipe.recipeName}`}
        />
        <View className="flex-1 p-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-lg font-bold">{recipe.recipeName}</Text>
            <View className="flex-row items-center">
              <AntDesign name="star" size={16} color="#F59E0B" />
              <Text className="ml-1 text-amber-500 font-medium">{recipe.averageRating}</Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
            {/*recipe.descripcion*/} Descripción breve de la receta que se muestra aquí para dar una idea del contenido.
          </Text>
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-4">
              <FontAwesome name="user" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 ml-1">Por {recipe.authorName}</Text>
            </View>
            <View className="flex-row items-center">
              <AntDesign name="clockcircleo" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 ml-1">15 min</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
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
          <TouchableOpacity
            onPress={() => navigation.navigate("AuthStack", { screen: "Login" })}
          >
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
              className="w-10 h-10 rounded-full"
              accessibilityLabel="Perfil de usuario"
            />
          </TouchableOpacity>
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
            data={recipeList.content}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ width: 300, marginRight: 16 }}>
                {renderRecipeCard(item, true)}
              </View>
            )}
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

          {/* Recipe Cards */}
          <View className="space-y-4">
            {recipeList.content && recipeList.content.length > 0 ? (
              recipeList.content.map((recipe) => (
                <View key={recipe.id} className="w-full">
                  {renderRecipeCard(recipe)}
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center">No hay recetas disponibles</Text>
            )}
            </View>
        </View>
      </ScrollView>

      {/* Create recipe */}
      <TouchableOpacity
        className="absolute bottom-20 right-6 bg-amber-400 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate("CreateRecipe")}
        accessibilityLabel="Añadir nueva receta"
        style={{ bottom: insets.bottom + 70 }}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  )
}

export default HomeRecipes
