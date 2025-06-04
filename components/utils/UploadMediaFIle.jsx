import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator, TextInput } from "react-native"; // Agregado TextInput
import * as ImagePicker from 'expo-image-picker';
import { firebase } from 'config'; // Asegúrate que esta ruta sea correcta
import React, { useState } from "react";
// FileSystem no es estrictamente necesario si usamos el URI directamente con XMLHttpRequest
// import * as FileSystem from 'expo-file-system';

console.log('Objeto Firebase importado:', firebase);

const UploadMediaFile = () => {
  const [imageUri, setImageUri] = useState(null); // Estado para guardar el URI de la imagen
  const [uploading, setUploading] = useState(false);

//--------------------------------------------
// INICIO: NUEVOS ESTADOS PARA BÚSQUEDA
//--------------------------------------------
  const [searchFilename, setSearchFilename] = useState(''); // Nombre del archivo a buscar
  const [retrievedImageUri, setRetrievedImageUri] = useState(null); // URI de la imagen recuperada
  const [searching, setSearching] = useState(false); // Estado de carga para la búsqueda
//--------------------------------------------
// FIN: NUEVOS ESTADOS PARA BÚSQUEDA
//--------------------------------------------

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
      console.log('Archivo guardado en Firebase Storage como:', uniqueFilename); //  NUEVA LÍNEA

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

//--------------------------------------------
// INICIO: NUEVA FUNCIÓN PARA BUSCAR IMAGEN POR NOMBRE
//--------------------------------------------
  const fetchImageByName = async () => {
    if (!searchFilename.trim()) {
      Alert.alert("Nombre vacío", "Por favor, ingresa el nombre del archivo a buscar.");
      return;
    }
    setSearching(true);
    setRetrievedImageUri(null); // Limpiar imagen anterior
    try {
      // Asume que el 'searchFilename' que recibes del backend es la ruta completa en Storage (ej: 'media/1678886950000.jpg')
      // Si solo recibes el nombre base (ej: '1678886950000.jpg') y siempre está en 'media/', debes anteponerlo:
      // const filePathInStorage = `media/${searchFilename.trim()}`;
      const filePathInStorage = searchFilename.trim(); // Usar directamente si ya es la ruta completa

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
//--------------------------------------------
// FIN: NUEVA FUNCIÓN PARA BUSCAR IMAGEN POR NOMBRE
//--------------------------------------------

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

{/*--------------------------------------------*/}
{/* INICIO: SECCIÓN UI PARA BUSCAR Y MOSTRAR IMAGEN */}
{/*--------------------------------------------*/}
        <Text style={styles.titleSearch}>Buscar Archivo por Nombre</Text>
        <TextInput
            style={styles.input}
            placeholder="Ruta completa (ej: media/nombre.jpg)"
            value={searchFilename}
            onChangeText={setSearchFilename}
            autoCapitalize="none"
        />
        <TouchableOpacity style={[styles.button, styles.searchButton]} onPress={fetchImageByName} disabled={searching}>
          <Text style={styles.buttonText}>Buscar Imagen</Text>
        </TouchableOpacity>

        {searching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Buscando...</Text>
          </View>
        )}

        {retrievedImageUri && (
            <View style={styles.retrievedImageContainer}>
                <Text style={styles.infoText}>Imagen Recuperada:</Text>
                <Image source={{ uri: retrievedImageUri }} style={styles.imagePreview} />
            </View>
        )}
{/*--------------------------------------------*/}
{/* FIN: SECCIÓN UI PARA BUSCAR Y MOSTRAR IMAGEN */}
{/*--------------------------------------------*/}

      </View>
    </SafeAreaView>
  );
}

export default UploadMediaFile;

// Se han añadido/modificado algunos estilos para los nuevos elementos.
// Puedes ajustar estos estilos según tus preferencias.
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
//--------------------------------------------
// INICIO: NUEVOS ESTILOS Y MODIFICACIONES
//--------------------------------------------
  titleSearch: { // Estilo para el título de la sección de búsqueda
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30, // Más espacio arriba
    marginBottom: 15,
    color: '#333',
  },
  input: { // Estilo para el TextInput
    width: '90%', // Ajustado al ancho de los botones
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  searchButton: { // Estilo para el botón de búsqueda
    backgroundColor: '#FF9500', // Un color diferente para el botón de buscar
    width: '90%', // Coincidir con otros botones/inputs
  },
  infoText: { // Texto informativo para la imagen recuperada
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  retrievedImageContainer: { // Contenedor para la imagen recuperada y su texto
    alignItems: 'center',
    marginTop: 10, // Espacio antes de mostrar la imagen recuperada
  },
//--------------------------------------------
// FIN: NUEVOS ESTILOS Y MODIFICACIONES
//--------------------------------------------
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: '90%', // Cambiado de 80% a 90% para consistencia
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