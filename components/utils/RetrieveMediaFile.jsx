import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator, TextInput } from "react-native";
import { firebase } from '../../config'; // Asegúrate que esta ruta sea correcta
import React, { useState } from "react";
import { AntDesign } from "@expo/vector-icons"; // Importamos AntDesign para el icono

const RetrieveMediaFile = () => {
    const [searchFilename, setSearchFilename] = useState("");
    const [retrievedImageUri, setRetrievedImageUri] = useState(null);
    const [searching, setSearching] = useState(false);

    const fetchImageByName = async () => {
        if (!searchFilename.trim()) {
            Alert.alert("Nombre vacío", "Por favor, ingresa el nombre del archivo a buscar.");
            return;
        }

        setSearching(true);
        setRetrievedImageUri(null);

        try {
            const filePathInStorage = searchFilename.trim();
            const storageRef = firebase.storage().ref().child(filePathInStorage);
            const downloadURL = await storageRef.getDownloadURL();

            console.log("Imagen encontrada. URL de descarga:", downloadURL);
            setRetrievedImageUri(downloadURL);
            Alert.alert('¡Imagen Encontrada!', 'La imagen se ha cargado.');
        } catch (error) {
            console.error("Error al buscar la imagen:", error);
            if (error.code === 'storage/object-not-found') {
                Alert.alert('Error de Búsqueda', 'No se encontró un archivo con ese nombre.');
            } else {
                Alert.alert('Error de Búsqueda', `Hubo un problema: ${error.message}`);
            }
            setRetrievedImageUri(null);
        } finally {
            setSearching(false);
        }
    };

    return (
        <View className="w-full items-center mb-10 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <Text className="text-xl font-bold text-gray-800 mb-4">Buscar Archivo por Nombre</Text>
            <TextInput
                className="w-[90%] h-12 border border-gray-300 rounded-lg px-4 mb-4 text-gray-800 bg-gray-50"
                placeholder="Ruta completa (ej: media/nombre.jpg)"
                value={searchFilename}
                onChangeText={setSearchFilename}
                autoCapitalize="none"
            />
            <TouchableOpacity
                className="bg-blue-500 rounded-xl py-3 px-8 items-center w-full shadow-md active:bg-blue-600"
                onPress={fetchImageByName}
                disabled={searching}
            >
                <Text className="text-white font-bold text-lg">Buscar Imagen</Text>
            </TouchableOpacity>

            {searching && (
                <View className="mt-4 items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="mt-2 text-gray-600 text-base">Buscando...</Text>
                </View>
            )}

            {retrievedImageUri && (
                <View className="mt-4 items-center">
                    <Text className="text-gray-700 text-base mb-2 font-medium">Imagen Recuperada:</Text>
                    <Image source={{ uri: retrievedImageUri }} className="w-48 h-48 resize-contain border border-gray-300 rounded-lg" />
                </View>
            )}
        </View>
    );
};

export default RetrieveMediaFile;