// screens/auth/VerifyCode.js
"use client"

import { useState, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
// Importa la nueva función para GET con query params
import { getDatosConQueryParams, postDatos } from "../../api/crud"; // Ajusta la ruta

const VerifyCode = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  // 'email' aquí es realmente el 'username' (mail) que se pasó desde Register
  const { type = "login", email = "", userType = "usuario" } = route.params || {}

  const [code, setCode] = useState(["", "", "", "", ""]) // Código de 5 caracteres
  // Estos formData parecen ser para otro tipo de registro (registerUser/registerStudent)
  // Si no se usan para la verificación, podrías considerar eliminarlos o moverlos
  const [formData, setFormData] = useState({
    nombre: "",
    contraseña: "",
    verificarContraseña: "",
    numeroTarjeta: "",
    numeroTramite: "",
    dniFrente: null,
    dniDorso: null,
  })

  const codeInputs = useRef([])

  const handleCodeChange = (value, index) => {
    const newCode = [...code]
    // Solo toma el último carácter si el usuario pega algo
    newCode[index] = value.slice(-1) 
    setCode(newCode)

    // Enfocar al siguiente input si hay un valor y no es el último
    if (value && index < 4) {
      codeInputs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e, index) => {
    // Para retroceso, mueve el foco al input anterior
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus()
    }
  }

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

  const handleResendCode = async () => {
    try {
        // *** MODIFICACIÓN AQUÍ: Endpoint para reenviar código (GET con query param) ***
        // Asumiendo que el endpoint para reenviar código es GET /register/resend y espera 'mail' como query param
        // Usamos 'email' que se pasó desde Register (que es el 'username' con el mail)
        await getDatosConQueryParams('register/resend', { mail: email }, 'Error al reenviar el código');

        Alert.alert("Código reenviado", `Se ha enviado un nuevo código a ${email}`);
        setCode(["", "", "", "", ""]); // Limpiar el código actual
        codeInputs.current[0]?.focus(); // Enfocar el primer input
    } catch (error) {
        console.error("Error al reenviar el código:", error);
        Alert.alert("Error", error.message || "No se pudo reenviar el código. Intenta de nuevo más tarde.");
    }
  }

  const handleSubmit = async () => {
    const codeString = code.join("");

    if (codeString.length !== 5) {
      Alert.alert("Error", "Por favor ingresa el código completo (5 caracteres).");
      return;
    }

    try {
      // *** MODIFICACIÓN AQUÍ: Endpoint de verificación (GET con un solo parámetro 'code') ***
      // Endpoint de verificación según tu Postman: GET http://localhost:8081/register/verify?code=P4KPS
      const response = await getDatosConQueryParams('register/verify', { code: codeString }, 'Error al verificar el código');
      console.log("Respuesta de verificación:", response);

      // La respuesta puede ser un objeto o un mensaje directo, ajusta esto si es necesario
      Alert.alert("Verificación Exitosa", response?.message || "Tu cuenta ha sido verificada exitosamente. ¡Ya puedes iniciar sesión!");

      // Después de la verificación exitosa, navegar al Login
      navigation.replace("Login"); // Usar replace para que no puedan volver a esta pantalla

    } catch (error) {
      console.error("Error en handleSubmit (VerifyCode):", error);
      const errorMessage = error.message || 'Ocurrió un error al verificar el código.';
      Alert.alert("Error de Verificación", errorMessage);
    }
  }

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getTitle = () => {
    switch (type) {
      case "registerVerification":
        return "Verificar Registro"
      case "forgotPassword":
        return "Verificar Código"
      default:
        return "Verificar Código"
    }
  }

  const getButtonText = () => {
    switch (type) {
      case "registerVerification":
        return "Confirmar Registro"
      case "forgotPassword":
        return "Verificar"
      default:
        return "Verificar"
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      <View className="flex-row items-center p-4">
        <TouchableOpacity
          className="bg-amber-500 rounded-full p-2 mr-4"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver atrás"
        >
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">{getTitle()}</Text>
      </View>

      <View className="flex-1 px-6">
        <View className="items-center mb-8">
          <Text className="text-lg font-medium text-gray-800 mb-4">Ingresa el código enviado a {email}</Text>
          <View className="flex-row justify-center space-x-3">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (codeInputs.current[index] = ref)}
                className="w-14 h-14 bg-white border-2 border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 shadow-sm"
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                // *** MODIFICACIÓN AQUÍ: Se quita keyboardType="numeric" para permitir letras y números ***
                maxLength={1}
                autoCapitalize="characters" // Para que las letras mayúsculas se auto-conviertan
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* Campos adicionales según el tipo, tal como los tenías */}
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
          {(type === "registerVerification" || type === "forgotPassword") && (
            <TouchableOpacity className="items-center mb-4" onPress={handleResendCode}>
              <Text className="text-gray-600 underline">Reenviar código</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity className="bg-amber-400 rounded-lg py-4 items-center" onPress={handleSubmit}>
            <Text className="text-white font-bold text-lg">{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default VerifyCode