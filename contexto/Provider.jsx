import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatosWithAuth } from '../api/crud'; 

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
  const [isStudent, setIsStudent] = useState(false);
  const [savedUserAccounts, setSavedUserAccounts] = useState([]);

  const [modifiedRecipes, setModifiedRecipes] = useState([]);
  const MAX_MODIFIED_RECIPES = 10; 
  const MODIFIED_RECIPES_STORAGE_KEY = '@modifiedRecipes';

  const SAVE_ACCOUNTS_KEY = 'savedUserAccounts'; 

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
      await AsyncStorage.setItem('userId', String(userIdData));
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
      await AsyncStorage.removeItem('isStudent'); 
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
  }, []); 

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
  }, []); 

  useEffect(() => {
    const saveModifiedRecipesToStorage = async () => {
      try {
        await AsyncStorage.setItem(MODIFIED_RECIPES_STORAGE_KEY, JSON.stringify(modifiedRecipes));
      } catch (error) {
        console.log("Error guardando recetas modificadas en AsyncStorage:", error);
      }
    };
    saveModifiedRecipesToStorage();
  }, [modifiedRecipes]); 

  /**
   * @param {object} recipeToSave 
   * @returns {Promise<{success: boolean, message: string}>}
   */

  const saveModifiedRecipe = useCallback(async (recipeToSave) => {
    return new Promise((resolve) => {
      setModifiedRecipes(prevRecipes => {
        const exists = prevRecipes.some(
          r => String(r.originalRecipeId) === String(recipeToSave.originalRecipeId) && r.cantidadPersonas === recipeToSave.cantidadPersonas
        );

        if (exists) {
          resolve({ success: false, message: "Esta versión modificada ya está guardada." });
          return prevRecipes;
        }

        if (prevRecipes.length >= MAX_MODIFIED_RECIPES) {
          resolve({ success: false, message: `Has alcanzado el límite de ${MAX_MODIFIED_RECIPES} recetas modificadas guardadas.` });
          return prevRecipes; 
        }

        const newModifiedRecipe = {
          ...recipeToSave,
          modifiedId: `${recipeToSave.originalRecipeId}-${recipeToSave.cantidadPersonas}-${Date.now()}`, 
        };

        const updatedRecipes = [...prevRecipes, newModifiedRecipe];
        resolve({ success: true, message: "Receta modificada guardada con éxito." });
        return updatedRecipes;
      });
    });
  }, []); 

  /**
   * @param {string} modifiedIdToRemove 
   * @returns {Promise<{success: boolean, message: string}>}
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
  }, []);

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

        if (loggedIn === 'true' && storedToken && storedUserId) { 
          setLogeado(true);
          setToken(storedToken);
          setUserId(storedUserId);
          setUsername(storedUsername);
          setEmail(storedEmail);
          setFirstName(storedFirstName);
          setLastName(storedLastName);
          setIsStudent(storedIsStudent === 'true');

          if (storedUserId && storedToken && storedIsStudent === null) {
            await checkAndSetIsStudent(storedUserId, storedToken);
          }
        }
        await loadUserCredentials(); 
      } catch (e) {
        console.log("Error al cargar estado inicial de la app desde AsyncStorage:", e);
      }
    };

    initializeAppState();
  }, [checkAndSetIsStudent, loadUserCredentials]);

  return (
    <Contexto.Provider value={{
      logeado, userId, username, firstName, lastName, email, token, userRole, isStudent,
      login, logout, setIsStudentStatus,

      savedUserAccounts, saveUserCredentials, removeUserCredentials,

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
