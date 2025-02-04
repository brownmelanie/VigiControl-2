import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";

export default function Layout() {

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