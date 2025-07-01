import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Alert, SafeAreaView, StyleSheet } from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDatosWithAuth } from "api/crud";
import { Contexto } from "contexto/Provider";

const MyCourses = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { courseId, scheduleId } = route.params || {};
    const { userId, token } = useContext(Contexto);
    
    const [courseData, setCourseData] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [attendedClasses, setAttendedClasses] = useState(0);
    const [isApproved, setIsApproved] = useState(false);
    const [approvalMessage, setApprovalMessage] = useState('');

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    };
    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) return "$0";
        return `$${price.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    const fetchAllData = useCallback(async () => {
        if (!courseId || !scheduleId || !userId || !token) {
            setError("Faltan datos para cargar la pantalla.");
            if(loading) setLoading(false);
            return;
        }
        
        try {
            const [courseRes, attendanceRes] = await Promise.all([
                getDatosWithAuth(`course/${courseId}`, 'Error al cargar detalles', token),
                getDatosWithAuth(`course/verify-attendance/student/${userId}/schedule/${scheduleId}`, "Error al verificar asistencia", token)
            ]);

            setCourseData(courseRes);
            const foundSchedule = courseRes.cronogramaCursos?.find(s => s.idCronograma === scheduleId);
            if (foundSchedule) {
                setSelectedSchedule(foundSchedule);
            } else {
                throw new Error("Cronograma no encontrado.");
            }

            setAttendedClasses(attendanceRes.clasesAsistidas);
            setIsApproved(attendanceRes.aprobado);
            setApprovalMessage(attendanceRes.mensaje);

        } catch (err) {
            setError(err.message);
        } finally {
            if (loading) setLoading(false);
        }
    }, [courseId, scheduleId, userId, token]);
    
    useFocusEffect(
        useCallback(() => {
            fetchAllData();
        }, [fetchAllData])
    );

    const handleAttendance = useCallback(() => {
        navigation.navigate("ScanQR", { courseId, scheduleId });
    }, [courseId, scheduleId]);

    if (loading) { return <SafeAreaView style={styles.centerScreen}><ActivityIndicator size="large" color="#F59E0B" /></SafeAreaView>; }
    if (error) { return <SafeAreaView style={styles.centerScreen}><Text style={{ color: 'red' }}>Error: {error}</Text></SafeAreaView>; }
    if (!courseData || !selectedSchedule) { return <SafeAreaView style={styles.centerScreen}><Text>No se encontraron datos.</Text></SafeAreaView>; }

    const attendancePercentage = courseData.duracion > 0 ? (attendedClasses / courseData.duracion) * 100 : 0;
    const isCourseActive = new Date(selectedSchedule.fechaFin) >= new Date();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Detalles de Mi Curso</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text className="text-2xl font-bold text-gray-800 mb-2">{courseData.nombreCurso}</Text>
                <Text className="text-gray-700 mb-4 text-base leading-relaxed">{courseData.descripcion}</Text>
                
                <View className="flex-row flex-wrap mb-4">
                    <View className="flex-row items-center mr-4 mb-2 w-full"><MaterialIcons name="location-on" size={16} color="#9CA3AF" /><Text className="text-gray-600 ml-1">Sede: {selectedSchedule.nombreSede}</Text></View>
                    <View className="flex-row items-center mr-4 mb-2 w-full"><AntDesign name="calendar" size={16} color="#9CA3AF" /><Text className="text-gray-600 ml-1">Fechas: {formatDate(selectedSchedule.fechaInicio)} - {formatDate(selectedSchedule.fechaFin)}</Text></View>
                    <View className="flex-row items-center mr-4 mb-2"><AntDesign name="book" size={16} color="#9CA3AF" /><Text className="text-gray-600 ml-1">Clases totales: {courseData.duracion}</Text></View>
                    <View className="flex-row items-center mb-2"><MaterialIcons name="category" size={16} color="#9CA3AF" /><Text className="text-gray-600 ml-1">Modalidad: {courseData.modalidad}</Text></View>
                    <View className="flex-row items-center mb-2"><MaterialIcons name="attach-money" size={16} color="#9CA3AF" /><Text className="text-gray-600 ml-1">Precio: {formatPrice(courseData.precio)}</Text></View>
                </View>

                <View className="mb-6">
                    <View className="flex-row justify-between mb-1"><Text className="text-gray-700 font-medium">Clases Asistidas</Text><Text className="text-amber-500 font-medium">{attendedClasses} / {courseData.duracion} clases</Text></View>
                    <View className="w-full bg-gray-200 rounded-full h-3"><View className="bg-amber-400 h-3 rounded-full" style={{ width: `${attendancePercentage}%` }} /></View>
                </View>

                { !isCourseActive && (
                    <View className={`p-4 rounded-lg mb-6 ${isApproved ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Text className={`font-bold text-lg ${isApproved ? 'text-green-800' : 'text-red-800'}`}>Estado: {isApproved ? 'APROBADO' : 'NO APROBADO'}</Text>
                        <Text className={`mt-1 ${isApproved ? 'text-green-700' : 'text-red-700'}`}>{approvalMessage}</Text>
                    </View>
                )}
                
                {isCourseActive && (<TouchableOpacity className="bg-amber-400 rounded-lg py-3 items-center mb-6" onPress={handleAttendance}><Text className="text-white font-bold">Realizar asistencia</Text></TouchableOpacity>)}

                <Text className="text-lg font-bold text-gray-800 mb-4">Contenidos del curso</Text>
                <View className="bg-white rounded-lg p-4 mb-3 border border-gray-100 shadow-sm"><Text className="text-gray-800 font-medium mb-2">Qué aprenderás:</Text><Text className="text-gray-600 text-sm leading-relaxed">{courseData.contenidos}</Text></View>

                {courseData.requerimientos && (<><Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Requerimientos</Text><View className="bg-white rounded-lg p-4 mb-3 border border-gray-100 shadow-sm"><Text className="text-gray-600 text-sm leading-relaxed">{courseData.requerimientos}</Text></View></>)}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#FEF3E2' },
    content: { padding: 16, flexGrow: 1 }, // Se agrega flexGrow para asegurar que el ScrollView se expanda
});

export default MyCourses;