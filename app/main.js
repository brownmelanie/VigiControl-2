import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

import Navbar from '../components/navbar';
import Btn from '../components/buttonsHome';
import RondaModal from '../components/rondaModal';
import PanicoButton from '../components/panicButton';
import LogoutButton from '../components/logoutBtn';
import LoadingOverlay from '../components/loader';

const background = require("../assets/background.png")
const logoGuardia = require("../assets/logoGuardia.png");
const panicoBtn = require("../assets/panicoBtn.png")
const asignacionBtn = require("../assets/asignacionBtn.png")
const rondaBtn = require("../assets/rondaBtn.png")
const novedadesBtn = require("../assets/novedadesBtn.png")

export default function Main () {

    console.log("Componente Main montado");

    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [userName, setUserName] = useState("Nombre Apellido");
    const [isLoading, setIsLoading] = useState(false);
    const dataLoaded = useRef(false);

    const handleActionWithLoading = async (action) => {
        setIsLoading(true);
        try {
            await action();
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRondaPress = () => {
        setIsLoading(true);
    
        setTimeout(() => {
            setModalVisible(true);
            setIsLoading(false);
        }, 200);
    };

    const handleNovedadesPress = () => {
        handleActionWithLoading(async () => {
            router.push("/informe");
        });
    };

    useEffect(() => {
        console.log("useEffect de main ejecutándose"); 
        const loadUserData = async () => {
            if (dataLoaded.current) return;
            
            try {
                const decodedTokenString = await AsyncStorage.getItem("decodedToken");
                console.log("Token decodificado obtenido de Storage:", decodedTokenString);
                
                if (decodedTokenString) {
                    const decodedToken = JSON.parse(decodedTokenString);
                    const fullName = `${decodedToken.given_name || ""} ${decodedToken.family_name || ""}`.trim();
                    setUserName(fullName || "Usuario Desconocido");
                    dataLoaded.current = true;
                }
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        };

        loadUserData();
    }, []);

    return (
        <ImageBackground source={background} style={styles.backgroundImg}>
            <LoadingOverlay isVisible={isLoading} />
            <Navbar/>
            <View style={styles.container}>
                <Text style={styles.textUser}>Usuario: {userName}</Text>
            </View>
            <View style={styles.containerButtons}>
                <PanicoButton logoSource={panicoBtn} text="PÁNICO" />
                <Btn 
                    logoSource={rondaBtn}
                    text="RONDA"
                    onPress={handleRondaPress}
                    disabled={isLoading}
                />
                <Btn
                    logoSource={novedadesBtn}
                    text="NOVEDADES"
                    onPress={handleNovedadesPress}
                    disabled={isLoading}
                />
                <Btn logoSource={asignacionBtn} text="ASIGNACIÓN"/>
            </View>
            <View style={styles.containerFooter}>
                <LogoutButton
                    logoSource={logoGuardia}
                    buttonText="FINALIZAR GUARDIA"
                    setIsLoading={setIsLoading}
                    disabled={isLoading}
                />
            </View>

            <RondaModal visible={modalVisible} onClose={() => setModalVisible(false)} />

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImg: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        width:"100%",
        borderBottomWidth: 1,
        borderBottomColor: "white"
    },
    textUser: {
        color: "white",
        textAlign: "right",
        paddingEnd: 25,
    },
    containerButtons: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width:"100%",
        borderBottomWidth: 1,
        borderBottomColor: "white"
    },
    containerFooter: {
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    footerButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 15,
        paddingBottom: 40,
    },
    footerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    logoGuardia: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
})