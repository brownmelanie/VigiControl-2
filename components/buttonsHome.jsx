import React from 'react';
import { Pressable, Text, StyleSheet, Image, View } from 'react-native';

const Btn = ({ logoSource, text, onPress }) => {
    return (
        <Pressable style={styles.button} onPress={onPress}>
            <View style={styles.contentContainer}>
                <Image source={logoSource} style={styles.logo} />
                <Text style={styles.text}>{text}</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'left',
        width: '80%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        marginTop: 10, //10
        marginBottom: 10, //10
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        margin: 10,
    },
    text: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default Btn;