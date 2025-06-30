import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../config'; // Assuming firebase is correctly configured
import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";

const UploadMediaFile = forwardRef(({ onUploadComplete, initialImageUri, onImageChange }, ref) => {
    const [imageUri, setImageUri] = useState(initialImageUri);
    const [uploading, setUploading] = useState(false);
    const [uploadedMediaInfo, setUploadedMediaInfo] = useState(null);
    const [isDirty, setIsDirty] = useState(false); // New state to track changes

    useEffect(() => {
        setImageUri(initialImageUri);
        if (initialImageUri && initialImageUri.startsWith('http')) {
            const uniqueFilenameFromUrl = `media/${initialImageUri.split('/').pop().split('?')[0]}`;
            setUploadedMediaInfo({ url: initialImageUri, path: uniqueFilenameFromUrl });
            setIsDirty(false); // If it's an initial remote URL, no immediate changes
        } else {
            setUploadedMediaInfo(null);
            // If initialImageUri is null or not a remote URL, it might be dirty if it was just cleared
            // We'll rely on pickImage/clearImage for setting isDirty for local changes
        }
    }, [initialImageUri]);

    useImperativeHandle(ref, () => ({
        upload: async () => {
            if (uploading) {
                Alert.alert("Subiendo", "Ya hay una subida en progreso.");
                return null;
            }
            if (!imageUri) {
                // If there's no image and it's not marked as dirty, nothing to upload
                // If it was cleared, it means no image to send, but we still return null
                console.log("No hay archivo para subir.");
                return null;
            }

            // If the image is already a remote URL and no new changes were made, return its info
            if (uploadedMediaInfo && uploadedMediaInfo.url && uploadedMediaInfo.path && !isDirty) {
                console.log("La imagen ya es una URL remota y no hay cambios, no se requiere re-subida.");
                if (onUploadComplete) {
                    onUploadComplete(uploadedMediaInfo.url, uploadedMediaInfo.path);
                }
                return uploadedMediaInfo;
            }

            // Otherwise, perform the upload
            const result = await performUpload();
            if (result) {
                setIsDirty(false); // Reset dirty state after successful upload
            }
            return result;
        },
        getImageUri: () => imageUri,
        hasChanges: () => isDirty, // Expose the hasChanges method
        clearImage: () => { // Expose a method to clear the image
            setImageUri(null);
            setUploadedMediaInfo(null);
            setIsDirty(true); // Mark as dirty because content was removed
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
            setUploadedMediaInfo(null); // Clear previous uploaded info
            setIsDirty(true); // A new image was picked, so it's dirty
            if (onImageChange) { // Notify parent about image change
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
                        setIsDirty(true); // Mark as dirty because content was removed
                        if (onImageChange) onImageChange(null); // Notify parent
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
                {imageUri ? ( // Use imageUri directly for display
                    <Image source={{ uri: imageUri }} className="w-full h-full rounded-lg resize-contain" />
                ) : (
                    <View className="items-center">
                        <AntDesign name="picture" size={30} color="#9CA3AF" />
                        <Text className="text-gray-500 text-sm mt-2">Toca para seleccionar imagen</Text>
                    </View>
                )}
            </TouchableOpacity>

            {imageUri && ( // Show clear button if an image is selected
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