import React, { useState, useEffect } from 'react';
import { Modal, View, Pressable, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from 'expo-router';
import { API_URL } from "../configAPI";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stopLocationTracking } from './locationTracking';

import Btn from './buttonsHome';
import LoadingOverlay from './loader';

const arriboQRBtn = require("../assets/arriboQRBtn.png")
const partidaBtn = require("../assets/partidaBtn.png")

const RondaModal = ({ visible, onClose }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [canPartida, setCanPartida] = useState(false);

    useEffect(() => {
        const checkPermission = async () => {
          try {
            const decodedTokenStr = await AsyncStorage.getItem("decodedToken");
            if (decodedTokenStr) {
              const decodedToken = JSON.parse(decodedTokenStr);
              const permissions = decodedToken["claims/permissions"] || [];
              if (permissions.includes("partidas:create")) {
                setCanPartida(true);
              }
            }
          } catch (error) {
            console.error("Error al obtener o parsear el token decodificado:", error);
          }
        };
    
        checkPermission();
      }, []);

    const handlePressWithLoading = async (action) => {
        setIsLoading(true);
        try {
            await action();
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePartida = () => {
        if (!canPartida) {
            Alert.alert("Permiso denegado", "Sólo los supervisores pueden realizar esta acción.");
            return;
          }
        handlePressWithLoading(async () => {
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
        });
    };

    const handleQRScan = () => {
        handlePressWithLoading(async () => {
            router.push("/qrscanner");
        });
    };

    const handleCancel = () => {
        handlePressWithLoading(async () => {
            onClose();
        });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <LoadingOverlay isVisible={isLoading} /> 
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
                        disabled={!canPartida}
                    />
                    <Pressable style={styles.closeButton} onPress={handleCancel}>
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