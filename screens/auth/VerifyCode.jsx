"use client"

import { useState, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const VerifyCode = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  // Parámetros que determinan qué tipo de verificación es
  const { type = "login", email = "", userType = "usuario" } = route.params || {}

  // Estados para el código de verificación
  const [code, setCode] = useState(["", "", "", "", ""])
  const [formData, setFormData] = useState({
    nombre: "",
    contraseña: "",
    verificarContraseña: "",
    numeroTarjeta: "",
    numeroTramite: "",
    dniFrente: null,
    dniDorso: null,
  })

  // Referencias para los inputs del código
  const codeInputs = useRef([])

  // Función para manejar el cambio en los inputs del código
  const handleCodeChange = (value, index) => {
    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)

    // Auto-focus al siguiente input
    if (value && index < 4) {
      codeInputs.current[index + 1]?.focus()
    }
  }

  // Función para manejar el backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus()
    }
  }

  // Función para simular carga de imagen
  const handleImageUpload = (field) => {
    Alert.alert("Cargar Imagen", "¿Desde dónde quieres cargar la imagen?", [
      { text: "Cámara", onPress: () => simulateImageUpload(field, "camera") },
      { text: "Galería", onPress: () => simulateImageUpload(field, "gallery") },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const simulateImageUpload = (field, source) => {
    const imageUrl = `https://picsum.photos/seed/${field}-${Date.now()}/400/300`
    setFormData((prev) => ({ ...prev, [field]: imageUrl }))
  }

  // Función para reenviar código
  const handleResendCode = () => {
    Alert.alert("Código reenviado", `Se ha enviado un nuevo código a ${email}`)
    setCode(["", "", "", "", ""])
    codeInputs.current[0]?.focus()
  }

  // Función para manejar el envío
  const handleSubmit = () => {
    const codeString = code.join("")

    if (codeString.length !== 5) {
      Alert.alert("Error", "Por favor ingresa el código completo")
      return
    }

    // Validaciones específicas según el tipo
    if (type === "registerUser" || type === "registerStudent") {
      if (!formData.nombre || !formData.contraseña || !formData.verificarContraseña) {
        Alert.alert("Error", "Por favor completa todos los campos obligatorios")
        return
      }

      if (formData.contraseña !== formData.verificarContraseña) {
        Alert.alert("Error", "Las contraseñas no coinciden")
        return
      }

      if (type === "registerStudent") {
        if (!formData.numeroTarjeta || !formData.numeroTramite || !formData.dniFrente || !formData.dniDorso) {
          Alert.alert("Error", "Por favor completa todos los campos y sube las imágenes del DNI")
          return
        }
      }

      // Para registros, ir a la pantalla de éxito
      navigation.navigate("SuccessScreen", {
        type: "register",
        userType: route.params?.userType,
      })
      return
    }

    if (type === "forgotPassword") {
      Alert.alert("Código verificado", "Código verificado correctamente", [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("ResetPassword", {
              email: route.params?.email,
            }),
        },
      ])
      return
    }

    // Para login, ir directamente a MainTabs
    if (type === "login") {
      navigation.navigate("MainTabs")
      return
    }
  }

  // Función para actualizar campos del formulario
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Determinar el título y botón según el tipo
  const getTitle = () => {
    switch (type) {
      case "registerUser":
        return "Completar Registro"
      case "registerStudent":
        return "Completar Registro de Alumno"
      case "forgotPassword":
        return "Verificar Código"
      default:
        return "Verificar Código"
    }
  }

  const getButtonText = () => {
    switch (type) {
      case "registerUser":
      case "registerStudent":
        return "Aceptar"
      case "forgotPassword":
        return "Verificar"
      default:
        return "Siguiente"
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          className="bg-amber-500  rounded-full p-2 mr-4"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver atrás"
        >
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">{getTitle()}</Text>
      </View>

      <View className="flex-1 px-6">
        {/* Código de verificación */}
        <View className="items-center mb-8">
          <Text className="text-lg font-medium text-gray-800 mb-4">Ingresar código</Text>
          <View className="flex-row justify-center space-x-3">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (codeInputs.current[index] = ref)}
                className="w-14 h-14 bg-white border-2 border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 shadow-sm"
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* Campos adicionales según el tipo */}
        {(type === "registerUser" || type === "registerStudent") && (
          <View className="space-y-4 mb-6">
            {/* Nombre */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Nombre</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm"
                placeholder="Ingresa tu nombre completo"
                value={formData.nombre}
                onChangeText={(value) => updateFormData("nombre", value)}
              />
            </View>

            {/* Contraseña */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Contraseña</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm"
                placeholder="Ingresa tu contraseña"
                value={formData.contraseña}
                onChangeText={(value) => updateFormData("contraseña", value)}
                secureTextEntry
              />
            </View>

            {/* Verificar Contraseña */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Verificar Contraseña</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm"
                placeholder="Confirma tu contraseña"
                value={formData.verificarContraseña}
                onChangeText={(value) => updateFormData("verificarContraseña", value)}
                secureTextEntry
              />
            </View>

            {/* Campos adicionales para estudiantes */}
            {type === "registerStudent" && (
              <>
                {/* Número de tarjeta */}
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Número de tarjeta</Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm"
                    placeholder="Ingresa el número de tarjeta"
                    value={formData.numeroTarjeta}
                    onChangeText={(value) => updateFormData("numeroTarjeta", value)}
                    keyboardType="numeric"
                  />
                </View>

                {/* DNI Frente */}
                <View>
                  <Text className="text-gray-700 font-medium mb-2">DNI frente</Text>
                  <TouchableOpacity
                    className="bg-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-center"
                    onPress={() => handleImageUpload("dniFrente")}
                  >
                    <AntDesign name="upload" size={20} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">
                      {formData.dniFrente ? "Imagen cargada" : "cargar imagen"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* DNI Dorso */}
                <View>
                  <Text className="text-gray-700 font-medium mb-2">DNI dorso</Text>
                  <TouchableOpacity
                    className="bg-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-center"
                    onPress={() => handleImageUpload("dniDorso")}
                  >
                    <AntDesign name="upload" size={20} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">{formData.dniDorso ? "Imagen cargada" : "cargar imagen"}</Text>
                  </TouchableOpacity>
                </View>

                {/* Número de trámite */}
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Número de trámite</Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm"
                    placeholder="Ingresa el número de trámite"
                    value={formData.numeroTramite}
                    onChangeText={(value) => updateFormData("numeroTramite", value)}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </View>
        )}

        {/* Botones */}
        <View className="mt-auto pb-8">
          {/* Reenviar código (solo para registro) */}
          {(type === "registerUser" || type === "registerStudent" || type === "forgotPassword") && (
            <TouchableOpacity className="items-center mb-4" onPress={handleResendCode}>
              <Text className="text-gray-600 underline">Reenviar código</Text>
            </TouchableOpacity>
          )}

          {/* Botón principal */}
          <TouchableOpacity className="bg-amber-400 rounded-lg py-4 items-center" onPress={handleSubmit}>
            <Text className="text-white font-bold text-lg">{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default VerifyCode
