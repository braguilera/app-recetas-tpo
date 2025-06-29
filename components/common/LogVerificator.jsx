import React, { useContext, useState } from 'react';
import { TouchableOpacity, Text, View, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Contexto } from '../../contexto/Provider'; 

const LogVerificator = ({
    children,
    onPress, 
    loginRequiredMessage = "Para experimentar la experiencia al máximo o realizar esta acción, inicia sesión.",
    loginButtonText = "Iniciar Sesión",
    cancelButtonText = "Cancelar",
    ...props 
}) => {
    const navigation = useNavigation();
    const { logeado } = useContext(Contexto);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePress = () => {
        if (logeado) {
            onPress();
        } else {
            setModalVisible(true); 
        }
    };

    const handleLoginRedirect = () => {
        setModalVisible(false);
        navigation.navigate("AuthStack", { screen: "Login" }); 
    };

    return (
        <>
            <TouchableOpacity onPress={handlePress} {...props}>
                {children}
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50"> 
                    <View className="m-5 bg-white rounded-2xl p-9 items-center shadow-lg w-4/5">
                        <Text className="mb-4 text-center text-base font-bold text-gray-800">
                            {loginRequiredMessage}
                        </Text>
                        <View className="flex-row mt-3 w-full">
                            <TouchableOpacity
                                className="flex-1 rounded-xl p-3 elevation-2 mx-1 bg-amber-400"
                                onPress={handleLoginRedirect}
                            >
                                <Text className="text-white font-bold text-center">
                                    {loginButtonText}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 rounded-xl p-3 elevation-2 mx-1 bg-gray-200"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-gray-800 font-bold text-center">
                                    {cancelButtonText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default LogVerificator;