import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'
import {
    AccessToken,
    GraphRequest,
    GraphRequestManager,
    LoginManager,
} from 'react-native-fbsdk';
import { submitLoginWithFacebook } from '../../actions'

class LoginWithFacebook extends Component {
    state = { userInfo: {} };

    logoutWithFacebook = () => {
        LoginManager.logOut();
        this.setState({ userInfo: {} });
    };

    getInfoFromToken = token => {
        const PROFILE_REQUEST_PARAMS = {
            fields: {
                string: 'id, name, first_name, last_name, email, picture.type(large)',
            },
        };
        const profileRequest = new GraphRequest(
            '/me',
            { token, parameters: PROFILE_REQUEST_PARAMS },
            (error, user) => {
                const submitData = {
                    "name": user.name,
                    "facebookId": user.id,
                    "email": user.email,
                    "lastName": user.last_name,
                    "firstName": user.first_name,
                    "image": user.picture.data.url,
                    "type": 3
                }
                console.log("submitData", submitData)
                if (error) {
                    console.log('login info has error: ' + error);
                } else {
                    this.setState({ userInfo: user });
                    this.props.onSubmitLoginWithFacebook(submitData)
                    console.log('result:', user);
                }
            },
        );
        new GraphRequestManager().addRequest(profileRequest).start();
    };

    loginWithFacebook = () => {
        // Attempt a login using the Facebook login dialog asking for default permissions.
        LoginManager.logInWithPermissions(['email', 'public_profile']).then(
            login => {
                if (login.isCancelled) {
                    console.log('Login cancelled');
                } else {
                    AccessToken.getCurrentAccessToken().then(data => {
                        const accessToken = data.accessToken.toString();
                        this.getInfoFromToken(accessToken);
                    });
                }
            },
            error => {
                console.log('Login fail with error: ' + error);
            },
        );
    };

    state = { userInfo: {} };

    render() {
        const isLogin = this.state.userInfo.name;
        const buttonText = isLogin ? 'Logout With Facebook' : 'Continue to facebook';
        const onPressButton = isLogin
            ? this.logoutWithFacebook
            : this.loginWithFacebook;
        return (
            <View style={{ flex: 1, margin: 50 }}>
                <TouchableOpacity
                    onPress={onPressButton}
                    style={{
                        backgroundColor: '#4064AC',
                        padding: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Text style={{ color: 'white' }}>{buttonText}</Text>
                </TouchableOpacity>
                {this.state.userInfo.name && (
                    <Text style={{ fontSize: 16, marginVertical: 16 }}>
                        Logged in As {this.state.userInfo.name}
                    </Text>
                )}
            </View>
        );
    }
}


function mapStateToProps(state) {
    return {
        isLoginLoading: state.login.isLoginLoading,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSubmitLoginWithFacebook: data => dispatch(submitLoginWithFacebook(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginWithFacebook);