import React, { useState } from 'react';
import { Modal, View, Pressable, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from 'expo-router';
import { API_URL } from "../configAPI";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stopLocationTracking } from './locationTracking';

import Btn from './buttonsHome';

const arriboQRBtn = require("../assets/arriboQRBtn.png")
const partidaBtn = require("../assets/partidaBtn.png")

const RondaModal = ({ visible, onClose }) => {
    const router = useRouter();

    const handlePartida = async () => {
        try {
            const accessToken = await AsyncStorage.getItem("accessToken");
            if (!accessToken) {
                Alert.alert("Error", "No se encontró el token de usuario");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
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
                throw new Error("Error al registrar la partida en el servidor");
            }

            await stopLocationTracking();
    
            onClose();
            
        } catch (error) {
            console.error('Error durante la partida:', error);
            Alert.alert(
                "Error", 
                "No se pudo registrar la partida correctamente. Por favor, intente nuevamente."
            );
        }
    };

    const handleQRScan = () => {
        router.push("/qrscanner");
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Btn 
                        logoSource={arriboQRBtn} 
                        text="ARRIBO CON QR" 
                        onPress={handleQRScan}
                    />
                    <Btn 
                        logoSource={partidaBtn} 
                        text="PARTIDA" 
                        onPress={handlePartida}
                    />
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cancelar</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#0086C6',
        borderRadius: 5,
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        margin: 20,
        padding: 15,
        width: "70%",
        alignItems: "center",
        backgroundColor: '#D1D6DA',
        borderRadius: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    closeButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RondaModal;