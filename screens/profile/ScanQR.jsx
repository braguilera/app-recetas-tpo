import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Contexto } from 'contexto/Provider';
import { postDatosWithAuth } from 'api/crud';
import { AntDesign } from '@expo/vector-icons';

const ScanQR = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { token } = useContext(Contexto);

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!permission) {
      return <View />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Necesitamos tu permiso para usar la cámara</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.buttonText}>Otorgar Permiso</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const handleBarcodeScanned = async ({ data }) => {
        setScanned(true);
        setIsLoading(true);

        let qrData;
        try {
            qrData = JSON.parse(data);
            if (!qrData.idCronograma || !qrData.fechaClase || !qrData.idAlumno) {
                throw new Error("El formato del QR es inválido.");
            }
        } catch (e) {
            Alert.alert(
                'QR Inválido',
                `Este código QR no tiene el formato esperado.\n\nContenido leído: "${data}"`,
                [{ text: 'Reintentar', onPress: () => setScanned(false) }],
                { cancelable: false }
            );
            setIsLoading(false);
            return;
        }
        
        try {
            await postDatosWithAuth('asistencia/registrar', qrData, 'Error al registrar la asistencia', token);
            
            Alert.alert(
                'Asistencia Registrada',
                'Tu asistencia ha sido registrada con éxito.',
                [{
                    text: 'Entendido',
                    onPress: () => navigation.goBack(),
                }],
                { cancelable: false }
            );
        } catch (error) {
            Alert.alert(
                'Error',
                `No se pudo registrar la asistencia: ${error.message}`,
                [{ text: 'Reintentar', onPress: () => setScanned(false) }],
                { cancelable: false }
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            />
            
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={28} color="white" />
            </TouchableOpacity>

            <View style={styles.scannerOverlay}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="white" />
                ) : (
                    <>
                        <View style={styles.scannerBox} />
                        <Text style={styles.scannerText}>Apunta la cámara al código QR</Text>
                    </>
                )}
            </View>

            {scanned && !isLoading && (
                <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
                    <Text style={styles.buttonText}>Escanear de Nuevo</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionButton: {
        backgroundColor: '#F59E0B',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    text: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: '#F59E0B',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 8,
        borderRadius: 20,
    },
    scannerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerBox: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
    },
    scannerText: {
        marginTop: 20,
        color: 'white',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
});

export default ScanQR;