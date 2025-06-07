import { useContext, useEffect, useState } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, StatusBar, TextInput } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, FontAwesome } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatos, getDatosWithAuth } from "api/crud"
import { Picker } from "@react-native-picker/picker"
import { Contexto } from "contexto/Provider"

const DetailsRecipes = () => {
  const { logeado} = useContext(Contexto); 
  
  const navigation = useNavigation()
  const route = useRoute()
  const { recipeId, rating } = route.params || {}
  const insets = useSafeAreaInsets()

  const [recipe, setRecipe] = useState({})
  const [activeTab, setActiveTab] = useState("ingredientes")
  const [peopleCount, setPeopleCount] = useState(2)
  const [comentario, setComentario] = useState("")
  const [puntuacion, setPuntuacion] = useState("5")

  const fetchRecipe = async () => {
    try {
      const data = await getDatosWithAuth(`recipe/${recipeId}`)
      setRecipe(data)
    } catch (error) {
      console.error("Error fetching recipes:", error.message)
    }
  }

  useEffect(() => {
    fetchRecipe()
  }, [])

  const ratings = recipe.calificaciones || []
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating.puntuacion, 0) / ratings.length
    : 0

  const increasePeople = () => {
    if (peopleCount < 10) setPeopleCount(peopleCount + 1)
  }

  const decreasePeople = () => {
    if (peopleCount > 1) setPeopleCount(peopleCount - 1)
  }

  return (
    <View style={{ paddingTop: insets.top }} className="pb-20 flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView className="flex-1 pb-40">
        {/* Imagen Header */}
        <View className="relative">
          <Image
            source={{ uri: `https://picsum.photos/seed/${recipe.idReceta}/800/500` }}
            className="w-full h-64"
            accessibilityLabel={`Imagen de ${recipe.nombreReceta}`}
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
          <View className="absolute bottom-4 right-4 bg-amber-400 rounded-full">
            <Text className="text-white px-3 py-1 font-medium">
              {recipe.tipoRecetaDescripcion}
            </Text>
          </View>
        </View>

        {/* Info Receta */}
        <View className="p-4">
          <Text className="text-3xl font-bold text-gray-800">{recipe.nombreReceta}</Text>
          <Text className="text-lg text-gray-400 mb-2">{recipe.descripcionReceta}</Text>

          <View className="flex-row items-center justify-around mb-4">
            <View className="flex-row items-center">
              <FontAwesome name="user" size={14} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">Por {recipe.nombreUsuario}</Text>
            </View>
            <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
            <View className="flex-row items-center">
              <FontAwesome name="users" size={14} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">{recipe.porciones}</Text>
            </View>
            <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
            <View className="flex-row items-center">
              <AntDesign name="star" size={14} color="#F59E0B" />
              <Text className="text-sm text-amber-500 ml-1">{rating}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-gray-200 mb-4">
            {["ingredientes", "instrucciones", "calificaciones"].map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-amber-400" : ""}`}
                onPress={() => setActiveTab(tab)}
              >
                <Text className={`font-medium ${activeTab === tab ? "text-amber-500" : "text-gray-500"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ingredientes */}
          {activeTab === "ingredientes" && (
            <View>
              {(recipe.usedIngredients || []).map((ing, index) => (
                <View
                  key={ing.idUtilizado}
                  className={`flex-row justify-between py-3 px-2 border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <View>
                    <Text className="text-gray-700">{ing.ingrediente?.nombre || "Ingrediente desconocido"}</Text>
                    {ing.observaciones && (
                      <Text className="text-gray-400 text-xs">{ing.observaciones}</Text>
                    )}
                  </View>
                  <Text className="text-gray-700 font-medium text-right">
                    {ing.cantidad} {ing.unidad?.name || ""}
                  </Text>
                </View>
              ))}
              {/* Selector de personas */}
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

          {/* Instrucciones */}
          {activeTab === "instrucciones" && (
            <View>
              {(recipe.steps || []).map((paso, index) => (
                <View
                  key={paso.id}
                  className={`mb-4 p-4 rounded-lg ${index % 2 === 0 ? "bg-white border border-gray-100" : "bg-gray-50"}`}
                >
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 rounded-full bg-amber-400 items-center justify-center mr-3">
                      <Text className="text-white font-bold">{paso.stepNumber}</Text>
                    </View>
                    <Text className="text-lg font-medium text-gray-800">Paso {paso.stepNumber}</Text>
                  </View>
                  <Text className="text-gray-700 ml-11">{paso.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Calificaciones */}
          {activeTab === "calificaciones" && (
            <View className="mb-8">
              {/* Lista de calificaciones */}
              {recipe.calification?.length === 0 ? (
                <View className="items-center justify-center p-10">
                  <Text className="text-gray-400 text-base italic text-center">
                    🍽️ Aún no hay calificaciones para esta receta.
                    <Text className="text-amber-500"> ¡Sé el primero en dejar tu opinión!</Text>
                  </Text>
                </View>
              ) : (
                (recipe.calification || []).map((r, i) => (
                  <View
                    key={i}
                    className={`mb-4 p-4 rounded-xl shadow-sm ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <Text className="text-gray-400 text-sm mb-1">“{r.nombreUsuario}”</Text>
                    <Text className="text-gray-700 font-semibold mb-1">“{r.comentarios}”</Text>
                    <Text className="text-sm text-gray-400">
                      Puntaje: <Text className="text-amber-500 font-bold">{r.calificacion}</Text>
                    </Text>
                  </View>
                ))
              )}

              {/* Formulario funcional para nueva calificación */}
              {logeado &&
                <View className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <Text className="text-gray-700 font-bold text-lg mb-2">Deja tu comentario</Text>
                  {/* Calificación */}
                  <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">Calificación (estrellas)</Text>
                    <View className="bg-gray-100 rounded-lg px-3 py-1">
                      <Picker
                        selectedValue={puntuacion}
                        onValueChange={(itemValue) => setPuntuacion(itemValue)}
                        dropdownIconColor="#F59E0B"
                      >
                        <Picker.Item label="⭐ 1" value="1" />
                        <Picker.Item label="⭐⭐ 2" value="2" />
                        <Picker.Item label="⭐⭐⭐ 3" value="3" />
                        <Picker.Item label="⭐⭐⭐⭐ 4" value="4" />
                        <Picker.Item label="⭐⭐⭐⭐⭐ 5" value="5" />
                      </Picker>
                    </View>
                  </View>

                  {/* Comentario */}
                  <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">Comentario</Text>
                    <TextInput
                      value={comentario}
                      onChangeText={setComentario}
                      placeholder="Escribe aquí tu opinión..."
                      multiline
                      className="bg-gray-100 rounded-lg px-2 py-4 text-gray-800"
                    />
                  </View>

                  {/* Botón Enviar */}
                  <TouchableOpacity
                    className="bg-amber-400 py-3 rounded-full items-center shadow-sm"
                    onPress={() => {
                      const nuevoComentario = {
                        comentario,
                        puntuacion: parseInt(puntuacion),
                        idReceta: recipe.idReceta,
                        fecha: new Date().toISOString(),
                      }
                      console.log("Comentario enviado:", JSON.stringify(nuevoComentario, null, 2))
                    }}
                  >
                    <Text className="text-white font-semibold">Enviar Comentario</Text>
                  </TouchableOpacity>
                </View>
              }

            </View>
          )}


        </View>
      </ScrollView>
    </View>
  )
}

export default DetailsRecipes
