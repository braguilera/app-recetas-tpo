import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator } from "react-native"; // Agregado ActivityIndicator
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../config'; // Asegúrate que esta ruta sea correcta
import React, { useState } from "react";
// FileSystem no es estrictamente necesario si usamos el URI directamente con XMLHttpRequest
// import * as FileSystem from 'expo-file-system';

console.log('Objeto Firebase importado:', firebase);

const UploadMediaFile = () => {
  const [imageUri, setImageUri] = useState(null); // Estado para guardar el URI de la imagen
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // No se necesita solicitar permisos para iniciar la biblioteca de imágenes
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'All', //all,images, videos
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri); // Guardamos el URI en el estado
      console.log("Imagen seleccionada URI:", result.assets[0].uri);
    } else {
      console.log("Selección de imagen cancelada o sin imagen.");
      // setImageUri(null); // Opcional: limpiar si no se selecciona nada
    }
  };

  const uploadMedia = async () => {
    if (!imageUri) {
      Alert.alert("No hay archivo", "Por favor, selecciona un archivo primero.");
      return;
    }

    setUploading(true);

    try {
      // El imageUri ya es el URI del archivo local
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          console.error("XMLHttpRequest error:", e);
          reject(new TypeError('Error en la solicitud de red para convertir a Blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', imageUri, true); // Usamos imageUri directamente
        xhr.send(null);
      });

      // Crear un nombre de archivo único
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const fileExtension = filename.split('.').pop();
      const uniqueFilename = `media/${Date.now()}.${fileExtension}`; // Guardar en carpeta 'media'

      const storageRef = firebase.storage().ref().child(uniqueFilename);

      const snapshot = await storageRef.put(blob);

      // Opcional: cerrar el blob si la implementación lo permite
      if (blob && typeof blob.close === 'function') {
        blob.close();
      }

       // AQUÍ IMPRIMIMOS EL NOMBRE DEL ARCHIVO CON EL QUE SE GUARDÓ EN STORAGE
       //BRIAN AMOR ACA ESTA EL ENDPOINT QUE TENES QUE METERLE AL BACK
      console.log('Archivo guardado en Firebase Storage como:', uniqueFilename); //  NUEVA LÍNE

      const downloadURL = await snapshot.ref.getDownloadURL();
      console.log("Archivo subido. URL de descarga:", downloadURL);

      setUploading(false);
      Alert.alert('¡Archivo Subido!', 'Tu archivo ha sido subido exitosamente.');
      setImageUri(null); // Limpiar la selección después de subir

    } catch (error) {
      console.error("Error al subir:", error);
      Alert.alert('Error de Subida', `Hubo un problema: ${error.message}`);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Subir Archivo</Text>

        {/* Botón para seleccionar imagen */}
        <TouchableOpacity style={styles.button} onPress={pickImage} disabled={uploading}>
          <Text style={styles.buttonText}>Seleccionar Archivo</Text>
        </TouchableOpacity>

        {/* Vista previa de la imagen */}
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        )}

        {/* Botón para subir imagen (solo si hay una imagen seleccionada y no se está subiendo) */}
        {imageUri && !uploading && (
          <TouchableOpacity style={[styles.button, styles.uploadButton]} onPress={uploadMedia}>
            <Text style={styles.buttonText}>Subir Archivo</Text>
          </TouchableOpacity>
        )}

        {/* Indicador de carga */}
        {uploading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Subiendo...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default UploadMediaFile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Color de fondo para SafeArea
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
     shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#4CAF50', // Un color diferente para el botón de subir
  },
  imagePreview: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  }
});