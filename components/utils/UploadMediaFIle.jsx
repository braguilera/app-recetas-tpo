// components/utils/UploadMediaFile.js
import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../config'; // Ajusta esta ruta si es necesario
import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";

// Usamos forwardRef para permitir que el componente padre acceda a métodos o estados del hijo
const UploadMediaFile = forwardRef(({ onUploadComplete, initialImageUri }, ref) => {
    const [imageUri, setImageUri] = useState(initialImageUri);
    const [uploading, setUploading] = useState(false);
    // Cambiado para almacenar un objeto { url, path } o null
    const [uploadedMediaInfo, setUploadedMediaInfo] = useState(null); 

    // Usa useEffect para actualizar imageUri si initialImageUri cambia
    useEffect(() => {
        setImageUri(initialImageUri);
        // Si initialImageUri es una URL de Firebase, asumimos que ya está subida
        // y necesitamos inferir el uniqueFilename si es posible o usar la URL como fallback
        if (initialImageUri && initialImageUri.startsWith('http')) {
            const uniqueFilenameFromUrl = `media/${initialImageUri.split('/').pop().split('?')[0]}`;
            setUploadedMediaInfo({ url: initialImageUri, path: uniqueFilenameFromUrl });
        } else {
            setUploadedMediaInfo(null); // Si es una nueva selección, reseteamos
        }
    }, [initialImageUri]);

    // Expone la función upload y la URI seleccionada al componente padre
    useImperativeHandle(ref, () => ({
        // Método que el padre puede llamar para iniciar la subida
        upload: async () => {
            if (!imageUri) {
                Alert.alert("No hay archivo", "Por favor, selecciona un archivo primero.");
                return null; // Retorna null si no hay imagen seleccionada
            }

            // Si la imagen ya es una URL remota y ya está "subida" (o preexistente), no la resubimos.
            // Simplemente retornamos la información existente.
            if (uploadedMediaInfo && uploadedMediaInfo.url && uploadedMediaInfo.path) {
                console.log("La imagen ya es una URL remota, no se requiere re-subida.");
                if (onUploadComplete) {
                    onUploadComplete(uploadedMediaInfo.url, uploadedMediaInfo.path);
                }
                return uploadedMediaInfo; // Retorna el objeto completo con url y path
            }
            return await performUpload(); // Llama a la función de subida interna
        },
        // Método para que el padre obtenga la URI actual (seleccionada o subida)
        getImageUri: () => imageUri,
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
            setUploadedMediaInfo(null); // Resetea la info de descarga si se selecciona una nueva imagen
            console.log("Imagen seleccionada URI:", selectedUri);
        } else {
            console.log("Selección de imagen cancelada o sin imagen.");
        }
    };

    // Esta función ahora es interna y se llama desde el método expuesto por useImperativeHandle
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
            const uniqueFilename = `media/${Date.now()}.${fileExtension}`; // Path en Firebase Storage

            const storageRef = firebase.storage().ref().child(uniqueFilename);
            const snapshot = await storageRef.put(blob);

            if (blob && typeof blob.close === 'function') {
                blob.close();
            }

            console.log('Archivo guardado en Firebase Storage como:', uniqueFilename);
            const downloadURL = await snapshot.ref.getDownloadURL();
            console.log("Archivo subido. URL de descarga:", downloadURL);

            const resultInfo = { url: downloadURL, path: uniqueFilename };
            setUploadedMediaInfo(resultInfo); // Guarda el objeto completo
            setUploading(false);
            Alert.alert('¡Archivo Subido!', `Tu archivo se ha subido.`);

            if (onUploadComplete) {
                onUploadComplete(downloadURL, uniqueFilename); // Notifica al padre con ambos valores
            }
            return resultInfo; // Retorna el objeto con url y path
        } catch (error) {
            console.error("Error al subir:", error);
            Alert.alert('Error de Subida', `Hubo un problema: ${error.message}`);
            setUploading(false);
            return null; // Retorna null en caso de error
        }
    };

    return (
        <View className="w-full items-center mb-10 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <Text className="text-xl font-bold text-gray-800 mb-4">Subir Imagen Principal</Text>

            <TouchableOpacity
                className="bg-gray-100 rounded-lg w-full h-32 items-center justify-center border-2 border-dashed border-gray-300 mb-4"
                onPress={pickImage}
                disabled={uploading}
            >
                {/* Muestra la URL final si ya se subió, de lo contrario la URI temporal */}
                {uploadedMediaInfo?.url || imageUri ? (
                    <Image source={{ uri: uploadedMediaInfo?.url || imageUri }} className="w-full h-full rounded-lg resize-contain" />
                ) : (
                    <View className="items-center">
                        <AntDesign name="picture" size={30} color="#9CA3AF" />
                        <Text className="text-gray-500 text-sm mt-2">Toca para seleccionar imagen</Text>
                    </View>
                )}
            </TouchableOpacity>

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