// screens/DetailsRecipes.js (o donde tengas tu componente principal)
// Este es un fragmento, asume que el resto del código del componente es el mismo que el proporcionado anteriormente.

import { useContext, useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deleteDatosWithAuth, getDatosWithAuth, postDatosWithAuth } from "api/crud";
import { Contexto } from "../../contexto/Provider";
import RetrieveMediaFile from "../../components/utils/RetrieveMediaFile"; // Asegúrate de que la ruta sea correcta

// Importa los nuevos componentes reutilizables
import RecipeHeader from "../../components/recipes/details/RecipeHeader";
import RecipeInfoOverview from "../../components/recipes/details/RecipeInfoOverview";
import TabNavigation from "../../components/recipes/details/TabNavigation";
import IngredientAdjuster from "../../components/recipes/details/IngredientAdjuster";
import CommentForm from "../../components/recipes/details/CommentForm";
import CommentList from "../../components/recipes/details/CommentList";


const DetailsRecipes = () => {
  // Destructurar las propiedades del contexto
  const { logeado, userId, saveModifiedRecipe, removeModifiedRecipe, modifiedRecipes, MAX_MODIFIED_RECIPES } = useContext(Contexto);

  const navigation = useNavigation();
  const route = useRoute();
  // recipeId es el ID de la receta original
  // modifiedData se pasará desde el perfil si se navega a una receta modificada guardada
  const { recipeId, modifiedData } = route.params || {};
  const insets = useSafeAreaInsets();

  const [recipe, setRecipe] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredientes");

  const [peopleCount, setPeopleCount] = useState(1); // CANTIDAD DE PERSONAS ACTUAL
  const [originalPeopleCount, setOriginalPeopleCount] = useState(1); // CANTIDAD DE PERSONAS ORIGINAL DE LA RECETA
  const [adjustedIngredients, setAdjustedIngredients] = useState([]);

  // Estado para saber si la receta actualmente mostrada (con sus ajustes) ya está guardada localmente
  const [isCurrentModifiedVersionSaved, setIsCurrentModifiedVersionSaved] = useState(false);
  // Almacena el modifiedId único de la versión actualmente guardada, si existe
  const [currentModifiedId, setCurrentModifiedId] = useState(null);

  // Determina si la receta ha sido modificada respecto a su cantidad de personas original
  const isRecipeModified = peopleCount !== originalPeopleCount;

  const [newComment, setNewComment] = useState({
    usuario: userId,
    receta: recipeId,
    calificacion: "",
    comentarios: "",
  });

  const verifyFavorite = useCallback(async () => {
    if (!userId || !recipeId) {
      setIsFavorite(false);
      return false;
    }
    try {
      const response = await getDatosWithAuth(
        `favorites/isFavorite/${userId}/${recipeId}`
      );
      const favoriteStatus = response || false;
      setIsFavorite(favoriteStatus);
      return favoriteStatus;
    } catch (error) {
      console.log("Error verificando estado de favorito:", error);
      setIsFavorite(false);
      return false;
    }
  }, [userId, recipeId]);

  const fetchRecipe = async () => {
    try {
      const data = await getDatosWithAuth(`recipe/${recipeId}`);
      setRecipe(data);

      let initialPeople = data.cantidadPersonas || 1;
      let initialIngredients = data.usedIngredients || [];

      // Si la navegación proviene de una receta modificada, usa esos datos
      if (modifiedData) {
        initialPeople = modifiedData.cantidadPersonas;
        initialIngredients = modifiedData.usedIngredients;
        // La "cantidadPersonas" de la receta original sigue siendo la del backend,
        // pero peopleCount e adjustedIngredients se inician con los datos modificados.
        // originalPeopleCount debe seguir siendo la del backend para la comparación `isRecipeModified`
      }

      setPeopleCount(initialPeople);
      setOriginalPeopleCount(data.cantidadPersonas || 1); // SIEMPRE la cantidad original del backend
      setAdjustedIngredients(initialIngredients);

    } catch (error) {
      console.log("Error fetching recipes:", error.message);
    }
  };

  const calculateAdjustedQuantities = useCallback((newCount) => {
    if (!recipe.usedIngredients || originalPeopleCount === 0) return [];

    return recipe.usedIngredients.map((ing) => {
      const originalQuantity = parseFloat(ing.cantidad);
      if (isNaN(originalQuantity)) {
        return ing;
      }

      const newQuantity = (originalQuantity / originalPeopleCount) * newCount;

      let formattedQuantity;
      if (newQuantity % 1 === 0) {
        formattedQuantity = newQuantity.toFixed(0);
      } else {
        formattedQuantity = newQuantity.toFixed(2);
      }

      return {
        ...ing,
        cantidad: formattedQuantity,
      };
    });
  }, [recipe.usedIngredients, originalPeopleCount]);

  const handleComment = async () => {
    if (!newComment.calificacion) {
      Alert.alert("Error", "Por favor, selecciona una calificación.");
      return;
    }
    if (!newComment.comentarios.trim()) {
      Alert.alert("Error", "Por favor, escribe un comentario.");
      return;
    }

    try {
      const commentToSend = {
        ...newComment,
        calificacion: Number.parseInt(newComment.calificacion),
      };

      await postDatosWithAuth(
        "califications/crear",
        commentToSend,
        "Error al comentar la receta"
      );

      await fetchRecipe();
      setNewComment({
        usuario: userId,
        receta: recipeId,
        calificacion: "",
        comentarios: "",
      });
    } catch (error) {
      console.log("Error al enviar el comentario:", error.message);
    }
  };

  useEffect(() => {
    fetchRecipe(); // Carga la receta y aplica modifiedData si viene
    if (logeado && userId && recipeId) {
      setNewComment((prev) => ({
        ...prev,
        usuario: userId,
        receta: recipeId,
      }));
      verifyFavorite();
    } else {
      setIsFavorite(false);
    }
  }, [logeado, userId, recipeId, verifyFavorite, modifiedData]); // added modifiedData as a dependency

  // Este useEffect recalcula los ingredientes ajustados cuando cambia peopleCount
  useEffect(() => {
    if (recipe.usedIngredients && originalPeopleCount > 0) {
      const newAdjustedIngredients = calculateAdjustedQuantities(peopleCount);
      setAdjustedIngredients(newAdjustedIngredients);
    }
  }, [peopleCount, originalPeopleCount, recipe.usedIngredients, calculateAdjustedQuantities]);

  // NUEVO: useEffect para verificar si la versión actual (por peopleCount) está guardada
  useEffect(() => {
    if (!recipeId) return; // Asegurarse de que tenemos un recipeId

    // Busca si existe una receta modificada con el mismo ID original y la CANTIDAD ACTUAL DE PERSONAS
    const found = modifiedRecipes.find(
      (r) =>
        String(r.originalRecipeId) === String(recipeId) &&
        r.cantidadPersonas === peopleCount
    );

    setIsCurrentModifiedVersionSaved(!!found);
    setCurrentModifiedId(found ? found.modifiedId : null);
  }, [modifiedRecipes, recipeId, peopleCount]); // Depende de modifiedRecipes y peopleCount

  const increasePeople = useCallback(() => {
    if (peopleCount < 10) {
      setPeopleCount(prevCount => prevCount + 1);
    }
  }, [peopleCount]);

  const decreasePeople = useCallback(() => {
    if (peopleCount > 1) {
      setPeopleCount(prevCount => prevCount - 1);
    }
  }, [peopleCount]);

  const resetPeopleAndIngredients = useCallback(() => {
    if (recipe.cantidadPersonas) {
      setPeopleCount(recipe.cantidadPersonas);
      setAdjustedIngredients(recipe.usedIngredients || []);
    } else {
      setPeopleCount(1);
      setAdjustedIngredients(recipe.usedIngredients || []);
    }
  }, [recipe.cantidadPersonas, recipe.usedIngredients]);

  const addToFavorite = async () => {
    try {
      await postDatosWithAuth(`favorites/add/${userId}/${recipeId}`);
      setIsFavorite(true);
    } catch (error) {
      console.log("Error al guardar la receta en favoritos:", error.message);
    }
  };

  const removeFromFavorite = async () => {
    try {
      await deleteDatosWithAuth(`favorites/remove/${userId}/${recipeId}`);
      setIsFavorite(false);
    } catch (error) {
      console.log("Error al eliminar la receta de favoritos:", error.message);
    }
  };

  const handleFavoritePress = useCallback(() => {
    if (isFavorite) {
      removeFromFavorite();
    } else {
      addToFavorite();
    }
  }, [isFavorite, addToFavorite, removeFromFavorite]);

  // NUEVO: Manejador para guardar/eliminar la receta modificada localmente
  const handleSaveRemoveModifiedRecipe = async () => {
    if (!logeado) {
      Alert.alert("Información", "Debes iniciar sesión para guardar o eliminar recetas modificadas.");
      return;
    }

    // Si la versión actual ya está guardada, se quiere eliminar
    if (isCurrentModifiedVersionSaved && currentModifiedId) {
      await removeModifiedRecipe(currentModifiedId);
    } else {
      // Si no está guardada, se quiere guardar
      const modifiedRecipeToSave = {
        originalRecipeId: recipeId,
        nombreReceta: recipe.nombreReceta,
        fotoPrincipal: recipe.fotoPrincipal,
        descripcionReceta: recipe.descripcionReceta,
        cantidadPersonas: peopleCount, // La cantidad de personas modificada
        usedIngredients: adjustedIngredients, // Los ingredientes ajustados
        steps: recipe.steps, // También podrías guardar los pasos si fueran afectados por la modificación
        tipoRecetaDescripcion: recipe.tipoRecetaDescripcion,
        nombreUsuario: recipe.nombreUsuario,
        porciones: recipe.porciones, // Mantener la original si no se ajusta
        averageRating: recipe.averageRating, // Mantener la original
      };

      await saveModifiedRecipe(modifiedRecipeToSave);
    }
  };


  return (
    <View style={{ paddingTop: insets.top }} className="pb-20 flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView className="flex-1 pb-40">
        <RecipeHeader
          imageUrl={recipe.fotoPrincipal}
          recipeType={recipe.tipoRecetaDescripcion}
          isFavorite={isFavorite}
          // El botón de favorito normal se oculta si la receta está siendo modificada O si ya es una versión modificada cargada
          logeado={logeado && !isRecipeModified && !modifiedData}
          onToggleFavorite={handleFavoritePress}
        />

        {/* Info Receta */}
        <View className="p-4">
          <Text className="text-3xl font-bold text-gray-800">
            {recipe.nombreReceta}
          </Text>
          <Text className="text-lg text-gray-400 mb-2">
            {recipe.descripcionReceta}
          </Text>

          <RecipeInfoOverview
            author={recipe.nombreUsuario}
            portions={recipe.porciones}
            peopleCount={peopleCount} // Muestra la cantidad actual de personas
            averageRating={recipe.averageRating}
          />

          {/* Tabs */}
          <TabNavigation
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />

          {/* Ingredients */}
          {activeTab === "ingredientes" && (
            <>
              <IngredientAdjuster
                adjustedIngredients={adjustedIngredients}
                peopleCount={peopleCount}
                originalPeopleCount={originalPeopleCount}
                increasePeople={increasePeople}
                decreasePeople={decreasePeople}
                resetPeopleAndIngredients={resetPeopleAndIngredients}
              />
              {/* Botón para guardar/eliminar receta modificada */}
              {logeado && isRecipeModified && (
                <View className="mt-6 p-4 items-center">
                  <TouchableOpacity
                    className={`py-3 px-6 rounded-full items-center shadow-sm ${
                      isCurrentModifiedVersionSaved ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    onPress={handleSaveRemoveModifiedRecipe}
                    // Deshabilitar el botón de guardar si se ha alcanzado el límite Y NO es una versión ya guardada para eliminar
                    disabled={!isCurrentModifiedVersionSaved && modifiedRecipes.length >= MAX_MODIFIED_RECIPES}
                  >
                    <Text className="text-white font-semibold text-lg">
                      {isCurrentModifiedVersionSaved ? 'Eliminar Modificación' : 'Guardar Receta Modificada'}
                      {!isCurrentModifiedVersionSaved && ` (${modifiedRecipes.length}/${MAX_MODIFIED_RECIPES})`}
                    </Text>
                  </TouchableOpacity>
                  {!isCurrentModifiedVersionSaved && modifiedRecipes.length >= MAX_MODIFIED_RECIPES && (
                    <Text className="text-red-500 text-sm mt-2 text-center">
                      Has alcanzado el límite de recetas modificadas guardadas.
                    </Text>
                  )}
                </View>
              )}
            </>
          )}

          {/* Instruccions */}
          {activeTab === "instrucciones" && (
            <View>
              {(recipe.steps || []).map((paso, index) => (
                <View
                  key={paso.id}
                  className={`mb-4 p-4 rounded-lg ${
                    index % 2 === 0
                      ? "bg-white border border-gray-100"
                      : "bg-gray-50"
                  }`}
                >
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 rounded-full bg-amber-400 items-center justify-center mr-3">
                      <Text className="text-white font-bold">
                        {paso.stepNumber}
                      </Text>
                    </View>
                    <Text className="text-lg font-medium text-gray-800">
                      Paso {paso.stepNumber}
                    </Text>
                  </View>
                  <Text className="text-gray-500 ml-11 mb-2">
                    {paso.description}
                  </Text>
                  <View className="flex gap-4 rounded-lg overflow-hidden">
                    {paso.multimediaList &&
                      paso.multimediaList.map((url) => (
                        <View key={url.urlContenido} className="w-full h-40">
                          <RetrieveMediaFile
                            imageUrl={url.urlContenido}
                          />
                        </View>
                      ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Califications */}
          {activeTab === "calificaciones" && (
            <View>
              <CommentList
                comments={recipe.calification}
                logeado={logeado}
              />
              {logeado && (
                <CommentForm
                  newComment={newComment}
                  setNewComment={setNewComment}
                  onHandleComment={handleComment}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsRecipes;
