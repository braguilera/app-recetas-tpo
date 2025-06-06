// contexto/Provider.js
import { useState, useEffect, createContext } from "react";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Exporta Contexto como una exportación nombrada
export const Contexto = createContext();

const Provider = ({ children }) => {
    const [token, setToken] = useState("");
    const [logeado, setLogeado] = useState(false);
    const [userId, setUserId] = useState(null);

    // const [rol, setRol] = useState(""); // Estado del rol (comentado por ahora)

    // Función para cargar el token y el userId al inicio
    const loadAppState = async () => {
        try {
            const storedToken = await AsyncStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                setLogeado(true);
                try {
                    const decoded = jwtDecode(storedToken);
                    if (decoded?.userId) {
                        setUserId(decoded.userId);
                    }
                    // if (decoded?.authorities) {
                    //     setRol(decoded.authorities);
                    // }
                } catch (decodeError) {
                    console.error("Error decodificando token al inicio:", decodeError);
                    await AsyncStorage.removeItem("token");
                    setToken("");
                    setLogeado(false);
                    setUserId(null);
                    // setRol("");
                }
            }
        } catch (error) {
            console.error("Error al cargar el estado de la app desde AsyncStorage:", error);
        }
    };

    // Cargar el estado al montar el componente
    useEffect(() => {
        loadAppState();
    }, []);

    // Decodificar Token y Setear userId cuando el token cambia
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                
                if (decoded?.userId) {
                    setUserId(decoded.userId);
                } else {
                    setUserId(null);
                }

                // if (decoded?.authorities) {
                //     setRol(decoded.authorities);
                // } else {
                //     setRol("");
                // }
            } catch (error) {
                console.error("Error decodificando token:", error);
                setUserId(null);
                // setRol("");
            }
        } else {
            setUserId(null);
            // setRol("");
        }
    }, [token]);

    // Manage Token (almacenamiento en AsyncStorage)
    useEffect(() => {
        const manageTokenInStorage = async () => {
            try {
                if (token) {
                    await AsyncStorage.setItem("token", token);
                    setLogeado(true);
                } else {
                    await AsyncStorage.removeItem("token");
                    setLogeado(false);
                }
            } catch (error) {
                console.error("Error al manejar el token en AsyncStorage:", error);
            }
        };
        manageTokenInStorage();
    }, [token]);

    return (
        <Contexto.Provider value={{ 
            logeado,
            setLogeado,
            token,
            setToken,
            userId,
            setUserId
        }}>
            {children}
        </Contexto.Provider>
    );
};

export default Provider;