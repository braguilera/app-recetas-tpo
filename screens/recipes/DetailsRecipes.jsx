import { ScrollView, Text, View, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, FontAwesome, Feather } from "@expo/vector-icons"
import recetas from "../../test/recipes"

const DetailsRecipes = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { recipeId } = route.params || {}

  // Find the recipe by ID
  const recipe = recetas.find((r) => r.idReceta === recipeId) || recetas[0]

  // Calculate average rating
  const ratings = recipe.calificaciones || []
  const avgRating =
    ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating.puntuacion, 0) / ratings.length : 0

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header Image */}
        <View className="relative">
          <Image
            source={{ uri: `https://picsum.photos/seed/${recipe.idReceta}/800/500` }}
            className="w-full h-64"
            accessibilityLabel={`Imagen de ${recipe.titulo}`}
          />
          <View className="absolute top-0 left-0 right-0 p-4 flex-row justify-between">
            <TouchableOpacity
              className="bg-white w-10 h-10 rounded-full items-center justify-center"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Volver atrás"
            >
              <AntDesign name="arrowleft" size={20} color="#333" />
            </TouchableOpacity>
            <View className="flex-row">
              <TouchableOpacity
                className="bg-white w-10 h-10 rounded-full items-center justify-center mr-2"
                accessibilityLabel="Compartir receta"
              >
                <Feather name="share-2" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white w-10 h-10 rounded-full items-center justify-center"
                accessibilityLabel="Guardar receta"
              >
                <AntDesign name="heart" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recipe Info */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold text-gray-800">{recipe.titulo}</Text>
            <View className="bg-amber-100 px-2 py-1 rounded-md">
              <Text className="text-xs font-medium text-amber-800">{recipe.tipoReceta}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center mr-4">
              <FontAwesome name="user" size={16} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">Por {recipe.usuario.alias}</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <AntDesign name="clockcircleo" size={16} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">15 min</Text>
            </View>
            <View className="flex-row items-center">
              <AntDesign name="star" size={16} color="#F59E0B" />
              <Text className="text-sm text-amber-500 ml-1">{avgRating.toFixed(1)}</Text>
            </View>
          </View>

          <Text className="text-gray-700 mb-6">{recipe.descripcion}</Text>

          {/* Ingredients */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Ingredientes</Text>
            <View className="bg-gray-50 rounded-xl p-4">
              {recipe.ingredientes.map((ingrediente, index) => (
                <View key={ingrediente.idIngredienteReceta} className="flex-row items-center mb-3">
                  <View className="w-2 h-2 rounded-full bg-amber-400 mr-3" />
                  <Text className="text-gray-700 flex-1">
                    {ingrediente.nombre} - {ingrediente.cantidad} {ingrediente.unidadMedida}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Steps */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Preparación</Text>
            {recipe.pasos.map((paso) => (
              <View key={paso.orden} className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-full bg-amber-400 items-center justify-center mr-3">
                    <Text className="text-white font-bold">{paso.orden}</Text>
                  </View>
                  <Text className="text-lg font-medium text-gray-800">Paso {paso.orden}</Text>
                </View>
                <Text className="text-gray-700 ml-11">{paso.descripcionPaso}</Text>
              </View>
            ))}
          </View>

          {/* Comments */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Comentarios</Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-amber-500 mr-1">Ver todos</Text>
                <AntDesign name="right" size={16} color="#F59E0B" />
              </TouchableOpacity>
            </View>

            {recipe.comentarios.map((comentario) => (
              <View key={comentario.idComentario} className="bg-gray-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-center mb-2">
                  <Image
                    source={{ uri: "https://picsum.photos/seed/user/100" }}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <View>
                    <Text className="font-medium text-gray-800">{comentario.usuario.alias}</Text>
                    <Text className="text-xs text-gray-500">
                      {new Date(comentario.fechaComentario).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-700">{comentario.contenido}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity className="bg-amber-400 py-3 rounded-xl items-center" accessibilityLabel="Comenzar a cocinar">
          <Text className="text-white font-bold text-lg">Comenzar a Cocinar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default DetailsRecipes
