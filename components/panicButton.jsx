import React, { useState } from "react";
import { Pressable, View, Text, Image, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../configAPI";
import * as Location from "expo-location";
import LoadingOverlay from "./loader";

const PanicoButton = ({ logoSource, text }) => {
  const [isLoading, setIsLoading] = useState(false);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Ocurrió un error, inicie sesión nuevamente.");
      }

      const response = await fetch(`${API_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      console.log("Respuesta de refresh token:", response.status, data);

      if (response.ok) {
        await AsyncStorage.setItem("accessToken", data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
      } else {
        throw new Error("Inicie sesión nuevamente");
      }
    } catch (error) {
      console.error("Error al refrescar token:", error);
      Alert.alert("Error", error.message);
      throw error;
    }
  };

  const handlePress = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Permiso de ubicación denegado");
        console.log("Permiso de ubicación denegado");
        return;
      }

      console.log("Obteniendo ubicación actual...");
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log("Ubicación obtenida:", { latitude, longitude });

      const enviarAlerta = async () => {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) {
          Alert.alert("Error", "No se encontró el token de usuario. Inicie sesión nuevamente");
          console.log("Token no encontrado en AsyncStorage");
          return;
        }

        console.log("Enviando alerta con ubicación:", { latitude, longitude });
        const response = await fetch(`${API_URL}/alerts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ type: "PANICO", location: { latitude, longitude } }),
        });

        const data = await response.json();
        console.log("Respuesta del endpoint /alerts:", response.status, data);

        if (response.ok) {
          Alert.alert("Alerta iniciada", `Alerta de ${text} enviada con éxito.`);
          console.log("Alerta enviada correctamente");
        } else if (response.status === 403) {
          console.log("Token expirado, refrescando...");
          await refreshAccessToken();
          await enviarAlerta();
        } else {
          Alert.alert("Error", data.message || "Ocurrió un error al enviar la alerta.");
          console.error("Error al enviar alerta:", data.message);
        }
      };

      await enviarAlerta();
    } catch (error) {
      console.error("Error en handlePress:", error);
      Alert.alert("Error", "No se pudo enviar la alerta. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Pressable style={styles.button} onPress={handlePress} disabled={isLoading}>
        <View style={styles.contentContainer}>
          <Image source={logoSource} style={styles.logo} />
          <Text style={styles.text}>{isLoading ? "ENVIANDO..." : "PÁNICO"}</Text>
        </View>
      </Pressable>
      <LoadingOverlay isVisible={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "80%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
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
