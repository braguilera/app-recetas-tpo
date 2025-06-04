"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const MyCourses = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  // Obtener el ID del curso de los parámetros de la ruta
  const { courseId = 1, isActive = true } = route.params || {}

  // Datos simulados del curso
  const [course, setCourse] = useState({
    id: courseId,
    title: "Curso de cocina italiana",
    instructor: "Florencia Varela",
    startDate: "10/8/2023",
    endDate: "10/8/2023",
    attendance: 83,
    contents: [
      { id: 1, title: "Contenido 1", description: "Introducción a la cocina italiana" },
      { id: 2, title: "Contenido 2", description: "Pastas y salsas" },
      { id: 3, title: "Contenido 3", description: "Risottos" },
      { id: 4, title: "Contenido 4", description: "Postres italianos" },
      { id: 5, title: "Contenido 5", description: "Evaluación final" },
    ],
    isActive: isActive,
  })

  // Función para realizar asistencia
  const handleAttendance = () => {
    navigation.navigate("ScanQR", { courseId: course.id })
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Mi curso</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Información del curso */}
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-2">{course.title}</Text>
          <Text className="text-gray-600 mb-4">{course.instructor}</Text>

          <View className="flex-row mb-4">
            <View className="flex-row items-center mr-4">
              <AntDesign name="calendar" size={16} color="#9CA3AF" />
              <Text className="text-gray-600 ml-1">
                {course.startDate} - {course.endDate}
              </Text>
            </View>
          </View>

          {/* Barra de asistencia */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-700 font-medium">Asistencia</Text>
              <Text className="text-amber-500 font-medium">{course.attendance}%</Text>
            </View>
            <View className="w-full bg-gray-200 rounded-full h-3">
              <View className="bg-amber-400 h-3 rounded-full" style={{ width: `${course.attendance}%` }} />
            </View>
          </View>

          {/* Botón de asistencia (solo si el curso está activo) */}
          {course.isActive && (
            <TouchableOpacity className="bg-amber-400 rounded-lg py-3 items-center mb-6" onPress={handleAttendance}>
              <Text className="text-white font-bold">Realizar asistencia</Text>
            </TouchableOpacity>
          )}

          {/* Contenidos del curso */}
          <Text className="text-lg font-bold text-gray-800 mb-4">Contenidos del curso</Text>

          {course.contents.map((content) => (
            <View key={content.id} className="bg-white rounded-lg p-4 mb-3 border border-gray-100">
              <Text className="font-medium text-gray-800 mb-1">{content.title}</Text>
              <Text className="text-gray-600 text-sm">{content.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer con íconos */}
      <View className="flex-row justify-center p-4 border-t border-gray-200">
        <TouchableOpacity className="items-center mx-4">
          <MaterialIcons name="restaurant-menu" size={24} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center mx-4">
          <MaterialIcons name="school" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MyCourses
