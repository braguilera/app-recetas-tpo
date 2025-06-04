import { useEffect, useState } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, FlatList, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, FontAwesome, Ionicons, Entypo  } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatos, getRecipesPaginated } from "api/crud"
import RecipeCardCarrousel from "components/recipes/RecipeCardCarrousel"
import RecipeCardHome from "components/recipes/RecipeCardHome"

const HomeRecipes = () => {
  const navigation = useNavigation()
  const [activeFilter, setActiveFilter] = useState("Todo")
  const insets = useSafeAreaInsets()
  const [recipeList, setRecipeList] = useState({})
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [nameReceta, setNameReceta] = useState("")
  const [userNameReceta, setUserNameReceta] = useState("")
  const [allIngredients, setAllIngredients] = useState([])
  const [ingredientRecipe, setIngredientRecipe] = useState(2)
  const [excludedIngredients, setExcludedIngredients] = useState("")
  const [typeRecipe, setTypeRecipe] = useState("")
  const [searchRating, setSearchRating] = useState("")
  const pageSize = 2

  const categories = ["Todo", "Pollo", "Hamburguesa", "Ensalada", "Pizza"]

  const categoryIcons = {
    Todo: "🍽️",
    Pollo: "🍗",
    Hamburguesa: "🍔",
    Ensalada: "🥗",
    Pizza: "🍕",
  }

  const getPaginationNumbers = () => {
    const totalPages = recipeList.totalPages || 1
    const current = currentPage
    const maxVisible = 1
    
    if (totalPages <= maxVisible + 2) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }
    
    const numbers = []
    
    if (current <= 1) {
      numbers.push(0, 1, 2)
      if (totalPages > 4) {
        numbers.push('...')
        numbers.push(totalPages - 1)
      }
    } else if (current >= totalPages - 2) {
      numbers.push(0)
      if (totalPages > 4) {
        numbers.push('...')
      }
      numbers.push(totalPages - 3, totalPages - 2, totalPages - 1)
    } else {
      numbers.push(0)
      numbers.push('...')
      numbers.push(current - 1, current, current + 1)
      numbers.push('...')
      numbers.push(totalPages - 1)
    }
    
    return numbers
  }

  const fetchRecipes = async (page = 0, reset = false) => {
    if (loading) return
    
    setLoading(true)
    try {
      const params = {
        page: page,
        size: pageSize,
        sort: ["nombreReceta", "asc"],
        name: nameReceta,
        userName:userNameReceta,
        rating:searchRating,
        includeIngredientId:ingredientRecipe,
        excludeIngredientId:excludedIngredients,
        tipoRecetaId:typeRecipe
      }
      
      const data = await getRecipesPaginated(params, 'Error al cargar recetas')
      if (reset) {
        setRecipeList(data)
      } else {
        setRecipeList(prevData => ({
          ...data,
          content: [...(prevData.content || []), ...data.content]
        }))
      }
      
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching recipes:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const getAllIngredients = async () => {
    try{
      const data = await getDatos("ingridient/find-all", "Error al obtener todos los ingredientes")
      setAllIngredients(data)
    } catch (error) {
      console.error("Error fetching ingredients:", error.message)
    }
  }

  const refreshRecipes = () => {
    setCurrentPage(0)
    fetchRecipes(0, true)
  }

  // Limpiar filtros de manera centralizada
  const clearFilters = () => {
    setIngredientRecipe("")
    setExcludedIngredients("")
    setNameReceta("")
    setUserNameReceta("")
  }

  const handleSearchUserName = (text) => {
    setUserNameReceta(text)
  }

  useEffect(() => {
    fetchRecipes(0, true);
    getAllIngredients();
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0)
      fetchRecipes(0, true)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [nameReceta])

  // useEffect para userName
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0)
      fetchRecipes(0, true)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [userNameReceta])

  // Nuevo useEffect para detectar cambios en los filtros de ingredientes
  useEffect(() => {
    if (ingredientRecipe !== undefined) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(0)
        fetchRecipes(0, true)
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [ingredientRecipe, excludedIngredients])

  const handleSearchRecipe = (text) => {
    setNameReceta(text)
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F3E4", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3E4" />
      <ScrollView className="flex-1 pb-40">
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
            data={recipeList.content ? recipeList.content.slice(0, 3) : []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.idReceta}
            renderItem={({ item }) => (
              <View style={{ width: 300, marginRight: 16 }}>
                <RecipeCardCarrousel recipe={item}></RecipeCardCarrousel>
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
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xl font-bold text-gray-800">Explora Nuestro Recetario</Text>
            <TouchableOpacity onPress={refreshRecipes} disabled={loading}>
              <AntDesign 
                name="reload1" 
                size={20} 
                color={loading ? "#9CA3AF" : "#F59E0B"} 
              />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-600 mb-4">
            Encuentra la receta perfecta para cualquier ocasión
            {recipeList.totalElements && (
              <Text className="text-amber-600"> ({recipeList.totalElements} recetas total)</Text>
            )}
          </Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-3 py-2 mb-4">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Buscar recetas por nombre..."
              className="flex-1 ml-2"
              accessibilityLabel="Buscar recetas"
              value={nameReceta}
              onChangeText={handleSearchRecipe}
            />
            <TouchableOpacity onPress={()=> setShowFilter(true)}>
              <View className="bg-amber-400 p-1 rounded">
                <Ionicons name="options" size={24} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Category Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {categories.map((category,index) => (
              <TouchableOpacity
                key={index}
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
          <View className="space-y-4 pb-12">
            {recipeList.content && recipeList.content.length > 0 ? (
              recipeList.content.map((recipe) => (
                <View key={recipe.idReceta} className="w-full">
                  <RecipeCardHome recipe={recipe}></RecipeCardHome>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center">No hay recetas disponibles</Text>
            )}
          </View>

          {/* Pagination Controls */}
          {recipeList.totalPages > 1 && (
            <View className="flex-row justify-center items-center mb-20">
              <View className="bg-white rounded-lg p-2 flex-row items-center shadow-sm">
                {/* Botón anterior */}
                <TouchableOpacity
                  onPress={() => fetchRecipes(currentPage - 1, true)}
                  disabled={currentPage === 0 || loading}
                  className={`w-8 h-8 rounded-md items-center justify-center mr-1 ${
                    currentPage === 0 || loading 
                      ? "hidden" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <AntDesign 
                    name="left" 
                    size={14} 
                    color={currentPage === 0 || loading ? "#D1D5DB" : "#6B7280"} 
                  />
                </TouchableOpacity>

                {/* Números de página */}
                {getPaginationNumbers().map((item, index) => (
                  <View key={index}>
                    {item === '...' ? (
                      <View className="w-8 h-8 items-center justify-center">
                        <Text className="text-gray-400 text-sm">...</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => fetchRecipes(item, true)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-md items-center justify-center mx-0.5 ${
                          currentPage === item
                            ? "bg-amber-400"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <Text className={`text-sm font-medium ${
                          currentPage === item
                            ? "text-white"
                            : "text-gray-700"
                        }`}>
                          {item + 1}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Botón siguiente */}
                <TouchableOpacity
                  onPress={() => fetchRecipes(currentPage + 1, true)}
                  disabled={recipeList.last || loading}
                  className={`w-8 h-8 rounded-md items-center justify-center ml-1 ${
                    recipeList.last || loading 
                      ? "hidden" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <AntDesign 
                    name="right" 
                    size={14} 
                    color={recipeList.last || loading ? "#D1D5DB" : "#6B7280"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
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

      
      {showFilter &&
      <View className="absolute w-full h-full bg-black/50"> 
        <View className="w-4/5 h-full bg-white absolute right-0 shadow-lg">
          <ScrollView className="flex-1 px-6 py-6 mb-32">
            {/* Header */}
            <View className="flex-row justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <Text className="font-bold text-2xl text-gray-800">Filtros</Text>
              <TouchableOpacity 
                onPress={() => setShowFilter(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Entypo name="cross" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Búsqueda por usuario */}
            <View className="mb-8">
              <Text className="font-semibold text-lg text-gray-800 mb-4">Buscar por autor</Text>
              <Text className="text-sm text-gray-600 mb-3">Encuentra recetas de un usuario específico:</Text>
              
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3 py-3">
                <FontAwesome name="user" size={18} color="#9CA3AF" />
                <TextInput
                  placeholder="Buscar por nombre de usuario..."
                  className="flex-1 ml-3 text-gray-800"
                  accessibilityLabel="Buscar por usuario"
                  value={userNameReceta}
                  onChangeText={handleSearchUserName}
                />
                {userNameReceta.length > 0 && (
                  <TouchableOpacity onPress={() => setUserNameReceta("")}>
                    <Entypo name="cross" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              
              {userNameReceta.length > 0 && (
                <View className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <Text className="text-sm text-amber-800">
                    Buscando recetas de: <Text className="font-semibold">"{userNameReceta}"</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Ingredientes que DEBE tener */}
            <View className="mb-8">
              <Text className="font-semibold text-lg text-gray-800 mb-4">Ingredientes requeridos</Text>
              <Text className="text-sm text-gray-600 mb-3">Selecciona un ingrediente que debe estar en la receta:</Text>
              
              <View className="flex-row flex-wrap">
                <TouchableOpacity
                  onPress={() => setIngredientRecipe("")}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                    ingredientRecipe === "" 
                      ? "bg-amber-400 border-amber-400" 
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text className={`text-sm ${
                    ingredientRecipe === "" 
                      ? "text-white font-medium" 
                      : "text-gray-700"
                  }`}>
                    Todos
                  </Text>
                </TouchableOpacity>
                
                {allIngredients.map(ingredient => (
                  <TouchableOpacity
                    key={ingredient.idIngrediente}
                    onPress={() => setIngredientRecipe(ingredient.idIngrediente)}
                    className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                      ingredientRecipe === ingredient.idIngrediente 
                        ? "bg-amber-400 border-amber-400" 
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text className={`text-sm ${
                      ingredientRecipe === ingredient.idIngrediente 
                        ? "text-white font-medium" 
                        : "text-gray-700"
                    }`}>
                      {ingredient.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Ingredientes que NO debe tener */}
            <View className="mb-8">
              <Text className="font-semibold text-lg text-gray-800 mb-4">Ingredientes excluidos</Text>
              <Text className="text-sm text-gray-600 mb-3">Selecciona ingredientes que NO quieres en la receta:</Text>
              
              <View className="flex-row flex-wrap">
                {allIngredients.map(ingredient => (
                  <TouchableOpacity
                    key={`exclude-${ingredient.idIngrediente}`}
                    onPress={() => {setExcludedIngredients(ingredient.idIngrediente)}}
                    className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                      excludedIngredients === ingredient.idIngrediente 
                        ? "bg-red-400 border-red-400" 
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text className={`text-sm ${
                      excludedIngredients === ingredient.idIngrediente 
                        ? "text-white font-medium" 
                        : "text-gray-700"
                    }`}>
                      {ingredient.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botones de acción */}
            <View className="border-t border-gray-200 pt-6 pb-16">
              <View className="flex-row gap-8 space-x-3">
                <TouchableOpacity
                  onPress={clearFilters}
                  className="flex-1 bg-gray-100 py-3 rounded-lg"
                >
                  <Text className="text-center text-gray-700 font-medium">Limpiar filtros</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    setShowFilter(false)
                    setCurrentPage(0)
                    fetchRecipes(0, true)
                  }}
                  className="flex-1 bg-amber-400 py-3 rounded-lg"
                >
                  <Text className="text-center text-white font-medium">Aplicar filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      }

    </View>
  )
}

export default HomeRecipes