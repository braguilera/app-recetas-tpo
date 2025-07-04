import { useContext, useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deleteDatosWithAuth, getDatosWithAuth, postDatosWithAuth } from "api/crud";
import { Contexto } from "../../contexto/Provider";
import RetrieveMediaFile from "../../components/utils/RetrieveMediaFile";

import RecipeHeader from "../../components/recipes/details/RecipeHeader";
import RecipeInfoOverview from "../../components/recipes/details/RecipeInfoOverview";
import TabNavigation from "../../components/recipes/details/TabNavigation";
import IngredientAdjuster from "../../components/recipes/details/IngredientAdjuster";
import CommentForm from "../../components/recipes/details/CommentForm";
import CommentList from "../../components/recipes/details/CommentList";

const DetailsRecipes = () => {
  const { logeado, userId, saveModifiedRecipe, removeModifiedRecipe, modifiedRecipes, MAX_MODIFIED_RECIPES } = useContext(Contexto);

  const navigation = useNavigation();
  const route = useRoute();
  const { recipeId, modifiedData } = route.params || {};
  const insets = useSafeAreaInsets();

  const [recipe, setRecipe] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredientes");
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const [peopleCount, setPeopleCount] = useState(1);
  const [originalPeopleCount, setOriginalPeopleCount] = useState(1);
  const [adjustedIngredients, setAdjustedIngredients] = useState([]);

  const [isCurrentModifiedVersionSaved, setIsCurrentModifiedVersionSaved] = useState(false);
  const [currentModifiedId, setCurrentModifiedId] = useState(null);

  const isRecipeModified = Math.abs(peopleCount - originalPeopleCount) > 0.001;

  const [newComment, setNewComment] = useState({
    usuario: userId,
    receta: recipeId,
    calificacion: "",
    comentarios: "",
  });

  const checkAuth = () => {
    if (!logeado) {
      setLoginModalVisible(true);
      return false;
    }
    return true;
  };

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

      if (modifiedData) {
        initialPeople = modifiedData.cantidadPersonas;
        initialIngredients = modifiedData.usedIngredients;
      }

      setPeopleCount(initialPeople);
      setOriginalPeopleCount(data.cantidadPersonas || 1);
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
        formattedQuantity = newQuantity.toFixed(2).replace('.', ',');
      }

      return {
        ...ing,
        cantidad: formattedQuantity,
      };
    });
  }, [recipe.usedIngredients, originalPeopleCount]);

  const handleIngredientUpdate = useCallback((ingredientId, newValueStr) => {
    if (!checkAuth()) return;
    const newValue = parseFloat(newValueStr.replace(',', '.'));

    if (isNaN(newValue) || newValue < 0) {
      Alert.alert("Valor inválido", "Por favor, introduce un número válido.");
      return;
    }

    if (newValue === 0) {
      Alert.alert("Cantidad no permitida", "La cantidad de un ingrediente no puede ser cero.");
      return;
    }

    const originalIngredient = recipe.usedIngredients?.find(
      (ing) => ing.idUtilizado === ingredientId
    );
    if (!originalIngredient) return;

    const originalQuantity = parseFloat(originalIngredient.cantidad);
    if (isNaN(originalQuantity) || originalQuantity === 0) return;

    const scalingFactor = newValue / originalQuantity;

    const newAdjustedIngredients = (recipe.usedIngredients || []).map(ing => {
      const oQty = parseFloat(ing.cantidad);
      if (isNaN(oQty)) return ing;

      const nQty = oQty * scalingFactor;
      let formattedQuantity;
      if (nQty % 1 === 0) {
        formattedQuantity = nQty.toFixed(0);
      } else {
        formattedQuantity = nQty.toFixed(2);
      }
      return { ...ing, cantidad: formattedQuantity };
    });

    const proportionalPeople = originalPeopleCount * scalingFactor;
    const roundedPeople = Math.max(1, Math.round(proportionalPeople));

    setPeopleCount(roundedPeople);
    setAdjustedIngredients(newAdjustedIngredients);

  }, [recipe.usedIngredients, originalPeopleCount, logeado]);


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
    fetchRecipe();
    if (logeado && userId && recipeId) {
      setNewComment((prev) => ({ ...prev, usuario: userId, receta: recipeId }));
      verifyFavorite();
    } else {
      setIsFavorite(false);
    }
  }, [logeado, userId, recipeId, verifyFavorite, modifiedData]);

  useEffect(() => {
    if (!logeado) return;
    const found = modifiedRecipes.find(
      (r) =>
        String(r.originalRecipeId) === String(recipeId) &&
        Math.abs(r.cantidadPersonas - peopleCount) < 0.01
    );

    setIsCurrentModifiedVersionSaved(!!found);
    setCurrentModifiedId(found ? found.modifiedId : null);
  }, [modifiedRecipes, recipeId, peopleCount, adjustedIngredients, logeado]);

  const increasePeople = useCallback(() => {
    if (!checkAuth()) return;
    const currentPeople = Math.round(peopleCount);
    if (currentPeople < 10) {
        const newCount = currentPeople + 1;
        setPeopleCount(newCount);
        const newIngredients = calculateAdjustedQuantities(newCount);
        setAdjustedIngredients(newIngredients);
    }
  }, [peopleCount, calculateAdjustedQuantities, logeado]);

  const decreasePeople = useCallback(() => {
    if (!checkAuth()) return;
    const currentPeople = Math.round(peopleCount);
    if (currentPeople > 1) {
        const newCount = currentPeople - 1;
        setPeopleCount(newCount);
        const newIngredients = calculateAdjustedQuantities(newCount);
        setAdjustedIngredients(newIngredients);
    }
  }, [peopleCount, calculateAdjustedQuantities, logeado]);

  const resetPeopleAndIngredients = useCallback(() => {
    if (!checkAuth()) return;
    setPeopleCount(originalPeopleCount);
    setAdjustedIngredients(recipe.usedIngredients || []);
  }, [originalPeopleCount, recipe.usedIngredients, logeado]);

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
    if (!checkAuth()) return;
    if (isFavorite) {
      removeFromFavorite();
    } else {
      addToFavorite();
    }
  }, [isFavorite, addToFavorite, removeFromFavorite, logeado]);

  const handleSaveRemoveModifiedRecipe = async () => {
    if (!logeado) {
      Alert.alert("Información", "Debes iniciar sesión para guardar o eliminar recetas modificadas.");
      return;
    }

    if (isCurrentModifiedVersionSaved && currentModifiedId) {
      await removeModifiedRecipe(currentModifiedId);
    } else {
      const modifiedRecipeToSave = {
        originalRecipeId: recipeId,
        nombreReceta: recipe.nombreReceta,
        fotoPrincipal: recipe.fotoPrincipal,
        descripcionReceta: recipe.descripcionReceta,
        cantidadPersonas: peopleCount,
        usedIngredients: adjustedIngredients,
        steps: recipe.steps,
        tipoRecetaDescripcion: recipe.tipoRecetaDescripcion,
        nombreUsuario: recipe.nombreUsuario,
        porciones: recipe.porciones,
        averageRating: recipe.averageRating,
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
          logeado={logeado}
          onToggleFavorite={handleFavoritePress}
        />

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
            peopleCount={peopleCount}
            averageRating={recipe.averageRating}
          />

          <TabNavigation
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />

          {activeTab === "ingredientes" && (
            <>
              <IngredientAdjuster
                adjustedIngredients={adjustedIngredients}
                peopleCount={peopleCount}
                originalPeopleCount={originalPeopleCount}
                increasePeople={increasePeople}
                decreasePeople={decreasePeople}
                resetPeopleAndIngredients={resetPeopleAndIngredients}
                onIngredientUpdate={handleIngredientUpdate}
                isUserLogged={logeado}
              />
              {logeado && isRecipeModified && (
                <View className="mt-6 p-4 items-center">
                  <TouchableOpacity
                    className={`py-3 px-6 rounded-full items-center shadow-sm ${
                      isCurrentModifiedVersionSaved ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    onPress={handleSaveRemoveModifiedRecipe}
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={loginModalVisible}
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <Pressable 
          className="flex-1 justify-center items-center bg-black/60" 
          onPress={() => setLoginModalVisible(false)}
        >
          <Pressable className="bg-white rounded-lg p-6 w-4/5 shadow-xl">
            <Text className="text-lg font-bold mb-4 text-gray-800">Función para Usuarios</Text>
            <Text className="text-base text-gray-600 mb-6">
              Para usar esta funcionalidad, por favor inicia sesión o crea una cuenta.
            </Text>
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setLoginModalVisible(false)}
                className="bg-gray-200 px-4 py-2 rounded-md mr-2"
              >
                <Text className="text-gray-700 font-semibold">Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setLoginModalVisible(false);
                  navigation.navigate("AuthStack", { screen: "Login" });
                }}
                className="bg-amber-500 px-4 py-2 rounded-md"
              >
                <Text className="text-white font-semibold">Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default DetailsRecipes;