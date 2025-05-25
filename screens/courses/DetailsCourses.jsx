import { ScrollView, Text, View, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, FontAwesome, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import courses from "../../test/courses"

const DetailsCourses = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { courseId } = route.params || {}

  const course = courses.find((c) => c.idCurso === courseId) || courses[0]

  const formatPrice = (price) => {
    return `$${price.toLocaleString()}`
  }

  const getDiscount = (promocion) => {
    const parsed = parseFloat(promocion);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const originalPrice = course.precioBase

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 flex-row items-center bg-amber-100">
          <TouchableOpacity className="mr-4 p-2 rounded-full bg-amber-400" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>

        </View>

        {/* Price and Discount */}
        <View className="p-4 bg-amber-50 flex-col justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">{course.nombreCurso}</Text>
            <View className="bg-white px-2 py-1 rounded-md flex-row items-center absolute top-0 right-0 mt-2">
              {course.modalidad === "presencial" ? (
                <MaterialIcons name="location-on" size={16} color="#F59E0B" />
              ) : (
                <MaterialIcons name="laptop" size={16} color="#F59E0B" />
              )}
              <Text className="text-xs font-medium text-amber-500 ml-1 capitalize">{course.modalidad}</Text>
            </View>
            <Text className="text-sm text-gray-600">
              {course.idCurso === 202
                ? "Academia de Cocina 'La Dolce Vita'"
                : course.idCurso === 203
                  ? "Escuela de Repostería 'Le Petit Pain'"
                  : "Instituto Gastronómico 'Saburu'"}
            </Text>
          </View>

          <Text className="text-gray-700 mb-2 leading-relaxed">{course.descripcionCompleta}</Text>
          
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-amber-500 ml-2">{formatPrice(originalPrice)}</Text>
          </View>
        </View>


        {/* Content */}
        <View className="p-4">
          {/* Description */}
            <View>

              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <AntDesign name="clockcircleo" size={20} color="#F59E0B" />
                  <Text className="text-gray-700 font-medium ml-2">{course.duracion} horas</Text>
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

          {/* Details */}
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
            </View>

          {/* Locations */}
            <View>
              {course.sedes.map((sede) => {
                const discount = getDiscount(sede.promociones);
                const discountedPrice = originalPrice * (1 - discount / 100);

                return (
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

                      {discount > 0 ? (
                        <View className="mt-2 bg-amber-50 p-3 rounded-lg">
                          <View className="flex-row items-center">
                            <AntDesign name="tag" size={16} color="#F59E0B" />
                            <Text className="text-amber-600 font-medium ml-2">Promoción</Text>
                          </View>
                          <View className="flex-row items-center mt-2">
                            <View className="bg-amber-100 px-2 py-1 rounded-full">
                              <Text className="text-xs font-medium text-amber-800">{discount}%</Text>
                            </View>
                            <Text className="text-2xl font-bold text-amber-500 ml-2">
                              {formatPrice(discountedPrice)}
                            </Text>
                            <Text className="text-sm text-gray-500 ml-2 line-through">
                              {formatPrice(originalPrice)}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View className="flex-row items-center">
                          <Text className="text-2xl font-bold text-amber-500 ml-2">
                            {formatPrice(originalPrice)}
                          </Text>
                        </View>
                      )}

                      <View className="p-4 flex-row">
                        <TouchableOpacity
                          className="flex-1 bg-amber-400 py-3 rounded-xl items-center mr-2"
                          accessibilityLabel="Inscribirse al curso"
                          onPress={() => navigation.navigate("BuyCourse", { courseId: course.idCurso })}
                        >
                          <Text className="text-white font-bold text-lg">Inscribirse en {sede.nombreSede}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  )
}

export default DetailsCourses
