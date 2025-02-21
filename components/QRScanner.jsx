import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Location from "expo-location"
import { API_URL } from "../configAPI";
import LoadingOverlay from "./loader";

export default function QRScanner() {
    const [facing, setFacing] = useState("back");
    const [zoom, setZoom] = useState(0);

    const [permission, requestPermission] = useCameraPermissions();
    const [isBarcodeMode, setIsBarcodeMode] = useState(true);
    const [barcodeResult, setBarcodeResult] = useState(null);
    const cameraRef = useRef(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const toggleCameraFacing = useCallback(() => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }, []);

    const handleZoomChange = useCallback((value) => {
        setZoom(value);
    }, []);

    const sendCheckInRequest = async (checkpointId) => {
        try {
            setIsLoading(true);

            if (!checkpointId) {
                console.error('CheckpointId inválido:', checkpointId);
                Alert.alert("Error", "Código QR inválido");
                return false;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Error', 'Se requieren permisos de ubicación');
                return false;
            }

            const accessToken = await AsyncStorage.getItem("accessToken");
            if (!accessToken) {
                Alert.alert("Error", "No se encontró el token de usuario, vuelva a iniciar sesión.");
                return false;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const requestData = {
                type: "CHECKIN",
                checkpointId: parseInt(checkpointId),
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

            console.log('Respuesta del servidor:', {
                status: response.status,
                ok: response.ok
            });

            const result = await response.json();

            if (response.ok) {
                return true;
            } else if (response.status === 403) {
                const refreshSuccessful = await refreshAccessToken();
                if (refreshSuccessful) {
                    return await sendCheckInRequest(checkpointId);
                } else {
                    Alert.alert("Error", "Sesión expirada. Por favor, inicie sesión nuevamente.");
                    return false;
                }
            } else {
                throw new Error(result.message || "Error al procesar el código QR");
            }
        } catch (error) {
            console.error('Error al enviar request:', error);
            Alert.alert(
                "Error",
                error.message || "Ocurrió un error al procesar el código QR. Por favor, intente nuevamente."
            );
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleBarCodeScanned = useCallback(async ({ data }) => {
        setIsBarcodeMode(false);
        setIsLoading(true);
        
        setTimeout(() => {
        try {
            setBarcodeResult(data);
            Alert.alert(
                "Código QR Detectado",
                `¿Desea registrar este punto de control?`,
                [
                    {
                        text: "Cancelar",
                        onPress: () => {
                            setBarcodeResult(null);
                            setIsBarcodeMode(true);
                            setIsLoading(false);
                        },
                        style: "cancel"
                    },
                    {
                        text: "Aceptar",
                        onPress: async () => {
                            setIsLoading(true);
                            try {

                                const success = await sendCheckInRequest(data);
                            
                                if (success) {
                                    Alert.alert(
                                        "Escaneado exitoso",
                                        "Punto de control registrado correctamente",
                                        [
                                            {
                                                text: "OK",
                                                onPress: () => {
                                                    setBarcodeResult(null);
                                                    router.back();
                                                }
                                            }
                                        ],
                                        { cancelable: false }
                                    );
                                } else {
                                    Alert.alert(
                                        "Error",
                                        "No se pudo procesar el punto de control. Intente nuevamente.",
                                        [
                                            {
                                                text: "OK",
                                                onPress: () => {
                                                    setBarcodeResult(null);
                                                    setIsBarcodeMode(true);
                                                }
                                            }
                                        ]
                                    );
                                }
                            } catch (error) {
                                console.error('Error al procesar QR:', error);
                                Alert.alert(
                                    "Error",
                                    "Ocurrió un error al procesar el código. Por favor, intente nuevamente.",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                setBarcodeResult(null);
                                                setIsBarcodeMode(true);
                                            }
                                        }
                                    ]
                                );
                            } finally {
                                setIsLoading(false);
                            }
                        }
                    }
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error al procesar QR:', error);
            Alert.alert(
                "Error", 
                "No se pudo procesar el código QR. Intente nuevamente.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setBarcodeResult(null);
                            setIsBarcodeMode(true);
                        }
                    }
                ]
            );
        } finally {
            setIsLoading(false);
        }
        }, 200);
    }, [router]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
        <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
            Se necesita acceso a la cámara para escanear QR
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
                <Text style={styles.buttonText}>Acceso a la cámara</Text>
            </TouchableOpacity>
        </View>
        );
    }

    return (
        <View style={styles.container}>
            <LoadingOverlay isVisible={isLoading} /> 
            
            {!isLoading && (
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                zoom={zoom}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13", "ean8", "pdf417", "aztec", "datamatrix"],
                }}
                onBarcodeScanned={isBarcodeMode ? handleBarCodeScanned : undefined}
            >
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <Text style={styles.buttonText}>GIRAR CAMARA</Text>
                    </TouchableOpacity>
                    <View style={styles.sliderContainer}>
                        <Text style={styles.zoomText}>Zoom: {zoom.toFixed(1)}x</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={1}
                            value={zoom}
                            onValueChange={handleZoomChange}
                        />
                    </View>
                </View>
            </CameraView>
            )}

        <TouchableOpacity style={styles.exitButton} onPress={() => router.push("/main")}>
            <Text style={styles.exitButtonText}>{isLoading ? "CARGANDO..." : "CERRAR CÁMARA"}</Text>
        </TouchableOpacity>
{/*
        <Modal
            animationType="slide"
            transparent={true}
            visible={!!barcodeResult}
            onRequestClose={() => setBarcodeResult(null)}
        >
        <View style={styles.modalContainer}>
        {barcodeResult ? (
            <>
                <Text style={styles.modalTitle}>QR Detectado:</Text>
                <Text style={styles.modalText}>{barcodeResult}</Text>
                <TouchableOpacity
                    style={[styles.button, styles.modalButton]}
                    onPress={() => setBarcodeResult(null)}
                >
                    <Text style={styles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
            </>
        ) : (
            <ActivityIndicator size="large" color="#0000ff" />
        )}
        </View>
        </Modal> */}
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    controls: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        width: 150,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    sliderContainer: {
        marginTop: 10,
        alignItems: "center",
        width: "80%",
    },
    slider: {
        width: "100%",
    },
    zoomText: {
        color: "#fff",
        marginBottom: 5,
    },
    exitButton: {
        position: "absolute",
        top: 40,
        left: 20,
        backgroundColor: "#FF3B30",
        padding: 10,
        borderRadius: 5,
    },
    exitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    permissionText: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 20,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        color: "#fff",
        fontSize: 18,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: "#FF3B30",
    },
});