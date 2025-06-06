// contexto/Provider.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Contexto = createContext();

const Provider = ({ children }) => {
  const [logeado, setLogeado] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null); // Corregido: 'username' que es el mail
  const [firstName, setFirstName] = useState(null); // Nuevo: para el nombre
  const [lastName, setLastName] = useState(null);   // Nuevo: para el apellido
  const [token, setToken] = useState(null);       // Nuevo: para el token
  const [userRole, setUserRole] = useState(null); // Dejarlo como null o cadena vacía si no hay roles

  // Función para guardar los datos del usuario después de un login exitoso
  // Recibe los datos directamente de la respuesta del backend
  const login = async (tokenData, userIdData, usernameData, firstNameData, lastNameData) => {
    setLogeado(true);
    setToken(tokenData);
    setUserId(userIdData);
    setUsername(usernameData);
    setFirstName(firstNameData);
    setLastName(lastNameData);
    setUserRole(null); // Como no hay roles, lo dejamos en null o un valor predeterminado

    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('token', tokenData); // Guardar el token
      await AsyncStorage.setItem('userId', String(userIdData)); // Asegúrate de guardar como string
      await AsyncStorage.setItem('username', usernameData);
      await AsyncStorage.setItem('firstName', firstNameData);
      // await AsyncStorage.setItem('lastName', lastNameData); // lastName puede ser null, considerar si guardarlo o no
    } catch (e) {
      console.error("Error al guardar en AsyncStorage:", e);
    }
  };

  // Función para cerrar sesión y limpiar los datos
  const logout = async () => {
    setLogeado(false);
    setUserId(null);
    setUsername(null);
    setFirstName(null);
    setLastName(null);
    setToken(null);
    setUserRole(null);

    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('firstName');
      await AsyncStorage.removeItem('lastName'); // Si lo guardaste, también quítalo
    } catch (e) {
      console.error("Error al eliminar de AsyncStorage:", e);
    }
  };

  // Efecto para cargar el estado del login desde AsyncStorage al iniciar la app
  useEffect(() => {
    const loadLoginState = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUsername = await AsyncStorage.getItem('username');
        const storedFirstName = await AsyncStorage.getItem('firstName');
        const storedLastName = await AsyncStorage.getItem('lastName');

        if (loggedIn === 'true' && storedToken && storedUserId && storedUsername) {
          setLogeado(true);
          setToken(storedToken);
          setUserId(storedUserId);
          setUsername(storedUsername);
          setFirstName(storedFirstName);
          setLastName(storedLastName);
          // setUserRole(storedUserRole); // Si decides manejar roles más adelante
        }
      } catch (e) {
        console.error("Error al cargar estado de login desde AsyncStorage:", e);
      }
    };

    loadLoginState();
  }, []);

  return (
    <Contexto.Provider value={{ logeado, userId, username, firstName, lastName, token, userRole, login, logout }}>
      {children}
    </Contexto.Provider>
  );
};

export default Provider;