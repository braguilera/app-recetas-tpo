import { useContext, useEffect, useState, useCallback } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, StatusBar, Alert, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { deleteDatosWithAuth, getDatosWithAuth, postDatos, getRecipesPaginatedWithAuth } from "api/crud"
import ConfirmModal from "../../components/common/ConfirmModal"
import { Contexto } from "../../contexto/Provider"
import RetrieveMediaFile from "components/utils/RetrieveMediaFile"
import CourseCard from "../../components/profile/CourseCard";
import RefundOptionsModal from "../../components/profile/RefundOptionsModal";
import MyCount from './MyCount';
import UserAvatar from "components/common/UserAvatar"

const Profile = () => {
    const navigation = useNavigation()
    const insets = useSafeAreaInsets()
    const { userId, username, firstName, lastName, email, logeado, logout, modifiedRecipes, removeModifiedRecipe, token } = useContext(Contexto);

    const [activeTab, setActiveTab] = useState("favoritos")
    const [myRecipes, setMyRecipes] = useState({ content: [] })
    const [confirmVisible, setConfirmVisible] = useState(false)
    const [recipeToDelete, setRecipeToDelete] = useState(null)
    const [userProfile, setUserProfile] = useState(null);
    const [myRecipesInactives, setMyRecipesInactives] = useState([]);
    const [favoritesRecipes, setFavoritesRecipes] = useState([]);

    const [confirmModifiedVisible, setConfirmModifiedVisible] = useState(false);
    const [modifiedRecipeToDelete, setModifiedRecipeToDelete] = useState(null);

    const [activeCourses, setActiveCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const [confirmUnsubscribeVisible, setConfirmUnsubscribeVisible] = useState(false);
    const [courseUnsubscribeResult, setCourseUnsubscribeResult] = useState(null); 
    const [showRefundOptionsModal, setShowRefundOptionsModal] = useState(false);
    const [courseForRefundSelection, setCourseForRefundSelection] = useState(null); 

    const tabs = [
        { id: "favoritos", name: "Favoritos" },
        { id: "recetas", name: "Mis Recetas" },
        { id: "cursos", name: "Cursos" },
        { id: "miCuenta", name: "Mi Cuenta" }, 
    ]

    const handleLogout = async () => {
        try {
            await logout();
            await postDatos('auth/logout', {}, 'Error al cerrar sesión en el backend');
            navigation.replace("MainTabs");
        } catch (error) {
            console.log("Error al cerrar sesión:", error);
        }
    }

    const confirmDeleteRecipe = async () => {
        if (!recipeToDelete) return
        try {
            await deleteDatosWithAuth(`recipe/delete/${recipeToDelete.idReceta}`, "Error al borrar la receta")
            await fetchRecipes(0)
        } catch (error) {
            console.log("Error al borrar receta:", error.message)
        } finally {
            setConfirmVisible(false)
            setRecipeToDelete(null)
        }
    }

    const fetchRecipes = async (page = 0) => {
        if (!username) {
            console.warn("Username no disponible para cargar recetas.");
            return;
        }
        try {
            const params = {
                userName: username,
            }
            const data = await getRecipesPaginatedWithAuth(params, 'Error al cargar recetas')
            setMyRecipes(data || { content: [] })
            console.log("Mis Recetas:", data)
        } catch (error) {
            console.log("Error fetching recipes:", error.message)
        }
    }

    const fetchRecipesInactives = async () => {
        try {
            const data = await getDatosWithAuth(`recipe/${userId}/inactivas`, 'Error al cargar recetas inactivas')
            setMyRecipesInactives(data || [])
            console.log("Mis Recetas Inactivas:", data)
        } catch (error) {
            console.log("Error fetching inactive recipes:", error.message)
        }
    }

    const fetchFavorites = async () => {
        try {
            const data = await getDatosWithAuth(`favorites/${userId}`, 'Error al cargar recetas favoritas')
            setFavoritesRecipes(data || [])
        } catch (error) {
            console.log("Error fetching favorites:", error.message)
        }
    }

    const fetchUserProfileData = async () => {
        if (!userId) {
            console.warn("User ID no disponible para cargar perfil.");
            return;
        }
        try {
            const data = await getDatosWithAuth(`user/${userId}`, 'Error al cargar el perfil del usuario');
            setUserProfile(data);
            console.log("Datos del perfil del usuario:", data);
        } catch (error) {
            console.log("Error al obtener el perfil del usuario:", error.message);
        }
    };

    const handleRemoveModifiedRecipe = useCallback((modifiedId, recipeName) => {
        setModifiedRecipeToDelete({ modifiedId, recipeName });
        setConfirmModifiedVisible(true);
    }, []);

    const confirmRemoveModifiedRecipe = useCallback(async () => {
        if (!modifiedRecipeToDelete) return;

        try {
            await removeModifiedRecipe(modifiedRecipeToDelete.modifiedId);
        } catch (error) {
            console.log("Error al eliminar receta modificada:", error);
        } finally {
            setConfirmModifiedVisible(false);
            setModifiedRecipeToDelete(null);
        }
    }, [modifiedRecipeToDelete, removeModifiedRecipe]);

    const fetchActiveCourses = useCallback(async () => {
        setLoadingCourses(true);
        if (!userId || !token) {
            console.warn("User ID o Token no disponibles para cargar cursos activos.");
            setLoadingCourses(false);
            return;
        }
        try {
            const data = await getDatosWithAuth(`course/student/${userId}/in-progress`, 'Error al cargar cursos en progreso', token);
            setActiveCourses(data || []);
        } catch (error) {
            console.log("Error fetching active courses:", error.message);
            setActiveCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    }, [userId, token]);

    const fetchCompletedCourses = useCallback(async () => {
        setLoadingCourses(true);
        if (!userId || !token) {
            console.warn("User ID o Token no disponibles para cargar cursos finalizados.");
            setLoadingCourses(false);
            return;
        }
        try {
            const data = await getDatosWithAuth(`course/student/${userId}/completed`, 'Error al cargar cursos finalizados', token);
            setCompletedCourses(data || []);
        } catch (error) {
            console.log("Error fetching completed courses:", error.message);
            setCompletedCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    }, [userId, token]);


    const handleUnsubscribeOption = useCallback((course) => {
        setCourseForRefundSelection(course); 
        setShowRefundOptionsModal(true); 
    }, []);

    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) {
            return "$0";
        }
        return `$${price.toLocaleString("es-AR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const confirmUnsubscribeWithRefundType = useCallback(async (medioDevolucion) => {
        setShowRefundOptionsModal(false); 

        if (!courseForRefundSelection || !userId || !token) {
            console.log("Error", "Datos incompletos para procesar la baja del curso.");
            return;
        }

        const cronograma = courseForRefundSelection.cronogramaCursos && courseForRefundSelection.cronogramaCursos.length > 0
            ? courseForRefundSelection.cronogramaCursos[0]
            : null;

        if (!cronograma) {
            console.log("Error", "No se encontró información del cronograma para el curso seleccionado.");
            return;
        }

        try {
            setLoadingCourses(true); 

            const body = {
                idAlumno: parseInt(userId), 
                idCronogramaCurso: cronograma.idCronograma,
                medioDevolucion: medioDevolucion
            };
            console.log("Unsubscribe request body:", body);

            const response = await deleteDatosWithAuth('course/unsubscribe', 'Error al darse de baja del curso', body, token);
            console.log("Unsubscribe API Response:", response);

            setCourseUnsubscribeResult({ 
                courseName: courseForRefundSelection.nombreCurso,
                refundAmount: response.importeReintegrado, 
                refundMessage: response.mensaje,
                medioDevolucion: medioDevolucion,
                refundPercentage: (response.importeReintegrado !== undefined && courseForRefundSelection.precio)
                    ? ((response.importeReintegrado / courseForRefundSelection.precio) * 100).toFixed(0)
                    : 0
            });
            setConfirmUnsubscribeVisible(true);

            await fetchActiveCourses(); 

        } catch (error) {
            console.log("Error al darse de baja del curso:", error);
        } finally {
            setLoadingCourses(false); 
            setCourseForRefundSelection(null); 
        }
    }, [courseForRefundSelection, userId, token, fetchActiveCourses]);

    const navigateToHomeCursos = useCallback(() => {
        setConfirmUnsubscribeVisible(false); 
        navigation.navigate("MainTabs", { screen: "HomeCursos" }); 
    }, [navigation]);


    useEffect(() => {
        fetchUserProfileData();
        if (username) {
            fetchRecipes(0);
            fetchFavorites();
            fetchRecipesInactives();
        }
        if (userId && token) {
            fetchActiveCourses();
            fetchCompletedCourses();
        }
    }, [userId, username, token, fetchActiveCourses, fetchCompletedCourses]);

    const renderModifiedRecipesList = () => {
        if (modifiedRecipes.length === 0) {
            return null;
        }
        return (
            <View className="p-4 pt-0">
                <Text className="text-lg font-bold text-gray-700 mb-4">Mis Recetas Modificadas</Text>
                {modifiedRecipes.map((recipe) => (
                    <View key={recipe.modifiedId} className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("DetailsRecipes", {
                                recipeId: recipe.originalRecipeId,
                                modifiedData: recipe
                            })}
                            className="flex-row"
                        >
                            <View className="w-28 h-28 p-2 relative">
                                <RetrieveMediaFile imageUrl={recipe.fotoPrincipal}></RetrieveMediaFile>
                            </View>
                            <View className="flex-1 p-4">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-lg font-bold">{recipe.nombreReceta}</Text>
                                    {recipe.cantidadPersonas && (
                                        <View className="flex-row items-center">
                                            <AntDesign name="team" size={14} color="#9CA3AF" />
                                            <Text className="text-xs text-gray-500 ml-1">Para {recipe.cantidadPersonas} pers.</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                    {recipe.descripcionReceta}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <View className="flex-row border-t border-gray-100">
                            <TouchableOpacity
                                className="flex-1 py-3 items-center"
                                onPress={() => handleRemoveModifiedRecipe(recipe.modifiedId, recipe.nombreReceta)}
                            >
                                <View className="flex-row items-center">
                                    <AntDesign name="delete" size={16} color="#EF4444" />
                                    <Text className="text-red-500 ml-2 font-medium">Eliminar Modificación</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {modifiedRecipes.length > 0 && favoritesRecipes.length > 0 && <View className="border-b border-gray-300 my-4" />}
            </View>
        );
    };


    const renderFavoritos = () => (
        <View className="p-4 pt-0">
            {renderModifiedRecipesList()}

            {favoritesRecipes.length > 0 && (
                modifiedRecipes.length > 0 ? (
                    <Text className="text-lg font-bold text-gray-700 mb-4">Mis Recetas Favoritas</Text>
                ) : (
                    <Text className="text-lg font-bold text-gray-700 mb-4">Mis Recetas Favoritas</Text>
                )
            )}


            {favoritesRecipes.length > 0 ? (
                favoritesRecipes.map((recipe) => (
                    <View key={recipe.idReceta} className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.idReceta })}
                            className="flex-row"
                        >
                            <View className="w-28 h-28 p-2 relative">
                                <RetrieveMediaFile imageUrl={recipe.fotoPrincipal}></RetrieveMediaFile>
                            </View>
                            <View className="flex-1 p-4">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-lg font-bold">{recipe.nombreReceta}</Text>
                                    <View className="flex-row items-center">
                                        <AntDesign name="star" size={16} color="#F59E0B" />
                                        <Text className="ml-1 text-amber-500 font-medium">{recipe.averageRating}</Text>
                                    </View>
                                </View>
                                <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                                    {recipe.descripcionReceta}
                                </Text>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center mr-4">
                                        <FontAwesome name="user" size={14} color="#9CA3AF" />
                                        <Text className="text-xs text-gray-500 ml-1">Por {recipe.nombreUsuario}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <AntDesign name="piechart" size={14} color="#9CA3AF" />
                                        <Text className="text-xs text-gray-500 ml-1">{recipe.porciones}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <AntDesign name="team" size={14} color="#9CA3AF" />
                                        <Text className="text-xs text-gray-500 ml-1">{recipe.cantidadPersonas}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                modifiedRecipes.length === 0 &&
                <Text className="text-gray-500 text-center mt-8">No tienes recetas guardadas aún.</Text>
            )}
        </View>
    )

    const renderMisRecetas = () => (
        <View className="p-4 pt-0">
            {myRecipesInactives.length > 0 && (
                <Text className="text-lg font-bold text-gray-700 mb-4">Recetas en Etapa de Validación</Text>
            )}

            {myRecipesInactives && myRecipesInactives.length > 0 ? (
                myRecipesInactives.map((recipe) => (
                    <View key={`inactive-${recipe.idReceta}`} className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm opacity-70">
                        <View className="flex-row">
                            <View className="w-28 h-28 p-2 relative">
                                <RetrieveMediaFile imageUrl={recipe.fotoPrincipal}></RetrieveMediaFile>
                            </View>
                            <View className="flex-1 p-4">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-lg font-bold">{recipe.nombreReceta}</Text>
                                    <View className="flex-row items-center">
                                        <AntDesign name="star" size={16} color="#F59E0B" />
                                        <Text className="ml-1 text-amber-500 font-medium">{recipe.averageRating}</Text>
                                    </View>
                                </View>
                                <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                    {recipe.descripcionReceta}
                                </Text>
                                <Text className="text-sm text-yellow-600 mt-2">Pendiente de validación</Text>
                            </View>
                        </View>
                    </View>
                ))
            ) : null}

            {myRecipes.content && myRecipes.content.length > 0 && (
                <Text className="text-lg font-bold text-gray-700 mb-4">Mis Recetas Publicadas</Text>
            )}
            {myRecipes.content && myRecipes.content.length > 0 ? (
                myRecipes.content.map((recipe) => (
                    <View key={`active-${recipe.idReceta}`} className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.idReceta })}
                            className="flex-row"
                        >
                            <View className="w-28 h-28 p-2 relative">
                                <RetrieveMediaFile imageUrl={recipe.fotoPrincipal}></RetrieveMediaFile>
                            </View>
                            <View className="flex-1 p-4">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-lg font-bold">{recipe.nombreReceta}</Text>
                                    <View className="flex-row items-center">
                                        <AntDesign name="star" size={16} color="#F59E0B" />
                                        <Text className="ml-1 text-amber-500 font-medium">{recipe.averageRating}</Text>
                                    </View>
                                </View>
                                <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                    {recipe.descripcionReceta}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row border-t border-gray-100">
                            <TouchableOpacity className="flex-1 py-3 items-center border-r border-gray-100">
                                <View className="flex-row items-center">
                                    <AntDesign name="edit" size={16} color="#F59E0B" />
                                    <Text className="text-amber-500 ml-2 font-medium">Editar</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 py-3 items-center"
                                onPress={() => {
                                    setRecipeToDelete(recipe)
                                    setConfirmVisible(true)
                                }}
                            >
                                <View className="flex-row items-center">
                                    <AntDesign name="delete" size={16} color="#EF4444" />
                                    <Text className="text-red-500 ml-2 font-medium">Eliminar</Text>
                                </View>
                            </TouchableOpacity>

                            <ConfirmModal
                                visible={confirmVisible}
                                title="¿Eliminar receta?"
                                message="¿Estás seguro de que quieres eliminar esta receta? Esta acción no se puede deshacer."
                                onCancel={() => {
                                    setConfirmVisible(false)
                                    setRecipeToDelete(null)
                                }}
                                onConfirm={confirmDeleteRecipe}
                            />
                        </View>
                    </View>
                ))
            ) : (
                myRecipesInactives.length === 0 &&
                <Text className="text-gray-500 text-center mt-8">No tienes recetas publicadas aún.</Text>
            )}
        </View>
    )

    const renderCursos = () => (
        <View className="p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Cursos en progreso</Text>
            {loadingCourses ? (
                <ActivityIndicator size="large" color="#F59E0B" className="mt-8" />
            ) : activeCourses.length > 0 ? (
                activeCourses.map((course) => (
                    <CourseCard
                        key={course.idCurso}
                        course={course}
                        isActive={true}
                        onUnsubscribe={() => handleUnsubscribeOption(course)} 
                    />
                ))
            ) : (
                <Text className="text-gray-500 text-center mt-8">No tienes cursos en progreso.</Text>
            )}

            <Text className="text-lg font-bold text-gray-800 mb-4 mt-6">Cursos finalizados</Text>
            {loadingCourses ? (
                <ActivityIndicator size="large" color="#F59E0B" className="mt-8" />
            ) : completedCourses.length > 0 ? (
                completedCourses.map((course) => (
                    <CourseCard
                        key={course.idCurso}
                        course={course}
                        isActive={false} 
                    />
                ))
            ) : (
                <Text className="text-gray-500 text-center mt-8">No tienes cursos finalizados.</Text>
            )}

            <ConfirmModal
                visible={confirmUnsubscribeVisible}
                title="Baja de Curso Confirmada"
                message={
                    `¡Te has dado de baja de "${courseUnsubscribeResult?.courseName || 'el curso'}"!\n\n` +
                    `Reintegro: ${courseUnsubscribeResult?.refundPercentage}% (${formatPrice(courseUnsubscribeResult?.refundAmount)}) ` +
                    `en ${courseUnsubscribeResult?.medioDevolucion === 'tarjeta' ? 'tu tarjeta' : 'tu cuenta corriente'}.\n\n` +
                    (courseUnsubscribeResult?.refundMessage || 'Operación completada exitosamente.')
                }
                onCancel={navigateToHomeCursos}
                onConfirm={navigateToHomeCursos}
                confirmText="Ok"
                cancelText="Ok"
            />

            <RefundOptionsModal
                visible={showRefundOptionsModal}
                onClose={() => setShowRefundOptionsModal(false)}
                courseDetails={courseForRefundSelection}
                onConfirmRefund={confirmUnsubscribeWithRefundType}
            />
        </View>
    )


    const renderTabContent = () => {
        switch (activeTab) {
            case "favoritos":
                return renderFavoritos()
            case "recetas":
                return renderMisRecetas()
            case "cursos":
                return renderCursos()
            case "miCuenta": 
                return <MyCount />
            default:
                return renderFavoritos()
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F5F3E4", paddingTop: insets.top }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F3E4" />

            <View className="bg-amber-100 p-4 pb-8 rounded-b-3xl shadow-md">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <AntDesign name="arrowleft" size={24} color="#333" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogout} className="px-4 py-2 bg-red-500 rounded-full shadow-sm">
                        <Text className="text-white font-semibold text-sm">Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center px-2">
                    <UserAvatar
                        sizeClasses="w-20 h-20" 
                        textSizeClasses="text-4xl" 
                    />

                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-2xl font-extrabold text-gray-800 mb-1">
                            {firstName} {lastName}
                        </Text>
                        <Text className="text-gray-700 text-base mb-2">@{username}</Text>
                        <Text className="text-gray-700 text-base mb-2">{email}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")} className="flex-row self-start rounded-full bg-amber-400 px-4 py-2">
                            <MaterialCommunityIcons name="pencil-outline" size={16} color="#fff" />
                            <Text className="text-white text-sm ml-1">Editar perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View className="flex-row justify-center mt-6">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            className={`w-3 h-3 rounded-full mx-1 ${activeTab === tab.id ? "bg-gray-800" : "bg-gray-400"}`}
                            onPress={() => setActiveTab(tab.id)}
                        />
                    ))}
                </View>
            </View>

            <View className="bg-white border-b border-gray-200">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            className={`py-3 px-4 mr-2 ${activeTab === tab.id ? "border-b-2 border-amber-400" : ""}`}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text className={`font-medium ${activeTab === tab.id ? "text-amber-500" : "text-gray-500"}`}>
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {renderTabContent()}
            </ScrollView>

            {/* ConfirmModal para eliminar receta modificada */}
            <ConfirmModal
                visible={confirmModifiedVisible}
                title="¿Eliminar Receta Modificada?"
                message={`¿Estás seguro de que quieres eliminar la receta modificada "${modifiedRecipeToDelete?.recipeName || 'esta receta'}"? Esta acción no se puede deshacer localmente.`}
                onCancel={() => {
                    setConfirmModifiedVisible(false);
                    setModifiedRecipeToDelete(null);
                }}
                onConfirm={confirmRemoveModifiedRecipe}
                confirmText="Sí, eliminar"
            />
        </View>
    )
}

export default Profile
