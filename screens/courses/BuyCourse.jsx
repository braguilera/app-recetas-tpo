import { useRoute, useNavigation } from '@react-navigation/native'
import React from 'react'
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Image } from 'react-native'
import { AntDesign, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import courses from "../../test/courses"

const currentUser = {
  idUsuario: 1,
  mail: "juan.perez@gmail.com",
  nickname: "juampi123",
  habilitado: true,
  nombre: "Juan Pérez",
  direccion: "Av. Siempreviva 742",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  alumno: {
    idAlumno: 1,
    numeroTarjeta: "1234-5678-9012-3456",
    dniFrente: "dni-frente.jpg",
    dniFondo: "dni-fondo.jpg",
    tramite: "ABC123456",
    cuentaCorriente: true
  }
}

const BuyCourse = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { courseId, sedeId } = route.params || {}

  const course = courses.find((c) => c.idCurso === courseId) || courses[0]
  const sede = course.sedes.find((s) => s.idSede === sedeId)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            className="mr-4 p-2 rounded-full bg-amber-400"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Volver atrás"
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            Compra de {course.nombreCurso}
          </Text>
        </View>

        <View className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="text-gray-700">Sede: {sede?.nombre || 'Sin especificar'}</Text>
          <Text className="text-gray-700">Inicio: {course.fechaInicio}</Text>
          <Text className="text-gray-700">Duración: {course.duracion} meses</Text>
          <Text className="text-gray-700">Precio: ${course.precioBase}</Text>
        </View>

        <View className="flex-row items-center bg-white p-4 rounded-lg mb-4 border border-gray-200">
          <Image source={{ uri: currentUser.avatar }} className="w-12 h-12 rounded-full mr-4" />
          <View>
            <Text className="text-gray-800 font-bold">{currentUser.nombre}</Text>
            <Text className="text-gray-500">{currentUser.mail}</Text>
          </View>
        </View>

        <Text className="text-gray-500 mb-2">Métodos de pago disponibles</Text>

        <TouchableOpacity className="bg-white p-4 rounded-lg mb-4 border border-green-300 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <FontAwesome5 name="credit-card" size={24} color="#10B981" />
            <Text className="ml-4 text-gray-800">Tarjeta: {currentUser.alumno.numeroTarjeta}</Text>
          </View>
          <MaterialIcons name="check-circle" size={20} color="#10B981" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white p-4 rounded-lg mb-4 border border-gray-300 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <FontAwesome5 name="building" size={24} color="#6B7280" />
            <Text className="ml-4 text-gray-800">Pagar directamente en sede</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-amber-400 py-3 rounded-xl items-center mt-4"
          onPress={() => {
            console.log("Comprar curso", courseId, "en sede", sedeId)
          }}
        >
          <Text className="text-white font-bold text-lg">Confirmar y Comprar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default BuyCourse
