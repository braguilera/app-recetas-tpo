import React from 'react'
import { Modal, View, Text, TouchableOpacity } from 'react-native'

const ConfirmModal = ({
  visible,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  onConfirm,
  onCancel,
  confirmText = "Sí, eliminar",
  cancelText = "Cancelar",
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
          <Text className="text-lg font-semibold mb-2 text-center">{title}</Text>
          <Text className="text-base text-center mb-6">{message}</Text>

          <View className="flex-row justify-between">
            <TouchableOpacity
              className={`bg-gray-200 px-4 py-2 rounded-lg ${title==="Baja de Curso Confirmada" || title==="¡Curso Comprado Exitosamente!" && "w-full items-center"}`}
              onPress={onCancel}
            >
              <Text className="text-gray-800">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`${title==="Confirmar Compra" ? "bg-yellow-500" : "bg-red-500"} ${title==="Baja de Curso Confirmada" || title==="¡Curso Comprado Exitosamente!" && "hidden"} px-4 py-2 rounded-lg`}
              onPress={onConfirm}
            >
              <Text className="text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ConfirmModal
