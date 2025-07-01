import { ScrollView, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { getDatosWithAuth } from "api/crud";

const DetailsCourses = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params || {};

  const [course, setCourse] = useState(null); 
  const [loading, setLoading] = useState(true); 

  const fetchCourseDetails = async () => {
    setLoading(true); 
    try {
      const data = await getDatosWithAuth(`course/${courseId}`);
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course details:", error.message);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    } else {
        setLoading(false); 
    }
  }, [courseId]);

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return "$0";
    }
    return `$${price.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const getDiscount = (promocion) => {
    const parsed = parseFloat(promocion);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text className="mt-4 text-gray-600">Cargando detalles del curso...</Text>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
            <TouchableOpacity className="absolute top-16 left-4 p-2 rounded-full bg-amber-400" onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-red-500">Error</Text>
            <Text className="text-gray-600 mt-2 text-center">No se pudieron cargar los detalles del curso. Por favor, intenta de nuevo.</Text>
        </SafeAreaView>
    );
  }

  const originalPrice = course.precio;
  const courseSchedules = course.cronogramaCursos || [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4 flex-row items-center bg-amber-100">
          <TouchableOpacity className="mr-4 p-2 rounded-full bg-amber-400" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

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
            <Text className="text-sm text-gray-600 mt-2">
              {course.descripcion}
            </Text>
          </View>

          <View className="flex-row items-center mt-4">
            <Text className="text-2xl font-bold text-amber-500 ml-2">{formatPrice(originalPrice)}</Text>
          </View>
        </View>

        <View className="p-4 pb-20">
          <View>
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <AntDesign name="book" size={20} color="#F59E0B" />
                <Text className="text-gray-700 font-medium ml-2">{course.duracion} clases</Text>
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
              {course.contenidos ? (
                <Text className="text-gray-700">{course.contenidos}</Text>
              ) : (
                <Text className="text-gray-500">No hay contenido de aprendizaje especificado.</Text>
              )}
            </View>
          </View>

          <View>
            <Text className="text-lg font-bold text-gray-800 mb-3">Requerimientos del Curso</Text>
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              {course.requerimientos ? (
                <Text className="text-gray-700">{course.requerimientos}</Text>
              ) : (
                <Text className="text-gray-500">No hay requerimientos específicos para este curso.</Text>
              )}
            </View>
          </View>

          {courseSchedules.length > 0 && (
            <View>
              <Text className="text-lg font-bold text-gray-800 mb-3">Fechas y Sedes Disponibles</Text>
              {courseSchedules.map((schedule) => {
                const discount = getDiscount(schedule.promociones);
                const discountedPrice = originalPrice * (1 - discount / 100);

                return (
                  <View key={schedule.idCronograma} className="mb-4 bg-gray-50 rounded-xl overflow-hidden">
                    <View className="bg-amber-50 p-3 border-b border-gray-200">
                      <Text className="font-bold text-gray-800">{schedule.nombreSede}</Text>
                      {schedule.vacantesDisponibles !== undefined && schedule.vacantesTotales !== undefined && (
                        <Text className="text-sm text-gray-600 mt-1">
                          Vacantes: {schedule.vacantesDisponibles} / {schedule.vacantesTotales}
                        </Text>
                      )}
                    </View>

                    <View className="p-4">
                      <View className="flex-row items-center mb-3">
                        <AntDesign name="calendar" size={16} color="#9CA3AF" />
                        <Text className="text-gray-700 ml-2">
                          {formatDate(schedule.fechaInicio)} - {formatDate(schedule.fechaFin)}
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
                        <View className="flex-row items-center mt-2">
                          <Text className="text-2xl font-bold text-amber-500 ml-2">
                            {formatPrice(originalPrice)}
                          </Text>
                        </View>
                      )}

                      <View className="p-4 flex-row">
                        <TouchableOpacity
                          disabled={schedule.vacantesDisponibles === 0}
                          className="flex-1 bg-amber-400 py-3 rounded-xl items-center mr-2 disabled:opacity-70"
                          accessibilityLabel={`Inscribirse al curso en ${schedule.nombreSede}`}
                          onPress={() => navigation.navigate("BuyCourse", { courseId: course.idCurso, scheduleId: schedule.idCronograma })}
                        >
                          <Text className="text-white font-bold text-lg"> { schedule.vacantesDisponibles === 0 ? "No hay vacantes disponibles" : "Inscribirse en" + schedule.nombreSede}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          {courseSchedules.length === 0 && (
            <Text className="text-gray-500 text-center mt-8">No hay cronogramas disponibles para este curso en este momento.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default DetailsCourses;