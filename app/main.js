import React, { useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import Navbar from '../components/navbar';
import Btn from '../components/buttonsHome';
import RondaModal from '../components/rondaModal';
import PanicoButton from '../components/panicButton';
import LogoutButton from '../components/logoutBtn';

const background = require("../assets/background.png")
const logoGuardia = require("../assets/logoGuardia.png");
const panicoBtn = require("../assets/panicoBtn.png")
const asignacionBtn = require("../assets/asignacionBtn.png")
const rondaBtn = require("../assets/rondaBtn.png")
const novedadesBtn = require("../assets/novedadesBtn.png")

export default function Main () {

    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <ImageBackground source={background} style={styles.backgroundImg}>
            <Navbar/>
            <View style={styles.container}>
                <Text style={styles.textUser}>Usuario: Nombre Apellido</Text>
            </View>
            <View style={styles.containerButtons}>
                <PanicoButton logoSource={panicoBtn} text="PÁNICO" />
                <Btn logoSource={rondaBtn} text="RONDA"  onPress={() => setModalVisible(true)} />
                <Btn logoSource={novedadesBtn} text="NOVEDADES" onPress={() => router.push("/informe")}/>
                <Btn logoSource={asignacionBtn} text="ASIGNACIÓN"/>
            </View>
            <View style={styles.containerFooter}>
                <LogoutButton
                    logoSource={logoGuardia}
                    buttonText="FINALIZAR GUARDIA"
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