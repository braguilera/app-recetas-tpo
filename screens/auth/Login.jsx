import { useContext, useState, useEffect } from "react"
import { Text, View, TextInput, TouchableOpacity, StatusBar, Alert, FlatList, Switch } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Contexto } from "../../contexto/Provider";
import { postDatos } from "../../api/crud"; // Asegúrate de que esta ruta es correcta para postDatos

const Login = () => {
  const { login, savedUserAccounts, saveUserCredentials, removeUserCredentials } = useContext(Contexto);

  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [userDates, setUserDates] = useState(
    {
      email: "",
      password: ""
    });
  const [rememberMe, setRememberMe] = useState(false);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  useEffect(() => {
    if (savedUserAccounts.length === 1) {
      setUserDates({
        email: savedUserAccounts[0].email,
        password: savedUserAccounts[0].password,
      });
      setRememberMe(true);
    }
  }, [savedUserAccounts]);

  const handleLogin = async () => {
    if (!userDates.email || !userDates.password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      const responseData = await postDatos('auth/login', userDates, 'Error al iniciar sesión');
      console.log("Respuesta de inicio de sesión:", responseData);

      if (responseData && responseData.token) {
        // La función login en el contexto ahora maneja la verificación de estudiante
        login(
          responseData.token,
          responseData.userId,
          responseData.username,
          responseData.email,
          responseData.firstname,
          responseData.lastname
        );

        if (rememberMe) {
          await saveUserCredentials(userDates.email, userDates.password);
        } else {
          await removeUserCredentials(userDates.email);
        }

        navigation.navigate('MainTabs');

      } else {
        Alert.alert("Error de autenticación", responseData?.message || "Credenciales inválidas.");
      }
    } catch (error) {
      console.error("Error en handleLogin:", error);
      const errorMessage = error.message || 'Ocurrió un error inesperado al iniciar sesión.';
      Alert.alert("Error", errorMessage);
    }
  };

  /**
   * @param {object} account
   */
  const selectSavedEmail = (account) => {
    setUserDates({
      email: account.email,
      password: account.password,
    });
    setShowEmailSuggestions(false);
  };

  const renderEmailSuggestionItem = ({ item }) => (
    <TouchableOpacity
      className="py-3 px-4 border-b border-gray-200"
      onPress={() => selectSavedEmail(item)}
      testID={`suggestion-item-${item.email}`}
    >
      <Text className="text-gray-800">{item.email}</Text>
    </TouchableOpacity>
  );

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
            className="border border-gray-300 rounded-xl px-4 py-2 mb-2 text-gray-800 bg-gray-50"
            placeholder="ejemplo@email.com"
            placeholderTextColor="#9CA3AF"
            value={userDates.email}
            onChangeText={(text) => {
              setUserDates(prev => ({ ...prev, email: text }));
              if (text.length > 0) setShowEmailSuggestions(false);
            }}
            onFocus={() => {
              if (userDates.email === "" && savedUserAccounts.length > 0) {
                setShowEmailSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowEmailSuggestions(false), 300);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {showEmailSuggestions && savedUserAccounts.length > 0 && (
            <View className="border border-gray-300 rounded-xl mb-4 bg-white max-h-40 overflow-hidden">
              <FlatList
                data={savedUserAccounts}
                keyExtractor={(item) => item.email}
                renderItem={renderEmailSuggestionItem}
                keyboardShouldPersistTaps="always"
              />
            </View>
          )}

          <Text className="text-gray-700 font-medium mb-2">Contraseña</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-2 mb-4 text-gray-800 bg-gray-50"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={userDates.password}
            onChangeText={(text) => setUserDates(prev => ({ ...prev, password: text }))}
            secureTextEntry
          />

          <View className="flex-row items-center mb-4">
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: "#E0E0E0", true: "#81b0ff" }}
              thumbColor={rememberMe ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
            />
            <Text className="ml-2 text-gray-700">Recordarme</Text>
          </View>

          <TouchableOpacity className="bg-amber-400 rounded-xl py-3 mt-4" onPress={handleLogin}>
            <Text className="text-white text-center font-bold text-lg">Ingresar</Text>
          </TouchableOpacity>

          <TouchableOpacity className="mt-4" onPress={() => navigation.navigate("ForgotPassword")}>
            <Text className="text-center text-amber-600 font-medium">¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")} className="mt-6">
            <Text className="text-center text-amber-500 font-medium">¿No tenés cuenta? Registrate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register", { isStudentRegister: true })}
            className="mt-4"
          >
            <Text className="text-center text-amber-500 font-medium">
              ¿Quiere ser estudiante? Regístrate aquí
            </Text>
          </TouchableOpacity>

        </View>
        <TouchableOpacity onPress={() => navigation.navigate("MainTabs")} className="mt-6">
          <Text className="text-center text-amber-500 font-medium underline">Ir al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Login;