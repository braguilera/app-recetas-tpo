import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { postDatos } from "../../api/crud"

const ForgotPassword = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState("")

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido")
      return
    }

    try {
      await postDatos("password/request-reset", { email: email }, "Error al solicitar el restablecimiento de contraseña");

      Alert.alert("Código enviado", `Se ha enviado un código de recuperación a ${email}`, [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("VerifyCode", {
              type: "passwordReset",
              email: email,
            }),
        },
      ])
    } catch (error) {
      console.error("Error en handleSendCode:", error)
      const errorMessage = error.message || "No se pudo enviar el código de recuperación. Intenta de nuevo más tarde."
      Alert.alert("Error", errorMessage)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      <View className="flex-row items-center p-4 mb-8">
        <TouchableOpacity
          className="bg-amber-500 rounded-full p-2 mr-4"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver atrás"
        >
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Recuperar contraseña</Text>
      </View>

      <View className="flex-1 px-6">
        <View className="mb-8">
          <Text className="text-gray-600 text-center leading-6">
            Ingresa tu correo electrónico y te enviaremos un código para recuperar tu contraseña.
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-gray-700 font-medium mb-3">Ingresar mail</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-4 text-gray-800 text-base"
            placeholder="ejemplo@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

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