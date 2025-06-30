import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { getDatosWithAuth } from '../../api/crud'; 
import { Contexto } from '../../contexto/Provider'; 

const UserAvatar = ({
    sizeClasses = "w-16 h-16", 
    textSizeClasses = "text-2xl", 
    bgColorClass = "bg-amber-500", 
    textColorClass = "text-white"
}) => {
    const { userId, token } = useContext(Contexto);
    const [userProfileData, setUserProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserProfileData = useCallback(async () => {
        if (!userId || !token) {
            setError("ID de usuario o token no disponibles para cargar el avatar.");
            setLoading(false);
            return;
        }
        try {
            const data = await getDatosWithAuth(`user/${userId}`, 'Error al cargar el perfil del usuario para el avatar', token);
            setUserProfileData(data);
        } catch (err) {
            console.error("Error al obtener el perfil del usuario para el avatar:", err.message);
            setError("No se pudo cargar el avatar.");
        } finally {
            setLoading(false);
        }
    }, [userId, token]);

    useEffect(() => {
        fetchUserProfileData();
    }, [fetchUserProfileData]);

    if (loading) {
        return (
            <View className={`${sizeClasses} rounded-full overflow-hidden items-center justify-center bg-gray-300`}>
                <ActivityIndicator size="small" color="#6B7280" />
            </View>
        );
    }

    if (error) {
        // En caso de error, muestra un avatar genérico 
        return (
            <View className={`${sizeClasses} rounded-full overflow-hidden items-center justify-center bg-red-400`}>
                <Text className={`${textColorClass} ${textSizeClasses} font-bold`}>?</Text>
            </View>
        );
    }

    const userNameInitial = userProfileData?.nombre ? userProfileData.nombre.charAt(0).toUpperCase() : '';
    const hasAvatar = userProfileData?.avatar && userProfileData.avatar.trim() !== '';

    return (
        <View className={`${sizeClasses} rounded-full overflow-hidden items-center justify-center bg-gray-300`}>
            {hasAvatar ? (
                <Image source={{ uri: userProfileData.avatar }} className="w-full h-full object-cover" />
            ) : (
                <View className={`w-full h-full rounded-full items-center justify-center ${bgColorClass}`}>
                    <Text className={`${textColorClass} ${textSizeClasses} font-bold`}>
                        {userNameInitial}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default UserAvatar;
