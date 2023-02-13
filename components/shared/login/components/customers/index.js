import React, { Component } from "react";
import { connect } from "react-redux";
import { submitLogin } from "../../actions";
import {
    Image,
    StyleSheet,
    Text,
    View,
    ImageBackground
} from "react-native";
import Logo from '../../../../../assets/logo/logo.png'
// import LoginFromFacebook from './loginWithFacebook'

import { Button } from 'react-native-elements';
class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: "customer1@email.com",
            password: "123456"
        };
    }

    componentDidMount() { }

    componentDidUpdate() {
        const { isLoginSuccess, isLoginRejected, navigation } = this.props;
        if (isLoginSuccess) {
            this.props.navigation.navigate('Advertisement')
        } else if (isLoginRejected) {
            alert("Username & Password is not correct, please try again.");
        }
    }

    handleSubmitLogin() {
        const { email, password } = this.state;
        const { onSubmitLogin } = this.props;
        const data = {
            email,
            password
        };
        onSubmitLogin(data, 'customer');
    }

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
                        <Text style={{ color: 'white', fontSize: 22, marginTop: 40, opacity: 0.9, fontWeight: 'bold' }} >
                            Be A Hero.
                        </Text>
                    </View>
                    <View style={{ paddingLeft: 25, paddingRight: 25 }}>
                        <View style={{ marginTop: 50 }}>
                            <Text style={{ color: 'white', textAlign: 'center' }}>
                                Continue with:
                            </Text>
                        </View>
                        <View style={{ marginBottom: 5 }}  >
                            <Button
                                titleStyle={{ color: '#FD2D55', fontWeight: '700' }}
                                buttonStyle={{ backgroundColor: 'white', borderRadius: 10, height: 50 }}
                                title="Email"
                                type="solid"
                                loading={isLoginLoading}
                                onPress={() => {
                                    navigation.navigate("Login");
                                }}
                            />
                        </View>
                        <View style={{ marginBottom: 5 }}  >
                            <Button
                                titleStyle={{ color: 'white', fontWeight: '700' }}
                                buttonStyle={{ backgroundColor: '#353A50', borderRadius: 10, height: 50 }}
                                title="Sign Up"
                                type="solid"
                                loading={isLoginLoading}
                                onPress={() => {
                                    navigation.navigate("CustomerSignUp");
                                }}
                            />
                        </View>
                    </View>
                </View>
            </ImageBackground>
        );
    }
}

Login.navigationOptions = {
    header: null,
    tabBarVisible: false
};

function mapStateToProps(state) {
    return {
        isLoginLoading: state.login.isLoginLoading,
        isLoginSuccess: state.login.isLoginSuccess,
        isLoginRejected: state.login.isLoginRejected
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSubmitLogin: (data, userType) => dispatch(submitLogin(data, userType))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

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
