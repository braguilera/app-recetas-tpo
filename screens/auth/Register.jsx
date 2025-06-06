import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { postDatos } from "../../api/crud"; // Ajusta la ruta a tu crud.js
import LoadingModal from '../../components/utils/LoadingModal'; // Importa el nuevo componente

const Register = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga
  const [loadingMessage, setLoadingMessage] = useState("Cargando..."); // Estado para el mensaje del modal

  const handleRegister = async () => {
    // Validaciones básicas de campos
    if (!firstName || !lastName || !username || !password || !rePassword) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    if (password !== rePassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoadingMessage("Registrando tu cuenta..."); // Establece el mensaje antes de cargar
    setLoading(true); // Activa el indicador de carga al iniciar la solicitud

    try {
      const registerData = {
        firstname: firstName,
        lastname: lastName,
        username: username, 
        password: password,
        rePassword: rePassword,
      };
      
      const data = await postDatos('register', registerData, 'Error al registrarse');
      
      console.log("Respuesta del registro:", data);

      Alert.alert("Registro Exitoso", data?.message || "Se ha iniciado el proceso de registro. Por favor, revisa tu email para el código de verificación.");
      
      navigation.navigate("VerifyCode", {
        type: "registerVerification",
        email: username, 
        userType: "usuario"
      });

    } catch (error) {
      console.error("Error en handleRegister:", error);
      const errorMessage = error.message || 'Ocurrió un error inesperado al registrarse.';
      Alert.alert("Error de Registro", errorMessage);
    } finally {
      setLoading(false); // Desactiva el indicador de carga al finalizar (éxito o error)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      <TouchableOpacity
        className="absolute top-10 left-4 z-10 bg-amber-500 rounded-full p-2"
        onPress={() => navigation.goBack()}
        style={{ top: insets.top + 16 }}
      >
        <AntDesign name="arrowleft" size={24} color="#fff" />
      </TouchableOpacity>

      <View className="flex-1 px-6 pt-12">
        <View className="items-center mt-8 mb-10">
          <View className="w-20 h-20 rounded-full bg-amber-500 items-center justify-center">
            <Text className="text-white text-4xl font-bold">R</Text>
          </View>
          
          <Text className="text-2xl font-bold text-gray-800 mt-4">Registro</Text>
          <Text className="text-sm text-gray-500">Creá una cuenta nueva</Text>
        </View>

        <View className="bg-white rounded-2xl shadow p-6">
          <Text className="text-gray-700 font-medium mb-2">Nombre</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="Ingresa tu nombre"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading} 
          />

          <Text className="text-gray-700 font-medium mb-2">Apellido</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="Ingresa tu apellido"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            editable={!loading} 
          />

          <Text className="text-gray-700 font-medium mb-2">Correo Electrónico (Alias)</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="ejemplo@email.com"
            placeholderTextColor="#9CA3AF"
            value={username} 
            onChangeText={setUsername} 
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading} 
          />

          <Text className="text-gray-700 font-medium mb-2">Contraseña</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading} 
          />

          <Text className="text-gray-700 font-medium mb-2">Repetir Contraseña</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={rePassword}
            onChangeText={setRePassword}
            secureTextEntry
            editable={!loading} 
          />

          <TouchableOpacity 
            className={`rounded-xl py-3 mt-2 ${loading ? 'bg-gray-400' : 'bg-amber-400'}`} 
            onPress={handleRegister} 
            disabled={loading} 
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">Registrarse</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Uso del componente LoadingModal */}
      <LoadingModal visible={loading} message={loadingMessage} />
    </View>
  )
}

export default Register;