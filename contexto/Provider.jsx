import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatosWithAuth } from '../api/crud'; // Asegúrate de tener esta importación, asumiendo la ruta

export const Contexto = createContext();

const Provider = ({ children }) => {
  const [logeado, setLogeado] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isStudent, setIsStudent] = useState(false); // Nuevo estado para el rol de estudiante
  const [savedUserAccounts, setSavedUserAccounts] = useState([]);

  const SAVE_ACCOUNTS_KEY = 'savedUserAccounts';

  const login = async (tokenData, userIdData, usernameData, useremailData, firstNameData, lastNameData) => {
    setLogeado(true);
    setToken(tokenData);
    setUserId(userIdData);
    setUsername(usernameData);
    setEmail(useremailData);
    setFirstName(firstNameData);
    setLastName(lastNameData);
    setUserRole(null); // Mantener por si acaso, pero el rol principal será isStudent

    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('token', tokenData);
      await AsyncStorage.setItem('userId', String(userIdData));
      await AsyncStorage.setItem('username', usernameData);
      await AsyncStorage.setItem('email', useremailData);
      await AsyncStorage.setItem('firstName', firstNameData);
      await AsyncStorage.setItem('lastName', lastNameData);

      // **** NUEVA LÓGICA: Verificar si es estudiante al iniciar sesión ****
      await checkAndSetIsStudent(userIdData, tokenData);

    } catch (e) {
      console.log("Error al guardar en AsyncStorage (login):", e);
    }
  };

  const logout = async () => {
    setLogeado(false);
    setUserId(null);
    setUsername(null);
    setEmail(null);
    setFirstName(null);
    setLastName(null);
    setToken(null);
    setUserRole(null);
    setIsStudent(false); // Restablecer isStudent al cerrar sesión

    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('firstName');
      await AsyncStorage.removeItem('lastName');
      await AsyncStorage.removeItem('isStudent'); // Eliminar también el estado de estudiante
    } catch (e) {
      console.log("Error al eliminar de AsyncStorage (logout):", e);
    }
  };

  // Función para verificar y establecer el estado de estudiante
  const checkAndSetIsStudent = async (id, currentToken) => {
    if (!id) {
      setIsStudent(false);
      await AsyncStorage.setItem('isStudent', 'false');
      return;
    }
    try {
      const studentData = await getDatosWithAuth(`student/${id}`, "Error al verificar rol de estudiante", currentToken);
      if (studentData && Object.keys(studentData).length > 0) { // Asumiendo que un objeto vacío o null significa que no es estudiante
        setIsStudent(true);
        await AsyncStorage.setItem('isStudent', 'true');
      } else {
        setIsStudent(false);
        await AsyncStorage.setItem('isStudent', 'false');
      }
    } catch (e) {
      console.log("Error al verificar si es estudiante:", e);
      // Si hay un error (ej. 404 Not Found), asumimos que no es estudiante
      setIsStudent(false);
      await AsyncStorage.setItem('isStudent', 'false');
    }
  };

  // Función para actualizar el estado de estudiante desde fuera (ej. EditProfile)
  const setIsStudentStatus = async (status) => {
    setIsStudent(status);
    await AsyncStorage.setItem('isStudent', String(status));
  };

  /**
   * @param {string} userEmail
   * @param {string} userPassword
   */
  const saveUserCredentials = async (userEmail, userPassword) => {
    try {
      let currentAccounts = [];
      const storedAccounts = await AsyncStorage.getItem(SAVE_ACCOUNTS_KEY);
      if (storedAccounts) {
        currentAccounts = JSON.parse(storedAccounts);
        currentAccounts = currentAccounts.filter(account => account.email !== userEmail);
      }
      currentAccounts.push({ email: userEmail, password: userPassword });
      await AsyncStorage.setItem(SAVE_ACCOUNTS_KEY, JSON.stringify(currentAccounts));
      setSavedUserAccounts(currentAccounts);
    } catch (e) {
      console.log("Error al guardar credenciales:", e);
    }
  };

  const loadUserCredentials = async () => {
    try {
      const storedAccounts = await AsyncStorage.getItem(SAVE_ACCOUNTS_KEY);
      if (storedAccounts) {
        setSavedUserAccounts(JSON.parse(storedAccounts));
      }
    } catch (e) {
      console.log("Error al cargar credenciales:", e);
      setSavedUserAccounts([]);
    }
  };

  /**
   * @param {string} userEmail
   */
  const removeUserCredentials = async (userEmail) => {
    try {
      let currentAccounts = [];
      const storedAccounts = await AsyncStorage.getItem(SAVE_ACCOUNTS_KEY);
      if (storedAccounts) {
        currentAccounts = JSON.parse(storedAccounts);
        currentAccounts = currentAccounts.filter(account => account.email !== userEmail);
        await AsyncStorage.setItem(SAVE_ACCOUNTS_KEY, JSON.stringify(currentAccounts));
        setSavedUserAccounts(currentAccounts);
      }
    } catch (e) {
      console.log("Error al eliminar credenciales:", e);
    }
  };

  useEffect(() => {
    const initializeAppState = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUsername = await AsyncStorage.getItem('username');
        const storedEmail = await AsyncStorage.getItem('email');
        const storedFirstName = await AsyncStorage.getItem('firstName');
        const storedLastName = await AsyncStorage.getItem('lastName');
        const storedIsStudent = await AsyncStorage.getItem('isStudent'); // Cargar isStudent

        if (loggedIn === 'true' && storedToken && storedUserId && storedUsername) {
          setLogeado(true);
          setToken(storedToken);
          setUserId(storedUserId);
          setUsername(storedUsername);
          setEmail(storedEmail);
          setFirstName(storedFirstName);
          setLastName(storedLastName);
          setIsStudent(storedIsStudent === 'true'); // Establecer isStudent
          // También verifica el rol de estudiante si no está ya almacenado o para refrescar
          // Solo si userId y token están disponibles
          if (storedUserId && storedToken && storedIsStudent === null) { // Si no se había guardado antes
             await checkAndSetIsStudent(storedUserId, storedToken);
          }
        }
        await loadUserCredentials();
      } catch (e) {
        console.log("Error al cargar estado inicial de la app desde AsyncStorage:", e);
      }
    };

    initializeAppState();
  }, []);

  return (
    <Contexto.Provider value={{
      logeado, userId, username, firstName, lastName, email, token, userRole, isStudent, // Añadir isStudent
      login, logout, setIsStudentStatus, // Añadir setIsStudentStatus
      savedUserAccounts, saveUserCredentials, removeUserCredentials
    }}>
      {children}
    </Contexto.Provider>
  );
};

export default Provider;