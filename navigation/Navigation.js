import { StatusBar, Platform } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NavigationContainer } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"

import Splash from "screens/conexion/Splash"; 

import HomeCourses from "screens/courses/HomeCourses"
import DetailsCourses from "screens/courses/DetailsCourses"
import HomeRecipes from "screens/recipes/HomeRecipes"
import DetailsRecipes from "screens/recipes/DetailsRecipes"
import CreateRecipe from "screens/recipes/CreateRecipe"
import BuyCourse from "screens/courses/BuyCourse"
import Login from "screens/auth/Login"
import Register from "screens/auth/Register"
import VerifyCode from "screens/auth/VerifyCode"
import ForgotPassword from "screens/auth/ForgotPassword"
import ResetPassword from "screens/auth/ResetPassword"
import SuccessScreen from "screens/auth/SuccessScreen"
import Profile from "screens/profile/Profile"
import EditProfile from "screens/profile/EditProfile"
import SaveRecipe from "screens/profile/SaveRecipe"
import MyCourses from "screens/profile/MyCourses"
import ScanQR from "screens/profile/ScanQR"
import NoConexion from "screens/conexion/NoConexion" 

const Tab = createBottomTabNavigator()
const RecipesStack = createNativeStackNavigator()
const CoursesStack = createNativeStackNavigator()
const AuthStack = createNativeStackNavigator()
const ProfileStack = createNativeStackNavigator()
const RootStack = createNativeStackNavigator()

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#FEF3E2" },
      }}
    >
      <ProfileStack.Screen name="Profile" component={Profile} />
      <ProfileStack.Screen name="EditProfile" component={EditProfile} />
      <ProfileStack.Screen name="SaveRecipe" component={SaveRecipe} />
      <ProfileStack.Screen name="MyCourses" component={MyCourses} />
      <ProfileStack.Screen name="ScanQR" component={ScanQR} />
      <ProfileStack.Screen name="DetailsRecipes" component={DetailsRecipes} />
      <ProfileStack.Screen name="DetailsCourses" component={DetailsCourses} />
    </ProfileStack.Navigator>
  )
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#FEF3E2" },
      }}
    >
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
      <AuthStack.Screen name="VerifyCode" component={VerifyCode} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <AuthStack.Screen name="ResetPassword" component={ResetPassword} />
      <AuthStack.Screen name="SuccessScreen" component={SuccessScreen} />
    </AuthStack.Navigator>
  )
}

function RecipesStackScreen() {
  return (
    <RecipesStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <RecipesStack.Screen name="HomeRecipes" component={HomeRecipes} />
      <RecipesStack.Screen name="DetailsRecipes" component={DetailsRecipes} />
      <RecipesStack.Screen name="CreateRecipe" component={CreateRecipe} />
    </RecipesStack.Navigator>
  )
}

function CoursesStackScreen() {
  return (
    <CoursesStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <CoursesStack.Screen name="HomeCourses" component={HomeCourses} />
      <CoursesStack.Screen name="DetailsCourses" component={DetailsCourses} />
      <CoursesStack.Screen name="BuyCourse" component={BuyCourse} />
    </CoursesStack.Navigator>
  )
}

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#F5F3E4",
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 80 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === "ios" ? 10 : 0,
        },
        tabBarActiveTintColor: "#F59E0B",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tab.Screen
        name="Recetas"
        component={RecipesStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chef-hat" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Cursos"
        component={CoursesStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="school" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function Navigation() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3E4" />
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <RootStack.Screen
            name="Splash"
            component={Splash}
            options={{
              gestureEnabled: false,
            }}
          />

          <RootStack.Screen
            name="MainTabs"
            component={MyTabs}
            options={{
              gestureEnabled: false,
            }}
          />

          <RootStack.Screen
            name="AuthStack"
            component={AuthStackScreen}
            options={{
              presentation: "modal",
              gestureEnabled: true,
            }}
          />

          <RootStack.Screen
            name="ProfileStack"
            component={ProfileStackScreen}
            options={{
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
          <RootStack.Screen
            name="NoConexion"
            component={NoConexion}
            options={{
              gestureEnabled: false,
            }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}