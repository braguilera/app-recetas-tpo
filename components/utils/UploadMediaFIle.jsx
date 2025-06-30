import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../config';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";

const UploadMediaFile = forwardRef(({ onUploadComplete, initialImageUri, onImageChange }, ref) => {
    const [imageUri, setImageUri] = useState(initialImageUri);
    const [uploading, setUploading] = useState(false);
    const [uploadedMediaInfo, setUploadedMediaInfo] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setImageUri(initialImageUri);
        if (initialImageUri && initialImageUri.startsWith('http')) {
            const uniqueFilenameFromUrl = `media/${initialImageUri.split('/').pop().split('?')[0]}`;
            setUploadedMediaInfo({ url: initialImageUri, path: uniqueFilenameFromUrl });
            setIsDirty(false); 
        } else {
            setUploadedMediaInfo(null);
        }
    }, [initialImageUri]);

    useImperativeHandle(ref, () => ({
        upload: async () => {
            if (uploading) {
                Alert.alert("Subiendo", "Ya hay una subida en progreso.");
                return null;
            }
            if (!imageUri) {
                console.log("No hay archivo para subir.");
                return null;
            }

            if (uploadedMediaInfo && uploadedMediaInfo.url && uploadedMediaInfo.path && !isDirty) {
                console.log("La imagen ya es una URL remota y no hay cambios, no se requiere re-subida.");
                if (onUploadComplete) {
                    onUploadComplete(uploadedMediaInfo.url, uploadedMediaInfo.path);
                }
                return uploadedMediaInfo;
            }

            const result = await performUpload();
            if (result) {
                setIsDirty(false); 
            }
            return result;
        },
        getImageUri: () => imageUri,
        hasChanges: () => isDirty, 
        clearImage: () => {
            setImageUri(null);
            setUploadedMediaInfo(null);
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
            setImageUri(selectedUri);
            setUploadedMediaInfo(null); 
            setIsDirty(true);
            if (onImageChange) { 
                onImageChange(selectedUri);
            }
            console.log("Imagen seleccionada URI:", selectedUri);
        } else {
            console.log("Selección de imagen cancelada o sin imagen.");
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
                className="bg-gray-100 rounded-lg w-full h-32 items-center justify-center border-2 border-dashed border-gray-300 "
                onPress={pickImage}
                disabled={uploading}
            >
                {imageUri ? ( 
                    <Image source={{ uri: imageUri }} className="w-full h-full rounded-lg resize-contain" />
                ) : (
                    <View className="items-center">
                        <AntDesign name="picture" size={30} color="#9CA3AF" />
                        <Text className="text-gray-500 text-sm mt-2">Toca para seleccionar imagen</Text>
                    </View>
                )}
            </TouchableOpacity>

            {imageUri && ( 
                <TouchableOpacity
                    onPress={handleClearImage}
                    className="absolute top-2 right-2 bg-red-500 p-1 rounded-full z-10"
                >
                    <AntDesign name="close" size={16} color="white" />
                </TouchableOpacity>
            )}

            {uploading && (
                <View className="mt-4 items-center">
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text className="mt-2 text-gray-600 text-base">Subiendo...</Text>
                </View>
            )}
        </View>
    );
});

export default UploadMediaFile;