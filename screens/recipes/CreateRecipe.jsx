// components/CreateRecipe.js
import { useEffect, useState, useRef, useContext } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, StatusBar, Alert, Switch } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatos, getDatosWithAuth, postDatos, postDatosWithAuth } from "api/crud" // Asegúrate que esta ruta sea correcta y las funciones estén implementadas
import { Picker } from '@react-native-picker/picker'
import UploadMediaFile from "components/utils/UploadMediaFIle" // Asegúrate que esta ruta sea correcta y el componente soporte ref y upload() método
import { Contexto } from "contexto/Provider" // Asegúrate que esta ruta sea correcta y provea userId

const CreateRecipe = () => {
    const { userId } = useContext(Contexto);

    const navigation = useNavigation()
    const insets = useSafeAreaInsets()

    const mainImageUploadRef = useRef(null);
    const stepImageRefs = useRef(new Map());

    const [recipeImage, setRecipeImage] = useState(null)
    const [recipeName, setRecipeName] = useState("")
    const [recipeDescription, setRecipeDescription] = useState("")
    const [portions, setPortions] = useState("")
    const [peopleCount, setPeopleCount] = useState("")
    const [selectedTypeRecipe, setSelectedTypeRecipe] = useState("")
    const [allTypeRecipe, setAllTypeRecipe] = useState([])
    const [allIngredients, setAllIngredients] = useState([])
    const [allUnits, setAllUnits] = useState([])

    const [ingredients, setIngredients] = useState([
        { ingredientId: "", ingredientName: "", amount: "", unitAmountId: "", observation: "", useSelectForIngredientName: true },
    ]);

    const [steps, setSteps] = useState([
        {
            number: 1,
            description: "",
            multimediaList: [
                {
                    tipoContenido: "foto",
                    extension: "jpg",
                    urlContenido: null,
                },
            ],
        },
    ]);

    // --- Gestión de Ingredientes ---
    const addIngredient = () => {
        setIngredients([
            ...ingredients,
            { ingredientId: "", ingredientName: "", amount: "", unitAmountId: "", observation: "", useSelectForIngredientName: true },
        ])
    }

    const removeIngredient = (indexToRemove) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, index) => index !== indexToRemove))
        }
    }

    const updateIngredient = (indexToUpdate, field, value) => {
        setIngredients(
            ingredients.map((ingredient, index) => {
                if (index === indexToUpdate) {
                    const updatedIngredient = { ...ingredient, [field]: value };
                    if (field === "ingredientId") {
                        const selectedIng = allIngredients.find(ing => ing.idIngrediente === value);
                        updatedIngredient.ingredientName = selectedIng ? selectedIng.nombre : "";
                    } else if (field === "ingredientName" && !ingredient.useSelectForIngredientName) {
                        updatedIngredient.ingredientId = "";
                    }
                    return updatedIngredient;
                }
                return ingredient;
            })
        )
    }

    const toggleIngredientInputType = (indexToUpdate) => {
        setIngredients(
            ingredients.map((ingredient, index) =>
                index === indexToUpdate
                    ? {
                        ...ingredient,
                        useSelectForIngredientName: !ingredient.useSelectForIngredientName,
                        ingredientId: "",
                        ingredientName: "",
                    }
                    : ingredient
            )
        )
    }

    // --- Gestión de Pasos ---
    const addStep = () => {
        const newNumber = (steps.length > 0 ? Math.max(...steps.map((s) => s.number)) : 0) + 1;
        setSteps([
            ...steps,
            {
                number: newNumber,
                description: "",
                multimediaList: [{ tipoContenido: "foto", extension: "jpg", urlContenido: null }],
            },
        ])
    }

    const removeStep = (indexToRemove) => {
        if (steps.length > 1) {
            setSteps(steps.filter((_, index) => index !== indexToRemove).map((step, idx) => ({ ...step, number: idx + 1 })));
        }
    }

    const updateStepDescription = (indexToUpdate, description) => {
        setSteps(steps.map((step, index) => (index === indexToUpdate ? { ...step, description: description } : step)))
    }

    const addMultimediaToStep = (stepIndex) => {
        setSteps(
            steps.map((step, sIdx) =>
                sIdx === stepIndex
                    ? {
                        ...step,
                        multimediaList: [
                            ...step.multimediaList,
                            { tipoContenido: "foto", extension: "jpg", urlContenido: null },
                        ],
                    }
                    : step
            )
        )
    }

    const removeMultimediaFromStep = (stepIndex, multimediaIndexToRemove) => {
        setSteps(
            steps.map((step, sIdx) =>
                sIdx === stepIndex
                    ? {
                        ...step,
                        multimediaList: step.multimediaList.filter((_, mIdx) => mIdx !== multimediaIndexToRemove),
                    }
                    : step
            )
        )
    }

    // --- Carga de Datos Iniciales ---
    const fetchTypesRecipe = async () => {
        try {
            const data = await getDatosWithAuth("recipe/types")
            setAllTypeRecipe(data)
        } catch (error) {
            console.error("Error fetching recipe types:", error.message)
        }
    }

    const fetchUnits = async () => {
        try {
            const data = await getDatosWithAuth("unit")
            setAllUnits(data)
        } catch (error) {
            console.error("Error fetching units:", error.message)
        }
    }

    const getAllIngredients = async () => {
        try {
            const data = await getDatosWithAuth("ingridient/find-all", "Error al obtener todos los ingredientes")
            setAllIngredients(data)
        } catch (error) {
            console.error("Error fetching ingredients:", error.message)
        }
    }

    useEffect(() => {
        fetchTypesRecipe();
        fetchUnits();
        getAllIngredients();
    }, [])

    // --- Envío del Formulario ---
    const handleSubmitRecipe = async () => {
        // Validaciones de campos obligatorios de texto (mantienen Alert)
        if (!recipeName.trim()) {
            Alert.alert("Error", "Por favor ingresa el nombre de la receta")
            return
        }
        if (!recipeDescription.trim()) {
            Alert.alert("Error", "Por favor ingresa la descripción de la receta")
            return
        }
        if (!selectedTypeRecipe) {
            Alert.alert("Error", "Por favor selecciona el tipo de receta")
            return
        }

        let finalRecipeImagePath = null;

        // 1. Subir imagen principal de la receta (sin alerts de validación aquí)
        if (mainImageUploadRef.current) {
            const uploadResult = await mainImageUploadRef.current.upload();
            if (uploadResult && uploadResult.url && uploadResult.path) {
                finalRecipeImagePath = uploadResult.path;
                setRecipeImage(uploadResult.url);
            }
            // Si uploadResult es nulo/falla, finalRecipeImagePath permanecerá null, lo cual es permitido.
        }

        // 2. Procesar y subir imágenes de los pasos (sin alerts de validación aquí)
        const uploadedSteps = [];
        for (let sIndex = 0; sIndex < steps.length; sIndex++) {
            const step = steps[sIndex];
            const stepMultimedia = [];
            for (let mIndex = 0; mIndex < step.multimediaList.length; mIndex++) {
                const media = step.multimediaList[mIndex];
                const uploadRef = stepImageRefs.current.get(`${sIndex}-${mIndex}`);
                let mediaUrlContenido = media.urlContenido;

                if (uploadRef) {
                    const uploadResult = await uploadRef.upload();
                    if (uploadResult && uploadResult.path) {
                        mediaUrlContenido = uploadResult.path;
                    }
                    // Si uploadResult es nulo/falla, mediaUrlContenido permanecerá su valor inicial o nulo.
                }

                if (mediaUrlContenido) { // Solo incluye multimedia si hay una URL válida (subida o preexistente)
                    stepMultimedia.push({
                        tipoContenido: media.tipoContenido,
                        extension: media.extension,
                        urlContenido: mediaUrlContenido,
                    });
                }
            }
            uploadedSteps.push({
                number: step.number,
                description: step.description,
                multimediaList: stepMultimedia,
            });
        }

        // Validaciones de ingredientes (mantienen Alert)
        const ingredientsForRecipe = ingredients.filter(ing => ing.ingredientName.trim() && ing.amount);
        if (ingredientsForRecipe.length === 0) {
            Alert.alert("Error", "Por favor agrega al menos un ingrediente con nombre y cantidad.");
            return;
        }
        
        const formattedIngredients = ingredientsForRecipe.map(ing => ({
            ingredientId: ing.useSelectForIngredientName && ing.ingredientId ? ing.ingredientId : null,
            ingredientName: ing.ingredientName,
            amount: Number.parseFloat(ing.amount) || 0,
            unitAmountId: ing.unitAmountId ? Number.parseInt(ing.unitAmountId) : null,
            observation: ing.observation || "",
        }));

        // 4. Construir el objeto final de la receta
        const recipeData = {
            nombreReceta: recipeName,
            descripcionReceta: recipeDescription,
            fotoPrincipal: finalRecipeImagePath,
            porciones: Number.parseInt(portions) || 1,
            cantidadPersonas: Number.parseInt(peopleCount) || 1,
            idUsuario: userId,
            idTipoReceta: Number.parseInt(selectedTypeRecipe),
            ingredientsForRecipe: formattedIngredients,
            steps: uploadedSteps,
        }

        console.log("Datos de la receta a enviar:", JSON.stringify(recipeData, null, 2))

        // 5. Enviar los datos a la API
        try {
            await postDatosWithAuth("recipe/create", recipeData, "Error al crear receta")

            Alert.alert("¡Receta creada!", "La receta se ha creado exitosamente.", [
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
                {/* Imagen de la receta Principal */}
                <View className="p-4">
                    <Text className="text-gray-700 mb-2 font-medium">Imagen Principal de la Receta (Opcional)</Text>
                    <UploadMediaFile
                        ref={mainImageUploadRef}
                        initialImageUri={recipeImage}
                    />
                </View>

                {/* Información básica */}
                <View className="px-4 mb-6">
                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2 font-medium">Nombre de la Receta</Text>
                        <TextInput
                            className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="Nombre de la receta"
                            value={recipeName}
                            onChangeText={setRecipeName}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2 font-medium">Descripción</Text>
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
                        <Text className="text-gray-700 mb-2 font-medium">Tipo de Receta</Text>
                        <View className="bg-gray-100 rounded-lg">
                            <Picker
                                selectedValue={selectedTypeRecipe}
                                onValueChange={(itemValue) => setSelectedTypeRecipe(itemValue)}
                                style={{ color: '#1F2937' }}
                            >
                                <Picker.Item label="Seleccione un tipo..." value="" enabled={false} />
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
                            <Text className="text-gray-700 mb-2 font-medium">Porciones</Text>
                            <TextInput
                                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                                placeholder="Ej: 4"
                                value={portions}
                                onChangeText={setPortions}
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <Text className="text-gray-700 mb-2 font-medium">Cantidad personas</Text>
                            <TextInput
                                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                                placeholder="Ej: 4"
                                value={peopleCount}
                                onChangeText={setPeopleCount}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {ingredients.map((ingredient, index) => (
                        <View key={index} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-gray-700 font-medium">Ingrediente {index + 1}</Text>
                                {ingredients.length > 1 && (
                                    <TouchableOpacity onPress={() => removeIngredient(index)} className="p-1">
                                        <AntDesign name="close" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-gray-700 text-sm">Seleccionar de lista / Escribir</Text>
                                <Switch
                                    onValueChange={() => toggleIngredientInputType(index)}
                                    value={ingredient.useSelectForIngredientName}
                                />
                            </View>

                            <View className="mb-3">
                                <Text className="text-gray-700 mb-2">Nombre del Ingrediente</Text>
                                {ingredient.useSelectForIngredientName ? (
                                    <View className="bg-gray-100 rounded-lg">
                                        <Picker
                                            selectedValue={ingredient.ingredientId}
                                            onValueChange={(itemValue) => updateIngredient(index, "ingredientId", itemValue)}
                                            style={{ color: '#1F2937' }}
                                        >
                                            <Picker.Item label="Seleccione un ingrediente..." value="" enabled={false} />
                                            {allIngredients.map((ing) => (
                                                <Picker.Item key={ing.idIngrediente} label={ing.nombre} value={ing.idIngrediente} />
                                            ))}
                                        </Picker>
                                    </View>
                                ) : (
                                    <TextInput
                                        className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                                        placeholder="Escribe el ingrediente (ej: Harina)"
                                        value={ingredient.ingredientName}
                                        onChangeText={(value) => updateIngredient(index, "ingredientName", value)}
                                    />
                                )}
                            </View>

                            <View className="flex-row mb-3">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-700 mb-2">Cantidad</Text>
                                    <TextInput
                                        className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                                        placeholder="Ej: 200"
                                        value={ingredient.amount}
                                        onChangeText={(value) => updateIngredient(index, "amount", value)}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-gray-700 mb-2">Unidad</Text>
                                    <View className="bg-gray-100 rounded-lg">
                                        <Picker
                                            selectedValue={ingredient.unitAmountId}
                                            onValueChange={(itemValue) => updateIngredient(index, "unitAmountId", itemValue)}
                                            style={{ color: '#1F2937' }}
                                        >
                                            <Picker.Item label="Seleccione unidad..." value="" enabled={false} />
                                            {allUnits.map((unit) => (
                                                <Picker.Item key={unit.idUnidad} label={unit.descripcion} value={unit.idUnidad} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                            <View>
                                <Text className="text-gray-700 mb-2">Observación (Opcional)</Text>
                                <TextInput
                                    className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                                    placeholder="Ej: tamizada"
                                    value={ingredient.observation}
                                    onChangeText={(value) => updateIngredient(index, "observation", value)}
                                />
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity className="bg-gray-200 rounded-lg py-3 items-center mt-2" onPress={addIngredient}>
                        <Text className="text-gray-700 font-medium">Agregar Ingrediente</Text>
                    </TouchableOpacity>
                </View>

                <View className="h-px bg-gray-300 mx-4 mb-6" />

                {/* Pasos */}
                <View className="px-4 mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-4">Pasos</Text>

                    {steps.map((step, sIndex) => (
                        <View key={sIndex} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-amber-400 items-center justify-center mr-3">
                                        <Text className="text-white font-bold">{sIndex + 1}</Text>
                                    </View>
                                    <Text className="text-gray-700 font-medium">Paso {sIndex + 1}</Text>
                                </View>
                                {steps.length > 1 && (
                                    <TouchableOpacity onPress={() => removeStep(sIndex)} className="p-1">
                                        <AntDesign name="close" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View className="mb-3">
                                <Text className="text-gray-700 mb-2">Descripción del Paso</Text>
                                <TextInput
                                    className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                                    placeholder="Describe lo que se hace en este paso"
                                    value={step.description}
                                    onChangeText={(value) => updateStepDescription(sIndex, value)}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            <Text className="text-gray-700 mb-2">Imágenes del Paso (Opcional)</Text>
                            {step.multimediaList.map((media, mIndex) => (
                                <View key={`${sIndex}-${mIndex}`} className="mb-3 relative">
                                    <UploadMediaFile
                                        ref={(el) => stepImageRefs.current.set(`${sIndex}-${mIndex}`, el)}
                                        initialImageUri={media.urlContenido}
                                    />
                                    {step.multimediaList.length > 1 && (
                                        <TouchableOpacity
                                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full z-10"
                                            onPress={() => removeMultimediaFromStep(sIndex, mIndex)}
                                        >
                                            <AntDesign name="close" size={16} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity
                                className="bg-gray-200 rounded-lg py-3 items-center mt-2"
                                onPress={() => addMultimediaToStep(sIndex)}
                            >
                                <Text className="text-gray-700 font-medium">Agregar Imagen al Paso</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity className="bg-gray-200 rounded-lg py-3 items-center mt-2" onPress={addStep}>
                        <Text className="text-gray-700 font-medium">Agregar Paso</Text>
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