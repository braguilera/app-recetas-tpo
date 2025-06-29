import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDatosConQueryParams, postDatos } from "../../api/crud";
import LoadingModal from "../../components/utils/LoadingModal";

const Register = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Alias

  const [aliasSuggestions, setAliasSuggestions] = useState([]);
  const [isAliasAvailable, setIsAliasAvailable] = useState(null);
  const [isEmailAvailable, setIsEmailAvailable] = useState(null); // Esto debe ser null al inicio, no false
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Cargando...");

  const [isStudentRegister, setIsStudentRegister] = useState(
    route.params?.isStudentRegister || false
  );

  useEffect(() => {
    if (route.params?.isStudentRegister !== undefined) {
      setIsStudentRegister(route.params.isStudentRegister);
    }
  }, [route.params?.isStudentRegister]);

  const handleRegisterStep1 = async () => {
    if (!email || !username) {
      Alert.alert("Error", "Por favor completa el correo electrónico y el alias.");
      return;
    }

    if (isAliasAvailable === false) {
      Alert.alert(
        "Error",
        "El alias seleccionado no está disponible. Por favor, elige uno de las sugerencias o uno diferente."
      );
      return;
    }
    // NOTA: No necesitamos una alerta aquí para isEmailAvailable === false,
    // ya que el mensaje de "Correo ya registrado" y el enlace de "Recuperar Contraseña"
    // ya cumplen esa función visualmente.
    // if (isEmailAvailable === false) {
    //   Alert.alert(
    //     "Error",
    //     "El correo electrónico ya está registrado. Por favor, utiliza otro o inicia sesión."
    //   );
    //   return;
    // }

    // Deshabilitar el botón si las validaciones de disponibilidad no son true
    if (isAliasAvailable !== true || isEmailAvailable !== true) {
      Alert.alert("Error", "Por favor, verifica que el correo y el alias estén disponibles.");
      return;
    }


    setLoadingMessage("Verificando datos iniciales...");
    setLoading(true);

    try {
      const data = await postDatos(
        "register/step1",
        { email: email.trim(), nickname: username.trim() },
        "Error al iniciar el registro"
      );

      console.log("Respuesta de register/step1:", email, username, data);

      navigation.navigate("VerifyCode", {
        type: "registerStep2",
        email: email.trim(),
        username: username.trim(),
        isStudentRegister: isStudentRegister,
      });
    } catch (error) {
      console.error("Error en handleRegisterStep1:", error);
      const errorMessage =
        error.message || "Ocurrió un error inesperado al iniciar el registro.";
      Alert.alert("Error de Registro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkAlias = async () => {
    if (username.trim() === "") {
      setIsAliasAvailable(null);
      setAliasSuggestions([]);
      return;
    }
    try {
      const data = await getDatosConQueryParams(
        "register/check-nickname",
        { nickname: username.trim() },
        "Error al verificar el alias"
      );
      console.log("Respuesta de verificación de alias:", data);

      if (data && typeof data === "object") {
        setIsAliasAvailable(data.available);
        if (data.available === false && data.suggestions && Array.isArray(data.suggestions)) {
          setAliasSuggestions(data.suggestions);
        } else {
          setAliasSuggestions([]);
        }
      } else {
        setIsAliasAvailable(null);
        setAliasSuggestions([]);
        console.warn("Formato de respuesta inesperado para check-nickname:", data);
      }
    } catch (error) {
      console.error("Error en checkAlias:", error);
      setIsAliasAvailable(null);
      setAliasSuggestions([]);
      Alert.alert(
        "Error de Alias",
        error.message || "No se pudo verificar el alias. Intenta de nuevo."
      );
    }
  };

  const checkEmail = async () => {
    if (email.trim() === "") {
      setIsEmailAvailable(null);
      return;
    }
    // Validar formato de email antes de enviar la solicitud
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setIsEmailAvailable(null); // O podrías establecer un estado de error de formato
      return;
    }

    try {
      const data = await getDatosConQueryParams(
        "register/check-email",
        { email: email.trim() },
        "Error al verificar el email"
      );
      console.log("Respuesta de verificación de email:", data);

      if (typeof data === "boolean") {
        setIsEmailAvailable(data);
      } else if (data && typeof data === "object" && typeof data.available === "boolean") {
        setIsEmailAvailable(data.available);
      } else {
        setIsEmailAvailable(null);
        console.warn("Formato de respuesta inesperado para check-email:", data);
      }
    } catch (error) {
      console.error("Error en checkEmail:", error);
      setIsEmailAvailable(null);
      Alert.alert(
        "Error de Email",
        error.message || "No se pudo verificar el email. Intenta de nuevo."
      );
    }
  };

  // Función para navegar a la pantalla de recuperar contraseña
  const navigateToForgotPassword = () => {
    navigation.navigate("ForgotPassword"); // Asegúrate de que "ForgotPassword" es el nombre correcto de la ruta
  };

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

      <ScrollView className="flex-1 px-6 pt-12" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-8 mb-10">
          <View className="w-20 h-20 rounded-full bg-amber-500 items-center justify-center">
            <Text className="text-white text-4xl font-bold">R</Text>
          </View>

          <Text className="text-2xl font-bold text-gray-800 mt-4">
            {isStudentRegister ? "Registro de Estudiante" : "Registro"}
          </Text>
          <Text className="text-sm text-gray-500">Ingresa tu correo y alias</Text>
        </View>

        <View className="bg-white rounded-2xl shadow p-6 mb-20">
          <Text className="text-gray-700 font-medium mb-2">
            Correo Electrónico
          </Text>
          <TextInput
            className={`border rounded-xl px-4 py-2 mb-2 text-gray-800 bg-gray-50 ${
              isEmailAvailable === true
                ? "border-green-500"
                : isEmailAvailable === false
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="ejemplo@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            onBlur={checkEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          {isEmailAvailable === false && (
            <View>
              <Text className="text-red-600 text-sm mb-2">
                Este correo electrónico ya está registrado.
              </Text>
              <TouchableOpacity className="mt-[-8] mb-2" onPress={navigateToForgotPassword}>
                <Text className="text-amber-600 text-sm font-medium underline">
                  ¿Olvidaste tu contraseña? Recupérala aquí.
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text className="text-gray-700 font-medium mb-2 mt-2">Alias</Text>
          <TextInput
            className={`border rounded-xl px-4 py-2 mb-2 text-gray-800 bg-gray-50 ${
              isAliasAvailable === true
                ? "border-green-500"
                : isAliasAvailable === false
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Alias único"
            placeholderTextColor="#9CA3AF"
            value={username}
            onBlur={checkAlias}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />
          {isAliasAvailable === true && (
            <Text className="text-green-600 text-sm mb-2">
              ¡Alias disponible!
            </Text>
          )}
          {isAliasAvailable === false && (
            <View>
              <Text className="text-red-600 text-sm mb-1">
                Alias no disponible. Sugerencias:
              </Text>
              {aliasSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setUsername(suggestion)}
                  className="mb-1"
                >
                  <Text className="text-amber-500 text-sm underline">
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            className={`rounded-xl py-3 mt-8 ${
              loading ||
              isAliasAvailable !== true || // Deshabilitar si no es true
              isEmailAvailable !== true // Deshabilitar si no es true
                ? "bg-gray-400"
                : "bg-amber-400"
            }`}
            onPress={handleRegisterStep1}
            disabled={
              loading ||
              isAliasAvailable !== true ||
              isEmailAvailable !== true
            }
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Siguiente
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingModal visible={loading} message={loadingMessage} />
    </View>
  );
};

export default Register;