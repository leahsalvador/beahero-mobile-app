import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert, PermissionsAndroid, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Styles from './AppStyles';
import MapStyles from './MapStyles';
import Geolocation from '@react-native-community/geolocation';
import haversine from "haversine";
import KmWatcher from './kmWatcher'
import FindDelivery from './findDelivery'
import ModalDeliveryRequest from './modals/deliveryRequest'
import { connect } from 'react-redux'
import { loadLatestTransactionOfRider, updateRiderCurrentPosition } from '../actions'
import Wallet from './wallet'
import KeepAwake from 'react-native-keep-awake';
import { loadWallet } from '../../wallets/actions'
import { getDataFromToken } from '../../../utilities/token'
import { useFocusEffect } from "@react-navigation/native";

import { log } from 'util';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const LATITUDE_DELTA = 0.0009;
const LONGITUDE_DELTA = 0.0009;
const LATITUDE = 14.6760;
const LONGITUDE = 121.0437;

class Maps extends Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: 14.6760,
            longitude: 121.0437,
            distanceTravelled: 0,
            prevLatLng: {},
            requestDelivery: [],
            riderConfirmDeliveryModalShow: false,
            deliverStatus: 0,
            hasArrived: false,
            simulator: false
        }
        this.handleNavigateRoute = this.handleNavigateRoute.bind(this)
        this.updateRequestDeliveryData = this.updateRequestDeliveryData.bind(this)
    }

    async componentDidMount() {
        // keep awake screen
        KeepAwake.activate();

        const userData = await getDataFromToken()
        const riderId = userData.id
        this.props.onLoadWallet(riderId)
        this.props.onLoadRiderLatestTransaction().then(res => {
            const DROPPED_OFF_LOCATION = 4
            // status 4 meaning that the rider has a unfinihed delivery and stops at DROPPED_OFF_LOCATION
            if (res.payload.status === DROPPED_OFF_LOCATION) {

                Alert.alert(
                    "Unfinished Delivery",
                    "Our system detected that you have a unfinished delivery. Go to confirm page to finished transaction.",
                    [
                        {
                            text: "Go to summary reports",
                            onPress: () => this.props.navigation.navigate('DeliveryConfirm'),
                        },
                    ],
                    {
                        cancelable: false
                    }
                );
            }
        })

        this.watchID = Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                this.setState({ latitude, longitude, });
                if (this.refMap) {
                    this.refMap.fitToCoordinates([position.coords], {
                        edgePadding: {
                            right: windowWidth / 50,
                            bottom: windowHeight / 50,
                            left: windowWidth / 50,
                            top: windowHeight / 50
                        },
                        animated: true,
                    })
                }
            },
            error => console.log(error),
            // { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000, distanceFilter: 10 }
            { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true, distanceFilter: 10 }
        );
        this.watchID = Geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;
                this.setState({ latitude, longitude, });
                this.props.onUpdateRiderCurrentPosition({
                    latitude,
                    longitude,
                    customerId: this.props.transactionData.customerId
                })
            },
            error => console.log(error),
            // { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000, distanceFilter: 10 }
            { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true, distanceFilter: 10 }
        );


    }

    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
    }

    calcDistance = newLatLng => {
        const { prevLatLng } = this.state;
        return haversine(prevLatLng, newLatLng) || 0;
    };

    requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Location Access Permission",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the camera");
            } else {
                console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    };

    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });

    handleNavigateRoute(status) {
        this.goNavigateRoute(status)
    }

    onChangeDeliveryStatus(status) {
        this.setState({ deliverStatus: status })
    }

    updateRequestDeliveryData(data) {
        this.setState({ requestDelivery: data })
    }

    render() {
        return (
            <View style={Styles.appContainer}>
                <View style={{ flex: 1 }}>
                    <Wallet amount={this.props.walletData.amount} />
                    <MapView
                        showsScale={true}
                        showsCompass={true}
                        showsPointsOfInterest={true}
                        showsBuildings={true}
                        ref={ref => this.refMap = ref}
                        showsUserLocation
                        provider={PROVIDER_GOOGLE}
                        style={Styles.map}
                        customMapStyle={MapStyles}
                        // region={this.getMapRegion()}
                        initialRegion={this.getMapRegion()}
                        zoomEnabled={true}
                        followsUserLocation
                    >
                    </MapView>
                </View>
                {
                    // check if object is empty
                    (Object.entries(this.props.transactionData).length === 0) ? <FindDelivery
                        distanceTravelled={this.state.distanceTravelled}
                        onBackdropPress={() => this.setState({ riderConfirmDeliveryModalShow: false })}
                        updateRequestDelivery={(value) => { this.updateRequestDeliveryData(value) }}
                        requestDelivery={this.state.requestDelivery}
                        showDeliveryRequestModal={(bool) => this.setState({ riderConfirmDeliveryModalShow: bool })}
                        currentLocation={{ latitude: this.state.latitude, longitude: this.state.longitude }}
                    /> :
                        <KmWatcher
                            distanceTravelled={this.state.distanceTravelled}
                            hasArrived={this.state.hasArrived}
                            setHasArrived={(bool) => this.setState({ hasArrived: bool })}
                            transactionData={this.props.transactionData}
                            currentLocation={{ latitude: this.state.latitude, longitude: this.state.longitude }}
                            {...this.props}
                        />
                }
                <ModalDeliveryRequest
                    isVisible={this.state.riderConfirmDeliveryModalShow && this.state.requestDelivery.length > 0}
                    onBackdropPress={() => this.setState({ riderConfirmDeliveryModalShow: false })}
                    requestDelivery={this.state.requestDelivery}
                    updateRequestDelivery={(value) => { this.updateRequestDeliveryData(value) }}
                    currentLocation={{ latitude: this.state.latitude, longitude: this.state.longitude }}
                />

            </View>
        )
    }
}


function mapStateToProps(state) {
    return {
        transactionData: state.riders.maps.transactionData,
        walletData: state.riders.wallets.walletData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onUpdateRiderCurrentPosition: position => dispatch(updateRiderCurrentPosition(position)),
        onSubmitAcceptDelivery: data => dispatch(submitAcceptDelivery(data)),
        onLoadRiderLatestTransaction: () => dispatch(loadLatestTransactionOfRider()),
        onLoadWallet: riderId => dispatch(loadWallet(riderId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Maps);