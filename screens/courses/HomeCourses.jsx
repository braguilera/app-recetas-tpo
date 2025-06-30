"use client"

import { useContext, useState, useEffect, useCallback } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, Ionicons, MaterialIcons, FontAwesome5, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatosWithAuth, getCoursesPaginatedWithAuth } from "../../api/crud";
import { Contexto } from "contexto/Provider"
import CourseCardHome from "../../components/courses/CourseCardHome";
import UserAvatar from "components/common/UserAvatar"

const HomeCourses = () => {
  const { logeado, isStudent } = useContext(Contexto);

  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  // Estados para la paginación y lista de cursos
  const [courseList, setCourseList] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados para los filtros
  const [showFilter, setShowFilter] = useState(false);
  const [searchCourseName, setSearchCourseName] = useState("");
  const [searchSedeId, setSearchSedeId] = useState("");
  const [activeFilterModalidad, setActiveFilterModalidad] = useState("Todo");

  // Estados para el ordenamiento
  const [sortType, setSortType] = useState(""); // Por defecto: "nombreCurso"
  const [directionType, setDirectionType] = useState(""); // Por defecto: "asc"

  const pageSize = 5;

  // Opciones de filtro para modalidad
  const filterOptions = ["Todo", "Presencial", "Remoto", "Virtual"];

  // Función para obtener los números de paginación
  const getPaginationNumbers = () => {
    const totalPages = courseList.totalPages || 1;
    const current = currentPage;
    const maxVisible = 1;

    if (totalPages <= maxVisible + 2) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const numbers = [];

    if (current <= 1) {
      numbers.push(0, 1, 2);
      if (totalPages > 4) {
        numbers.push('...');
        numbers.push(totalPages - 1);
      }
    } else if (current >= totalPages - 2) {
      numbers.push(0);
      if (totalPages > 4) {
        numbers.push('...');
      }
      numbers.push(totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      numbers.push(0);
      numbers.push('...');
      numbers.push(current - 1, current, current + 1);
      numbers.push('...');
      numbers.push(totalPages - 1);
    }

    return numbers;
  };

  // Función para hacer el fetch de cursos
  const fetchCourses = useCallback(async (page = 0, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      let modalidadParam = undefined;
      if (activeFilterModalidad === "Presencial") {
        modalidadParam = "presencial";
      } else if (activeFilterModalidad === "Virtual") {
        modalidadParam = "virtual";
      } else if (activeFilterModalidad === "Remoto") {
        modalidadParam = "remoto";
      }

      const params = {
        page: page,
        size: pageSize,
        sortBy: sortType, // CORREGIDO: 'sortBy' en lugar de 'sort' para coincidir con la API
        direction: directionType,
        nombreCurso: searchCourseName !== "" ? searchCourseName : undefined,
        idSede: searchSedeId !== "" ? searchSedeId : undefined,
        modalidad: modalidadParam,
      };

      const data = await getCoursesPaginatedWithAuth(params, 'Error al cargar cursos');

      if (reset) {
        setCourseList(data);
      } else {
        setCourseList(prevData => ({
          ...data,
          content: [...(prevData.content || []), ...data.content]
        }));
      }

      setCurrentPage(page);

    } catch (error) {
      console.log("Error fetching courses:", error.message);
    } finally {
      setLoading(false);
    }
  }, [loading, pageSize, sortType, directionType, searchCourseName, searchSedeId, activeFilterModalidad]);

  // Función para refrescar los cursos
  const refreshCourses = () => {
    setCurrentPage(0);
    fetchCourses(0, true);
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchCourseName("");
    setSearchSedeId("");
    setActiveFilterModalidad("Todo");
    setSortType("");
    setDirectionType("");
  };

  // Función para resetear solo el ordenamiento
  const resetSorting = () => {
    setSortType("");
    setDirectionType("");
  };

  // Hooks de efecto para cargar datos y aplicar filtros
  useEffect(() => {
    fetchCourses(0, true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchCourses(0, true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchCourseName, searchSedeId]);

  useEffect(() => {
    setCurrentPage(0);
    fetchCourses(0, true);
  }, [activeFilterModalidad]);

  useEffect(() => {
    setCurrentPage(0);
    fetchCourses(0, true);
  }, [sortType, directionType]);

  const formatPrice = (price) => {
    return `${price.toLocaleString()}`;
  };

  const getCourseDuration = (course) => {
    return course.duracion ? `${course.duracion} horas` : "Duración no especificada";
  };

  const getCourseDates = (course) => {
    if (course.cronogramaCursos && course.cronogramaCursos.length > 0) {
      const firstSchedule = course.cronogramaCursos[0];
      const startDate = new Date(firstSchedule.fechaInicio);
      const endDate = new Date(firstSchedule.fechaFin);

      const formatShortDate = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString("es-ES", { month: "short" });
        return `${day} ${month}`;
      };
      return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
    }
    return "Fechas no disponibles";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F3E4", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3E4" />
      <ScrollView className="flex-1 pb-40">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 bg-amber-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-yellow-500 mr-1 items-center justify-center">
              <Text className="text-white text-xl font-bold">R</Text>
            </View>
            <Text className="text-xl font-bold text-gray-800">YOURI</Text>
          </View>
          {logeado ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("ProfileStack", { screen: "ProfileScreen" })}
            >
              <UserAvatar
                sizeClasses="w-12 h-12"
                textSizeClasses="text-xl"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("AuthStack", { screen: "Login" })}
              className="px-3 py-1 bg-amber-400 rounded-md"
            >
              <Text className="text-white font-medium">Iniciar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Course Collection */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xl font-bold text-gray-800">Explora Nuestros Cursos</Text>
            <TouchableOpacity onPress={refreshCourses} disabled={loading}>
              <AntDesign
                name="reload1"
                size={20}
                color={loading ? "#9CA3AF" : "#F59E0B"}
              />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-600 mb-4">
            Encuentra el curso perfecto para aprender y crecer
            {courseList.totalElements && (
              <Text className="text-amber-600"> ({courseList.totalElements} cursos total)</Text>
            )}
          </Text>

          {/* Search by Course Name */}
          <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-3 py-2 mb-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Buscar cursos por nombre..."
              className="flex-1 ml-2"
              accessibilityLabel="Buscar cursos"
              value={searchCourseName}
              onChangeText={setSearchCourseName}
            />
            {logeado &&
              <TouchableOpacity onPress={() => setShowFilter(true)}>
                <View className="bg-amber-400 p-1 rounded">
                  <Ionicons name="options" size={24} color="white" />
                </View>
              </TouchableOpacity>
            }
          </View>

          {/* Course Modality Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${activeFilterModalidad === option ? "bg-amber-400" : "bg-white border border-gray-200"
                  }`}
                onPress={() => setActiveFilterModalidad(option)}
                accessibilityLabel={`Filtrar por ${option}`}
                accessibilityState={{ selected: activeFilterModalidad === option }}
              >
                <Text className={`${activeFilterModalidad === option ? "text-white font-medium" : "text-gray-700"}`}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Course Cards */}
          <View className="space-y-4 pb-12">
            {courseList.content && courseList.content.length > 0 ? (
              courseList.content.map((course) => (
                <View key={course.idCurso} className="w-full">
                  <CourseCardHome course={course} formatPrice={formatPrice} getCourseDates={getCourseDates} getCourseDuration={getCourseDuration} logeado={logeado} isStudent={isStudent} navigation={navigation} />
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center">No hay cursos disponibles con este filtro</Text>
            )}
          </View>

          {/* Pagination */}
          {courseList.totalPages > 1 && (
            <View className="flex-row justify-center items-center mb-20">
              <View className="bg-white rounded-lg p-2 flex-row items-center shadow-sm">
                <TouchableOpacity
                  onPress={() => fetchCourses(currentPage - 1, true)}
                  disabled={currentPage === 0 || loading}
                  className={`w-8 h-8 rounded-md items-center justify-center mr-1 ${currentPage === 0 || loading
                      ? "hidden"
                      : "bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  <AntDesign
                    name="left"
                    size={14}
                    color={currentPage === 0 || loading ? "#D1D5DB" : "#6B7280"}
                  />
                </TouchableOpacity>
                {getPaginationNumbers().map((item, index) => (
                  <View key={index}>
                    {item === '...' ? (
                      <View className="w-8 h-8 items-center justify-center">
                        <Text className="text-gray-400 text-sm">...</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => fetchCourses(item, true)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-md items-center justify-center mx-0.5 ${currentPage === item
                            ? "bg-amber-400"
                            : "bg-gray-50 hover:bg-gray-100"
                          }`}
                      >
                        <Text className={`text-sm font-medium ${currentPage === item
                            ? "text-white"
                            : "text-gray-700"
                          }`}>
                          {item + 1}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => fetchCourses(currentPage + 1, true)}
                  disabled={courseList.last || loading}
                  className={`w-8 h-8 rounded-md items-center justify-center ml-1 ${courseList.last || loading
                      ? "hidden"
                      : "bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  <AntDesign
                    name="right"
                    size={14}
                    color={courseList.last || loading ? "#D1D5DB" : "#6B7280"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Filter Drawer */}
      {showFilter &&
        <View className="absolute w-full h-full bg-black/50">
          <View className="w-4/5 h-full bg-white absolute right-0 shadow-lg">
            <ScrollView className="flex-1 px-6 py-6 mb-32">
              <View className="flex-row justify-between items-center pb-4 border-b border-gray-200 mb-6">
                <Text className="font-bold text-2xl text-gray-800">Filtros</Text>
                <TouchableOpacity
                  onPress={() => setShowFilter(false)}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Entypo name="cross" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Sort by Course Name (Alphabetical) */}
              <View className="mb-4">
                <Text className="font-semibold text-lg text-gray-800 mb-2">Ordenar alfabéticamente</Text>
                <Text className="text-sm text-gray-600 mb-3">Organiza los cursos por el nombre:</Text>

                <View className="flex-row items-center rounded-lg px-3 py-3">
                  <TouchableOpacity
                    onPress={() => { setSortType("nombreCurso"); setDirectionType("asc"); }}
                    className={`flex-1 mr-2 px-4 py-2 rounded-full flex-row items-center justify-center ${sortType === "nombreCurso" && directionType === "asc" ? "bg-purple-500" : "bg-white border border-gray-200"
                      }`}
                  >
                    <MaterialCommunityIcons
                      name="sort-alphabetical-descending-variant"
                      size={20}
                      color={sortType === "nombreCurso" && directionType === "asc" ? "white" : "#6B7280"}
                      style={{ marginRight: 5 }}
                    />
                    <Text className={`text-sm ${sortType === "nombreCurso" && directionType === "asc" ? "text-white font-medium" : "text-gray-700"}`}>
                      Nombre (A-Z)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setSortType("nombreCurso"); setDirectionType("desc"); }}
                    className={`flex-1 px-4 py-2 rounded-full flex-row items-center justify-center ${sortType === "nombreCurso" && directionType === "desc" ? "bg-red-500" : "bg-white border border-gray-200"
                      }`}
                  >
                    <MaterialCommunityIcons
                      name="sort-alphabetical-ascending-variant"
                      size={20}
                      color={sortType === "nombreCurso" && directionType === "desc" ? "white" : "#6B7280"}
                      style={{ marginRight: 5 }}
                    />
                    <Text className={`text-sm ${sortType === "nombreCurso" && directionType === "desc" ? "text-white font-medium" : "text-gray-700"}`}>
                      Nombre (Z-A)
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={resetSorting}
                  className="w-full bg-gray-100 py-3 rounded-lg my-3 flex-row items-center justify-center"
                >
                  <MaterialCommunityIcons name="sort-variant-remove" size={20} color="#6B7280" style={{ marginRight: 5 }} />
                  <Text className="text-center text-gray-700 font-medium">Restablecer ordenamiento</Text>
                </TouchableOpacity>
              </View>

              {/* Apply/Clear Filters Buttons */}
              <View className="border-t border-gray-200 pt-6 pb-16">
                <View className="flex-row gap-8 space-x-3">
                  <TouchableOpacity
                    onPress={clearFilters}
                    className="flex-1 bg-gray-100 py-3 rounded-lg"
                  >
                    <Text className="text-center text-gray-700 font-medium">Limpiar filtros</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setShowFilter(false);
                      setCurrentPage(0);
                      fetchCourses(0, true); // Aplicar filtros
                    }}
                    className="flex-1 bg-amber-400 py-3 rounded-lg"
                  >
                    <Text className="text-center text-white font-medium">Aplicar filtros</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      }
    </View>
  )
}

export default HomeCourses