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
import { Divider, Button, Card, Image } from "react-native-elements";
import { updateCustomer, loadCustomer, GET_CUSTOMER_FULFILLED, PUT_CUSTOMER_FULFILLED } from '../actions'
import DocumentPicker from 'react-native-document-picker';
import { TouchableOpacity } from "react-native";
import noImage from '../../../../assets/images/noImage.jpg'
import { getDataFromToken } from '../../../utilities/token'
import { S3Config } from '../../../utilities/reactS3Client'
import { RNS3 } from 'react-native-s3-upload';
import config from '../../../../config'
const REACT_APP_STORAGE = config.REACT_APP_STORAGE
class Profile extends Component {
    constructor() {
        super()
        this.state = {
            "name": "",
            "email": "",
            "firstName": "",
            "lastName": "",
            "middleName": "",
            "phoneNumber": "",
            "address": "",
            "image": "",
            "isEmailValid": false,
            "errorMessage": [],

            "fileImage": '',
            "isLoading": false
        }
        this.handleUpdate = this.handleUpdate.bind(this)
    }

    async componentDidMount() {
        let userData = await getDataFromToken()
        this.props.onLoadCustomer(userData.id).then(res => {
            if (res.type === GET_CUSTOMER_FULFILLED) {
                this.validate(res.payload.email)
                this.setState(res.payload)
            }
        })
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


    async handleUpdate() {
        let userData = await getDataFromToken()

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

        this.setState({ errorMessage: errorMessage })

        const submitData = {
            "id": userData.id,
            "name": this.state.name,
            "email": this.state.email,
            "firstName": this.state.firstName,
            "lastName": this.state.lastName,
            "middleName": this.state.middleName,
            "phoneNumber": this.state.phoneNumber,
            "address": this.state.address,
            "image": this.state.image,
            "type": 1,
        }
        if (errorMessage.length === 0) {
            if (!this.state.imageUri) {
                this.props.onUpdateCustomer(submitData).then(res => {
                    this.setState({ isLoading: false })
                    if (res.type === PUT_CUSTOMER_FULFILLED) {
                        Alert.alert(
                            "Updated",
                            "Information updated successfully",
                            [
                                { text: "OK", onPress: () => console.log("OK Pressed") }
                            ]
                        );
                    }
                })
            } else {
                this.setState({ isLoading: true })
                RNS3.put(this.state.image, S3Config('users')).then(response => {
                    // if (response.status !== 201)
                    //     throw new Error("Failed to upload image to S3");
                    this.props.onUpdateCustomer({ ...submitData, image: `users/${this.state.image.name}` }).then(res => {

                        if (res.type === PUT_CUSTOMER_FULFILLED) {
                            Alert.alert(
                                "Updated",
                                "Information updated successfully",
                                [
                                    { text: "OK", onPress: () => console.log("OK Pressed") }
                                ]
                            );
                        }
                        this.setState({ isLoading: false })
                    })
                });
            }
        }

    }

    async handleOpenFile() {
        // Pick a single file
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.images],
            });
            this.setState({ imageUri: res.uri, image: res })
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView>
                    <View style={{ margin: 10, paddingTop: 20 }}>
                        <Text style={{ color: '#FD2D55', textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>My Profile</Text>
                    </View>
                    {
                        this.state.errorMessage.length !== 0 &&
                        <Card>
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
                        </Card>
                    }

                    <Card>
                        <View>
                            <Text style={{ color: "#FD2D55", fontWeight: 'bold' }}>Picture</Text>
                        </View>
                        <View style={{ marginTop: 10 }}>
                            {
                                this.state.image ?
                                    <Image
                                        source={{ uri: this.state.imageUri ? this.state.imageUri : `${REACT_APP_STORAGE}/${this.state.image}` }}
                                        style={{ width: 200, height: 200 }}
                                    /> :
                                    <Image
                                        source={noImage}
                                        style={{ width: 200, height: 200 }}
                                    />
                            }

                        </View>
                        <View style={{ marginTop: 10 }}>
                            <TouchableOpacity onPress={() => this.handleOpenFile()}>
                                <Text style={{ color: 'blue', opacity: 0.5, textDecorationLine: 'underline' }}>Change Picture</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>

                    <Card>
                        <View>
                            <Text style={{ color: "#FD2D55", fontWeight: 'bold' }}>My Info</Text>
                        </View>
                        <View>
                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="First Name" value={this.state.firstName} onChangeText={(value) => this.setState({ firstName: value })} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Middle Name" value={this.state.middleName} onChangeText={(value) => this.setState({ middleName: value })} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Last Name" value={this.state.lastName} onChangeText={(value) => this.setState({ lastName: value })} />
                            </View>
                        </View>
                    </Card>

                    <Card>
                        <View>
                            <Text style={{ color: "#FD2D55", fontWeight: 'bold' }}>Contact</Text>
                        </View>
                        <View>
                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Email" value={this.state.email} onChangeText={(text) => this.validate(text)} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Contact Number" keyboardType='numeric' value={this.state.phoneNumber} onChangeText={(value) => this.setState({ phoneNumber: value })} />
                            </View>

                            <View style={styles.inputView}>
                                <TextInput style={styles.input} placeholder="Address" value={this.state.address} onChangeText={(value) => this.setState({ address: value })} />
                            </View>
                        </View>
                    </Card>

                    <Card >
                        <View style={{ marginTop: 10 }}  >
                            <Button
                                titleStyle={{ color: 'white', fontWeight: '700' }}
                                buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                                title="UPDATE"
                                type="solid"
                                loading={this.props.customerLoading || this.state.isLoading}
                                onPress={() => {
                                    this.setState({ isLoading: true })
                                    this.handleUpdate();
                                }}
                            />
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

function mapStateToProps(state) {
    return {
        customerSuccess: state.customers.profile.customerSuccess,
        customerLoading: state.customers.profile.customerLoading,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onUpdateCustomer: (data) => dispatch(updateCustomer(data)),
        onLoadCustomer: (customerId) => dispatch(loadCustomer(customerId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

