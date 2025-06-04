"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, Feather } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const EditProfile = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  // Estados para los campos del formulario
  const [name, setName] = useState("Julian Bonavota")
  const [nickname, setNickname] = useState("julianb")
  const [email, setEmail] = useState("julian@example.com")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // Función para guardar cambios
  const handleSaveChanges = () => {
    // Validaciones básicas
    if (!name.trim() || !nickname.trim() || !email.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido")
      return
    }

    // Validar contraseña si se está cambiando
    if (newPassword && !currentPassword) {
      Alert.alert("Error", "Debes ingresar tu contraseña actual para cambiarla")
      return
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert("Error", "La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    // Simular actualización exitosa
    Alert.alert("Éxito", "Perfil actualizado correctamente", [{ text: "OK", onPress: () => navigation.goBack() }])
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Actualizar Información</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Avatar y botón de edición */}
        <View className="items-center mb-6 relative">
          <View className="w-24 h-24 bg-black rounded-full items-center justify-center">
            <AntDesign name="user" size={40} color="white" />
          </View>
          <TouchableOpacity className="absolute bottom-0 right-1/3 bg-amber-400 p-2 rounded-full">
            <Feather name="edit-2" size={18} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold mt-2">{name}</Text>
        </View>

        {/* Formulario */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-2">Cambiar Nombre</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              value={name}
              onChangeText={setName}
              placeholder="Ingresa tu nombre completo"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Cambiar Nickname</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Ingresa tu nickname"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Cambiar Correo</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              value={email}
              onChangeText={setEmail}
              placeholder="Ingresa tu correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Cambiar Contraseña</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-2"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Verificar Contraseña"
              secureTextEntry
            />
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nueva Contraseña"
              secureTextEntry
            />
          </View>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity className="bg-amber-400 rounded-xl py-4 items-center mt-8" onPress={handleSaveChanges}>
          <Text className="text-white font-bold text-lg">Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default EditProfile
