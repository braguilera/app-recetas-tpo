import React, { useState, useEffect, useContext, useCallback } from "react"
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Alert, SafeAreaView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatosWithAuth } from "api/crud"
import { Contexto } from "contexto/Provider"

const MyCourses = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const insets = useSafeAreaInsets()

    const { courseId, scheduleId } = route.params || {}
    console.log("Course ID:", courseId, "Schedule ID:", scheduleId)

    const { userId, token } = useContext(Contexto) 

    const [courseData, setCourseData] = useState(null) 
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null) 

    const [attendedClasses, setAttendedClasses] = useState(0); 

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) {
            return "$0";
        }
        return `$${price.toLocaleString("es-AR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const fetchCourseDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!courseId || !scheduleId || !userId || !token) {
            setError("Faltan datos para cargar los detalles del curso. Asegúrate de estar logueado y que los IDs del curso y cronograma sean válidos.");
            setLoading(false);
            return;
        }

        try {
            const courseRes = await getDatosWithAuth(`course/${courseId}`, 'Error al cargar los detalles del curso', token);
            setCourseData(courseRes);

            const foundSchedule = courseRes.cronogramaCursos?.find(s => s.idCronograma === scheduleId);
            if (foundSchedule) {
                setSelectedSchedule(foundSchedule);
            } else {
                setError("El cronograma específico no fue encontrado para este curso.");
            }

        } catch (err) {
            console.error("Error fetching course details:", err);
            setError(err.message || "No se pudieron cargar los detalles del curso.");
        } finally {
            setLoading(false);
        }
    }, [courseId, scheduleId, userId, token]);

    useEffect(() => {
        fetchCourseDetails();
    }, [fetchCourseDetails]);

    const handleAttendance = useCallback(() => {
        if (courseData?.idCurso && selectedSchedule?.idCronograma) {
            navigation.navigate("ScanQR", {
                courseId: courseData.idCurso,
                scheduleId: selectedSchedule.idCronograma,
            });
        } else {
            Alert.alert("Error", "No se pudo obtener la información necesaria para la asistencia.");
        }
    }, [courseData, selectedSchedule, navigation]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text className="mt-4 text-gray-600">Cargando detalles del curso...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
                <Text className="text-red-500 text-lg text-center">Error: {error}</Text>
                <TouchableOpacity
                    className="mt-6 bg-amber-400 py-3 px-6 rounded-xl"
                    onPress={fetchCourseDetails} 
                >
                    <Text className="text-white font-bold">Reintentar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="mt-4 py-2 px-4 rounded-xl border border-gray-300"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-gray-700">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!courseData || !selectedSchedule) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
                <Text className="text-gray-500 text-lg text-center">No se encontraron detalles completos para este curso o su cronograma. Por favor, intente de nuevo.</Text>
                <TouchableOpacity
                    className="mt-4 py-2 px-4 rounded-xl border border-gray-300"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-gray-700">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const attendancePercentage = courseData.duracion > 0
        ? (attendedClasses / courseData.duracion) * 100
        : 0;

    const isCourseActive = new Date(selectedSchedule.fechaFin) >= new Date();

    return (
        <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

            <View className="flex-row items-center p-4 border-b border-gray-200">
                <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
                    <AntDesign name="arrowleft" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Detalles de Mi Curso</Text>
            </View>

            <ScrollView className="flex-1">
                <View className="p-4">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">{courseData.nombreCurso}</Text>
                    <Text className="text-gray-700 mb-4 text-base leading-relaxed">
                        {courseData.descripcion}
                    </Text>

                    <View className="flex-row flex-wrap mb-4">
                        <View className="flex-row items-center mr-4 mb-2 w-full">
                            <MaterialIcons name="location-on" size={16} color="#9CA3AF" />
                            <Text className="text-gray-600 ml-1">Sede: {selectedSchedule.nombreSede}</Text>
                        </View>
                        <View className="flex-row items-center mr-4 mb-2 w-full">
                            <AntDesign name="calendar" size={16} color="#9CA3AF" />
                            <Text className="text-gray-600 ml-1">
                                Fechas: {formatDate(selectedSchedule.fechaInicio)} - {formatDate(selectedSchedule.fechaFin)}
                            </Text>
                        </View>
                        <View className="flex-row items-center mr-4 mb-2">
                            <AntDesign name="book" size={16} color="#9CA3AF" />
                            <Text className="text-gray-600 ml-1">Clases totales: {courseData.duracion}</Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="category" size={16} color="#9CA3AF" />
                            <Text className="text-gray-600 ml-1">Modalidad: {courseData.modalidad}</Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="attach-money" size={16} color="#9CA3AF" />
                            <Text className="text-gray-600 ml-1">Precio: {formatPrice(courseData.precio)}</Text>
                        </View>
                    </View>

                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-gray-700 font-medium">Clases Asistidas</Text>
                            <Text className="text-amber-500 font-medium">{attendedClasses} / {courseData.duracion} clases</Text>
                        </View>
                        <View className="w-full bg-gray-200 rounded-full h-3">
                            <View className="bg-amber-400 h-3 rounded-full" style={{ width: `${attendancePercentage}%` }} />
                        </View>
                    </View>

                    {isCourseActive && ( 
                        <TouchableOpacity className="bg-amber-400 rounded-lg py-3 items-center mb-6" onPress={handleAttendance}>
                            <Text className="text-white font-bold">Realizar asistencia</Text>
                        </TouchableOpacity>
                    )}

                    <Text className="text-lg font-bold text-gray-800 mb-4">Contenidos del curso</Text>
                    <View className="bg-white rounded-lg p-4 mb-3 border border-gray-100 shadow-sm">
                        <Text className="text-gray-800 font-medium mb-2">Qué aprenderás:</Text>
                        <Text className="text-gray-600 text-sm leading-relaxed">
                            {courseData.contenidos}
                        </Text>
                    </View>

                    {courseData.requerimientos && (
                        <>
                            <Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Requerimientos</Text>
                            <View className="bg-white rounded-lg p-4 mb-3 border border-gray-100 shadow-sm">
                                <Text className="text-gray-600 text-sm leading-relaxed">
                                    {courseData.requerimientos}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

export default MyCourses
