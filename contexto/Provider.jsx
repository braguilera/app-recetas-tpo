// contexto/Provider.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatosWithAuth } from '../api/crud'; // Asegúrate de tener esta importación, asumiendo la ruta

export const Contexto = createContext();

const Provider = ({ children }) => {
  // Estados existentes para autenticación y perfil de usuario
  const [logeado, setLogeado] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isStudent, setIsStudent] = useState(false);
  const [savedUserAccounts, setSavedUserAccounts] = useState([]);

  // NUEVOS estados y constantes para recetas modificadas
  const [modifiedRecipes, setModifiedRecipes] = useState([]); // Array de recetas modificadas
  const MAX_MODIFIED_RECIPES = 10; // Límite de recetas modificadas localmente
  const MODIFIED_RECIPES_STORAGE_KEY = '@modifiedRecipes'; // Clave para AsyncStorage

  const SAVE_ACCOUNTS_KEY = 'savedUserAccounts'; // Clave existente para cuentas guardadas

  // --- Lógica de Autenticación y Credenciales ---

  const login = async (tokenData, userIdData, usernameData, useremailData, firstNameData, lastNameData) => {
    setLogeado(true);
    setToken(tokenData);
    setUserId(userIdData);
    setUsername(usernameData);
    setEmail(useremailData);
    setFirstName(firstNameData);
    setLastName(lastNameData);
    setUserRole(null);

    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('token', tokenData);
      await AsyncStorage.setItem('userId', String(userIdData)); // Asegúrate de guardar como string
      await AsyncStorage.setItem('username', usernameData);
      await AsyncStorage.setItem('email', useremailData);
      await AsyncStorage.setItem('firstName', firstNameData);
      await AsyncStorage.setItem('lastName', lastNameData);

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
    setIsStudent(false);

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

  const checkAndSetIsStudent = useCallback(async (id, currentToken) => {
    if (!id) {
      setIsStudent(false);
      await AsyncStorage.setItem('isStudent', 'false');
      return;
    }
    try {
      // Nota: Si getDatosWithAuth necesita el token para 'student/{id}', asegúrate de pasarlo
      const studentData = await getDatosWithAuth(`student/${id}`, "Error al verificar rol de estudiante", currentToken);
      if (studentData && Object.keys(studentData).length > 0) {
        setIsStudent(true);
        await AsyncStorage.setItem('isStudent', 'true');
      } else {
        setIsStudent(false);
        await AsyncStorage.setItem('isStudent', 'false');
      }
    } catch (e) {
      console.log("Error al verificar si es estudiante:", e);
      setIsStudent(false);
      await AsyncStorage.setItem('isStudent', 'false');
    }
  }, []); // Dependencias: ninguna, ya que id y currentToken se pasan como argumentos

  const setIsStudentStatus = async (status) => {
    setIsStudent(status);
    try {
      await AsyncStorage.setItem('isStudent', String(status));
    } catch (e) {
      console.log("Error al guardar isStudent en AsyncStorage:", e);
    }
  };

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

  // --- NUEVA Lógica para Recetas Modificadas ---

  // Cargar recetas modificadas desde AsyncStorage al iniciar el Provider
  useEffect(() => {
    const loadModifiedRecipes = async () => {
      try {
        const storedRecipes = await AsyncStorage.getItem(MODIFIED_RECIPES_STORAGE_KEY);
        if (storedRecipes) {
          setModifiedRecipes(JSON.parse(storedRecipes));
        }
      } catch (error) {
        console.log("Error cargando recetas modificadas de AsyncStorage:", error);
      }
    };
    loadModifiedRecipes();
  }, []); // Se ejecuta una sola vez al montar el componente

  // Guardar recetas modificadas en AsyncStorage cada vez que el estado 'modifiedRecipes' cambie
  useEffect(() => {
    const saveModifiedRecipesToStorage = async () => {
      try {
        await AsyncStorage.setItem(MODIFIED_RECIPES_STORAGE_KEY, JSON.stringify(modifiedRecipes));
      } catch (error) {
        console.log("Error guardando recetas modificadas en AsyncStorage:", error);
      }
    };
    saveModifiedRecipesToStorage();
  }, [modifiedRecipes]); // Se ejecuta cada vez que modifiedRecipes cambia

  /**
   * Guarda una receta modificada en el almacenamiento local.
   * @param {object} recipeToSave - El objeto de la receta modificada a guardar.
   * @returns {Promise<{success: boolean, message: string}>} - Un objeto con el estado y un mensaje.
   */
  const saveModifiedRecipe = useCallback(async (recipeToSave) => {
    return new Promise((resolve) => {
      setModifiedRecipes(prevRecipes => {
        // Verificar si la receta modificada ya existe (misma receta original y misma cantidad de personas)
        const exists = prevRecipes.some(
          r => String(r.originalRecipeId) === String(recipeToSave.originalRecipeId) && r.cantidadPersonas === recipeToSave.cantidadPersonas
        );

        if (exists) {
          resolve({ success: false, message: "Esta versión modificada ya está guardada." });
          return prevRecipes; // No hay cambios
        }

        // Verificar el límite de recetas
        if (prevRecipes.length >= MAX_MODIFIED_RECIPES) {
          resolve({ success: false, message: `Has alcanzado el límite de ${MAX_MODIFIED_RECIPES} recetas modificadas guardadas.` });
          return prevRecipes; // No hay cambios
        }

        // Generar un ID único para esta instancia de receta modificada
        // Esto es crucial para poder eliminarla individualmente desde el perfil
        const newModifiedRecipe = {
          ...recipeToSave,
          modifiedId: `${recipeToSave.originalRecipeId}-${recipeToSave.cantidadPersonas}-${Date.now()}`, // ID compuesto para unicidad
        };

        const updatedRecipes = [...prevRecipes, newModifiedRecipe];
        resolve({ success: true, message: "Receta modificada guardada con éxito." });
        return updatedRecipes;
      });
    });
  }, []); // Dependencias: ninguna, ya que setModifiedRecipes es estable y no usamos variables externas mutables

  /**
   * Elimina una receta modificada del almacenamiento local por su ID único.
   * @param {string} modifiedIdToRemove - El ID único de la receta modificada a eliminar.
   * @returns {Promise<{success: boolean, message: string}>} - Un objeto con el estado y un mensaje.
   */
  const removeModifiedRecipe = useCallback(async (modifiedIdToRemove) => {
    return new Promise((resolve) => {
      setModifiedRecipes(prevRecipes => {
        const initialLength = prevRecipes.length;
        const updatedRecipes = prevRecipes.filter(r => r.modifiedId !== modifiedIdToRemove);
        if (updatedRecipes.length < initialLength) {
          resolve({ success: true, message: "Receta modificada eliminada con éxito." });
        } else {
          resolve({ success: false, message: "No se encontró la receta modificada para eliminar." });
        }
        return updatedRecipes;
      });
    });
  }, []); // Dependencias: ninguna, setModifiedRecipes es estable

  // --- Efecto de Inicialización Global ---
  // Este useEffect se encargará de cargar los datos de autenticación y credenciales
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
        const storedIsStudent = await AsyncStorage.getItem('isStudent');

        if (loggedIn === 'true' && storedToken && storedUserId) { // Simplificado para que solo necesite los básicos
          setLogeado(true);
          setToken(storedToken);
          setUserId(storedUserId);
          setUsername(storedUsername);
          setEmail(storedEmail);
          setFirstName(storedFirstName);
          setLastName(storedLastName);
          setIsStudent(storedIsStudent === 'true');

          // Verificación de rol de estudiante al iniciar la app si los datos están incompletos o para refrescar
          if (storedUserId && storedToken && storedIsStudent === null) {
            await checkAndSetIsStudent(storedUserId, storedToken);
          }
        }
        await loadUserCredentials(); // Cargar credenciales guardadas para auto-login
      } catch (e) {
        console.log("Error al cargar estado inicial de la app desde AsyncStorage:", e);
      }
    };

    initializeAppState();
  }, [checkAndSetIsStudent, loadUserCredentials]); // Dependencias para useCallback


  return (
    <Contexto.Provider value={{
      // Propiedades de autenticación y perfil
      logeado, userId, username, firstName, lastName, email, token, userRole, isStudent,
      login, logout, setIsStudentStatus,

      // Propiedades de cuentas guardadas
      savedUserAccounts, saveUserCredentials, removeUserCredentials,

      // NUEVAS propiedades para recetas modificadas
      modifiedRecipes,
      saveModifiedRecipe,
      removeModifiedRecipe,
      MAX_MODIFIED_RECIPES,
    }}>
      {children}
    </Contexto.Provider>
  );
};

export default Provider;
