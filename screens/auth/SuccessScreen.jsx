"use client"

import { View, Text, TouchableOpacity, StatusBar } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const SuccessScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  const { type = "register", userType = "usuario" } = route.params || {}

  const getMessage = () => {
    switch (type) {
      case "register":
        return "¡Cuenta creada exitosamente!"
      case "passwordReset":
        return "¡Contraseña cambiada exitosamente!"
      default:
        return "¡Operación exitosa!"
    }
  }

  const getSubMessage = () => {
    switch (type) {
      case "register":
        return userType === "alumno"
          ? "Tu cuenta de alumno ha sido creada. Ya puedes acceder a todos los cursos."
          : "Tu cuenta ha sido creada. Ya puedes explorar todas las recetas."
      case "passwordReset":
        return "Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión."
      default:
        return ""
    }
  }

  const handleGoToHome = () => {
    if (type === "passwordReset") {
      // Si es cambio de contraseña, ir al login
      navigation.navigate("Login")
    } else {
      // Si es registro, ir a las tabs principales
      navigation.navigate("MainTabs")
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      <View className="flex-1 justify-center items-center px-8">
        {/* Ícono de éxito */}
        <View className="w-24 h-24 bg-amber-500 rounded-full items-center justify-center mb-8">
          <AntDesign name="user" size={40} color="white" />
        </View>

        {/* Mensaje principal */}
        <Text className="text-2xl font-bold text-gray-800 text-center mb-4">{getMessage()}</Text>

        {/* Mensaje secundario */}
        {getSubMessage() && <Text className="text-gray-600 text-center mb-12 leading-6">{getSubMessage()}</Text>}

        {/* Botón de acción */}
        <TouchableOpacity className="bg-amber-400 rounded-xl py-4 px-8 w-full max-w-xs" onPress={handleGoToHome}>
          <Text className="text-white text-center font-bold text-lg">
            {type === "passwordReset" ? "Ir al login" : "Ir a inicio"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SuccessScreen
