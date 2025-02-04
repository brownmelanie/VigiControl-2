import React, { useRef, useState } from "react";
import { Animated, Pressable, View, Text, Image, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../configAPI";
import * as Location from "expo-location";
import { iniciarSocket } from "./socketLocation";

const PanicoButton = ({ logoSource, text }) => {
    const [alertId, setAlertId] = useState(null);

    const refreshAccessToken = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            if (!refreshToken) {
                throw new Error("Ocurrió un error, inicie sesión nuevamente.");
            }

            const response = await fetch(`${API_URL}/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem("accessToken", data.accessToken);
                await AsyncStorage.setItem("refreshToken", data.refreshToken);
            } else {
                throw new Error("Inicie sesión nuevamente");
            }
        } catch (error) {
            Alert.alert("Error", error.message);
            throw error;
        }
    };

    const handlePress = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Error", "Permiso de ubicación denegado");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const enviarAlerta = async () => {
                const accessToken = await AsyncStorage.getItem("accessToken");
                if (!accessToken) {
                    Alert.alert("Error", "No se encontró el token de usuario. Inicie sesión nuevamente");
                    return;
                }

                const response = await fetch(`${API_URL}/alerts`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ type: "PANICO", location: { latitude, longitude } }),
                });

                const data = await response.json();

                if (response.ok) {
                    Alert.alert("Alerta iniciada", `Alerta de ${text} enviada con éxito.`);
                    setAlertId(data.id);
                    iniciarSocket(API_URL, data.id);
                } else if (response.status === 403) {
                    await refreshAccessToken();
                    await enviarAlerta();
                } else {
                    Alert.alert("Error", data.message || "Ocurrió un error al enviar la alerta.");
                }
            };

            await enviarAlerta();
        } catch (error) {
            Alert.alert("Error", "No se pudo enviar la alerta. Intente nuevamente.");
        }
    };

    return (
        <Pressable
            style={styles.button}
            onPress={handlePress}
        >
            <View style={styles.contentContainer}>
                <Image source={logoSource} style={styles.logo} />
                <Text style={styles.text}>{text}</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "left",
        width: "80%",
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        marginTop: 10,
        marginBottom: 10,
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    logo: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        margin: 10,
    },
    text: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
});

export default PanicoButton;