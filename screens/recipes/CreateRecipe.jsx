import { useEffect, useState, useRef, useContext } from "react"
import {ScrollView, Text, View, TouchableOpacity, Image, TextInput, StatusBar, Alert, Switch, ActivityIndicator, StyleSheet, Modal} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatos, getDatosWithAuth, postDatos, postDatosWithAuth, putDatosWithAuth } from "api/crud"
import { Picker } from '@react-native-picker/picker'
import UploadMediaFile from "components/utils/UploadMediaFIle"
import { Contexto } from "contexto/Provider"
import LoadingModal from "components/utils/LoadingModal"
import ConfirmModal from "components/common/ConfirmModal"

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
    const [loading, setLoading] = useState(false);
    const [isNameDuplicate, setIsNameDuplicate] = useState(false);
    const [datesRecipeRepite, setDatesRecipeRepite] = useState();
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
    const [modalState, setModalState] = useState({
        visible: false,
        title: '',
        message: '',
        onConfirm: () => {},
        onCancel: () => {},
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
    });

    // Variables para duplicar receta
    const [existingRecipeData, setExistingRecipeData] = useState(null); 
    const [isDuplicateModalVisible, setDuplicateModalVisible] = useState(false); 
    const [recipeIdToUpdate, setRecipeIdToUpdate] = useState(null);

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

    const fetchTypesRecipe = async () => {
        try {
            const data = await getDatosWithAuth("recipe/types")
            setAllTypeRecipe(data)
        } catch (error) {
            console.error("Error fetching recipe types:", error.message)
            throw error;
        }
    }

    const fetchUnits = async () => {
        try {
            const data = await getDatosWithAuth("unit")
            setAllUnits(data)
        } catch (error) {
            console.error("Error fetching units:", error.message)
            throw error;
        }
    }

    const getAllIngredients = async () => {
        try {
            const data = await getDatosWithAuth("ingridient/find-all", "Error al obtener todos los ingredientes")
            setAllIngredients(data)
        } catch (error) {
            console.error("Error fetching ingredients:", error.message)
            throw error;
        }
    }

    const loadInitialData = async () => {
        try {
            await Promise.all([
                fetchTypesRecipe(),
                fetchUnits(),
                getAllIngredients()
            ]);
        } catch (error) {
            Alert.alert("Error de Carga", "No se pudieron cargar los datos necesarios. Por favor, intenta de nuevo.");
            navigation.goBack();
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const hideModal = () => {
        setModalState(prev => ({ ...prev, visible: false }));
    }
    
    const showConfirmationModal = (title, message, onConfirmAction) => {
        setModalState({
            visible: true,
            title,
            message,
            onConfirm: () => {
                hideModal(); 
                onConfirmAction(); 
            },
            onCancel: hideModal, 
            confirmText: 'Confirmar',
            cancelText: 'Cancelar'
        });
    };

    const showInfoModal = (title, message, options = {}) => {
        const primaryAction = () => {
            hideModal();
            if (options.onClose) {
                options.onClose(); 
            }
        };

        setModalState({
            visible: true,
            title,
            message,
            onConfirm: primaryAction, 
            onCancel: primaryAction, 
            confirmText: options.confirmText || "Aceptar",
            cancelText: options.cancelText || "Cerrar",
        });
    };
    
    // Se asegura si existe una receta con el mismo nombre
    const checkRecipeName = async () => {
        if (!recipeName.trim()) {
            setIsNameDuplicate(false); 
            return;
        };
        console.log("Verificando nombre de receta:", recipeName);
        try {
            const data = await getDatosWithAuth(`recipe/check-name/${userId}/${recipeName}`);
            
            const isDuplicate = !!data.idReceta; 
            setIsNameDuplicate(isDuplicate);

            if (isDuplicate) {
                setExistingRecipeData(data);
                setDuplicateModalVisible(true);
            } else {
                setExistingRecipeData(null);
            }

        } catch (error) {
            console.error("Error checking recipe name:", error.message)
        }
    }

const handleModifyRecipe = () => {
        if (!existingRecipeData) {
            return;
        }
        setRecipeIdToUpdate(existingRecipeData.idReceta);
        setRecipeName(existingRecipeData.nombreReceta);
        setRecipeDescription(existingRecipeData.descripcionReceta);
        setPortions(String(existingRecipeData.porciones));
        setPeopleCount(String(existingRecipeData.cantidadPersonas));
        
        const foundType = allTypeRecipe.find(t => t.name === existingRecipeData.tipoRecetaDescripcion);
        if (foundType) {
            setSelectedTypeRecipe(foundType.id);
        }

        setRecipeImage(existingRecipeData.fotoPrincipal);

        const formattedIngredients = existingRecipeData.usedIngredients.map(ing => ({
            ingredientId: ing.ingrediente.idIngrediente,
            ingredientName: ing.ingrediente.nombre,
            amount: String(ing.cantidad),
            unitAmountId: ing.unidad.id,
            observation: ing.observaciones || "",
            useSelectForIngredientName: true,
        }));
        setIngredients(formattedIngredients.length > 0 ? formattedIngredients : []);

        const formattedSteps = existingRecipeData.steps.map(step => ({
            number: step.stepNumber,
            description: step.description,
            multimediaList: (step.multimediaList && step.multimediaList.length > 0)
                ? step.multimediaList.map(media => ({
                    ...media,
                    urlContenido: media.urlContenido,
                }))
                : [{ tipoContenido: "foto", extension: "jpg", urlContenido: null }],
        }));
        setSteps(formattedSteps.length > 0 ? formattedSteps : []);
        
        setDuplicateModalVisible(false);
        showInfoModal(
            "Modo Edición Activado",
            "Los datos de tu receta han sido cargados. Ya puedes modificarlos."
        );
    };;

    // Opción reemplazar
    const handleReplaceRecipe = () => {
        setRecipeIdToUpdate(null);
        setDuplicateModalVisible(false);
        Alert.alert("Modo Reemplazar", "Continúa editando la nueva receta. Al guardar, se reemplazará la versión anterior.");
    };


    // Valida los campos del formulario antes de enviar
    const validateForm = () => {
        if (!recipeName.trim()) {
            showInfoModal("Campo Requerido", "Por favor, ingresa el nombre de la receta.");
            return false;
        }
        if (!recipeDescription.trim()) {
            showInfoModal("Campo Requerido", "Por favor, ingresa la descripción de la receta.");
            return false;
        }
        if (!selectedTypeRecipe) {
            showInfoModal("Campo Requerido", "Por favor, selecciona un tipo de receta.");
            return false;
        }
        const ingredientsForRecipe = ingredients.filter(ing => ing.ingredientName.trim() && ing.amount);
        if (ingredientsForRecipe.length === 0) {
            showInfoModal("Campo Requerido", "Agrega al menos un ingrediente con nombre y cantidad.");
            return false;
        }
        return true;
    };

    const uploadAllImages = async () => {
        let finalRecipeImagePath = null;

        if (mainImageUploadRef.current) {
            const mainUploadResult = await mainImageUploadRef.current.upload();
            if (mainUploadResult?.path) {
                finalRecipeImagePath = mainUploadResult.path;
            }
        }

        const uploadedSteps = await Promise.all(
            steps.map(async (step, sIndex) => {
                const stepMultimedia = [];
                for (let mIndex = 0; mIndex < step.multimediaList.length; mIndex++) {
                    const uploadRef = stepImageRefs.current.get(`${sIndex}-${mIndex}`);
                    if (uploadRef) {
                        const stepUploadResult = await uploadRef.upload();
                        if (stepUploadResult?.path) {
                            stepMultimedia.push({
                                tipoContenido: "foto",
                                extension: "jpg", 
                                urlContenido: stepUploadResult.path,
                            });
                        }
                    }
                }
                return {
                    number: step.number,
                    description: step.description,
                    multimediaList: stepMultimedia,
                };
            })
        );
        
        return { finalRecipeImagePath, uploadedSteps };
    };

    // Contruye el payload de la receta
    const buildRecipePayload = (finalRecipeImagePath, uploadedSteps) => {
        const ingredientsForRecipe = ingredients.filter(ing => ing.ingredientName.trim() && ing.amount);
        const formattedIngredients = ingredientsForRecipe.map(ing => ({
            ingredientId: ing.useSelectForIngredientName && ing.ingredientId ? ing.ingredientId : null,
            ingredientName: ing.ingredientName,
            amount: Number.parseFloat(ing.amount) || 0,
            unitAmountId: ing.unitAmountId ? Number.parseInt(ing.unitAmountId) : null,
            observation: ing.observation || "",
        }));

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
        };

        return recipeData;
    };
    
    // Envío de la receta
    const handleSubmitRecipe = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { finalRecipeImagePath, uploadedSteps } = await uploadAllImages();
            const recipeData = buildRecipePayload(finalRecipeImagePath, uploadedSteps);
            
            const navigateBack = () => navigation.goBack();

            if (recipeIdToUpdate) {
                await putDatosWithAuth(`recipe/update/${recipeIdToUpdate}`, recipeData, "Error al modificar la receta");
                console.log("Receta modificada:", recipeIdToUpdate);
                showInfoModal("¡Receta Modificada!", "Tu receta se ha actualizado exitosamente.", { onClose: navigateBack, cancelText: "¡Genial!" });
            
            } else if (existingRecipeData?.idReceta) {
                await postDatosWithAuth(`recipe/replace/${existingRecipeData.idReceta}`, recipeData, "Error al reemplazar la receta");
                showInfoModal("¡Receta Reemplazada!", "La receta anterior fue reemplazada por la nueva.", { onClose: navigateBack, cancelText: "¡Entendido!" });
            
            } else {
                await postDatosWithAuth("recipe/create", recipeData, "Error al crear receta");
                showInfoModal("¡Receta Creada!", "La receta se ha creado exitosamente.", { onClose: navigateBack, cancelText: "OK" });
            }

        } catch (error) {
            console.error("Error en el proceso de envío de receta:", error.message);
            showInfoModal("Error Inesperado", `No se pudo completar la operación: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    
    return (
        <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }} className="pb-20">
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
                    <AntDesign name="arrowleft" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Crear receta</Text>
            </View>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    <Text className="text-gray-700 mb-2 font-medium">Imagen Principal</Text>
                    <UploadMediaFile
                        ref={mainImageUploadRef}
                        initialImageUri={recipeImage}
                    />
                </View>
                {/* Información Básica */}
                <View className="px-4 mb-6">
                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2 font-medium">Nombre de la Receta</Text>
                        <TextInput
                            className={`border rounded-xl px-4 py-2 mb-2 text-gray-800 bg-gray-50 ${
                                isNameDuplicate ? 'border-red-500' : 'border-gray-300' 
                            }`}
                            placeholder="Nombre de la receta"
                            value={recipeName}
                            onBlur={checkRecipeName}
                            onChangeText={setRecipeName}
                        />
                        {isNameDuplicate && ( 
                            <Text className="text-red-600 text-sm">Ya estás usando este nombre en otra receta</Text>
                        )}
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
                <View className="p-4 pb-8">
                    <TouchableOpacity
                        className="bg-amber-400 rounded-xl py-4 items-center"
                        onPress={handleSubmitRecipe}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Subir Receta</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal para Receta Duplicada */}
            <Modal
                visible={isDuplicateModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDuplicateModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <View className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                        <Text className="text-lg font-bold mb-2 text-gray-800">Receta Encontrada</Text>
                        <Text className="text-base text-gray-600 mb-6">
                            Ya tienes una receta llamada "{recipeName}". ¿Qué te gustaría hacer?
                        </Text>
                        <View className="flex-col space-y-4">
                            <TouchableOpacity
                                onPress={handleModifyRecipe}
                                className="bg-blue-500 px-4 py-3 rounded-md"
                            >
                                <Text className="text-white font-semibold text-center">Modificar Existente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleReplaceRecipe} 
                                className="bg-yellow-500 px-4 py-3 rounded-md"
                            >
                                <Text className="text-white font-semibold text-center">Reemplazar con la Nueva</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setDuplicateModalVisible(false)}
                                className="bg-gray-200 px-4 py-3 rounded-md mt-2"
                            >
                                <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Confirmación */}
            <ConfirmModal
                visible={modalState.visible}
                title={modalState.title}
                message={modalState.message}
                onConfirm={modalState.onConfirm}
                onCancel={modalState.onCancel}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
            />

            <LoadingModal visible={loading} message={"Creando receta, esto puede tardar un momento"}></LoadingModal>
        </View>
    )
}
export default CreateRecipe