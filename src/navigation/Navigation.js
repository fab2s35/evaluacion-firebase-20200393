import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

// Importar todas las pantallas
import RegistroScreen from '../screens/RegisterUser';
import LoginScreen from '../screens/Login';
import HomeScreen from '../screens/Home';
import EditarDatosScreen from '../screens/EditInfoUser';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
            setIsLoading(false);
        });

        return unsubscribe; 
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {user ? (
                    // Usuario autenticado - Stack de pantallas principales
                    <>
                        <Stack.Screen 
                            name="HomeScreen" 
                            component={HomeScreen}
                            options={{
                                title: 'Inicio',
                                gestureEnabled: false, // Evita que el usuario pueda regresar con gesto
                            }}
                        />
                        <Stack.Screen 
                            name="EditarDatosScreen" 
                            component={EditarDatosScreen}
                            options={{
                                title: 'Editar Información',
                                presentation: 'modal',
                                headerShown: true,
                                headerStyle: {
                                    backgroundColor: '#3498db',
                                },
                                headerTintColor: '#ffffff',
                                headerTitleStyle: {
                                    fontWeight: 'bold',
                                },
                            }}
                        />
                    </>
                ) : (
                    // Usuario no autenticado - Stack de autenticación
                    <>
                        <Stack.Screen 
                            name="RegistroScreen" 
                            component={RegistroScreen}
                            options={{
                                title: 'Registro',
                            }}
                        />
                        <Stack.Screen 
                            name="LoginScreen" 
                            component={LoginScreen}
                            options={{
                                title: 'Iniciar Sesión',
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
});

export default Navigation;