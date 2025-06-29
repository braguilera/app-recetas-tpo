import React from 'react';
import { Modal, View, Text, ActivityIndicator } from 'react-native';

const LoadingModal = ({ visible, message }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}} 
    >
      <View className="flex-1 justify-center items-center bg-black/50"> 
        <View className="bg-white p-5 rounded-lg items-center shadow-lg">
          <ActivityIndicator size="large" color="#FACC15" />
          <Text className="mt-2 text-base text-gray-800 text-center">{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;