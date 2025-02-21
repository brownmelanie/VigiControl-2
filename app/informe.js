import React, { useState } from 'react';
import { ImageBackground, StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import * as Location from 'expo-location';
import { API_URL } from "../configAPI";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from "../components/navbar";
import LoadingOverlay from '../components/loader';

const background = require("../assets/background.png")

const Informe = () => {
    const [text, setText] =  useState("");
    const [isLoading, setIsLoading] = useState(false);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleSendReport = async () => {
        if (!text.trim()) {
            Alert.alert("Error", "Por favor ingrese el texto del reporte");
            return;
        }

        setIsLoading(true);

        try {
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const requestData = {
                type: 'INFORM',
                inform: text,
                location: { latitude, longitude }
            };

            const accessToken = await AsyncStorage.getItem("accessToken");
            if (!accessToken) {
                Alert.alert("Error", "No se encontró el token de usuario");
                return;
            }

            const response = await fetch(`${API_URL}/checks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestData),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                Alert.alert("Éxito", "El reporte se ha procesado correctamente.");
                setText("");
            } else if (response.status === 403) {
                const refreshSuccessful = await refreshAccessToken();
                if (refreshSuccessful) {
                    await handleSendReport();
                } else {
                    Alert.alert("Error", "Sesión expirada. Por favor, inicie sesión nuevamente.");
                }
            } else {
                throw new Error(result.message || "Error al enviar el reporte");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Hubo un problema al procesar el reporte. Inténtalo nuevamente.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ImageBackground source={background} style={styles.backgroundImg}>
            <Navbar/>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>

                <View style={styles.containerTitle}>
                    <Text style={styles.title}>Usted se encuentra cerca de</Text>
                </View>

                <View style={styles.textBox}>
                    <TextInput
                        style={styles.textInput}
                        multiline
                        placeholder="Escriba su reporte aquí..."
                        value={text}
                        onChangeText={setText}
                        blurOnSubmit={true}
                        returnKeyType="done"
                        onSubmitEditing={dismissKeyboard}
                    />
                </View>

                <View style={styles.sendButtonContainer}>
                    <TouchableOpacity 
                        style={[styles.sendButton, isLoading && styles.disabledButton]}
                        onPress={handleSendReport}
                        disabled={isLoading}
                    >
                        <Text style={styles.sendButtonText}>PROCESAR REPORTE</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </ScrollView>
            </KeyboardAvoidingView>
            <LoadingOverlay isVisible={isLoading} />
        </ImageBackground>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    backgroundImg: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        flex: 1,
        width: "100%",
        borderTopColor: "white",
        borderTopWidth: 1,
    },
    containerTitle: {
        borderBottomColor: "rgba(255, 255, 255, 0.7)", 
        borderBottomWidth: 0.5,
        padding: 10,
    },
    title: {
        color: "white",
        textAlign: "center",
        paddingTop: 15,
        fontSize: 18,
    },
    textBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 15,
        margin: 20,
        borderRadius: 3,
        minHeight: "40%"
    },
    textInput: {
        height: 100,
        fontSize: 16,
        color: 'black',
        textAlignVertical: 'top',
        paddingTop: 8,
    },
    buttonContainer: {
        marginBottom: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        backgroundColor: '#D6D8D7',
        paddingVertical: 20,
        paddingHorizontal: 50,
        borderRadius: 2,
        margin: 10,
        elevation: 3,
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sendButtonContainer: {
        marginLeft: 20,
        marginRight: 20,
    },
    sendButton: {
        backgroundColor: '#D6D8D7',
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderRadius: 2,
    },
    sendButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: "center",
    },
})

export default Informe;