"use client"

import { useState } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, FontAwesome, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import courses from "../../test/courses"

const DetailsCourses = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { courseId } = route.params || {}

  // Find the course by ID
  const course = courses.find((c) => c.idCurso === courseId) || courses[0]

  // State for selected tab
  const [activeTab, setActiveTab] = useState("descripcion")

  // Function to format price
  const formatPrice = (price) => {
    return `$${price.toLocaleString()}`
  }

  // Function to get random discount
  const getRandomDiscount = () => {
    const discounts = [10, 15, 20, 25]
    return discounts[Math.floor(Math.random() * discounts.length)]
  }

  // Function to get course duration
  const getCourseDuration = () => {
    // Random number of classes between 6 and 12
    const classes = Math.floor(Math.random() * 7) + 6
    // Random hours per class between 2 and 3
    const hours = Math.floor(Math.random() * 2) + 2
    return `${classes} clases de ${hours} horas`
  }

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  // Calculate discount
  const discount = getRandomDiscount()
  const originalPrice = course.precioBase
  const discountedPrice = originalPrice * (1 - discount / 100)
  const duration = getCourseDuration()

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 flex-row items-center bg-amber-100">
          <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
            <AntDesign name="arrowleft" size={24} color="#333" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">{course.nombreCurso}</Text>
            <Text className="text-sm text-gray-600">
              {course.idCurso === 202
                ? "Academia de Cocina 'La Dolce Vita'"
                : course.idCurso === 203
                  ? "Escuela de Repostería 'Le Petit Pain'"
                  : "Instituto Gastronómico 'Saburu'"}
            </Text>
          </View>
          <TouchableOpacity className="ml-2" accessibilityLabel="Compartir curso">
            <AntDesign name="sharealt" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Course Image */}
        <Image
          source={{ uri: `https://picsum.photos/seed/course${course.idCurso}/800/500` }}
          className="w-full h-48"
          accessibilityLabel={`Imagen de ${course.nombreCurso}`}
        />

        {/* Price and Discount */}
        <View className="p-4 bg-amber-50 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="bg-amber-100 px-2 py-1 rounded-full">
              <Text className="text-xs font-medium text-amber-800">{discount}%</Text>
            </View>
            <Text className="text-2xl font-bold text-amber-500 ml-2">{formatPrice(discountedPrice)}</Text>
            <Text className="text-sm text-gray-500 ml-2 line-through">{formatPrice(originalPrice)}</Text>
          </View>
          <View className="bg-white px-2 py-1 rounded-md flex-row items-center">
            {course.modalidad === "presencial" ? (
              <MaterialIcons name="location-on" size={16} color="#F59E0B" />
            ) : (
              <MaterialIcons name="laptop" size={16} color="#F59E0B" />
            )}
            <Text className="text-xs font-medium text-amber-500 ml-1 capitalize">{course.modalidad}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200">
          <TouchableOpacity
            className={`flex-1 py-3 ${activeTab === "descripcion" ? "border-b-2 border-amber-400" : ""}`}
            onPress={() => setActiveTab("descripcion")}
          >
            <Text
              className={`text-center font-medium ${activeTab === "descripcion" ? "text-amber-500" : "text-gray-500"}`}
            >
              Descripción
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 ${activeTab === "detalles" ? "border-b-2 border-amber-400" : ""}`}
            onPress={() => setActiveTab("detalles")}
          >
            <Text
              className={`text-center font-medium ${activeTab === "detalles" ? "text-amber-500" : "text-gray-500"}`}
            >
              Detalles
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 ${activeTab === "sedes" ? "border-b-2 border-amber-400" : ""}`}
            onPress={() => setActiveTab("sedes")}
          >
            <Text className={`text-center font-medium ${activeTab === "sedes" ? "text-amber-500" : "text-gray-500"}`}>
              Sedes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className="p-4">
          {/* Description Tab */}
          {activeTab === "descripcion" && (
            <View>
              <Text className="text-gray-700 mb-6 leading-relaxed">{course.descripcionCompleta}</Text>

              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <AntDesign name="clockcircleo" size={20} color="#F59E0B" />
                  <Text className="text-gray-700 font-medium ml-2">{duration}</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <AntDesign name="calendar" size={20} color="#F59E0B" />
                  <Text className="text-gray-700 font-medium ml-2">
                    {formatDate(course.sedes[0].fechaInicio)} - {formatDate(course.sedes[0].fechaFin)}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <MaterialIcons
                    name={course.modalidad === "presencial" ? "people" : "laptop"}
                    size={20}
                    color="#F59E0B"
                  />
                  <Text className="text-gray-700 font-medium ml-2 capitalize">{course.modalidad}</Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-gray-800 mb-3">Lo que aprenderás</Text>
              <View className="bg-gray-50 rounded-xl p-4 mb-6">
                {course.temas.map((tema, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <AntDesign name="check" size={16} color="#10B981" />
                    <Text className="text-gray-700 ml-2">{tema}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Details Tab */}
          {activeTab === "detalles" && (
            <View>
              <Text className="text-lg font-bold text-gray-800 mb-3">Insumos Requeridos</Text>
              <View className="bg-gray-50 rounded-xl p-4 mb-6">
                {course.insumosRequeridos.length > 0 ? (
                  course.insumosRequeridos.map((insumo, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <FontAwesome5 name="utensils" size={14} color="#F59E0B" />
                      <Text className="text-gray-700 ml-3">{insumo}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500">No hay insumos requeridos para este curso</Text>
                )}
              </View>

              <Text className="text-lg font-bold text-gray-800 mb-3">Información Adicional</Text>
              <View className="bg-gray-50 rounded-xl p-4 mb-6">
                <View className="flex-row items-center mb-3">
                  <AntDesign name="user" size={16} color="#F59E0B" />
                  <Text className="text-gray-700 ml-3">Curso para todos los niveles</Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <AntDesign name="book" size={16} color="#F59E0B" />
                  <Text className="text-gray-700 ml-3">Material didáctico incluido</Text>
                </View>
                <View className="flex-row items-center">
                  <AntDesign name="Trophy" size={16} color="#F59E0B" />
                  <Text className="text-gray-700 ml-3">Certificado de finalización</Text>
                </View>
              </View>
            </View>
          )}

          {/* Locations Tab */}
          {activeTab === "sedes" && (
            <View>
              {course.sedes.map((sede) => (
                <View key={sede.idSede} className="mb-4 bg-gray-50 rounded-xl overflow-hidden">
                  <View className="bg-amber-50 p-3 border-b border-gray-200">
                    <Text className="font-bold text-gray-800">{sede.nombreSede}</Text>
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-start mb-3">
                      <MaterialIcons name="location-on" size={18} color="#9CA3AF" className="mt-1" />
                      <Text className="text-gray-700 ml-2 flex-1">{sede.direccion}</Text>
                    </View>

                    {sede.telefono !== "N/A" && (
                      <View className="flex-row items-center mb-3">
                        <FontAwesome name="phone" size={16} color="#9CA3AF" />
                        <Text className="text-gray-700 ml-2">{sede.telefono}</Text>
                      </View>
                    )}

                    <View className="flex-row items-center mb-3">
                      <AntDesign name="calendar" size={16} color="#9CA3AF" />
                      <Text className="text-gray-700 ml-2">
                        {formatDate(sede.fechaInicio)} - {formatDate(sede.fechaFin)}
                      </Text>
                    </View>

                    {sede.promociones && (
                      <View className="mt-2 bg-amber-50 p-3 rounded-lg">
                        <View className="flex-row items-center">
                          <AntDesign name="tag" size={16} color="#F59E0B" />
                          <Text className="text-amber-600 font-medium ml-2">Promoción</Text>
                        </View>
                        <Text className="text-gray-700 mt-1">{sede.promociones}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="p-4 border-t border-gray-200 bg-white flex-row">
        <TouchableOpacity
          className="flex-1 bg-amber-400 py-3 rounded-xl items-center mr-2"
          accessibilityLabel="Inscribirse al curso"
        >
          <Text className="text-white font-bold text-lg">Inscribirse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white border border-amber-400 py-3 px-4 rounded-xl items-center"
          accessibilityLabel="Guardar curso"
        >
          <AntDesign name="heart" size={24} color="#F59E0B" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default DetailsCourses
