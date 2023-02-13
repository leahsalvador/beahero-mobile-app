import React, { Component } from "react";
import { connect } from "react-redux";
import {
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    Text,
    View,
    ImageBackground
} from "react-native";
import Logo from '../../../../assets/logo/logo.png'

import { Button } from 'react-native-elements';

export default class Index extends Component {


    render() {
        const { isLoginLoading, navigation } = this.props;
        return (
            <ImageBackground
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#FD2D55"
                }}
            >
                <View style={styles.container}>
                    <View style={styles.welcomeContainer}>
                        <Image
                            source={Logo}
                            style={styles.welcomeImage}
                        />
                        <Text style={{ color: 'white', fontSize: 62, fontWeight: 'bold' }} >
                            BEAHERO
                        </Text>
                        <Text style={{ color: 'white', fontSize: 18, marginTop: 40, opacity: 0.9 }} >
                            You want to login as
                        </Text>
                    </View>
                    <View style={{ paddingLeft: 25, paddingRight: 25 }}>
                        <View style={{ marginBottom: 5 }}  >
                            <Button
                                titleStyle={{ color: '#FD2D55', fontWeight: '700' }}
                                buttonStyle={{ backgroundColor: 'white', borderRadius: 10, height: 50 }}
                                title="I'm a Customer"
                                type="solid"
                                loading={isLoginLoading}
                                onPress={() => {
                                    // this.handleSubmitLogin();
                                    console.log("ASDASDSADSAD")
                                    navigation.navigate("Customers");
                                }}

                            />
                        </View>
                        <View style={{ marginBottom: 5 }} >
                            <Button
                                buttonStyle={{ backgroundColor: '#353A50', borderRadius: 10, height: 50 }}
                                titleStyle={{ color: '#FD2D55', fontWeight: '700' }}
                                title="I'm a Rider"
                                type="solid"
                                loading={isLoginLoading}
                                onPress={() => {
                                    // this.handleSubmitLogin();
                                    navigation.navigate("Riders");
                                }}
                            />
                        </View>
                    </View>
                </View>
            </ImageBackground>
        );
    }
}

Index.navigationOptions = {
    header: null,
    tabBarVisible: false
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        alignContent: 'flex-end',
        justifyContent: 'flex-end',
        marginBottom: 50
        // backgroundColor: 'black'
    },
    contentContainer: {
        paddingTop: 30
    },
    welcomeContainer: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20
    },
    welcomeImage: {
        width: 120,
        height: 120,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: -10,
        resizeMode: "contain"
    },
    loading: {
        backgroundColor: "rgba(128,128,128,0.1)",
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1
    }
});
