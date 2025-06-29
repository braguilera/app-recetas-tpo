import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CourseCard = ({ course, isActive, onUnsubscribe }) => {
    const navigation = useNavigation();

    // Helper function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Determine the relevant schedule (assuming the first one for simplicity if multiple)
    const schedule = course.cronogramaCursos && course.cronogramaCursos.length > 0
        ? course.cronogramaCursos[0]
        : null;

    const courseDurationUnit = course.duracion === 1 ? "hora" : "horas"; // Adjust text for singular/plural

    return (
        <View className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
            <TouchableOpacity
                onPress={() => navigation.navigate("DetailsCourses", { courseId: course.idCurso })}
                className="p-4"
            >
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold text-gray-800 flex-1">{course.nombreCurso}</Text>
                    {course.modalidad && (
                        <View className="flex-row items-center ml-2 bg-amber-50 px-2 py-1 rounded-md">
                            {course.modalidad === "presencial" ? (
                                <MaterialIcons name="location-on" size={16} color="#F59E0B" />
                            ) : (
                                <MaterialIcons name="laptop" size={16} color="#F59E0B" />
                            )}
                            <Text className="text-xs font-medium text-amber-500 ml-1 capitalize">
                                {course.modalidad}
                            </Text>
                        </View>
                    )}
                </View>
                <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                    {course.descripcion}
                </Text>

                {schedule && (
                    <View className="mt-2">
                        <View className="flex-row items-center mb-1">
                            <MaterialIcons name="event" size={14} color="#6B7280" />
                            <Text className="text-xs text-gray-600 ml-1">
                                Sede: {schedule.nombreSede}
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-1">
                            <AntDesign name="calendar" size={14} color="#6B7280" />
                            <Text className="text-xs text-gray-600 ml-1">
                                {formatDate(schedule.fechaInicio)} - {formatDate(schedule.fechaFin)}
                            </Text>
                        </View>
                    </View>
                )}

                <View className="flex-row items-center mt-2">
                    <AntDesign name="clockcircleo" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-600 ml-1">
                        Duración: {course.duracion} {courseDurationUnit}
                    </Text>
                </View>

                {isActive ? (
                    // Display progress for active courses (hardcoded for now as backend doesn't provide progress)
                    <View className="mb-3 mt-4">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-gray-500 text-sm">Progreso</Text>
                            <Text className="text-amber-500 text-sm font-medium">0%</Text> {/* Placeholder */}
                        </View>
                        <View className="w-full bg-gray-200 rounded-full h-2">
                            <View className="bg-amber-400 h-2 rounded-full" style={{ width: `0%` }} /> {/* Placeholder */}
                        </View>
                    </View>
                ) : (
                    // Display completion date for completed courses
                    <View className="flex-row items-center mt-4">
                        <AntDesign name="checkcircle" size={16} color="#10B981" />
                        <Text className="text-green-600 text-sm ml-2">Completado el {formatDate(schedule?.fechaFin)}</Text> {/* Assuming completion date is fechaFin of the schedule */}
                    </View>
                )}
            </TouchableOpacity>

            {isActive && onUnsubscribe && (
                <View className="border-t border-gray-100 mt-2">
                    <TouchableOpacity
                        className="bg-red-50 py-3 px-4 rounded-b-xl flex-row items-center justify-center"
                        onPress={() => onUnsubscribe(course.idCurso, schedule.idCronograma, course.nombreCurso)}
                    >
                        <MaterialIcons name="remove-circle-outline" size={20} color="#EF4444" />
                        <Text className="text-red-600 font-medium ml-2">Darse de baja</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default CourseCard;
