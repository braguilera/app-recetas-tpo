import { useContext, useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, FlatList, StatusBar, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, FontAwesome, Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDatosWithAuth, getRecipesPaginatedWithAuth } from "api/crud";
import RecipeCardCarrousel from "components/recipes/RecipeCardCarrousel";
import RecipeCardHome from "components/recipes/RecipeCardHome";
import { Contexto } from "contexto/Provider";
import IngredientSelector from "components/recipes/IngredientSelector";
import UserAvatar from "components/common/UserAvatar";

const HomeRecipes = () => {
  const { logeado } = useContext(Contexto);

  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState("");
  const insets = useSafeAreaInsets();
  const [recipeList, setRecipeList] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [nameReceta, setNameReceta] = useState("");
  const [userNameReceta, setUserNameReceta] = useState("");
  const [allIngredients, setAllIngredients] = useState([]);
  const [lastThreeIngredients, setLastThreeIngredients] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [ingredientRecipe, setIngredientRecipe] = useState("");
  const [excludedIngredients, setExcludedIngredients] = useState("");
  const [typeRecipe, setTypeRecipe] = useState("");
  const [searchRating, setSearchRating] = useState("");

  const [sortType, setSortType] = useState("");
  const [directionType, setDirectionType] = useState("");

  const pageSize = 2;

  const getPaginationNumbers = () => {
    const totalPages = recipeList.totalPages || 1;
    const current = currentPage;
    const maxVisible = 1;

    if (totalPages <= maxVisible + 2) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const numbers = [];

    if (current <= 1) {
      numbers.push(0, 1, 2);
      if (totalPages > 4) {
        numbers.push('...');
        numbers.push(totalPages - 1);
      }
    } else if (current >= totalPages - 2) {
      numbers.push(0);
      if (totalPages > 4) {
        numbers.push('...');
      }
      numbers.push(totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      numbers.push(0);
      numbers.push('...');
      numbers.push(current - 1, current, current + 1);
      numbers.push('...');
      numbers.push(totalPages - 1);
    }

    return numbers;
  };

  const fetchRecipes = async (page = 0, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = {
        page: page,
        size: pageSize,
        sortBy: sortType,
        direction: directionType,
        name: nameReceta,
        userName: userNameReceta,
        minAverageRating: searchRating,
        includeIngredientId: ingredientRecipe !== "" ? ingredientRecipe : undefined,
        excludeIngredientId: excludedIngredients,
        tipoRecetaId: typeRecipe,
      };

      const data = await getRecipesPaginatedWithAuth(params, 'Error al cargar recetas');
      if (reset) {
        setRecipeList(data);
      } else {
        setRecipeList(prevData => ({
          ...data,
          content: [...(prevData.content || []), ...data.content]
        }));
      }

      setCurrentPage(page);
      getLastThreeRecipes();
    } catch (error) {
      console.log("Error fetching recipes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllTypes = async () => {
    try {
      const data = await getDatosWithAuth("recipe/types", "Error al obtener todos los tipos");
      console.log(data);
      setAllTypes(data);
    } catch (error) {
      console.log("Error fetching ingredients:", error.message);
    }
  };

  const getLastThreeRecipes = async () => {
    try {
      const data = await getDatosWithAuth("recipe/last-three", "Error al obtener las ultimas 3 recetas");
      setLastThreeIngredients(data);
    } catch (error) {
      console.log("Error fetching ultimas 3 recetas:", error.message);
    }
  };

  const getAllIngredients = async () => {
    try {
      const data = await getDatosWithAuth("ingridient/find-all", "Error al obtener todos los ingredientes");
      setAllIngredients(data);
    } catch (error) {
      console.log("Error fetching ingredients:", error.message);
    }
  };

  const refreshRecipes = () => {
    setCurrentPage(0);
    getAllIngredients();
    fetchRecipes(0, true);
  };

  const clearFilters = () => {
    setIngredientRecipe("");
    setExcludedIngredients("");
    setNameReceta("");
    setUserNameReceta("");
    setSearchRating("");
    setTypeRecipe("");
    setActiveFilter("");
    setSortType("");
    setDirectionType("");
  };

  const resetSorting = () => {
    setSortType("");
    setDirectionType("");
  };


  const handleSearchUserName = (text) => {
    setUserNameReceta(text);
  };

  useEffect(() => {
    fetchRecipes(0, true);
    getLastThreeRecipes();
    if (logeado) {
      getAllIngredients();
      getAllTypes();
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchRecipes(0, true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [nameReceta]);

  useEffect(() => {
    setCurrentPage(0);
    fetchRecipes(0, true);
  }, [typeRecipe]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchRecipes(0, true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [userNameReceta]);

  useEffect(() => {
    if (ingredientRecipe !== undefined && excludedIngredients !== undefined) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(0);
        fetchRecipes(0, true);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [ingredientRecipe, excludedIngredients]);

  useEffect(() => {
    setCurrentPage(0);
    fetchRecipes(0, true);
  }, [sortType, directionType]);


  const handleSearchRecipe = (text) => {
    setNameReceta(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F3E4", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3E4" />
      <ScrollView className="flex-1 pb-40">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 bg-amber-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-yellow-500 mr-1 items-center justify-center">
              <Text className="text-white text-xl font-bold">R</Text>
            </View>
            <Text className="text-xl font-bold text-gray-800">YOURI</Text>
          </View>
          {logeado ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("ProfileStack", { screen: "ProfileScreen" })}
            >
              <UserAvatar
                sizeClasses="w-12 h-12" 
                textSizeClasses="text-xl"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("AuthStack", { screen: "Login" })}
              className="px-3 py-1 bg-amber-400 rounded-md"
            >
              <Text className="text-white font-medium">Iniciar Sesión</Text>
            </TouchableOpacity>
          )}

        </View>

        <View className="p-4">
          {/* Latest Recipes */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Ultimas Recetas</Text>
            <View className="bg-amber-100 px-2 py-1 rounded-md">
              <Text className="text-xs font-medium text-amber-800">Nuevas</Text>
            </View>
          </View>

          <FlatList
            data={lastThreeIngredients}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.idReceta}
            renderItem={({ item }) => (
              <View style={{ width: 300, marginRight: 16 }}>
                <RecipeCardCarrousel recipe={item}></RecipeCardCarrousel>
              </View>
            )}
          />

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

          <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-3 py-2 mb-4">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Buscar recetas por nombre..."
              className="flex-1 ml-2"
              accessibilityLabel="Buscar recetas"
              value={nameReceta}
              onChangeText={handleSearchRecipe}
            />
            {logeado &&
              <TouchableOpacity onPress={() => setShowFilter(true)}>
                <View className="bg-amber-400 p-1 rounded">
                  <Ionicons name="options" size={24} color="white" />
                </View>
              </TouchableOpacity>
            }
          </View>

          {logeado &&
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <TouchableOpacity
                key={"Todo"}
                className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${activeFilter === "" ? "bg-amber-400" : "bg-white border border-gray-200"
                  }`}
                onPress={() => (setActiveFilter(""), setTypeRecipe(""))}
                accessibilityLabel={`Filtrar por todo`}
                accessibilityState={{ selected: activeFilter === "" }}
              >
                <Text className={`${activeFilter === "" ? "text-white font-medium" : "text-gray-700"}`}>
                  Todo
                </Text>
              </TouchableOpacity>
              {allTypes.map((types, index) => (
                <TouchableOpacity
                  key={index}
                  className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${activeFilter === types.id ? "bg-amber-400" : "bg-white border border-gray-200"
                    }`}
                  onPress={() => (setActiveFilter(types.id), setTypeRecipe(types.id))}
                  accessibilityLabel={`Filtrar por ${types}`}
                  accessibilityState={{ selected: activeFilter === types.id }}
                >
                  <Text className={`${activeFilter === types.id ? "text-white font-medium" : "text-gray-700"}`}>
                    {types.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          }

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

          {/* Pagination */}
          {recipeList.totalPages > 1 && (
            <View className="flex-row justify-center items-center mb-20">
              <View className="bg-white rounded-lg p-2 flex-row items-center shadow-sm">
                <TouchableOpacity
                  onPress={() => fetchRecipes(currentPage - 1, true)}
                  disabled={currentPage === 0 || loading}
                  className={`w-8 h-8 rounded-md items-center justify-center mr-1 ${currentPage === 0 || loading
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
                        className={`w-8 h-8 rounded-md items-center justify-center mx-0.5 ${currentPage === item
                            ? "bg-amber-400"
                            : "bg-gray-50 hover:bg-gray-100"
                          }`}
                      >
                        <Text className={`text-sm font-medium ${currentPage === item
                            ? "text-white"
                            : "text-gray-700"
                          }`}>
                          {item + 1}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => fetchRecipes(currentPage + 1, true)}
                  disabled={recipeList.last || loading}
                  className={`w-8 h-8 rounded-md items-center justify-center ml-1 ${recipeList.last || loading
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
      {logeado &&
        <TouchableOpacity
          className="absolute bottom-20 right-6 bg-amber-400 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => navigation.navigate("CreateRecipe")}
          accessibilityLabel="Añadir nueva receta"
          style={{ bottom: insets.bottom + 70 }}
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      }


      {showFilter &&
        <View className="absolute w-full h-full bg-black/50">
          <View className="w-4/5 h-full bg-white absolute right-0 shadow-lg">
            <ScrollView className="flex-1 px-6 py-6 mb-32">
              <View className="flex-row justify-between items-center pb-4 border-b border-gray-200 mb-6">
                <Text className="font-bold text-2xl text-gray-800">Filtros</Text>
                <TouchableOpacity
                  onPress={() => setShowFilter(false)}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Entypo name="cross" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Sort news */}
              <View className="mb-4">
                <Text className="font-semibold text-lg text-gray-800 mb-2">Ordenar por fecha</Text>
                <Text className="text-sm text-gray-600 mb-3">Organiza las recetas de la más reciente a la más antigua, o viceversa:</Text>

                <View className="flex-row items-center rounded-lg px-3 py-3">
                  <TouchableOpacity
                    onPress={() => { setSortType("idReceta"); setDirectionType("asc"); }}
                    className={`flex-1 mr-2 px-4 py-2 rounded-full flex-row items-center justify-center ${sortType === "idReceta" && directionType === "asc" ? "bg-blue-500" : "bg-white border border-gray-200"
                      }`}
                  >
                    <Text className={`text-sm ${sortType === "idReceta" && directionType === "asc" ? "text-white font-medium" : "text-gray-700"}`}>
                      Más antiguas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setSortType("idReceta"); setDirectionType("desc"); }}
                    className={`flex-1 px-4 py-2 rounded-full flex-row items-center justify-center ${sortType === "idReceta" && directionType === "desc" ? "bg-green-500" : "bg-white border border-gray-200"
                      }`}
                  >
                    <Text className={`text-sm ${sortType === "idReceta" && directionType === "desc" ? "text-white font-medium" : "text-gray-700"}`}>
                      Más nuevas
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sort Alph */}
              <View className="mb-4">
                <Text className="font-semibold text-lg text-gray-800 mb-2">Ordenar alfabéticamente</Text>
                <Text className="text-sm text-gray-600 mb-3">Organiza las recetas por el nombre:</Text>

                <View className="flex-row items-center rounded-lg px-3 py-3">
                  <TouchableOpacity
                    onPress={() => { setSortType(""); setDirectionType("asc"); }}
                    className={`flex-1 mr-2 px-4 py-2 rounded-full flex-row items-center justify-center ${sortType === "" && directionType === "asc" ? "bg-purple-500" : "bg-white border border-gray-200"
                      }`}
                  >
                    <MaterialCommunityIcons
                      name="sort-alphabetical-descending-variant"
                      size={20}
                      color={sortType === "" && directionType === "asc" ? "white" : "#6B7280"}
                      style={{ marginRight: 5 }}
                    />
                    <Text className={`text-sm ${sortType === "" && directionType === "asc" ? "text-white font-medium" : "text-gray-700"}`}>
                      Nombre (A-Z)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setSortType(""); setDirectionType("desc"); }}
                    className={`flex-1 px-4 py-2 rounded-full flex-row items-center justify-center ${sortType === "" && directionType === "desc" ? "bg-red-500" : "bg-white border border-gray-200"
                      }`}
                  >
                    <MaterialCommunityIcons
                      name="sort-alphabetical-ascending-variant"
                      size={20}
                      color={sortType === "" && directionType === "desc" ? "white" : "#6B7280"}
                      style={{ marginRight: 5 }}
                    />
                    <Text className={`text-sm ${sortType === "" && directionType === "desc" ? "text-white font-medium" : "text-gray-700"}`}>
                      Nombre (Z-A)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/*Sort Alphabetically by User Name */}
              <View className="mb-4">
                <Text className="font-semibold text-lg text-gray-800 mb-2">Ordenar por autor</Text>
                <Text className="text-sm text-gray-600 mb-3">Organiza las recetas por el nombre del autor:</Text>

                <View className="flex-row items-center rounded-lg px-3 py-3">
                  <TouchableOpacity
                    onPress={() => { setSortType("usuario"); setDirectionType("asc"); }}
                    className={`flex-1 mr-2 px-4 py-2 rounded-full flex-row items-center justify-center ${sortType === "usuario" && directionType === "asc" ? "bg-cyan-500" : "bg-white border border-gray-200"
                      }`}
                  >
                    <FontAwesome
                      name="sort-alpha-asc"
                      size={16}
                      color={sortType === "usuario" && directionType === "asc" ? "white" : "#6B7280"}
                      style={{ marginRight: 8 }}
                    />
                    <Text className={`text-sm ${sortType === "usuario" && directionType === "asc" ? "text-white font-medium" : "text-gray-700"}`}>
                      Autor (A-Z)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setSortType("usuario"); setDirectionType("desc"); }}
                    className={`flex-1 px-4 py-2 rounded-full flex-row items-center justify-center ${sortType === "usuario" && directionType === "desc" ? "bg-teal-500" : "bg-white border border-gray-200"
                      }`}
                  >
                    <FontAwesome
                      name="sort-alpha-desc"
                      size={16}
                      color={sortType === "usuario" && directionType === "desc" ? "white" : "#6B7280"}
                      style={{ marginRight: 8 }}
                    />
                    <Text className={`text-sm ${sortType === "usuario" && directionType === "desc" ? "text-white font-medium" : "text-gray-700"}`}>
                      Autor (Z-A)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={resetSorting}
                className="w-full bg-gray-100 py-3 rounded-lg my-3 flex-row items-center justify-center"
              >
                <MaterialCommunityIcons name="sort-variant-remove" size={20} color="#6B7280" style={{ marginRight: 5 }} />
                <Text className="text-center text-gray-700 font-medium">Restablecer ordenamientos</Text>
              </TouchableOpacity>


              {/* Search User */}
              <View className="mb-8">
                <Text className="font-semibold text-lg text-gray-800 ">Buscar por autor</Text>
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

              {/* Ingrediente include */}
              <IngredientSelector
                title="Ingredientes requeridos"
                description="Selecciona un ingrediente que debe estar en la receta:"
                ingredients={allIngredients}
                selectedValue={ingredientRecipe}
                onSelect={setIngredientRecipe}
                type="required"
              />

              {/* Ingrediente exclude */}
              <IngredientSelector
                title="Ingredientes excluidos"
                description="Selecciona ingredientes que NO quieres en la receta:"
                ingredients={allIngredients}
                selectedValue={excludedIngredients}
                onSelect={setExcludedIngredients}
                type="excluded"
              />

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
                      setShowFilter(false);
                      setCurrentPage(0);
                      fetchRecipes(0, true);
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
  );
};

export default HomeRecipes;