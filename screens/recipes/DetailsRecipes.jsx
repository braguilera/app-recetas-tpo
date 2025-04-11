"use client"

import { useState } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, StatusBar } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import recetas from "../../test/recipes"

const DetailsRecipes = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { recipeId } = route.params || {}
  const insets = useSafeAreaInsets()

  // Find the recipe by ID
  const recipe = recetas.find((r) => r.idReceta === recipeId) || recetas[0]

  // State for active tab
  const [activeTab, setActiveTab] = useState("ingredientes")

  // State for number of people
  const [peopleCount, setPeopleCount] = useState(2)

  // Calculate average rating
  const ratings = recipe.calificaciones || []
  const avgRating =
    ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating.puntuacion, 0) / ratings.length : 0

  // Function to get meal type based on recipe type
  const getMealType = (tipo) => {
    switch (tipo) {
      case "Principal":
        return "Almuerzo"
      case "Entrada":
        return "Entrada"
      case "Postre":
        return "Postre"
      default:
        return "Cena"
    }
  }

  // Function to calculate ingredient amount based on people count
  const calculateAmount = (baseAmount, baseCount = 4) => {
    const ratio = peopleCount / baseCount
    const newAmount = baseAmount * ratio

    // Format number to avoid too many decimals
    if (Number.isInteger(newAmount)) {
      return newAmount
    } else {
      return Math.round(newAmount * 10) / 10
    }
  }

  // Function to increase people count
  const increasePeople = () => {
    if (peopleCount < 10) {
      setPeopleCount(peopleCount + 1)
    }
  }

  // Function to decrease people count
  const decreasePeople = () => {
    if (peopleCount > 1) {
      setPeopleCount(peopleCount - 1)
    }
  }

  // Function to get user ID safely
  const getUserId = (user) => {
    return user && user.idUsuario ? user.idUsuario : "default"
  }

  // Function to get user alias safely
  const getUserAlias = (user) => {
    return user && user.alias ? user.alias : "Usuario"
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
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
              className="bg-amber-400 w-10 h-10 rounded-full items-center justify-center"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Volver atrás"
            >
              <AntDesign name="arrowleft" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white w-10 h-10 rounded-full items-center justify-center"
              accessibilityLabel="Guardar receta"
            >
              <AntDesign name="book" size={20} color="#F59E0B" />
            </TouchableOpacity>
          </View>

          {/* Recipe Tags */}
          <View className="absolute bottom-4 right-4 flex-row">
            <TouchableOpacity className="bg-white w-8 h-8 rounded-full items-center justify-center mr-2">
              <MaterialCommunityIcons name="leaf" size={18} color="#22C55E" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white w-8 h-8 rounded-full items-center justify-center mr-2">
              <MaterialCommunityIcons name="wheat" size={18} color="#F59E0B" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white w-8 h-8 rounded-full items-center justify-center">
              <Ionicons name="flame" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recipe Info */}
        <View className="p-4">
          <Text className="text-amber-500 font-medium">{getMealType(recipe.tipoReceta)}</Text>
          <Text className="text-3xl font-bold text-gray-800 mb-2">{recipe.titulo}</Text>

          <View className="flex-row items-center mb-4">
            <FontAwesome name="user" size={14} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1">Por {recipe.usuario ? recipe.usuario.alias : "Usuario"}</Text>
            <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
            <AntDesign name="clockcircleo" size={14} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1">15 min</Text>
            <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
            <AntDesign name="star" size={14} color="#F59E0B" />
            <Text className="text-sm text-amber-500 ml-1">{avgRating.toFixed(1)}</Text>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-gray-200 mb-4">
            <TouchableOpacity
              className={`py-2 px-4 ${activeTab === "ingredientes" ? "border-b-2 border-amber-400" : ""}`}
              onPress={() => setActiveTab("ingredientes")}
            >
              <Text className={`font-medium ${activeTab === "ingredientes" ? "text-amber-500" : "text-gray-500"}`}>
                Ingredientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-2 px-4 ${activeTab === "instrucciones" ? "border-b-2 border-amber-400" : ""}`}
              onPress={() => setActiveTab("instrucciones")}
            >
              <Text className={`font-medium ${activeTab === "instrucciones" ? "text-amber-500" : "text-gray-500"}`}>
                Instrucciones
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-2 px-4 ${activeTab === "calificaciones" ? "border-b-2 border-amber-400" : ""}`}
              onPress={() => setActiveTab("calificaciones")}
            >
              <Text className={`font-medium ${activeTab === "calificaciones" ? "text-amber-500" : "text-gray-500"}`}>
                Calificaciones
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ingredients Tab */}
          {activeTab === "ingredientes" && (
            <View>
              {recipe.ingredientes.map((ingrediente, index) => (
                <View
                  key={ingrediente.idIngredienteReceta}
                  className={`flex-row justify-between py-3 px-2 border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <Text className="text-gray-700">{ingrediente.nombre}</Text>
                  <Text className="text-gray-700 font-medium">
                    {calculateAmount(ingrediente.cantidad)} {ingrediente.unidadMedida}
                  </Text>
                </View>
              ))}

              {/* People Count Selector */}
              <View className="flex-row justify-center items-center mt-6 bg-gray-100 rounded-full py-2 px-4 self-center">
                <TouchableOpacity onPress={decreasePeople} disabled={peopleCount <= 1}>
                  <AntDesign name="minus" size={20} color={peopleCount <= 1 ? "#D1D5DB" : "#F59E0B"} />
                </TouchableOpacity>
                <View className="flex-row items-center mx-4">
                  <FontAwesome name="user" size={16} color="#4B5563" />
                  <Text className="text-gray-700 font-bold mx-1">×</Text>
                  <Text className="text-gray-700 font-bold">{peopleCount}</Text>
                </View>
                <TouchableOpacity onPress={increasePeople} disabled={peopleCount >= 10}>
                  <AntDesign name="plus" size={20} color={peopleCount >= 10 ? "#D1D5DB" : "#F59E0B"} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Instructions Tab */}
          {activeTab === "instrucciones" && (
            <View>
              {recipe.pasos.map((paso, index) => (
                <View
                  key={paso.orden}
                  className={`mb-4 p-4 rounded-lg ${index % 2 === 0 ? "bg-white border border-gray-100" : "bg-gray-50"}`}
                >
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
          )}

          {/* Ratings Tab */}
          {activeTab === "calificaciones" && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Text className="text-3xl font-bold text-amber-500 mr-2">{avgRating.toFixed(1)}</Text>
                  <View>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <AntDesign
                          key={star}
                          name="star"
                          size={16}
                          color={star <= Math.round(avgRating) ? "#F59E0B" : "#E5E7EB"}
                        />
                      ))}
                    </View>
                    <Text className="text-gray-500 text-xs">{ratings.length} calificaciones</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-amber-400 py-2 px-4 rounded-lg">
                  <Text className="text-white font-medium">Calificar</Text>
                </TouchableOpacity>
              </View>

              {recipe.calificaciones.map((calificacion, index) => (
                <View
                  key={calificacion.idCalificacion}
                  className={`p-4 mb-3 rounded-lg ${index % 2 === 0 ? "bg-white border border-gray-100" : "bg-gray-50"}`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: `https://picsum.photos/seed/user${getUserId(calificacion.usuario)}/100` }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <View>
                        <Text className="font-medium text-gray-800">{getUserAlias(calificacion.usuario)}</Text>
                        <View className="flex-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <AntDesign
                              key={star}
                              name="star"
                              size={12}
                              color={star <= calificacion.puntuacion ? "#F59E0B" : "#E5E7EB"}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text className="text-gray-700">{calificacion.comentarioCalificacion}</Text>
                </View>
              ))}

              {/* Comments Section */}
              <Text className="text-xl font-bold text-gray-800 mt-6 mb-4">Comentarios</Text>
              {recipe.comentarios.map((comentario, index) => (
                <View
                  key={comentario.idComentario}
                  className={`p-4 mb-3 rounded-lg ${index % 2 === 0 ? "bg-white border border-gray-100" : "bg-gray-50"}`}
                >
                  <View className="flex-row items-center mb-2">
                    <Image
                      source={{ uri: `https://picsum.photos/seed/user${getUserId(comentario.usuario)}/100` }}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <View>
                      <Text className="font-medium text-gray-800">{getUserAlias(comentario.usuario)}</Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(comentario.fechaComentario).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-700">{comentario.contenido}</Text>
                </View>
              ))}

              <TouchableOpacity className="bg-gray-100 p-4 rounded-lg mt-2 flex-row items-center">
                <AntDesign name="message1" size={20} color="#9CA3AF" />
                <Text className="text-gray-500 ml-2">Añadir un comentario...</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View
        className="p-4 border-t border-gray-200 bg-white"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }}
      >
        <TouchableOpacity className="bg-amber-400 py-3 rounded-xl items-center" accessibilityLabel="Comenzar a cocinar">
          <Text className="text-white font-bold text-lg">Comenzar a Cocinar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default DetailsRecipes
