import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

//screens
import HomeCourses from "screens/courses/HomeCourses";
import DetailsCourses from "screens/courses/DetailsCourses";

import HomeRecipes from "screens/recipes/HomeRecipes";
import DetailsRecipes from "screens/recipes/DetailsRecipes";

const HomeRecipesNavigator = createNativeStackNavigator();

//Functions to move to details
function MyStackRecipes() {
    return(
        <HomeRecipesNavigator.Navigator
            initialRouteName="HomeRecipe"
        >
            <HomeRecipesNavigator.Screen
                name="HomeRecipe"
                component={HomeRecipes}
            />
            <HomeRecipesNavigator.Screen
                name="StackRecipes"
                component={DetailsRecipes}
                options={{
                    headerBackTitle:false,
                }}
            />
        </HomeRecipesNavigator.Navigator>
    )
}

const HomeCoursesNavigator = createNativeStackNavigator();

function MyStackCourses() {
    return(
        <HomeCoursesNavigator.Navigator
            initialRouteName="HomeCourse"
        >
            <HomeCoursesNavigator.Screen
                name="HomeCourse"
                component={HomeCourses}
            />
            <HomeCoursesNavigator.Screen
                name="StackCourses"
                component={DetailsCourses}
                options={{
                    headerBackTitle:false,
                }}
            />
        </HomeCoursesNavigator.Navigator>
    )
}

const Tab = createBottomTabNavigator();

{/*
    tabBarBadge:3, Sirve para poner notificaciones
    tabBarLaber: "Otro nombre" Con este cambiamos el nombre del Tab
    headerShow:false, Para ocultar el Header
*/}

//Tabs to move to Screens
const MyTabs = () => {
    return(
        <Tab.Navigator
            initialRouteName="Recetas"
            screenOptions={{
                tabBarActiveTintColor:"yellow",
                animation:"fade"
            }}
        >
            <Tab.Screen 
                name="Recetas" 
                component={MyStackRecipes}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <MaterialCommunityIcons name="chef-hat" size={24} color={color} />
                    ),
                    headerShown:false
                }}
            />
            <Tab.Screen 
                name="Cursos" 
                component={MyStackCourses}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <MaterialCommunityIcons name="school" size={24} color={color} />
                    ),
                    headerShown:false
                }}
            />
        </Tab.Navigator>
    )
}

export default function Navigation(){
    return(
        <NavigationContainer>
            <MyTabs/>
        </NavigationContainer>
    )
}