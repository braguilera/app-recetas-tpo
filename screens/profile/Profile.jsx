import { useContext, useEffect, useState, useCallback } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { deleteDatosWithAuth, getRecipesPaginated, getDatosWithAuth, postDatos, getRecipesPaginatedWithAuth } from "api/crud"
import ConfirmModal from "../../components/common/ConfirmModal" // Asegúrate de que esta ruta sea correcta
import { Contexto } from "../../contexto/Provider"
import RetrieveMediaFile from "components/utils/RetrieveMediaFile"

const Profile = () => {
    const navigation = useNavigation()
    const insets = useSafeAreaInsets()
    // Destructure modifiedRecipes and removeModifiedRecipe from context
    const { userId, username, firstName, lastName, email, logeado, logout, modifiedRecipes, removeModifiedRecipe } = useContext(Contexto);

    const [activeTab, setActiveTab] = useState("favoritos")
    const [myRecipes, setMyRecipes] = useState({ content: [] })
    const [confirmVisible, setConfirmVisible] = useState(false) // Para borrar recetas publicadas
    const [recipeToDelete, setRecipeToDelete] = useState(null) // Para borrar recetas publicadas
    const [userProfile, setUserProfile] = useState(null);
    const [myRecipesInactives, setMyRecipesInactives] = useState([]);
    const [favoritesRecipes, setFavoritesRecipes] = useState([]);

    // NUEVOS estados para el modal de confirmación de recetas modificadas
    const [confirmModifiedVisible, setConfirmModifiedVisible] = useState(false);
    const [modifiedRecipeToDelete, setModifiedRecipeToDelete] = useState(null);


    const myCourses = {
        active: [
            { id: 1, name: "Pastelería Avanzada", progress: 60, instructor: "Chef María" },
            { id: 2, name: "Cocina Mediterránea", progress: 30, instructor: "Chef Carlos" },
        ],
        completed: [
            { id: 3, name: "Cocina Básica", completedAt: "2023-12-15", instructor: "Chef Ana" },
            { id: 4, name: "Repostería Francesa", completedAt: "2023-11-20", instructor: "Chef Pierre" },
        ],
    }

    const myReviews = [
        {
            id: 1,
            recipeTitle: "Pizza Napolitana",
            rating: 5,
            comment: "Estas pizzas están increíbles con queso.",
            date: "2024-01-20",
            recipeId: 1,
        },
        {
            id: 2,
            recipeTitle: "Empanadas",
            rating: 4,
            comment: "Estas empanadas están increíbles.",
            date: "2024-01-18",
            recipeId: 2,
        },
        {
            id: 3,
            recipeTitle: "Tacos al Pastor",
            rating: 5,
            comment: "Perfectos para una cena familiar.",
            date: "2024-01-15",
            recipeId: 3,
        },
    ]

    const tabs = [
        { id: "favoritos", name: "Favoritos" },
        { id: "recetas", name: "Mis Recetas" },
        { id: "cursos", name: "Cursos" },
        { id: "calificaciones", name: "Calificaciones" },
    ]

    const handleLogout = async () => {
        try {
            await logout();
            await postDatos('auth/logout', {}, 'Error al cerrar sesión en el backend');
            navigation.replace("MainTabs");
        } catch (error) {
            console.log("Error al cerrar sesión:", error);
            Alert.alert("Error", error.message || 'Ocurrió un error al cerrar sesión.');
        }
    }

    const confirmDeleteRecipe = async () => {
        if (!recipeToDelete) return
        try {
            await deleteDatosWithAuth(`recipe/delete/${recipeToDelete.idReceta}`, "Error al borrar la receta")
            await fetchRecipes(0)
        } catch (error) {
            console.log("Error al borrar receta:", error.message)
            Alert.alert("Error", error.message || "Ocurrió un error al eliminar la receta.");
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

    // Modificado para usar ConfirmModal
    const handleRemoveModifiedRecipe = useCallback((modifiedId, recipeName) => {
        setModifiedRecipeToDelete({ modifiedId, recipeName });
        setConfirmModifiedVisible(true);
    }, []);

    // Nueva función para confirmar la eliminación de receta modificada
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


    useEffect(() => {
        fetchUserProfileData();
        if (username) {
            fetchRecipes(0);
            fetchFavorites();
            fetchRecipesInactives();
        }
    }, [userId, username]);

    useEffect(() => {
        if (username && myRecipes.content.length === 0) {
            fetchRecipes(0);
        }
    }, [username]);


    const renderUserAvatar = () => {
        const userNameInitial = userProfile?.nombre ? userProfile.nombre.charAt(0).toUpperCase() : '';
        const hasAvatar = userProfile?.avatar && userProfile.avatar.trim() !== '';

        return (
            <View className="w-20 h-20 rounded-full overflow-hidden items-center justify-center bg-gray-300">
                {hasAvatar ? (
                    <Image source={{ uri: userProfile.avatar }} className="w-full h-full object-cover" />
                ) : (
                    <View className="w-full h-full rounded-full items-center justify-center bg-amber-500">
                        <Text className="text-white text-4xl font-bold">
                            {userNameInitial}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <AntDesign key={index} name="star" size={14} color={index < rating ? "#F59E0B" : "#E5E7EB"} />
        ))
    }

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
                                modifiedData: recipe // Pass the full modified object
                            })}
                            className="flex-row"
                        >
                            <View className="w-28 h-28 p-2 relative">
                                <RetrieveMediaFile imageUrl={recipe.fotoPrincipal}></RetrieveMediaFile>
                            </View>
                            <View className="flex-1 p-4">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-lg font-bold">{recipe.nombreReceta}</Text>
                                    {/* Display modified persons if relevant */}
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
            {myCourses.active.length > 0 ? (
                myCourses.active.map((course) => (
                    <View key={course.id} className="bg-white rounded-xl mb-4 p-4 border border-gray-100 shadow-sm">
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("MyCourses", {
                                    courseId: course.id,
                                    isActive: true,
                                })
                            }
                        >
                            <Text className="text-lg font-bold text-gray-800 mb-1">{course.name}</Text>
                            <Text className="text-gray-600 text-sm mb-3">Instructor: {course.instructor}</Text>

                            <View className="mb-3">
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-gray-500 text-sm">Progreso</Text>
                                    <Text className="text-amber-500 text-sm font-medium">{course.progress}%</Text>
                                </View>
                                <View className="w-full bg-gray-200 rounded-full h-2">
                                    <View className="bg-amber-400 h-2 rounded-full" style={{ width: `${course.progress}%` }} />
                                </View>
                            </View>
                        </TouchableOpacity>

                        {logeado &&
                            <TouchableOpacity className="bg-red-50 py-2 px-4 rounded-lg">
                                <Text className="text-red-600 font-medium text-center">Darse de baja</Text>
                            </TouchableOpacity>
                        }
                    </View>
                ))
            ) : (
                <Text className="text-gray-500 text-center mt-8">No tienes cursos en progreso.</Text>
            )}

            <Text className="text-lg font-bold text-gray-800 mb-4 mt-6">Cursos finalizados</Text>
            {myCourses.completed.length > 0 ? (
                myCourses.completed.map((course) => (
                    <TouchableOpacity
                        key={course.id}
                        className="bg-green-50 rounded-xl mb-4 p-4 border border-green-100"
                        onPress={() =>
                            navigation.navigate("MyCourses", {
                                courseId: course.id,
                                isActive: false,
                            })
                        }
                    >
                        <Text className="text-lg font-bold text-gray-800 mb-1">{course.name}</Text>
                        <Text className="text-gray-600 text-sm mb-1">Instructor: {course.instructor}</Text>
                        <View className="flex-row items-center">
                            <AntDesign name="checkcircle" size={16} color="#10B981" />
                            <Text className="text-green-600 text-sm ml-2">Completado el {course.completedAt}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text className="text-gray-500 text-center mt-8">No tienes cursos finalizados.</Text>
            )}
        </View>
    )

    const renderCalificaciones = () => (
        <View className="p-4">
            {myReviews.length > 0 ? (
                myReviews.map((review) => (
                    <TouchableOpacity
                        key={review.id}
                        className="bg-white rounded-xl mb-4 p-4 border border-gray-100 shadow-sm"
                        onPress={() => navigation.navigate("DetailsRecipes", { recipeId: review.recipeId })}
                    >
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-lg font-bold text-gray-800 flex-1">{review.recipeTitle}</Text>
                            <Text className="text-amber-500 font-bold text-lg ml-2">{review.rating}</Text>
                        </View>

                        <View className="flex-row mb-3">{renderStars(review.rating)}</View>

                        <Text className="text-gray-700 mb-3">{review.comment}</Text>

                        <Text className="text-gray-400 text-sm">{review.date}</Text>
                    </TouchableOpacity>
                ))
            ) : (
                <Text className="text-gray-500 text-center mt-8">No tienes calificaciones aún.</Text>
            )}
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
            case "calificaciones":
                return renderCalificaciones()
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

                {/* User dates */}
                <View className="flex-row items-center px-2">
                    {renderUserAvatar()}

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
