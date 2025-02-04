import React, { useState } from 'react';
import { StyleSheet, Image, Pressable, Text, View, TextInput, ImageBackground, Alert, KeyboardAvoidingView, Platform, Linking } from "react-native";
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from 'jwt-decode';

import * as Location from 'expo-location';
//import { startLocationTracking } from "../components/locationTracking";

import { API_URL } from "../configAPI";

const iconLogo = require("../assets/logo-ansa.png");
const background = require("../assets/background.png");

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        console.log("Iniciando proceso de login");
    
        if (!email || !password) {
            Alert.alert("Error", "Por favor, ingrese su usuario y contraseña.");
            console.log("Error: usuario o contraseña no ingresados");
            return;
        }
    
        try {
            console.log("Enviando datos al servidor:", { email, password });
    
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
    
            console.log("Respuesta del servidor:", response);
    
            if (response.ok) {
                const { accessToken, refreshToken } = await response.json();
    
                console.log("Tokens recibidos:", { accessToken, refreshToken });

                const decodedToken = jwtDecode(accessToken);
                console.log("Token decodificado:", decodedToken);
    
                await AsyncStorage.setItem("accessToken", accessToken);
                await AsyncStorage.setItem("refreshToken", refreshToken);
                await AsyncStorage.setItem("decodedToken", JSON.stringify(decodedToken));

                router.push("/main");
/*
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.error("Permiso de ubicación denegado");
                    Alert.alert("Error", "No se concedieron permisos de ubicación.");
                    return;
                }
    
                let location;
                try {
                    location = await Location.getCurrentPositionAsync({});
                } catch (locationError) {
                    console.error("Error obteniendo ubicación:", locationError);
                    location = { coords: { latitude: 0, longitude: 0 } };
                }
    
                const { latitude, longitude } = location.coords;
    
                const requestData = {
                    type: "LOGIN",
                    location: { latitude, longitude },
                };
    
                const checksResponse = await fetch(`${API_URL}/checks`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestData),
                });
    
                console.log("Respuesta del servidor en /checks:", checksResponse);
    
                if (checksResponse.ok) {
                    const trackingStarted = await startLocationTracking();
                    if (trackingStarted) {
                        console.log("Seguimiento de ubicación iniciado");
                        router.push("/main");
                    } else {
                        console.error("Error: no se pudo iniciar el seguimiento de ubicación");
                        Alert.alert("Error", "No se pudo iniciar el seguimiento de ubicación");
                    }
                } else {
                    const errorText = await checksResponse.text();
                    console.error(
                        `Error en /checks: Código ${checksResponse.status}, Respuesta: ${errorText}`
                    );
                    Alert.alert(
                        `Error ${checksResponse.status}`,
                        "No se pudo realizar el chequeo de ubicación. Intente nuevamente"
                    );
                } */
            } else {
                const errorText = await response.text();
                console.error(
                    `Error de inicio de sesión: Código ${response.status}, Respuesta: ${errorText}`
                );
                Alert.alert(
                    `Error ${response.status}`,
                    "El usuario o contraseña ingresados son incorrectos. Intente nuevamente"
                );
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            Alert.alert(
                "Error",
                "No se pudo conectar con el servidor, intente nuevamente más tarde"
            );
        }
    };

    const handleOpenPrivacyPolicy = () => {
        const url = 'https://drive.google.com/file/d/1B0kYboHKITYTkwYABRVxDheojD5WUISY/view?usp=drive_link';
        Linking.openURL(url);
    };

    return (
        <ImageBackground source={background} style={styles.backgroundImg}>
            <KeyboardAvoidingView
                style={styles.mainContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <Stack.Screen
                    options={{
                        header: () => <></>,
                    }}
                />
                <View style={styles.container}>
                    <Image source={iconLogo} style={styles.imgLogo} />
                    <Text style={styles.title}>VIGI CONTROL</Text>
                    <View style={styles.inputCont}>
                        <TextInput
                            style={styles.input}
                            placeholder="Usuario"
                            placeholderTextColor="white"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor="white"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    <View style={styles.containerBtn}>
                        <Pressable style={styles.btn} onPress={handleLogin}>
                            <Text style={styles.btnText}>Iniciar Sesión</Text>
                        </Pressable>
                    </View>
                </View>
                <Text style={styles.privacyText}>
                    Al iniciar sesión aceptas nuestras{' '}
                    <Text style={styles.linkText} onPress={handleOpenPrivacyPolicy}>
                        políticas de privacidad
                    </Text>.
                </Text>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        marginVertical: 10, //80
        backgroundColor: 'rgba(16, 16, 16, 0.51)',
        borderRadius: 15,
        width: "80%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    container: {
        flex: 1,
        marginVertical: 80,
        borderRadius: 15,
        width: "80%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        color: "white",
        fontSize: 20,
        fontFamily: "Gotham",
        fontWeight: "bold"
    },
    imgLogo: {
        width: 250,
        height: 80,
        objectFit: "contain",
    },
    inputCont: {
        width: "95%",
        height: 210,
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    input: {
        height: 40,
        color: "white",
        borderColor: '#ccc',
        borderBottomWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        fontFamily: "Gotham"
    },
    containerBtn: {
        alignItems: "center",
        marginBottom: 40,
    },
    btn: {
        backgroundColor: "#1D1B69",
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 15,
        marginBottom: 10,
    },
    btnText: {
        color: "white",
        textAlign: "center",
        fontSize: 20,
        fontFamily: "Gotham",
    },
    backgroundImg: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: "center"
    },
    privacyText: {
        textAlign: 'center',
        marginBottom: 20,
        marginHorizontal: 30,
        color: 'white',
        fontSize: 12,
        paddingHorizontal: 25,
    },
    linkText: {
        textDecorationLine: 'underline',
        color: 'white',
    }
})
