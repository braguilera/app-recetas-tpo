import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../config';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";

const UploadMediaFile = forwardRef(({ onUploadComplete, initialImageUri, onImageChange }, ref) => {
    // Estado para la URI que se va a mostrar (puede ser local 'file://' o remota 'https://')
    const [displayUri, setDisplayUri] = useState(null);
    // Estado para saber si se está resolviendo una URL de Firebase
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    
    const [uploading, setUploading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const resolveImageUri = async () => {
            // Si la URI inicial no existe, no mostramos nada.
            if (!initialImageUri) {
                setDisplayUri(null);
                return;
            }

            // Si ya es una URL completa (http) o un archivo local (file), la usamos directamente.
            if (initialImageUri.startsWith('http') || initialImageUri.startsWith('file')) {
                setDisplayUri(initialImageUri);
            } 
            // Si es una ruta de Firebase (como "media/123.jpg"), obtenemos la URL de descarga.
            else if (initialImageUri.startsWith('media/')) {
                setIsLoadingUrl(true);
                try {
                    const url = await firebase.storage().ref(initialImageUri).getDownloadURL();
                    setDisplayUri(url);
                } catch (error) {
                    console.error("Error al obtener URL de la imagen:", error);
                    setDisplayUri(null); // Si hay error, no mostramos la imagen.
                } finally {
                    setIsLoadingUrl(false);
                }
            }
        };

        resolveImageUri();
    }, [initialImageUri]);

    useImperativeHandle(ref, () => ({
        // ✅ LÓGICA DE SUBIDA CORREGIDA E INTEGRADA
        upload: async () => {
            // Si no hay imagen nueva para subir (sigue siendo una URL remota y no se ha cambiado)
            if (!isDirty && displayUri && displayUri.startsWith('http')) {
                console.log("No hay cambios en la imagen, no se requiere re-subida.");
                // Devolvemos la información de la imagen existente
                const path = `media/${displayUri.split('%2F').pop().split('?')[0]}`;
                return { url: displayUri, path: path };
            }
            
            // Si no hay ninguna URI, no hay nada que subir
            if (!displayUri) {
                return null;
            }

            setUploading(true);
            try {
                // Usamos fetch, que es más moderno y robusto
                const response = await fetch(displayUri);
                const blob = await response.blob();
                
                const filename = displayUri.substring(displayUri.lastIndexOf('/') + 1);
                const uniqueFilename = `media/${Date.now()}_${filename}`;
                const storageRef = firebase.storage().ref().child(uniqueFilename);

                await storageRef.put(blob);
                const downloadURL = await storageRef.getDownloadURL();
                
                console.log("Archivo subido. URL:", downloadURL, "Path:", uniqueFilename);
                setIsDirty(false); // Marcar como "limpio" después de subir
                
                const resultInfo = { url: downloadURL, path: uniqueFilename };
                if (onUploadComplete) onUploadComplete(downloadURL, uniqueFilename);
                
                return resultInfo;

            } catch (error) {
                console.error("Error al subir:", error);
                Alert.alert('Error de Subida', `Hubo un problema: ${error.message}`);
                return null;
            } finally {
                setUploading(false);
            }
        },
        getImageUri: () => displayUri,
        hasChanges: () => isDirty,
        clearImage: () => {
            setDisplayUri(null);
            setIsDirty(true);
            if (onImageChange) onImageChange(null);
        }
    }));
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedUri = result.assets[0].uri;
            setDisplayUri(selectedUri);
            setIsDirty(true); // Se ha hecho un cambio
            if (onImageChange) onImageChange(selectedUri);
        }
    };

    const handleClearImage = () => {
        Alert.alert(
            "Confirmar eliminación",
            "¿Estás seguro de que quieres eliminar esta imagen?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: () => {
                        setImageUri(null);
                        setUploadedMediaInfo(null);
                        setIsDirty(true);
                        if (onImageChange) onImageChange(null);
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    const performUpload = async () => {
        setUploading(true);
        try {
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => resolve(xhr.response);
                xhr.onerror = (e) => {
                    console.error("XMLHttpRequest error:", e);
                    reject(new TypeError('Error en la solicitud de red para convertir a Blob'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', imageUri, true);
                xhr.send(null);
            });

            const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
            const fileExtension = filename.split('.').pop();
            const uniqueFilename = `media/${Date.now()}.${fileExtension}`;

            console.log("Subiendo archivo:", uniqueFilename);

            const storageRef = firebase.storage().ref().child(uniqueFilename);
            const snapshot = await storageRef.put(blob);

            if (blob && typeof blob.close === 'function') {
                blob.close();
            }

            console.log('Archivo guardado en Firebase Storage como:', uniqueFilename);
            const downloadURL = await snapshot.ref.getDownloadURL();
            console.log("Archivo subido. URL de descarga:", downloadURL);

            const resultInfo = { url: downloadURL, path: uniqueFilename };
            setUploadedMediaInfo(resultInfo);
            setUploading(false);

            if (onUploadComplete) {
                onUploadComplete(downloadURL, uniqueFilename);
            }
            return resultInfo;
        } catch (error) {
            console.error("Error al subir:", error);
            Alert.alert('Error de Subida', `Hubo un problema: ${error.message}`);
            setUploading(false);
            return null;
        }
    };

        return (
        <View className="w-full items-center mb-10 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <TouchableOpacity
                className="bg-gray-100 rounded-lg w-full h-32 items-center justify-center border-2 border-dashed border-gray-300"
                onPress={pickImage}
                disabled={uploading || isLoadingUrl}
            >
                {isLoadingUrl ? (
                    <ActivityIndicator size="small" color="#F59E0B" />
                ) : displayUri ? (
                    <Image source={{ uri: displayUri }} className="w-full h-full rounded-lg" resizeMode="contain" />
                ) : (
                    <View className="items-center">
                        <AntDesign name="picture" size={30} color="#9CA3AF" />
                        <Text className="text-gray-500 text-sm mt-2">Toca para seleccionar imagen</Text>
                    </View>
                )}
            </TouchableOpacity>

            {displayUri && !isLoadingUrl && (
                <TouchableOpacity
                    onPress={handleClearImage}
                    className="absolute top-2 right-2 bg-red-500 p-1 rounded-full z-10"
                >
                    <AntDesign name="close" size={16} color="white" />
                </TouchableOpacity>
            )}

            {uploading && (
                <View className="absolute inset-0 bg-white/70 justify-center items-center rounded-lg">
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text className="mt-2 text-gray-600 text-base">Subiendo...</Text>
                </View>
            )}
        </View>
    );
});

export default UploadMediaFile;