import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';

const RefundOptionsModal = ({
    visible,
    onClose,
    courseDetails, 
    onConfirmRefund,
}) => {

    if (!courseDetails) {
        return null; 
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) {
            return "$0";
        }
        return `$${price.toLocaleString("es-AR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const cronograma = courseDetails.cronogramaCursos && courseDetails.cronogramaCursos.length > 0
        ? courseDetails.cronogramaCursos[0]
        : null;

    const coursePrice = courseDetails.precio;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                    <Text className="text-xl font-bold text-center mb-4">Confirmar Baja de Curso</Text>

                    <ScrollView showsVerticalScrollIndicator={false} className="max-h-[70%]">
                        <Text className="text-lg font-semibold text-gray-800 mb-2">{courseDetails.nombreCurso}</Text>
                        {cronograma && (
                            <>
                                <Text className="text-gray-600 mb-1">Sede: {cronograma.nombreSede}</Text>
                                <Text className="text-gray-600 mb-2">Inicio: {formatDate(cronograma.fechaInicio)}</Text>
                            </>
                        )}
                        <Text className="text-gray-700 font-medium text-base mb-4">Precio del curso: {formatPrice(coursePrice)}</Text>

                        <View className="border-t border-b border-gray-200 py-4 mb-4">
                            <Text className="text-base text-gray-800 font-semibold mb-2">Política de Reintegro:</Text>
                            <Text className="text-sm text-gray-700 leading-relaxed mb-2">
                                - Hasta 10 días antes del inicio: Reintegro del 100%.
                            </Text>
                            <Text className="text-sm text-gray-700 leading-relaxed mb-2">
                                - Entre 9 y 1 día antes del inicio: Reintegro del 70%.
                            </Text>
                            <Text className="text-sm text-gray-700 leading-relaxed mb-2">
                                - El día de inicio: Reintegro del 50%.
                            </Text>
                            <Text className="text-sm text-gray-700 leading-relaxed">
                                - Una vez iniciado el curso: No se reintegrará importe alguno.
                            </Text>
                        </View>

                        <Text className="text-lg font-bold text-gray-800 mb-2 text-center">Selecciona el medio de reintegro:</Text>

                    </ScrollView>

                    <View className="flex-row justify-between mt-4">
                        <TouchableOpacity
                            className="bg-gray-200 px-4 py-2 rounded-lg flex-1 mr-2"
                            onPress={onClose}
                        >
                            <Text className="text-gray-800 text-center">Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-green-500 px-4 py-2 rounded-lg flex-1 mr-2"
                            onPress={() => onConfirmRefund('tarjeta')}
                        >
                            <Text className="text-white text-center">Reembolsar en Tarjeta</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-blue-500 px-4 py-2 rounded-lg flex-1"
                            onPress={() => onConfirmRefund('cuenta')}
                        >
                            <Text className="text-white text-center">Reembolsar en Cuenta</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default RefundOptionsModal;
