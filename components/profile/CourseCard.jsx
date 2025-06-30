import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import RetrieveMediaFile from "components/utils/RetrieveMediaFile"; // Asegúrate de que la ruta sea correcta

const CourseCard = ({ course, isActive, onUnsubscribe, onPressCard }) => {
    // Helper para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Obtenemos el primer cronograma si existe
    const firstSchedule = course.cronogramaCursos && course.cronogramaCursos.length > 0
        ? course.cronogramaCursos[0]
        : null;

    return (
        <TouchableOpacity
            key={course.idCurso}
            className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm"
            onPress={onPressCard} // Usa la prop onPressCard para la navegación
        >
            <View className="flex-row">
                <View className="w-28 h-28 p-2 relative">
                    {/* Asumiendo que course.fotoPrincipal puede existir para cursos */}
                    {course.fotoPrincipal ? (
                        <RetrieveMediaFile imageUrl={course.fotoPrincipal} />
                    ) : (
                        <Image
                            source={{ uri: `https://placehold.co/112x112/E5E7EB/4B5563?text=Curso` }}
                            className="w-full h-full rounded-md object-cover"
                        />
                    )}
                </View>
                <View className="flex-1 p-4">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-lg font-bold text-gray-800 flex-1">{course.nombreCurso}</Text>
                        {isActive && (
                            <View className="bg-green-100 rounded-full px-3 py-1 ml-2">
                                <Text className="text-green-700 text-xs font-semibold">En progreso</Text>
                            </View>
                        )}
                        {!isActive && (
                            <View className="bg-blue-100 rounded-full px-3 py-1 ml-2">
                                <Text className="text-blue-700 text-xs font-semibold">Finalizado</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                        {course.descripcion || 'Sin descripción disponible.'}
                    </Text>

                    {/* Mostrar Sede solo si hay un cronograma disponible */}
                    {firstSchedule && firstSchedule.nombreSede && (
                        <View className="flex-row items-center mb-1">
                            <MaterialIcons name="location-on" size={14} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 ml-1">Sede: {firstSchedule.nombreSede}</Text>
                        </View>
                    )}

                    {/* Mostrar Fechas solo si hay un cronograma disponible */}
                    {firstSchedule && firstSchedule.fechaInicio && firstSchedule.fechaFin && (
                        <View className="flex-row items-center mb-1">
                            <AntDesign name="calendar" size={14} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 ml-1">
                                {formatDate(firstSchedule.fechaInicio)} - {formatDate(firstSchedule.fechaFin)}
                            </Text>
                        </View>
                    )}

                    {/* Mostrar Duración (clases totales) */}
                    {course.duracion !== undefined && (
                        <View className="flex-row items-center mb-1">
                            <AntDesign name="book" size={14} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 ml-1">Clases: {course.duracion}</Text>
                        </View>
                    )}
                </View>
            </View>
            {isActive && onUnsubscribe && (
                <View className="flex-row border-t border-gray-100">
                    <TouchableOpacity
                        className="flex-1 py-3 items-center"
                        onPress={onUnsubscribe}
                    >
                        <View className="flex-row items-center">
                            <AntDesign name="closecircleo" size={16} color="#EF4444" />
                            <Text className="text-red-500 ml-2 font-medium">Dar de baja</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default CourseCard;
