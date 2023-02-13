import React, { useEffect, useRef } from 'react';
import Advertisement from './advertisement/components/index'
import NearBy from './nearby/components/index'
import MerchantProducts from './nearby/components/merchantProducts'
import NearByView from './nearby/components/view'
import Categories from './categories/components/index'
import Settings from './settings/components/index'
import Confirm from './confirm/components/index'
import Maps from './maps/components/index'
import Carts from './carts/components/index'
import CustomerSignUp from './register/components/index'
import Profile from './profile/components/index'
import History from './history/components/index'
import { NavigationContainer } from '@react-navigation/native';
import LoginIndex from '../shared/login/components/customers/index'
import Login from '../shared/login/components/customers/login'
import { createStackNavigator } from '@react-navigation/stack';
import { getDataFromToken } from '../utilities/token'
import PushNotification from "react-native-push-notification";
import Geolocation from '@react-native-community/geolocation';
import { connect } from 'react-redux'
import { updateUserLocation } from './maps/actions'
import Drawer from 'react-native-drawer'
import { Button } from 'react-native-elements';
import { PermissionsAndroid } from 'react-native'

const drawerStyles = {
    drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3 },
    main: { paddingLeft: 3 },
}

const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();
function CustomersNavigation(props) {
    let refDrawer = useRef(null);
    let refNavigation = useRef(null)
    let watchId
    useEffect(() => {
        async function listen() {
            let userData = await getDataFromToken()
            window.Echo.channel(`customer.${userData.id}`)
                .listen('.customer-transaction-status-channel', (response) => {
                    const { data } = response
                    PushNotification.localNotification({
                        message: data.message, // (required)
                    })
                })
        }
        listen()
    }, [])

    useEffect(() => {
        async function getPosition() {
            try {
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
                        let userData = await getDataFromToken()
                        watchId = Geolocation.watchPosition(
                            position => {
                                const { latitude, longitude } = position.coords;
                                // this.setState({ latitude, longitude, });
                                const submitData = {
                                    id: userData.id,
                                    latitude,
                                    longitude
                                }
                                props.onUpdateUserLocation(submitData)
                                console.log("Update Location", submitData)
                            },
                            error => console.log(error),
                            // { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000, distanceFilter: 1 }
                            { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
                        );
                        return () => {
                            Geolocation.clearWatch(watchId);
                        };
                    }
                } else {
                    console.log("Permission denied");
                }
            } catch (err) {
                console.warn(err);
            }
        }
        getPosition()

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
            <NavigationContainer
                ref={refNavigation} independent>
                <Stack.Navigator initialRouteName={props.isAuthenticated ? 'Advertisement' : 'LoginIndex'}>
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
                    <Stack.Screen name="Advertisement"
                        options={{
                            headerShown: false
                        }}
                        component={Advertisement}
                    />
                    <Stack.Screen name="Categories"
                        options={{
                            // headerShown: true,
                            headerLeft: null,
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
                        component={Categories}
                    />

                    <Stack.Screen name="Nearby"
                        options={{
                            title: 'Products',
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
                        component={NearBy}
                    />

                    <Stack.Screen name="MerchantProducts"
                        options={{
                            title: 'Merchant Products',
                            headerShown: false,
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
                        component={MerchantProducts}
                    />


                    <Stack.Screen name="NearbyView"
                        options={{
                            headerShown: false
                            // headerTitle: null
                        }}
                        component={NearByView}
                    />
                    <Stack.Screen name="Carts"
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
                        component={Carts}
                    />
                    <Stack.Screen name="Maps"
                        options={{
                            title: 'Map',
                            // headerShown: false
                        }}
                        component={Maps}
                    />
                    <Stack.Screen name="Confirm"
                        options={{
                            headerShown: false
                        }}
                        component={Confirm}
                    />

                    <Stack.Screen name="Profile"
                        options={{
                            headerShown: false
                        }}
                        component={Profile}
                    />

                    <Stack.Screen name="History"
                        options={{
                            headerShown: false
                        }}
                        component={History}
                    />

                    <Stack.Screen name="CustomerSignUp"
                        options={{
                            headerShown: false
                        }}
                        component={CustomerSignUp}
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

export default connect(mapStateToProps, mapDispatchToProps)(CustomersNavigation);