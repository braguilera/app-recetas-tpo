import { ScrollView, Text, View, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, FontAwesome, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { useEffect, useState } from "react"
// Asumo que getDatosWithAuth está disponible globalmente o se importa desde 'api/crud'
import { getDatosWithAuth } from "api/crud";


const DetailsCourses = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { courseId } = route.params || {}

  const [course, setCourse] = useState({})

  const fetchCourseDetails = async () => { // Renombrado para mayor claridad
    try {
      const data = await getDatosWithAuth(`course/${courseId}`); // Endpoint para obtener curso por ID
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course details:", error.message); // Usar console.error para errores
      // Puedes añadir un Alert o un mensaje de error en la UI aquí
    }
  };

  useEffect(() => {
    if (courseId) { // Asegurarse de que hay un ID de curso antes de hacer la llamada
      fetchCourseDetails();
    }
  }, [courseId]); // Dependencia en courseId para recargar si cambia


  const formatPrice = (price) => {
    // Manejar casos donde el precio podría ser undefined o null antes de formatear
    if (typeof price !== 'number' || isNaN(price)) {
      return "$0"; // O algún valor por defecto
    }
    return `$${price.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  // Se asume que promociones dentro de cronogramaCursos no existe en el backend actual
  // Esta función ahora será más robusta para manejar la ausencia de promociones
  const getDiscount = (promocion) => {
    // Si la promoción no es un número o no es válida, retorna 0
    const parsed = parseFloat(promocion);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString)
    // Asegurarse de que la fecha sea válida antes de formatear
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  // Usar course.precio directamente para el precio original del curso
  const originalPrice = course.precio;

  // Ya no se divide el contenido, se usa directamente como una cadena
  // const learningContents = course.contenidos ? course.contenidos.split(',').map(item => item.trim()) : [];
  // Requerimientos es un solo string, se usa directamente

  // Asegurarse de que cronogramaCursos sea un array antes de mapear
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
            {/* Si necesitas mostrar el nombre de la sede aquí, tendrías que elegir la primera o manejarlo de otra forma */}
            {/* Eliminada la lógica hardcodeada de academias */}
            <Text className="text-sm text-gray-600">
              {course.descripcion} {/* Muestra la descripción aquí, que es general del curso */}
            </Text>
          </View>

          {/* Precio original del curso (general, no por sede) */}
          <View className="flex-row items-center mt-4">
            <Text className="text-2xl font-bold text-amber-500 ml-2">{formatPrice(originalPrice)}</Text>
          </View>
        </View>

        <View className="p-4 pb-20">
          <View>
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <AntDesign name="clockcircleo" size={20} color="#F59E0B" />
                <Text className="text-gray-700 font-medium ml-2">{course.duracion} horas</Text>
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
              {/* Modificado para mostrar el contenido como un párrafo */}
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

          {/* Listado de Cronogramas de Cursos (sedes/fechas específicas) */}
          {courseSchedules.length > 0 && (
            <View>
              <Text className="text-lg font-bold text-gray-800 mb-3">Fechas y Sedes Disponibles</Text>
              {courseSchedules.map((schedule) => {
                // Asumo que 'promociones' no viene en cada objeto de cronograma
                // Por lo tanto, no se aplica descuento por sede directamente de la API
                const discount = getDiscount(schedule.promociones); // Esto siempre será 0 si promociones no existe
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
                      {/* Direccion y Telefono no están en el objeto cronogramaCursos, se eliminan */}
                      {/*
                      <View className="flex-row items-start mb-3">
                        <MaterialIcons name="location-on" size={18} color="#9CA3AF" className="mt-1" />
                        <Text className="text-gray-700 ml-2 flex-1">{schedule.direccion}</Text>
                      </View>
                      {schedule.telefono !== "N/A" && (
                        <View className="flex-row items-center mb-3">
                          <FontAwesome name="phone" size={16} color="#9CA3AF" />
                          <Text className="text-gray-700 ml-2">{schedule.telefono}</Text>
                        </View>
                      )}
                      */}

                      <View className="flex-row items-center mb-3">
                        <AntDesign name="calendar" size={16} color="#9CA3AF" />
                        <Text className="text-gray-700 ml-2">
                          {formatDate(schedule.fechaInicio)} - {formatDate(schedule.fechaFin)}
                        </Text>
                      </View>

                      {/* Lógica de precio para cada sede/cronograma */}
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
                          className="flex-1 bg-amber-400 py-3 rounded-xl items-center mr-2"
                          accessibilityLabel={`Inscribirse al curso en ${schedule.nombreSede}`}
                          onPress={() => navigation.navigate("BuyCourse", { courseId: course.idCurso, scheduleId: schedule.idCronograma })}
                        >
                          <Text className="text-white font-bold text-lg">Inscribirse en {schedule.nombreSede}</Text>
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

export default DetailsCourses
