import { View, Text, TouchableOpacity, StatusBar } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const SuccessScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  const { successType = "newAccount" } = route.params || {}

  const getMessage = () => {
    switch (successType) {
      case "newAccount":
        return "¡Cuenta creada exitosamente!"
      case "studentAccount":
        return "¡Felicitaciones!"
      case "passwordReset":
        return "¡Contraseña cambiada exitosamente!"
      default:
        return "¡Operación exitosa!"
    }
  }

  const getSubMessage = () => {
    switch (successType) {
      case "newAccount":
        return "Tu cuenta ha sido creada. Inicia sesión para explorar la aplicación."
      case "studentAccount":
        return "¡Ya eres alumno! Ahora puedes disfrutar de todos los cursos que ofrecemos. Inicia sesión para comenzar."
      case "passwordReset":
        return "Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión."
      default:
        return ""
    }
  }

  const handleGoToLogin = () => {
    navigation.replace("Login"); 
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      <View className="flex-1 justify-center items-center px-8">
        <View className="w-24 h-24 bg-amber-500 rounded-full items-center justify-center mb-8">
          <AntDesign name="checkcircleo" size={40} color="white" /> 
        </View>

        <Text className="text-2xl font-bold text-gray-800 text-center mb-4">{getMessage()}</Text>

        {getSubMessage() && <Text className="text-gray-600 text-center mb-12 leading-6">{getSubMessage()}</Text>}

        <TouchableOpacity className="bg-amber-400 rounded-xl py-4 px-8 w-full max-w-xs" onPress={handleGoToLogin}>
          <Text className="text-white text-center font-bold text-lg">
            Ir al Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SuccessScreen;