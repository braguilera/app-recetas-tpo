import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo'; 

const NoConexion = () => {
  const navigation = useNavigation();

  const handleRetryConnection = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      Alert.alert("¡Conectado!", "Ya tienes conexión a internet.", [
        { text: "OK", onPress: () => navigation.replace('HomeRecipes') }
      ]);
    } else {
      Alert.alert("Sin conexión", "Aún no tienes conexión a internet. Por favor, verifica tu configuración.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Sin Conexión a Internet</Text>
      <Text style={styles.message}>
        Parece que no estás conectado a internet. Por favor, verifica tu conexión y vuelve a intentarlo.
      </Text>
      <Button title="Reintentar Conexión" onPress={handleRetryConnection} color="#FFA726" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF3E2',
    padding: 20,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default NoConexion;