import { View, Text, TouchableOpacity, StatusBar, Platform } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NavigationContainer } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Screens
import HomeCourses from "screens/courses/HomeCourses"
import DetailsCourses from "screens/courses/DetailsCourses"
import HomeRecipes from "screens/recipes/HomeRecipes"
import DetailsRecipes from "screens/recipes/DetailsRecipes"

// Stack Navigator para Recetas
const RecipesStack = createNativeStackNavigator()

function RecipesStackNavigator() {
  return (
    <RecipesStack.Navigator
      initialRouteName="HomeRecipes"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "slide_from_right",
      }}
    >
      <RecipesStack.Screen name="HomeRecipes" component={HomeRecipes} />
      <RecipesStack.Screen name="StackRecipes" component={DetailsRecipes} />
    </RecipesStack.Navigator>
  )
}

// Stack Navigator para Cursos
const CoursesStack = createNativeStackNavigator()

function CoursesStackNavigator() {
  return (
    <CoursesStack.Navigator
      initialRouteName="HomeCourses"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "slide_from_right",
      }}
    >
      <CoursesStack.Screen name="HomeCourses" component={HomeCourses} />
      <CoursesStack.Screen name="StackCourses" component={DetailsCourses} />
    </CoursesStack.Navigator>
  )
}

// Tab Navigator
const Tab = createBottomTabNavigator()

// Componente personalizado para el Tab Bar
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View
      style={{
        flexDirection: "row",
        height: 60,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingBottom: Platform.OS === "ios" ? 20 : 5,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel || options.title || route.name
        const isFocused = state.index === index

        // Determinar qué icono mostrar
        let iconName
        if (route.name === "Recetas") {
          iconName = "chef-hat"
        } else if (route.name === "Cursos") {
          iconName = "school"
        }

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name={iconName} size={24} color={isFocused ? "#F59E0B" : "#9CA3AF"} />
            <Text style={{ color: isFocused ? "#F59E0B" : "#9CA3AF", fontSize: 12, marginTop: 2 }}>{label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// Componente principal de navegación
export default function Navigation() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3E4" />
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Recetas"
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen name="Recetas" component={RecipesStackNavigator} />
          <Tab.Screen name="Cursos" component={CoursesStackNavigator} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
