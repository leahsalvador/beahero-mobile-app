

import React, { Component, Fragment } from 'react';
import { View, Text, Alert, PermissionsAndroid, Dimensions, Image, ScrollView, BackHandler } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Styles from './AppStyles';
import MapStyles from './MapStyles';
import Geolocation from '@react-native-community/geolocation';
import haversine from "haversine";
import { connect } from 'react-redux'
import { loadNearbyRiders, loadCustomerLatestTransaction, notifyRiders, updateTransaction, PUT_UPDATE_TRANSACTION_FULFILLED } from '../actions'
import { getDataFromToken } from '../../../utilities/token'
import Modal from 'react-native-modal';
import SetUpLocationModal from './modals/setUpLocationsModal'
import ConfirmDeliveryModal from './modals/confirmDeliveryModal'
import _ from 'lodash'
import RiderIcon from '../../../../assets/images/riderIcon.png'
import Point from '../../../../assets/images/point.png'
import MapViewDirections from "react-native-maps-directions";
import KeepAwake from 'react-native-keep-awake';
import { setCartData } from '../../carts/actions'
import { Button, Avatar } from 'react-native-elements';
import config from '../../../../config'
import DeliveryStatus from './deliveryStatus'
import Receipt from '../../receipt/components'
import noImage from '../../../../assets/images/noImage.jpg'

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const GOOGLE_MAPS_APIKEY = config.GOOGLE_MAPS_APIKEY;

