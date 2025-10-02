import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, AppState, Alert } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { jwtDecode } from 'jwt-decode'; 
import { API_URL } from "../configAPI";

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
        return true;
      } else {
        throw new Error("Inicie sesión nuevamente");
      }
    } catch (error) {
      console.error("Error al refrescar token:", error);
      Alert.alert("Error", error.message);
      return false;
    }
  };

export default function Layout() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkStoredTokens = async () => {
            const accessToken = await AsyncStorage.getItem("accessToken");
            const refreshToken = await AsyncStorage.getItem("refreshToken");

            console.log("Access Token al abrir la app:", accessToken);
            console.log("Refresh Token al abrir la app:", refreshToken);

            if (!accessToken) {
              router.replace("/login");
            } else {
              const isValid = await validateToken(accessToken, refreshToken);
              if (!isValid) {
                router.replace("/login");
              } else {
                if (pathname === "/" || pathname === "") {
                  router.replace("/main");
                }
              }
            }
            setLoading(false);
          };

        const validateToken = async (token, refreshToken) => {
            try {
              const decoded = jwtDecode(token);
              console.log("Token decodificado _layout:", decoded);
      
              const currentTime = Date.now() / 1000;
              if (decoded.exp < currentTime) {
                console.log("AccessToken expirado, intentando renovar...");
                if (refreshToken) {
                    const refreshed = await refreshAccessToken();
                    if (refreshed) {
                      console.log("Token renovado exitosamente.");
                      return true;
                    } else {
                      console.log("No se pudo renovar el token.");
                      return false;
                    }
                } else {
                  console.log("no hay refreshToken disponible.");
                  return false;
                }
              } else {
                console.log("AccessToken sigue válido.");
                return true;
              }
            } catch (error) {
              console.log("Error al validar token:", error);
              return false;
            }
          };

        checkStoredTokens();

        const handleAppStateChange = async (nextAppState) => {
            if (nextAppState === "active") {
                console.log("La app se reanudó.");
                const accessToken = await AsyncStorage.getItem("accessToken");
                const refreshToken = await AsyncStorage.getItem("refreshToken");
                if (accessToken) {
                    validateToken(accessToken, refreshToken);
                }
            }
        };

        const subscription = AppState.addEventListener("change", handleAppStateChange);

        return () => {
            subscription.remove();
          };
        }, [router, pathname]);

    return (
        <View style={styles.main}>
            <Stack
                screenOptions={{
                headerTitle: "",
                header: () => <></>
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create ({
    main: {
        flex: 1,
    },
})