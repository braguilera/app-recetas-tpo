"use client"

import { useState } from "react"
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import courses from "../../test/courses"

const HomeCourses = () => {
  const navigation = useNavigation()
  const [activeFilter, setActiveFilter] = useState("Todo")
  const insets = useSafeAreaInsets()

  const filterOptions = ["Todo", "Presencial", "Remoto", "Virtual"]

  const formatPrice = (price) => {
    return `${price.toLocaleString()}`
  }

  const getRandomDiscount = () => {
    const discounts = [10, 15, 20, 25]
    return discounts[Math.floor(Math.random() * discounts.length)]
  }

  const getCourseDuration = (course) => {
    const classes = Math.floor(Math.random() * 7) + 6
    const hours = Math.floor(Math.random() * 2) + 2
    return `${classes} clases de ${hours} horas`
  }

  const getCourseDates = (course) => {
    const startDate = new Date(course.sedes[0].fechaInicio)
    const endDate = new Date(course.sedes[0].fechaFin)

    const formatShortDate = (date) => {
      const day = date.getDate()
      const month = date.toLocaleString("es-ES", { month: "short" })
      return `${day} ${month}`
    }

    return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
  }

  const isPopular = (course) => {
    return course.idCurso % 2 === 0
  }

  const filteredCourses =
    activeFilter === "Todo"
      ? courses
      : courses.filter((course) => {
          if (activeFilter === "Remoto" && course.modalidad === "virtual") return true
          return course.modalidad.toLowerCase() === activeFilter.toLowerCase()
        })

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F3E4", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3E4" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 bg-amber-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-red-600 mr-1 items-center justify-center">
              <Text className="text-white text-xl font-bold">R</Text>
            </View>
            <Text className="text-xl font-bold text-gray-800">YOURI</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AuthStack", { screen: "Login" })}
          >
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
              className="w-10 h-10 rounded-full"
              accessibilityLabel="Perfil de usuario"
            />
          </TouchableOpacity>
        </View>

        {/* User */}
        <View className="p-4 flex-row items-center">
          <Image source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }} className="w-16 h-16 rounded-full mr-4" />
          <View>
            <Text className="text-xl font-bold text-gray-800">Hola, Julian Bonavota</Text>
            <Text className="text-gray-500">Empecemos a estudiar</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-white rounded-full border border-gray-200 px-4 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Buscar recetas por nombre..."
              className="flex-1 ml-2"
              accessibilityLabel="Buscar recetas"
            />
            <TouchableOpacity className="bg-amber-400 p-1 rounded-md">
              <Ionicons name="options-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Options */}
        <View className="px-4 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className={`mr-2 px-4 py-2 rounded-full ${
                  activeFilter === option
                    ? "bg-amber-400"
                    : option === "Todo"
                      ? "bg-gray-200"
                      : "bg-white border border-gray-200"
                }`}
                onPress={() => setActiveFilter(option)}
                accessibilityLabel={`Filtrar por ${option}`}
                accessibilityState={{ selected: activeFilter === option }}
              >
                <Text className={`${activeFilter === option ? "text-white font-medium" : "text-gray-700"}`}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Course Cards */}
        <View className="px-4 pb-20">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const discount = getRandomDiscount()
              const originalPrice = course.precioBase
              const discountedPrice = originalPrice * (1 - discount / 100)
              const duration = getCourseDuration(course)
              const dates = getCourseDates(course)
              const popular = isPopular(course)

              return (
                <View key={course.idCurso} className="mb-4 bg-white rounded-xl overflow-hidden border border-gray-100">
                  <View className="p-4">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800">{course.nombreCurso}</Text>
                      </View>

                      <View className="bg-amber-50 rounded-md px-3 py-2 mb-2 flex-row items-center">
                        <MaterialIcons
                          name={course.modalidad === "presencial" ? "location-on" : "laptop"}
                          size={12}
                          color="#f59e0b"
                        />
                        <Text className="text-xs text-amber-600 ml-2">
                          {course.modalidad}
                        </Text>
                      </View>
                    </View>

                    <View className="w-full">
                      <View className="bg-gray-100 w-full rounded-md px-3 py-2 mr-2 mb-2 flex-row items-center">
                        <Text className="text-xs text-gray-600 ml-2">
                          {course.descripcionCompleta}
                        </Text>
                      </View>

                    </View>

                    <View className="flex-row  mt-2">
                    {/* 
                      <View className="flex-row items-center">
                        <View className="bg-amber-100 px-2 py-1 rounded-full">
                          <Text className="text-xs font-medium text-amber-800">{discount}%</Text>
                        </View>
                        <Text className="text-xl font-bold text-amber-500 ml-2">${formatPrice(discountedPrice)}</Text>
                      </View>
                    */}

                      <View className="flex-1"> 
                        <TouchableOpacity
                          className="bg-amber-400 w-full px-4 py-2 rounded-md mr-2"
                          onPress={() => navigation.navigate("DetailsCourses", { courseId: course.idCurso })}
                        >
                          <Text className="text-white text-center font-bold">Inscribirse</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })
          ) : (
            <View className="py-8 items-center">
              <MaterialIcons name="sentiment-dissatisfied" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No hay cursos disponibles con este filtro</Text>
            </View>
          )}
        </View>
      </ScrollView>

    </View>
  )
}

export default HomeCourses
