"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const ForgotPassword = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState("")

  const handleSendCode = () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico")
      return
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido")
      return
    }

    // Simular envío de código
    Alert.alert("Código enviado", `Se ha enviado un código de recuperación a ${email}`, [
      {
        text: "OK",
        onPress: () =>
          navigation.navigate("VerifyCode", {
            type: "forgotPassword",
            email: email,
          }),
      },
    ])
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      {/* Header */}
      <View className="flex-row items-center p-4 mb-8">
        <TouchableOpacity
          className="bg-amber-500  rounded-full p-2 mr-4"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver atrás"
        >
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Recuperar contraseña</Text>
      </View>

      <View className="flex-1 px-6">
        {/* Descripción */}
        <View className="mb-8">
          <Text className="text-gray-600 text-center leading-6">
            Ingresa tu correo electrónico y te enviaremos un código para recuperar tu contraseña.
          </Text>
        </View>

        {/* Campo de email */}
        <View className="mb-8">
          <Text className="text-gray-700 font-medium mb-3">Ingresar mail</Text>
          <TextInput
            className="bg-gray-200 rounded-lg px-4 py-4 text-gray-800 text-base"
            placeholder="ejemplo@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Botón */}
        <View className="mt-auto pb-8">
          <TouchableOpacity className="bg-amber-400 rounded-lg py-4 items-center" onPress={handleSendCode}>
            <Text className="text-white font-bold text-lg">Siguiente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default ForgotPassword
