import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { getDatosWithAuth } from '../../api/crud'; // Asegúrate de que esta ruta sea correcta
import { Contexto } from '../../contexto/Provider'; // Asegúrate de que esta ruta sea correcta

/**
 * Componente para mostrar el avatar de un usuario o su inicial si no tiene foto.
 * Busca los datos del usuario internamente usando el ID del contexto.
 *
 * @param {object} props - Propiedades del componente.
 * @param {string} [props.sizeClasses="w-16 h-16"] - Clases de Tailwind para el tamaño (ej: "w-20 h-20").
 * @param {string} [props.textSizeClasses="text-2xl"] - Clases de Tailwind para el tamaño del texto de la inicial (ej: "text-4xl").
 * @param {string} [props.bgColorClass="bg-amber-500"] - Clase de Tailwind para el color de fondo de la inicial.
 * @param {string} [props.textColorClass="text-white"] - Clase de Tailwind para el color del texto de la inicial.
 */
const UserAvatar = ({
    sizeClasses = "w-16 h-16", // Tamaño por defecto: w-16 h-16 (64px)
    textSizeClasses = "text-2xl", // Tamaño de texto por defecto: text-2xl
    bgColorClass = "bg-amber-500", // Color de fondo por defecto: ámbar
    textColorClass = "text-white" // Color de texto por defecto: blanco
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
        // En caso de error, muestra un avatar genérico o un placeholder
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
