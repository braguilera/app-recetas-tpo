// screens/auth/Login.js
import { useContext, useState } from "react"
import { Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Contexto } from "../../contexto/Provider"; // Asegúrate de que la ruta sea correcta

import { postDatos } from "../../api/crud"; // Ajusta la ruta a tu crud.js

const Login = () => {
  const { login } = useContext(Contexto); // Desestructura solo 'login'

  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [userDates, setUserDates] = useState(
    {
      mail: "",
      password: ""
    });

  const handleLogin = async () => {
    // Vuelve a añadir esta validación, es importante.
    // Si te retornaba siempre, significa que uno de los campos estaba vacío.
    // Revisa cómo los TextInput actualizan el estado 'userDates'.
    if (!userDates.mail || !userDates.password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña.");
      return; // Detiene la ejecución si los campos están vacíos
    }

    try {
      const responseData = await postDatos('auth/login', userDates, 'Error al iniciar sesión');
      console.log("Respuesta de inicio de sesión:", responseData); // Para depuración

      if (responseData && responseData.token) {
        login(
          responseData.token,
          responseData.userId,
          responseData.username, // Este es el mail según tu API
          responseData.firstname,
          responseData.lastname || "" // Si lastname puede ser null, pásalo como cadena vacía
        );
        
        Alert.alert("Éxito", "¡Inicio de sesión exitoso!");
        // Aquí es donde navegas. Si tu Navigation.js no tiene la lógica condicional
        // para cambiar el stack raíz basado en 'logeado', esta navegación puede parecer
        // que no hace nada porque 'MainTabs' ya es el stack raíz.
        // Si tu idea es que siempre se navegue a MainTabs DESDE el Login, entonces `Maps` está bien.
        // Pero si quieres que la app "cambie" de la pantalla de login a MainTabs al iniciar,
        // la lógica condicional en Navigation.js es la clave.
        navigation.navigate('MainTabs'); 

      } else {
        Alert.alert("Error de autenticación", responseData?.message || "Credenciales inválidas.");
      }
    } catch (error) {
      console.error("Error en handleLogin:", error); // Esto te dará más detalles del error de la API
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

export default Login;