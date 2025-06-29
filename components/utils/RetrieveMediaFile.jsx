import { View, Image, ActivityIndicator } from "react-native";
import { firebase } from '../../config'; 
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons"; 

const RetrieveMediaFile = ({ imageUrl }) => {
    const [retrievedImageUri, setRetrievedImageUri] = useState(null);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchImage = async () => {
            if (!imageUrl) {
                setRetrievedImageUri(null); 
                return;
            }

            setSearching(true);
            setRetrievedImageUri(null);

            try {
                if (imageUrl.startsWith('media')){
                    const storageRef = firebase.storage().ref().child(imageUrl);
                    const downloadURL = await storageRef.getDownloadURL();
                    setRetrievedImageUri(downloadURL);
                }
            } catch (error) {
                console.error("Error al buscar la imagen:", error);
                setRetrievedImageUri('not-found'); 
            } finally {
                setSearching(false);
            }
        };

        fetchImage();
    }, [imageUrl]); 
    return (
        <View className="w-full h-full items-center justify-center overflow-hidden">
            {searching ? (
                <ActivityIndicator size="large" color="#3B82F6" />
            ) : retrievedImageUri === 'not-found' ? (
                <MaterialIcons name="image-not-supported" size={80} color="black" />
            ) : retrievedImageUri ? (
                <Image source={{ uri: retrievedImageUri }} className="w-full  rounded-lg" style={{ aspectRatio: 4/4 }} />
            ) : (
                <MaterialIcons name="image-not-supported" size={80} color="lightgray" />
            )}
        </View>
    );
};

export default RetrieveMediaFile;