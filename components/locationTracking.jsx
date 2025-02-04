import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../configAPI';

const LOCATION_TRACKING_TASK = 'background-location-tracking';

export const startLocationTracking = async () => {
  try {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK);

    if (!isTaskRegistered) {
      TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
        if (error) {
          console.error('Error en seguimiento de ubicación:', error);
          return;
        }

        if (data) {
          const { locations } = data;
          const location = locations[0];

          if (location) {
            const { latitude, longitude } = location.coords;

            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              const response = await fetch(`${API_URL}/users/location`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  location: { latitude, longitude },
                }),
              });

              if (!response.ok) {
                console.log('Error al enviar ubicación');
              }
            } catch (error) {
              console.error('Error en la solicitud de ubicación:', error);
            }
          }
        }
      });

      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 60000,
        distanceInterval: 0,
        foregroundService: {
          notificationTitle: 'Seguimiento de ubicación',
          notificationBody: 'La aplicación está rastreando tu ubicación',
        },
      });
    } else {
      console.log('La tarea de seguimiento de ubicación ya está registrada');
    }

    return true;
  } catch (error) {
    console.error('Error al iniciar seguimiento de ubicación:', error);
    return false;
  }
};

export const stopLocationTracking = async () => {
  try {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK);

    if (isTaskRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      console.log('Seguimiento de ubicación detenido');
    } else {
      console.log('La tarea de seguimiento de ubicación no está registrada');
    }

    return true;
  } catch (error) {
    console.error('Error al detener seguimiento de ubicación:', error);
    return false;
  }
};