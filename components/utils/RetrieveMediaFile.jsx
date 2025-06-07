import { View, Image, ActivityIndicator } from "react-native";
import { firebase } from '../../config'; // Asegúrate que esta ruta sea correcta
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons"; // Importamos MaterialIcons para el icono

const RetrieveMediaFile = ({ imageUrl }) => {
    const [retrievedImageUri, setRetrievedImageUri] = useState(null);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchImage = async () => {
            if (!imageUrl) {
                setRetrievedImageUri(null); // Clear previous image if URL is empty
                return;
            }

            setSearching(true);
            setRetrievedImageUri(null); // Reset before new search

            try {
                // Si la URL ya es una URL completa (http/https), la usamos directamente
                if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                    setRetrievedImageUri(imageUrl);
                    console.log("URL directa proporcionada:", imageUrl);
                } else {
                    // Si es un path de Firebase Storage, obtenemos la URL de descarga
                    const storageRef = firebase.storage().ref().child(imageUrl);
                    const downloadURL = await storageRef.getDownloadURL();
                    console.log("Imagen encontrada. URL de descarga:", downloadURL);
                    setRetrievedImageUri(downloadURL);
                }
            } catch (error) {
                console.error("Error al buscar la imagen:", error);
                setRetrievedImageUri('not-found'); // Special value to indicate image not found
            } finally {
                setSearching(false);
            }
        };

        fetchImage();
    }, [imageUrl]); // Dependencia del efecto en la prop imageUrl

    return (
        <View className="w-full items-center justify-center rounded-lg">
            {searching ? (
                <ActivityIndicator size="large" color="#3B82F6" />
            ) : retrievedImageUri === 'not-found' ? (
                <MaterialIcons name="image-not-supported" size={48} color="black" />
            ) : retrievedImageUri ? (
                <Image source={{ uri: retrievedImageUri }} className="w-full h-full resize-contain rounded-lg" style={{ aspectRatio: 4/3 }} />
            ) : (
                // Opcional: mostrar un placeholder inicial si no hay URL y no se está buscando
                <MaterialIcons name="image-not-supported" size={48} color="lightgray" />
            )}
        </View>
    );
};

export default RetrieveMediaFile;