const LATITUDE_DELTA = 0.0009;
const LONGITUDE_DELTA = 0.0009;
class Maps extends Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: 14.6892,
            longitude: 121.0450,
            distanceTravelled: 0,
            prevLatLng: {},
            requestDelivery: [],
            deliveryInformation: undefined,
            riderConfirmDeliveryModalShow: false,
            waitResponseRiderModalShow: false,
            deliveryAcceptedModalShow: false,
            successDeliveryModal: false,
            setUplocationModal: false,
            isFitToCoordinatesView: true,
            deliverStatus: 0,
            statusMessage: '',
            transactionStatus: 0,
            userData: {},
            riderData: {},
            riderCurrentMovingPosition: {
                latitude: 0,
                longitude: 0
            }

        }
        this.handleNavigateRoute = this.handleNavigateRoute.bind(this)
        this.handleUpdateLocation = this.handleUpdateLocation.bind(this)
        this.handleBackButton = this.handleBackButton.bind(this)
    }

    async componentDidMount() {

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
                    // { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000, distanceFilter: 1 }
                    { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
                );
                this.watchID = Geolocation.watchPosition(
                    position => {
                        const { latitude, longitude } = position.coords;
                        this.setState({ latitude, longitude, });
                    },
                    error => console.log(error),
                    // { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000, distanceFilter: 1 }
                    { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
                );
            } else {
                console.log("Permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
        // keep awake screen
        KeepAwake.activate();

        // disabled back button hardware
        // BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        // onload functions
        this.props.onLoadCustomerLatestTransaction().then(res => {
            const status = res.payload.status
            this.setState({ transactionStatus: status })

            const CONFIRMED = 1;
            const FOR_PICK_UP = 2;
            const FOR_DROP_OFF = 3;
            const DROPPED_OFF_LOCATION = 4;
            // hide header left back button if the status is ongoing.
            // user must not go back when the map starts to move
            if (status === CONFIRMED || status === FOR_PICK_UP || status === FOR_DROP_OFF || status === DROPPED_OFF_LOCATION) {
                this.props.navigation.setOptions({ headerLeft: false });
            }

        })
        this.props.onLoadNearbyRiders()

        let userData = await getDataFromToken()
        this.setState({ userData: userData })

        // wait here if the rider/s accept the delivery
        window.Echo.channel(`customer.${userData.id}`)
            .listen('.customer-waiting-response-channel', (response) => {
                const { data } = response
                this.props.onLoadCustomerLatestTransaction()
                this.setState({ riderData: data.rider, deliveryAcceptedModalShow: true, waitResponseRiderModalShow: false })
            })

        // waiting for the status change
        window.Echo.channel(`customer.${userData.id}`)
            .listen('.customer-transaction-status-channel', (response) => {
                const { data } = response
                // status 5 = delivered
                if (data.status === 5) {
                    this.setState({ successDeliveryModal: true })
                }
                this.setState({ statusMessage: data.message, transactionStatus: data.status })

                this.props.onLoadCustomerLatestTransaction()
            })

        // waiting for the status change
        window.Echo.channel(`customer.${userData.id}`)
            .listen('.customer-rider-current-position-channel', (response) => {
                const { data } = response
                this.setState({
                    riderCurrentMovingPosition: {
                        latitude: data.latitude,
                        longitude: data.longitude
                    }
                })
            })
    }

    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
    }

    handleBackButton() {
        Alert.alert(
            'Exit App',
            'Exiting the application?', [{
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel'
            }, {
                text: 'OK',
                onPress: () => BackHandler.exitApp()
            },], {
            cancelable: false
        }
        )
        return true;
    }

    calcDistance = newLatLng => {
        const { prevLatLng } = this.state;
        return haversine(prevLatLng, newLatLng) || 0;
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

    async handleUpdateLocation(data) {
        const { customerLatestTransactionData } = this.props
        const submitData = {
            "transactionId": customerLatestTransactionData.id,
            "pickUpDestination": data.pickUpDestination,
            "dropOffDestination": data.dropOffDestination
        }

        this.props.onUpdateTransaction(submitData).then(res => {
            if (res.type === PUT_UPDATE_TRANSACTION_FULFILLED) {
                // this.setState({ waitResponseRiderModalShow: true })
                // reload customer latest transaction to refresh assigned data
                this.props.onLoadCustomerLatestTransaction()
                this.props.navigation.navigate('Confirm', { transactionId: customerLatestTransactionData.id })
            }
        })
    }

    getLatLongBasedOnStatus() {
        const { customerLatestTransactionData } = this.props
        let position = {
            latitude: 0,
            longitude: 0
        }

        if (customerLatestTransactionData.status === 1) {
            position = {
                latitude: customerLatestTransactionData.pickUpDestination.latitude,
                longitude: customerLatestTransactionData.pickUpDestination.longitude,
            }
        } else if (customerLatestTransactionData.status === 2 || customerLatestTransactionData.status === 3 || customerLatestTransactionData.status === 4) {
            position = {
                latitude: customerLatestTransactionData.dropOffDestination.latitude,
                longitude: customerLatestTransactionData.dropOffDestination.longitude,
            }
        }

        return { ...position }
    }

    fitToCoordinatesView(e) {
        if (this.state.isFitToCoordinatesView) {
            this.refMap.fitToCoordinates(e.coordinates, {
                edgePadding: {
                    right: windowWidth / 50,
                    bottom: windowHeight / 50,
                    left: windowWidth / 50,
                    top: windowHeight / 50
                }
            });
            this.state.isFitToCoordinatesView = false;
        }
    }

    isEmpty(inputObject) {
        return Object.keys(inputObject).length === 0;
    };

    render() {
        const { customerLatestTransactionData } = this.props
        const { riderCurrentMovingPosition } = this.state
        return (
            <ScrollView>
                <View style={Styles.appContainer}>
                    <View style={{ flex: 1 }}>
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
                        // onRegionChange={e => console.log("TEST !!!!<=============================", e)}

                        >
                            {
                                // show list of available riders
                                // show if object is empty
                                (this.isEmpty(customerLatestTransactionData) || customerLatestTransactionData.status === 0) && this.props.nearByRidersData.map((data, index) => {
                                    return (
                                        <Marker key={index} coordinate={{ latitude: data && data.latitude, longitude: data && data.longitude }} >
                                            <Text style={{ textAlign: 'center' }}>{data.name.toUpperCase()}</Text>
                                            <Image source={RiderIcon} style={{ height: 80, width: 60 }} />
                                        </Marker>
                                    )
                                })
                            }
                            {
                                // show assigned rider
                                customerLatestTransactionData.status === 1 || // NOT DELIVERED
                                    customerLatestTransactionData.status === 2 ||
                                    customerLatestTransactionData.status === 3 ||
                                    customerLatestTransactionData.status === 4 ?
                                    <Fragment>
                                        <Marker
                                            coordinate={{
                                                latitude: riderCurrentMovingPosition.latitude || customerLatestTransactionData.rider.latitude,
                                                longitude: riderCurrentMovingPosition.longitude || customerLatestTransactionData.rider.longitude
                                            }} >
                                            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ textAlign: 'center' }}>{customerLatestTransactionData.rider.firstName}</Text>
                                                <Image source={RiderIcon} style={{ height: 80, width: 60 }} />
                                            </View>
                                        </Marker>

                                        <Marker
                                            coordinate={this.getLatLongBasedOnStatus()} >
                                            <Text>{customerLatestTransactionData.status === 1 ? 'Pick Up Location' : 'Drop Off Location'}</Text>
                                            <Image source={Point} style={{ height: 50, width: 50 }} />
                                        </Marker>

                                        <MapViewDirections
                                            trackViewChanges={false}

                                            origin={{
                                                latitude: riderCurrentMovingPosition.latitude || customerLatestTransactionData.rider.latitude,
                                                longitude: riderCurrentMovingPosition.longitude || customerLatestTransactionData.rider.longitude
                                            }}
                                            resetOnChange={false}
                                            destination={this.getLatLongBasedOnStatus()}
                                            strokeColor={'green'}
                                            strokeWidth={4}
                                            apikey={GOOGLE_MAPS_APIKEY}
                                            onStart={params => {
                                            }}
                                            onReady={e => {
                                                this.fitToCoordinatesView(e);
                                            }}
                                        />
                                    </Fragment> : null
                            }
                        </MapView>
                        <View>
                            <ScrollView>
                                <View style={{ margin: 10, marginBottom: 5, backgroundColor: 'white', borderRadius: 10, padding: 5 }}>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Avatar
                                            containerStyle={{ margin: 5 }}
                                            activeOpacity={0.2}
                                            rounded
                                            showAccessory
                                            size="large"
                                            source={customerLatestTransactionData.rider ? { uri: `${config.REACT_APP_STORAGE}/${customerLatestTransactionData.rider.image}` } : noImage}
                                        />
                                        <View>
                                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 20 }}>{customerLatestTransactionData && customerLatestTransactionData.rider && customerLatestTransactionData.rider.firstName || 'Book A Hero'} {customerLatestTransactionData && customerLatestTransactionData.rider && customerLatestTransactionData.rider.lastName}</Text>
                                            <Text style={{ color: 'black', fontSize: 14 }}>{customerLatestTransactionData && customerLatestTransactionData.rider && customerLatestTransactionData.rider.phoneNumber}</Text>
                                            <Text style={{ color: 'black', fontSize: 14 }}>{customerLatestTransactionData && customerLatestTransactionData.rider && `Transaction ID: ${customerLatestTransactionData.id}`}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ margin: 10, backgroundColor: 'white', borderRadius: 10, padding: 5 }}>
                                    <DeliveryStatus transactionStatus={this.state.transactionStatus} />
                                </View>
                                {
                                    // Show only if the status is idle
                                    // and does not have any riders assign
                                    (this.isEmpty(customerLatestTransactionData) || customerLatestTransactionData.status === 0) ?
                                        <View >
                                            <View style={{ padding: 10 }}>
                                                <View style={{ marginLeft: 5, marginRight: 5 }}>
                                                    <Button title='BOOK NOW' buttonStyle={{ backgroundColor: '#FD2D55', height: 50, borderRadius: 10 }} titleStyle={{ fontWeight: 'bold' }} onPress={() => this.setState({ setUplocationModal: true })} />
                                                </View>
                                            </View>
                                        </View> :
                                        <View>
                                            <View style={{ padding: 5 }}>
                                                <View style={{ marginLeft: 5, marginRight: 5, backgroundColor: 'white', borderRadius: 10, padding: 5 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, color: 'gray', fontSize: 18 }}>Current Status</Text>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, color: 'gray', fontSize: 18, fontStyle: 'italic' }}>{this.state.statusMessage}</Text>
                                                </View>
                                            </View>
                                        </View>
                                }
                            </ScrollView>
                        </View>
                    </View>

                    {
                        this.state.setUplocationModal &&
                        <SetUpLocationModal
                            visible={this.state.setUplocationModal}
                            onBackdropPress={() => this.setState({ setUplocationModal: false })}
                            merchantData={customerLatestTransactionData && customerLatestTransactionData.merchant}
                            currentLocation={{ latitude: this.state.latitude, longitude: this.state.longitude }}
                            handleUpdateLocation={this.handleUpdateLocation}
                        />
                    }

                    {/* Wait modal until the riders accept the request */}
                    {
                        this.state.deliveryAcceptedModalShow &&
                        <ConfirmDeliveryModal
                            visible={this.state.deliveryAcceptedModalShow}
                            onCancel={() => this.setState({ deliveryAcceptedModalShow: false })}
                            navigation={this.props.navigation}
                        />
                    }

                    <Modal isVisible={this.state.successDeliveryModal} onBackdropPress={() => {
                        this.props.navigation.navigate('Categories')
                        this.setState({ successDeliveryModal: false })
                        this.props.submitCartData([])
                    }
                    }
                        swipeDirection="left" useNativeDriver
                    // style={{ height: 200 }}
                    >
                        <View style={{ backgroundColor: 'white' }}>
                            <View>
                                <Text style={{ color: 'white', textAlign: 'center' }}>Successfully Delivered</Text>
                                {/* <Text style={{ color: 'white', textAlign: 'center' }}>You will redirected to home page.</Text> */}
                                <Receipt transactionId={customerLatestTransactionData.id} />
                                <View style={{ padding: 10 }}>
                                    <View >
                                        <Button title='ITEM HAS BEEN DELIVERED' buttonStyle={{ backgroundColor: '#FD2D55', height: 50, borderRadius: 10 }} titleStyle={{ fontWeight: 'bold' }} onPress={() => {
                                            this.setState({ successDeliveryModal: false })
                                            this.props.navigation.navigate('Categories')
                                            this.props.submitCartData([])
                                        }
                                        } />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        )
    }
}



function mapStateToProps(state) {
    return {
        nearByRidersData: state.customers.maps.nearByRidersData,
        customerLatestTransactionData: state.customers.maps.customerLatestTransactionData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        submitCartData: (data) => dispatch(setCartData(data)),
        onLoadNearbyRiders: () => dispatch(loadNearbyRiders()),
        onLoadCustomerLatestTransaction: () => dispatch(loadCustomerLatestTransaction()),
        onNotifyRiders: (data) => dispatch(notifyRiders(data)),
        onUpdateTransaction: (data) => dispatch(updateTransaction(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Maps);