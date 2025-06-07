// components/CreateRecipe.js
import { useEffect, useState, useRef } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatos, postDatos } from "api/crud"
import { Picker } from '@react-native-picker/picker'
import UploadMediaFile from "components/utils/UploadMediaFIle" // Asegúrate de que esta ruta sea correcta

const CreateRecipe = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  const mainImageUploadRef = useRef(null);

  // recipeImage ahora puede almacenar el path si lo necesitas para algo,
  // pero el que se envía a la DB será el uniqueFilename.
  const [recipeImage, setRecipeImage] = useState(null) 
  const [recipeName, setRecipeName] = useState("")
  const [recipeDescription, setRecipeDescription] = useState("")
  const [portions, setPortions] = useState("")
  const [peopleCount, setPeopleCount] = useState("")
  const [selectedTypeRecipe, setSelectedTypeRecipe] = useState("")
  const [allTypeRecipe, setAllTypeRecipe] = useState([])
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "", quantity: "", unit: "" },
    { id: 2, name: "", quantity: "", unit: "" },
  ])
  const [steps, setSteps] = useState([
    { id: 1, description: "", image: null },
    { id: 2, description: "", image: null },
  ])

  const addIngredient = () => {
    const newId = Math.max(...ingredients.map((i) => i.id)) + 1
    setIngredients([...ingredients, { id: newId, name: "", quantity: "", unit: "" }])
  }

  const removeIngredient = (id) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((ingredient) => ingredient.id !== id))
    }
  }

  const updateIngredient = (id, field, value) => {
    setIngredients(
      ingredients.map((ingredient) => (ingredient.id === id ? { ...ingredient, [field]: value } : ingredient)),
    )
  }

  const addStep = () => {
    const newId = Math.max(...steps.map((s) => s.id)) + 1
    setSteps([...steps, { id: newId, description: "", image: null }])
  }

  const removeStep = (id) => {
    if (steps.length > 1) {
      setSteps(steps.filter((step) => step.id !== id))
    }
  }

  const updateStep = (id, field, value) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, [field]: value } : step)))
  }

  const handleImageUpload = (type, id = null) => {
    Alert.alert("Cargar Imagen", "¿Desde dónde quieres cargar la imagen?", [
      { text: "Cámara", onPress: () => simulateImageUpload(type, id, "camera") },
      { text: "Galería", onPress: () => simulateImageUpload(type, id, "gallery") },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const simulateImageUpload = (type, id, source) => {
    const imageUrl = `https://picsum.photos/seed/${Date.now()}/400/300`

    if (type === "step") {
      updateStep(id, "image", imageUrl)
    }
  }

  // Esta función ahora solo es para propósitos de logging si la necesitas,
  // el valor principal para la DB se gestiona en handleSubmitRecipe
  const handleMainRecipeImageUploadComplete = (downloadURL, uniqueFilename) => {
    console.log("UploadMediaFile reportó URL de descarga (opcional para display):", downloadURL);
    console.log("UploadMediaFile reportó Nombre Único (para guardar en DB):", uniqueFilename);
    // Puedes actualizar un estado aquí si necesitas mostrar la imagen en tiempo real
    // sin esperar al submit completo.
    // setRecipeImage(downloadURL); // Si quieres que se muestre en el mismo UploadMediaFile
  };

  const fetchTypesRecipe = async () => {
    try {
      const data = await getDatos("recipe/types")
      setAllTypeRecipe(data)
    } catch (error) {
      console.error("Error fetching recipes:", error.message)
    }
  }

  useEffect(() => {
    fetchTypesRecipe()
  }, [])

  const handleSubmitRecipe = async () => {
    if (!recipeName.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre de la receta")
      return
    }
    if (!recipeDescription.trim()) {
      Alert.alert("Error", "Por favor ingresa la descripción de la receta")
      return
    }

    let finalRecipeImagePath = null; // Variable para almacenar el uniqueFilename
    let finalRecipeImageDownloadURL = null; // Variable para almacenar la downloadURL para setRecipeImage

    if (mainImageUploadRef.current) {
        const currentImageUri = mainImageUploadRef.current.getImageUri();
        if (!currentImageUri) {
            Alert.alert("Error", "Por favor selecciona una imagen principal para la receta.");
            return;
        }

        const uploadResult = await mainImageUploadRef.current.upload(); // Esto ahora devuelve { url, path } o null

        if (uploadResult && uploadResult.url && uploadResult.path) {
            finalRecipeImagePath = uploadResult.path;
            finalRecipeImageDownloadURL = uploadResult.url; // Guarda la URL para mostrar en el componente
            setRecipeImage(finalRecipeImageDownloadURL); // Actualiza el estado para que se vea la imagen en el componente
        } else {
            Alert.alert("Error", "No se pudo subir la imagen principal o obtener su path.");
            return;
        }
    } else {
        Alert.alert("Error", "El componente de subida de imagen no está listo.");
        return;
    }

    const recipeData = {
      nombreReceta: recipeName,
      descripcionReceta: recipeDescription,
      fotoPrincipal: finalRecipeImagePath, // ¡Aquí se usa el uniqueFilename/path!
      porciones: Number.parseInt(portions) || 1,
      cantidadPersonas: Number.parseInt(peopleCount) || 1,
      idUsuario: 2,
      idTipoReceta: Number.parseInt(selectedTypeRecipe)
    }

    try {
      await postDatos("recipe/create", recipeData, "Error al crear receta")

      console.log("Datos de la receta:", JSON.stringify(recipeData, null, 2))

      Alert.alert("¡Receta creada!", "La receta se ha creado exitosamente. Revisa la consola para ver los datos.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      console.error("Error creating recipe:", error.message)
      Alert.alert("Error", `No se pudo crear la receta: ${error.message}`)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }} className="pb-20">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Crear receta</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Imagen de la receta */}
        <View className="p-4">
          <UploadMediaFile
            ref={mainImageUploadRef}
            onUploadComplete={handleMainRecipeImageUploadComplete}
            initialImageUri={recipeImage} // Pasamos la downloadURL para que se muestre correctamente
          />
        </View>

        {/* Información básica */}
        <View className="px-4 mb-6">
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Ingrese Nombre</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Nombre de la receta"
              value={recipeName}
              onChangeText={setRecipeName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Ingrese Descripción</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Descripción de la receta"
              value={recipeDescription}
              onChangeText={setRecipeDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-2">
            <Text className="text-gray-700 mb-2">Selecciona el tipo de receta</Text>
            <View className="bg-gray-100 rounded-lg">
              <Picker
                selectedValue={selectedTypeRecipe}
                onValueChange={(itemValue) => setSelectedTypeRecipe(itemValue)}
                style={{ color: '#1F2937' }}
              >
                <Picker.Item label="Seleccione una opción..." value="" enabled={false} />
                {allTypeRecipe.map((type) => (
                  <Picker.Item key={type.id} label={type.name} value={type.id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View className="h-px bg-gray-300 mx-4 mb-6" />

        {/* Ingredientes */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Ingredientes</Text>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 mb-2">Porciones</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                placeholder="4"
                value={portions}
                onChangeText={setPortions}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 mb-2">Cantidad personas</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                placeholder="4"
                value={peopleCount}
                onChangeText={setPeopleCount}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Se mantiene comentado como en el original */}
          {/*ingredients.map((ingredient, index) => (
            <View key={ingredient.id} className="mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-700">Ingrediente {index + 1}</Text>
                {ingredients.length > 1 && (
                  <TouchableOpacity onPress={() => removeIngredient(ingredient.id)} className="p-1">
                    <AntDesign name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-gray-800 mr-2"
                  placeholder="Nombre del ingrediente"
                  value={ingredient.name}
                  onChangeText={(value) => updateIngredient(ingredient.id, "name", value)}
                />
                <TextInput
                  className="w-20 bg-gray-100 rounded-lg px-4 py-3 text-gray-800 mr-2"
                  placeholder="200"
                  value={ingredient.quantity}
                  onChangeText={(value) => updateIngredient(ingredient.id, "quantity", value)}
                  keyboardType="numeric"
                />
                <TextInput
                  className="w-20 bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                  placeholder="gr"
                  value={ingredient.unit}
                  onChangeText={(value) => updateIngredient(ingredient.id, "unit", value)}
                />
              </View>
            </View>
          ))*/}

          <TouchableOpacity className="bg-gray-200 rounded-lg py-3 items-center mt-2" onPress={addIngredient}>
            <Text className="text-gray-700 font-medium">agregar ingrediente</Text>
          </TouchableOpacity>
        </View>

        <View className="h-px bg-gray-300 mx-4 mb-6" />

        {/* Pasos */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Pasos</Text>

          {/* Se mantiene comentado como en el original */}
          {/*steps.map((step, index) => (
            <View key={step.id} className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-amber-400 items-center justify-center mr-3">
                    <Text className="text-white font-bold">{index + 1}</Text>
                  </View>
                  <Text className="text-gray-700 font-medium">Paso {index + 1}</Text>
                </View>
                {steps.length > 1 && (
                  <TouchableOpacity onPress={() => removeStep(step.id)} className="p-1">
                    <AntDesign name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800 mb-3"
                placeholder="Descripción del paso"
                value={step.description}
                onChangeText={(value) => updateStep(step.id, "description", value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                className="bg-gray-100 rounded-lg h-24 items-center justify-center border-2 border-dashed border-gray-300"
                onPress={() => handleImageUpload("step", step.id)}
              >
                {step.image ? (
                  <Image source={{ uri: step.image }} className="w-full h-full rounded-lg" />
                ) : (
                  <View className="items-center">
                    <AntDesign name="upload" size={24} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs mt-1">Imagen opcional</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))*/}

          <TouchableOpacity className="bg-gray-200 rounded-lg py-3 items-center mt-2" onPress={addStep}>
            <Text className="text-gray-700 font-medium">Agregar paso</Text>
          </TouchableOpacity>
        </View>

        {/* Subir receta */}
        <View className="p-4 pb-8">
          <TouchableOpacity className="bg-amber-400 rounded-xl py-4 items-center" onPress={handleSubmitRecipe}>
            <Text className="text-white font-bold text-lg">Subir Receta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default CreateRecipe