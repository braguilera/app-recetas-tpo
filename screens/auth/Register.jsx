"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const Register = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState("")
  const [alias, setAlias] = useState("")

  const handleRegister = (userType) => {
    if (!email || !alias) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    // Navegar directamente a verificación
    navigation.navigate("VerifyCode", {
      type: userType === "usuario" ? "registerUser" : "registerStudent",
      email: email,
      alias: alias,
      userType: userType,
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      {/* Botón atrás */}
      <TouchableOpacity
        className="absolute top-10 left-4 z-10 bg-amber-500 rounded-full p-2"
        onPress={() => navigation.goBack()}
        style={{ top: insets.top + 16 }}
      >
        <AntDesign name="arrowleft" size={24} color="#fff" />
      </TouchableOpacity>

      <View className="flex-1 px-6 pt-12">
        {/* Encabezado */}
        <View className="items-center mt-8 mb-10">
          <View className="w-20 h-20 rounded-full bg-amber-500 items-center justify-center">
            <Text className="text-white text-4xl font-bold">R</Text>
          </View>
          
          <Text className="text-2xl font-bold text-gray-800 mt-4">Registro</Text>
          <Text className="text-sm text-gray-500">Creá una cuenta nueva</Text>
        </View>

        {/* Formulario */}
        <View className="bg-white rounded-2xl shadow p-6">
          <Text className="text-gray-700 font-medium mb-2">Mail</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="ejemplo@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text className="text-gray-700 font-medium mb-2">Alias</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="Nombre de usuario"
            placeholderTextColor="#9CA3AF"
            value={alias}
            onChangeText={setAlias}
          />

          <TouchableOpacity className="bg-amber-400 rounded-xl py-3 mt-2" onPress={() => handleRegister("usuario")}>
            <Text className="text-white text-center font-bold text-lg">Registrarse como Usuario</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-amber-300 rounded-xl py-3 mt-4" onPress={() => handleRegister("alumno")}>
            <Text className="text-white text-center font-bold text-lg">Registrarse como Alumno</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Register
