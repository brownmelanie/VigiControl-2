import React from "react";
import { Pressable, Text, Image, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../configAPI";
import { stopLocationTracking } from "./locationTracking";

const LogoutButton = ({ logoSource, buttonText }) => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const accessToken = await AsyncStorage.getItem("accessToken");
            if (!accessToken) {
                Alert.alert("Error", "No se encontró el token de usuario");
                return;
            }
    
            let location;
            try {
                location = await Location.getCurrentPositionAsync({});
            } catch (locationError) {
                console.error('Error obteniendo ubicación:', locationError);
                location = { coords: { latitude: 0, longitude: 0 } };
            }
    
            const { latitude, longitude } = location.coords;
    
            const requestData = {
                type: 'LOGOUT',
                location: { latitude, longitude }
            };
    
            const response = await fetch(`${API_URL}/checks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestData)
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al registrar logout: ${errorText}`);
            }
    
            await stopLocationTracking();
    
            await AsyncStorage.multiRemove([
                "accessToken",
                "refreshToken",
                "userData"
            ]);
    
            router.push("/login");
            
        } catch (error) {
            console.error('Error durante el logout:', error);
            Alert.alert(
                "Error de Logout", 
                `No se pudo cerrar la sesión. Detalles: ${error.message}`
            );
        }
    };

    return (
        <Pressable style={styles.button} onPress={handleLogout}>
            <Image source={logoSource} style={styles.logo} />
            <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 30,
        paddingTop: 20,
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 10,
        resizeMode: "contain",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default LogoutButton;