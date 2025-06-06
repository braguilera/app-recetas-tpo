// components/LoadingModal.js
import React from 'react';
import { Modal, View, Text, ActivityIndicator } from 'react-native';
// Si usas NativeWind o similar, no necesitas StyleSheet.create
// import { StyleSheet } from 'react-native'; // <--- Esto ya no sería necesario

const LoadingModal = ({ visible, message }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}} // Impide cerrar el modal con el botón de retroceso de Android
    >
      <View className="flex-1 justify-center items-center bg-black/50"> {/* overlay */}
        <View className="bg-white p-5 rounded-lg items-center shadow-lg"> {/* container */}
          <ActivityIndicator size="large" color="#FACC15" /> {/* Color ámbar 400 */}
          <Text className="mt-2 text-base text-gray-800 text-center">{message}</Text> {/* message */}
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;