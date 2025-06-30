import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

const NoConexion = () => {
  const navigation = useNavigation();

  const handleRetryConnection = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      Alert.alert(
        "¡Conectado!",
        "Ya tienes conexión a internet.",
        [
          {
            text: "OK",
            // Corregido: Reinicia la navegación al Stack principal de la App
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            })
          }
        ]
      );
    } else {
      Alert.alert("Sin conexión", "Aún no tienes conexión a internet. Por favor, verifica tu configuración.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-amber-50 p-5">
      <Text className="text-8xl mb-5">⚠️</Text>
      <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Sin Conexión a Internet
      </Text>
      <Text className="text-base text-gray-600 text-center mb-8">
        Parece que no estás conectado a internet. Por favor, verifica tu conexión y vuelve a intentarlo.
      </Text>
      <TouchableOpacity
        onPress={handleRetryConnection}
        className="bg-amber-500 px-8 py-3 rounded-full shadow-lg"
      >
        <Text className="text-white font-bold text-base">Reintentar Conexión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoConexion;