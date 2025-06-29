import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const ResetPassword = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  const { email = "" } = route.params || {}

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    navigation.navigate("Login")
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
        <Text className="text-xl font-bold text-gray-800">Cambiar contraseña</Text>
      </View>

      <View className="flex-1 px-6">
        <View className="mb-8">
          <Text className="text-gray-600 text-center leading-6">
            Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-3">Nueva contraseña</Text>
          <View className="relative">
            <TextInput
              className="bg-gray-200 rounded-lg px-4 py-4 pr-12 text-gray-800 text-base"
              placeholder="Ingresa tu nueva contraseña"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity className="absolute right-4 top-4" onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-gray-700 font-medium mb-3">Verificar contraseña</Text>
          <View className="relative">
            <TextInput
              className="bg-gray-200 rounded-lg px-4 py-4 pr-12 text-gray-800 text-base"
              placeholder="Confirma tu nueva contraseña"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-sm text-gray-500 mb-2">Tu contraseña debe tener:</Text>
          <View className="flex-row items-center mb-1">
            <AntDesign
              name={newPassword.length >= 6 ? "checkcircle" : "closecircle"}
              size={16}
              color={newPassword.length >= 6 ? "#10B981" : "#EF4444"}
            />
            <Text className={`ml-2 text-sm ${newPassword.length >= 6 ? "text-green-600" : "text-red-500"}`}>
              Al menos 6 caracteres
            </Text>
          </View>
          <View className="flex-row items-center">
            <AntDesign
              name={newPassword === confirmPassword && newPassword.length > 0 ? "checkcircle" : "closecircle"}
              size={16}
              color={newPassword === confirmPassword && newPassword.length > 0 ? "#10B981" : "#EF4444"}
            />
            <Text
              className={`ml-2 text-sm ${newPassword === confirmPassword && newPassword.length > 0 ? "text-green-600" : "text-red-500"}`}
            >
              Las contraseñas coinciden
            </Text>
          </View>
        </View>

        <View className="mt-auto pb-8">
          <TouchableOpacity className="bg-amber-400 rounded-lg py-4 items-center" onPress={handleResetPassword}>
            <Text className="text-white font-bold text-lg">Cambiar contraseña</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default ResetPassword
