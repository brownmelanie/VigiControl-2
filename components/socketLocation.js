import io from "socket.io-client";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const iniciarSocket = async (API_URL, alertId) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log ("Token obtenido:", accessToken);

        if (!accessToken) {
            console.error('Inicia sesión nuevamente');
            return;
        }

        let socket = io(API_URL, {
            extraHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5
        });

        function sendUpdate (alertId, socket) {
            return setInterval(async () => {
                try {
                    const location = await Location.getCurrentPositionAsync({});
                    const { latitude, longitude } = location.coords;
    
                    socket.emit('updateLocation', {
                        id: alertId,
                        location: { latitude, longitude }
                    });
    
                    console.log('Ubicación enviada:', { latitude, longitude, alertId });
                } catch (error) {
                    console.error('Error al obtener la ubicación:', error);
                }
            }, 10000);
        }

        let interval;

        socket.on('connect', () => {
            console.log('Socket conectado');
            interval = sendUpdate(alertId, socket);
        });

        socket.on("error", (error) => {
            console.log(error);
        } )

        socket.on('disconnect', (reason) => {
            console.log('Desconectado del servidor:', reason);
            detenerActualizacionesUbicacion(interval);
            if (reason === 'io server disconnect') {
                console.log('Conexión cerrada por el servidor, deteniendo actualizaciones de ubicación.');
                Alert.alert("Alerta finalizada", "Alerta cerrada por el servidor, deteniendo actualizaciones de ubicación")
            }
        });

    } catch (error) {
        console.error('Error al iniciar el socket:', error);
    }
};

const detenerActualizacionesUbicacion = (interval) => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
};