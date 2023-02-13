import React, { useEffect, useRef } from 'react';
import Maps from './maps/components/index'
import Login from '../shared/login/components/riders/login'
import LoginIndex from '../shared/login/components/riders/index'
import Settings from './settings/components/index'
import Wallets from './wallets/components/index'
import Profile from './profile/components/index'
import DeliveryConfirm from './deliveryConfirm/components/index'
import Geolocation from '@react-native-community/geolocation';
import Drawer from 'react-native-drawer'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { updateUserLocation } from './maps/actions'
import { connect } from 'react-redux'
import { Button } from 'react-native-elements';
import { getDataFromToken } from '../utilities/token'
import { PermissionsAndroid } from 'react-native'

const drawerStyles = {
    drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3 },
    main: { paddingLeft: 3 },
}

const Stack = createStackNavigator();

function RidersNavigation(props) {
    let refDrawer = useRef(null);
    let refNavigation = useRef(null)

    useEffect(() => {
        async function getPosition() {
            let userData = await getDataFromToken()
            Geolocation.setRNConfiguration({
                authorizationLevel: 'always',
                skipPermissionRequests: true,
            });
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    // this.setState({ latitude, longitude, });
                    const submitData = {
                        id: userData.id,
                        latitude,
                        longitude
                    }
                    props.onUpdateUserLocation(submitData)
                    console.log("Update Location 1", submitData)
                },
                error => console.log(error),
                { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000, distanceFilter: 1 }
            );
            Geolocation.watchPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    // this.setState({ latitude, longitude, });
                    const submitData = {
                        id: userData.id,
                        latitude,
                        longitude
                    }
                    props.onUpdateUserLocation(submitData)
                    console.log("Update Location 2", submitData)
                },
                error => console.log(error),
                { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000, distanceFilter: 10 }

            );
        }

        async function getPermissions() {
            try {
                const backgroundgranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                    {
                        title: 'Background Location Permission',
                        message:
                            'We need access to your location ' +
                            'so you can get live quality updates.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (backgroundgranted === PermissionsAndroid.RESULTS.GRANTED) {
                    // get position only if logged in
                    if (props.isAuthenticated) {
                        getPosition()
                    }
                }
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message:
                            "Beahero needs access to your application " +
                            "so you can use map.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // get position only if logged in
                    if (props.isAuthenticated) {
                        getPosition()
                    }
                } else {
                    console.log("Permission denied");
                }
            } catch (err) {
                console.warn(err);
            }
        }

        getPermissions()

    }, [props.isAuthenticated])

    function openDrawer() {
        refDrawer.current.open()
    }


    return (
        <Drawer
            ref={refDrawer}
            styles={drawerStyles}
            tapToClose={true}
            openDrawerOffset={0.2} // 20% gap on the right side of drawer
            panCloseMask={0.2}
            closedDrawerOffset={-3}
            tweenHandler={(ratio) => ({
                main: { opacity: (2 - ratio) / 2 }
            })}
            content={<Settings refDrawer={refDrawer} refNavigation={refNavigation} />}
        >
            <NavigationContainer ref={refNavigation} independent>
                <Stack.Navigator initialRouteName={props.isAuthenticated ? 'Maps' : 'LoginIndex'}>
                    <Stack.Screen name="LoginIndex"
                        options={{
                            headerShown: false
                        }}
                        component={LoginIndex}
                    />
                    <Stack.Screen name="Login"
                        options={{
                            headerShown: false
                        }}
                        component={Login}
                    />
                    <Stack.Screen name="Maps"
                        options={{
                            // headerShown: true,
                            headerRight: () => (
                                <Button
                                    icon={{
                                        name: "settings",
                                        size: 24,
                                        color: "gray"
                                    }}
                                    buttonStyle={{ backgroundColor: 'transparent' }}
                                    title=""
                                    onPress={() => openDrawer()}
                                />
                            )
                        }}
                        component={Maps}
                    />
                    <Stack.Screen name="Wallets"
                        options={{
                            headerShown: false
                        }}
                        component={Wallets}
                    />
                    <Stack.Screen name="DeliveryConfirm"
                        options={{
                            headerShown: false
                        }}
                        component={DeliveryConfirm}
                    />
                    <Stack.Screen name="Profile"
                        options={{
                            headerShown: false
                        }}
                        component={Profile}
                    />
                </Stack.Navigator>
            </NavigationContainer >
        </Drawer>


    );
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        onUpdateUserLocation: (data) => dispatch(updateUserLocation(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RidersNavigation);
