import React, { Component } from "react";
import { connect } from "react-redux";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    Alert
} from "react-native";

import { Divider, Button, Card } from "react-native-elements";
import { submitRegister, POST_CUSTOMER_REGISTER_REJECTED, POST_CUSTOMER_REGISTER_FULFILLED } from '../actions'
import { TouchableOpacity } from "react-native";

class Register extends Component {
    constructor() {
        super()
        this.state = {
            "name": "",
            "email": "",
            "firstName": "",
            "lastName": "",
            "phoneNumber": "",
            "address": "",
            "password": "",
            "password_confirmation": "",
            "type": 1,
            "isEmailValid": false,
            "errorMessage": []
        }
        this.handleSubmitRegister = this.handleSubmitRegister.bind(this)
    }

    validate(text) {
        console.log(text);
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
            console.log("Email is Not Correct");
            this.setState({ email: text, isEmailValid: false })
            return false;
        }
        else {
            this.setState({ email: text, isEmailValid: true })
            console.log("Email is Correct");
        }
    }

    handleSubmitRegister() {
        let errorMessage = []

        if (this.state.email === '') {
            errorMessage.push('Email is Required')
        }

        if (!this.state.isEmailValid) {
            errorMessage.push('Email is Invalid')
        }

        if (this.state.firstName === '') {
            errorMessage.push('First Name is Required')
        }

        if (this.state.lastName === '') {
            errorMessage.push('Last Name is Required')
        }

        if (this.state.phoneNumber === '') {
            errorMessage.push('Phone number is Required')
        }

        if (this.state.address === '') {
            errorMessage.push('Address is Required')
        }

        if (this.state.password === '') {
            errorMessage.push('Password is Required')
        }

        if (this.state.password !== this.state['password_confirmation']) {
            errorMessage.push('Password does not match')
        }

        this.setState({ errorMessage: errorMessage })

        if (errorMessage.length === 0) {
            this.props.onSubmitRegister({
                "name": this.state.name,
                "email": this.state.email,
                "firstName": this.state.firstName,
                "lastName": this.state.lastName,
                "phoneNumber": this.state.phoneNumber,
                "address": this.state.address,
                "password": this.state.password,
                "password_confirmation": this.state['password_confirmation'],
                "type": 1,
            }).then(res => {
                console.log("RESUILT", res)
                if (res.type === POST_CUSTOMER_REGISTER_REJECTED) {
                    if (res.payload && res.payload.response && res.payload.response.status === 409) {
                        errorMessage.push('Email Already Exist')
                        this.setState({ errorMessage: errorMessage })
                    } else {
                        errorMessage.push('Something went wrong')
                        this.setState({ errorMessage: errorMessage })
                    }
                }

                if (res.type === POST_CUSTOMER_REGISTER_FULFILLED) {
                    Alert.alert(
                        "Successfully Registered",
                        "You have successfully registered as customer in Beahero. You may now login. Thank you",
                        [
                            {
                                text: "Redirect to login",
                                onPress: () => {
                                    this.setState({
                                        "name": "",
                                        "email": "",
                                        "firstName": "",
                                        "lastName": "",
                                        "phoneNumber": "",
                                        "address": "",
                                        "password": "",
                                        "password_confirmation": "",
                                    })
                                    this.props.navigation.navigate("Login")
                                }
                            },
                        ],
                        { cancelable: false }
                    );
                }
            })
        }

    }

    render() {
        const { isLoginLoading, navigation } = this.props;
        return (
            <View style={styles.container}>
                <ScrollView>
                    <View style={{ margin: 10, paddingTop: 20 }}>
                        <Text style={{ color: '#FD2D55', textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>Customer Sign Up!</Text>
                    </View>
                    <Card>
                        {
                            this.state.errorMessage.length !== 0 &&
                            <View style={{ marginBottom: 10, paddingBottom: 10 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'red' }}>Error</Text>
                                {
                                    this.state.errorMessage.map((error, index) => {
                                        return (
                                            <Text key={index} style={{ fontWeight: 'bold', fontSize: 16, color: 'red' }}>* {error}</Text>
                                        )
                                    })
                                }
                                <Divider style={{ margin: 10 }} />
                            </View>
                        }


                        <View >
                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Email" autoCapitalize='none' value={this.state.email} onChangeText={(text) => this.validate(text)} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="First Name" autoCapitalize='none' value={this.state.firstName} onChangeText={(value) => this.setState({ firstName: value })} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Last Name" autoCapitalize='none' value={this.state.lastName} onChangeText={(value) => this.setState({ lastName: value })} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Contact Number" keyboardType='numeric' value={this.state.phoneNumber} onChangeText={(value) => this.setState({ phoneNumber: value })} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Address" autoCapitalize='none' value={this.state.address} onChangeText={(value) => this.setState({ address: value })} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} secureTextEntry={true} autoCapitalize='none' placeholder="Password" value={this.state.password} onChangeText={(value) => this.setState({ password: value })} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} secureTextEntry={true} autoCapitalize='none' placeholder="Re-Type Password" value={this.state['password_confirmation']} onChangeText={(value) => this.setState({ 'password_confirmation': value })} />
                            </View>

                            <View style={{ marginTop: 10 }}  >
                                <Button
                                    titleStyle={{ color: 'white', fontWeight: '700' }}
                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                                    title="SIGN UP!"
                                    type="solid"
                                    loading={this.props.registerLoading}
                                    onPress={() => {
                                        this.handleSubmitRegister();
                                        // navigation.navigate("Customers");
                                    }}

                                />
                            </View>

                            <View style={{ display: 'flex', flexDirection: 'row', marginHorizontal: 10, marginTop: 10 }}>
                                <Text>Already have an account?</Text>
                                <TouchableOpacity onPress={() => {
                                    navigation.navigate("Login");
                                }}>
                                    <Text style={{ color: '#353A50', fontSize: 14, fontWeight: 'bold', marginHorizontal: 10, textDecorationLine: 'underline' }}>Login Here</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
                </ScrollView>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    input: {
        height: 40,
        fontSize: 16,
        padding: 4,
    },
    inputView: {
        borderBottomColor: 'lightgray',
        borderTopColor: 'lightgray',
        borderLeftColor: 'lightgray',
        borderRightColor: 'lightgray',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: 'white',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        height: 60,
        marginTop: 10,
        marginBottom: 10
    }

});

Register.navigationOptions = {
    header: null,
    tabBarVisible: false
};


function mapStateToProps(state) {
    return {
        registerSuccess: state.customers.register.registerSuccess,
        registerLoading: state.customers.register.registerLoading,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSubmitRegister: (data) => dispatch(submitRegister(data)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);

