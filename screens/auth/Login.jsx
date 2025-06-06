// screens/auth/Login.js
import { useContext, useState } from "react"
import { Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
// ¡IMPORTANTE! Cambiado a importación con desestructuración
import { Contexto } from "../../contexto/Provider"; // Ajusta la ruta si es necesario (ej. `../../contexto/Provider`)

import { postDatos } from "../../api/crud"; // Ajusta la ruta a tu crud.js

const Login = () => {
  // Aquí es crucial que setLogeado, setToken y setUserId se destructuren correctamente
  const { setLogeado, setToken, setUserId } = useContext(Contexto);

  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [userDates, setUserDates] = useState(
    {
      mail: "",
      password: ""
    });

  const handleLogin = async () => {
    if (!userDates.mail || !userDates.password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      const data = await postDatos('auth/login', userDates, 'Error al iniciar sesión');

      if (data.token) {
        setToken(data.token);
        
        if (data.userId !== undefined) {
          setUserId(data.userId);
        } else {
            console.warn("userId no encontrado directamente en la respuesta del login. Se espera que el Provider lo obtenga del token.");
        }
        
        setLogeado(true); // Esto debería funcionar ahora sin problemas
        Alert.alert("Éxito", "¡Inicio de sesión exitoso!");
        navigation.replace('MainTabs'); // Navega a tus tabs principales

      } else {
        Alert.alert("Error de autenticación", "No se recibió un token válido.");
      }
    } catch (error) {
      console.error("Error en handleLogin:", error);
      const errorMessage = error.message || 'Ocurrió un error inesperado al iniciar sesión.';
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-amber-500 items-center justify-center">
            <Text className="text-white text-4xl font-bold">R</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mt-4">Iniciar Sesión</Text>
          <Text className="text-sm text-gray-500">Accedé con tu cuenta para continuar</Text>
        </View>

        <View className="bg-white rounded-2xl shadow p-6">
          <Text className="text-gray-700 font-medium mb-2">Correo electrónico</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="ejemplo@email.com"
            placeholderTextColor="#9CA3AF"
            value={userDates.mail}
            onChangeText={(text) => setUserDates(prev => ({ ...prev, mail: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text className="text-gray-700 font-medium mb-2">Contraseña</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={userDates.password}
            onChangeText={(text) => setUserDates(prev => ({ ...prev, password: text }))}
            secureTextEntry
          />

          <TouchableOpacity className="bg-amber-400 rounded-xl py-3 mt-4" onPress={handleLogin}>
            <Text className="text-white text-center font-bold text-lg">Ingresar</Text>
          </TouchableOpacity>

          <TouchableOpacity className="mt-4" onPress={() => navigation.navigate("ForgotPassword")}>
            <Text className="text-center text-amber-600 font-medium">¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")} className="mt-6">
            <Text className="text-center text-amber-500 font-medium">¿No tenés cuenta? Registrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Login