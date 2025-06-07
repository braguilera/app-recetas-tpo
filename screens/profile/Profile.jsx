import { useContext, useEffect, useState } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
// Importa las nuevas funciones con autenticación
import { deleteDatosWithAuth, getRecipesPaginated, getDatosWithAuth, postDatos } from "api/crud"
import ConfirmModal from "../../components/common/ConfirmModal"
import { Contexto } from "../../contexto/Provider" // Importa tu contexto de autenticación

const Profile = () => {
    const navigation = useNavigation()
    const insets = useSafeAreaInsets()
    const { userId, username, firstname, logeado, logout } = useContext(Contexto); // Obtén el userId y username del contexto

    const [activeTab, setActiveTab] = useState("favoritos")
    const [myRecipes, setMyRecipes] = useState({ content: [] }) // Inicializa con un objeto que contenga 'content'
    const [confirmVisible, setConfirmVisible] = useState(false)
    const [recipeToDelete, setRecipeToDelete] = useState(null)
    const [userProfile, setUserProfile] = useState(null); // Estado para guardar los datos del perfil del usuario

    // Datos simulados (mantener por ahora o reemplazar con datos reales de la API si los tienes)
    const favoriteCategories = [
        { id: 1, name: "Favoritos", icon: "heart", count: 12 },
        { id: 2, name: "Equivalencias", icon: "swap-horizontal", count: 8 },
        { id: 3, name: "Postres", icon: "cupcake", count: 15 },
        { id: 4, name: "Saludables", icon: "leaf", count: 6 },
    ]

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
            Alert.alert("Cierre de Sesión", "Has cerrado sesión correctamente.");
            navigation.replace("AuthStack", { screen: "Login" });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            const errorMessage = error.message || 'Ocurrió un error al cerrar sesión.';
            Alert.alert("Error al Cerrar Sesión", errorMessage);
        }
    }

    const confirmDeleteRecipe = async () => {
        if (!recipeToDelete) return
        try {
            await deleteDatosWithAuth(`recipe/delete/${recipeToDelete.idReceta}`, "Error al borrar la receta")
            await fetchRecipes(0)
        } catch (error) {
            console.error("Error al borrar receta:", error.message)
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
                page: page.toString(),
                size: "10",
                sort: ["nombreReceta,asc"],
                name: "",
                userName: username,
                rating: "",
                includeIngredientId: "",
                excludeIngredientId: "",
                tipoRecetaId: "",
            }

            const data = await getRecipesPaginated(params, 'Error al cargar recetas')
            setMyRecipes(data || { content: [] })
            console.log("Mis Recetas:", data)

        } catch (error) {
            console.error("Error fetching recipes:", error.message)
        }
    }

    const fetchUserProfileData = async () => {
        if (!userId) {
            console.warn("User ID no disponible para cargar perfil.");
            return;
        }
        try {
            const data = await getDatosWithAuth(`user/${userId}`, 'Error al cargar el perfil del usuario');
            console.log(data)
            setUserProfile(data);
            console.log("Datos del perfil del usuario:", data);
        } catch (error) {
            console.error("Error al obtener el perfil del usuario:", error.message);
        }
    };

    useEffect(() => {
        fetchUserProfileData();
        if (username) {
            fetchRecipes(0);
        }
    }, [userId, username]);

    useEffect(() => {
        if (username && myRecipes.content.length === 0) {
            fetchRecipes(0);
        }
    }, [username]);

    // **Nueva función para renderizar el avatar del usuario**
    const renderUserAvatar = () => {
        const defaultAvatar = "https://picsum.photos/id/64/200/300"; // Una imagen por defecto si userProfile.avatar es nulo o vacío
        const userNameInitial = userProfile?.nombre ? userProfile.nombre.charAt(0).toUpperCase() : '';
        const hasAvatar = userProfile?.avatar && userProfile.avatar.trim() !== '';

        return (
            <View className="w-20 h-20 rounded-full overflow-hidden items-center justify-center bg-gray-300"> {/* Fondo gris por si no hay imagen */}
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

    const renderFavoritos = () => (
        <View className="p-4">
            <View className="flex-row flex-wrap justify-between">
                {favoriteCategories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        className="w-[48%] bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm"
                        onPress={() =>
                            navigation.navigate("SaveRecipe", {
                                categoryId: category.id,
                                categoryName: category.name,
                            })
                        }
                    >
                        <View className="items-center">
                            <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-3">
                                <MaterialCommunityIcons name={category.icon} size={32} color="#F59E0B" />
                            </View>
                            <Text className="text-gray-800 font-medium text-center mb-1">{category.name}</Text>
                            <Text className="text-gray-500 text-sm">{category.count} recetas</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )

    const renderMisRecetas = () => (
        <View className="p-4">
            {myRecipes.content && myRecipes.content.length > 0 ? (
                myRecipes.content.map((recipe) => (
                    <View key={recipe.idReceta} className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("DetailsRecipes", { recipeId: recipe.idReceta })}
                            className="flex-row"
                        >
                            <Image source={{ uri: `https://picsum.photos/seed/${recipe.idReceta}/200/200` }} className="w-24 h-24" />
                            <View className="flex-1 p-4">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-lg font-bold">{recipe.nombreReceta}</Text>
                                    <View className="flex-row items-center">
                                        <AntDesign name="star" size={16} color="#F59E0B" />
                                        <Text className="ml-1 text-amber-500 font-medium">{recipe.averageRating}</Text>
                                    </View>
                                </View>
                                <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                    Descripción breve de la receta que se muestra aquí para dar una idea del contenido.
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
                <Text className="text-gray-500 text-center mt-8">No tienes recetas publicadas aún.</Text>
            )}
        </View>
    )

    const renderCursos = () => (
        <View className="p-4">
            {/* Cursos Activos */}
            <Text className="text-lg font-bold text-gray-800 mb-4">Cursos en progreso</Text>
            {myCourses.active.map((course) => (
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

                        {/* Barra de progreso */}
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
            ))}

            {/* Cursos Completados */}
            <Text className="text-lg font-bold text-gray-800 mb-4 mt-6">Cursos finalizados</Text>
            {myCourses.completed.map((course) => (
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
            ))}
        </View>
    )

    const renderCalificaciones = () => (
        <View className="p-4">
            {myReviews.map((review) => (
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
            ))}
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

            {/* Header del Perfil - Sección de datos del usuario */}
            <View className="bg-amber-100 p-4 pb-8 rounded-b-3xl shadow-md"> {/* Añadido padding bottom y rounded corners */}
                <View className="flex-row items-center justify-between mb-6"> {/* Espacio inferior */}
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <AntDesign name="arrowleft" size={24} color="#333" />
                    </TouchableOpacity>

                    {/* Botón de cerrar sesión a la derecha del todo */}
                    <TouchableOpacity onPress={handleLogout} className="px-4 py-2 bg-red-500 rounded-full shadow-sm">
                        <Text className="text-white font-semibold text-sm">Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar y Datos del Usuario */}
                <View className="flex-row items-center px-2"> {/* Alineación y padding */}
                    {renderUserAvatar()} {/* Llama a la función para renderizar el avatar */}

                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-2xl font-extrabold text-gray-800 mb-1">
                            {userProfile ? `${userProfile.nombre} ${userProfile.apellido}` : 'Cargando...'}
                        </Text>
                        <Text className="text-gray-700 text-base mb-2">@{userProfile ? userProfile.nickname : 'Cargando...'}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")} className="flex-row items-center">
                            <MaterialCommunityIcons name="pencil-outline" size={16} color="#F59E0B" />
                            <Text className="text-amber-600 text-sm ml-1">Editar perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs Navigation (dots) - Cambiado de posición para estar debajo de los datos del usuario */}
                <View className="flex-row justify-center mt-6"> {/* Margen superior para separarlo */}
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={tab.id}
                            className={`w-3 h-3 rounded-full mx-1 ${activeTab === tab.id ? "bg-gray-800" : "bg-gray-400"}`}
                            onPress={() => setActiveTab(tab.id)}
                        />
                    ))}
                </View>
            </View>

            {/* Tab Labels */}
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

            {/* Tab Content */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {renderTabContent()}
            </ScrollView>

        </View>
    )
}

export default Profile