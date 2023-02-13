

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-elements'
import Modal from 'react-native-modal'
import { updateStatus, loadLatestTransactionOfRider } from '../actions'
import { connect } from 'react-redux'
import openMap from 'react-native-open-maps';

import Geocoder from 'react-native-geocoding';
const GOOGLE_API_KEY = 'AIzaSyCCuKbzeutKZ7F7TUkflyrPYzfWklFPpYQ';
Geocoder.init(GOOGLE_API_KEY, { language: "en" });

// const IDLE = 0;
// const CONFIRMED = 1;
// const FOR_PICK_UP = 2;
// const FOR_DROP_OFF = 3;
// const DROPPED_OFF_LOCATION = 4;
// const DELIVERED = 5;
// const CANCELLED = 6;
// const REJECTED = 7;

const KmWatcher = (props) => {

    const [orderStatus, setOrderStatus] = useState(1)
    const [pickUpModalShow, setPickUpModalShow] = useState(false)
    const [dropOffModalShow, setDropOffModalShow] = useState(false)
    const [arrivedModalShow, setArrivedModalShow] = useState(false)
    const [deliveredLoading, setDeliveredLoading] = useState(false)
    const [droppedOffLocationLoading, setDroppedOffLocationLoading] = useState(false)
    const [transactionCompletedModalShow, setTransactionComletedModalShow] = useState(false)
    const [pingTimer, setPingTimer] = useState('')
    function getActiveStatus() {
        let activeStatus = {
            label: '',
            function: undefined
        }
        switch (orderStatus) {
            case 1:
                activeStatus = { label: 'Start', function: handleStart }
                break;
            case 2:
                activeStatus = { label: 'Got the item?', function: () => setDropOffModalShow(true) }
                break;
            case 3:
                activeStatus = { label: 'Arrived?', function: () => { setArrivedModalShow(true) } }
                break;
            default:
                activeStatus = { label: 'Start', function: handleStart }
                break;
        }
        return activeStatus
    }

    function handleStart() {
        setPickUpModalShow(true)
    }

    function handleGoPickUpLocation() {
        // Status 2 = For Pick Up
        const forPickUp = 2
        const transactionId = props.transactionData.id
        props.onUpdateStatus(transactionId, forPickUp).then((res) => {
            setOrderStatus(forPickUp)
            handleOpenMapWithCurrentLocation(forPickUp)
            setPickUpModalShow(false)
        })
    }

    function handleGoDropOffLocation() {
        // Status 3 = For Drop Off
        const forDropOff = 3
        const transactionId = props.transactionData.id
        props.onUpdateStatus(transactionId, forDropOff).then((res) => {
            setOrderStatus(forDropOff)
            handleOpenMapWithCurrentLocation(forDropOff)
            setDropOffModalShow(false)
        })
    }


    function handleGotArrived() {
        // Status 4 = dropped off location (arrived)
        const droppedOffLocation = 4
        const transactionId = props.transactionData.id
        setDroppedOffLocationLoading(true)
        props.onUpdateStatus(transactionId, droppedOffLocation).then((res) => {
            setDroppedOffLocationLoading(false)
        })
        const duration = 60 * 2 //2mins

        startTimer(duration)
    }


    function handleSuccessfullyDelivered() {
        // Status 5 = Delivered
        const delivered = 5
        const transactionId = props.transactionData.id
        setArrivedModalShow(false)
        setDeliveredLoading(false)

        const droppedOffLocation = 4

        setDroppedOffLocationLoading(true)
        props.onUpdateStatus(transactionId, droppedOffLocation).then((res) => {
            setDroppedOffLocationLoading(false)
            props.navigation.navigate('DeliveryConfirm')
        })

        // props.onUpdateStatus(transactionId, delivered).then((res) => {
        //     setOrderStatus(0)
        //     setArrivedModalShow(false)
        //     setTransactionComletedModalShow(true)
        //     setDeliveredLoading(false)
        // })
    }


    function handleOpenMapWithCurrentLocation(status) {

        function _openMap(positionReverse) {
            openMap({
                // start: "My Location",
                latitude: props.currentLocation.latitude,
                longitude: props.currentLocation.longitude,
                end: positionReverse.results[0].formatted_address,
                travelType: "drive",
                provider: "google",
                navigate_mode: "navigate",
                zoom: 100
            });
        }

        // const pickUpDestination = {
        //     latitude: 14.6904,
        //     longitude: 121.0451
        // }

        // const dropOffDestination = {
        //     latitude: 14.6898,
        //     longitude: 121.0455
        // }

        const pickUpDestination = props.transactionData.pickUpDestination
        const dropOffDestination = props.transactionData.dropOffDestination

        let mainDestination = {}
        status = status || this.state.deliverStatus
        switch (status) {
            case 2:
                mainDestination = { ...pickUpDestination }
                break;
            case 3:
                mainDestination = { ...dropOffDestination }
                break;
            default:
                return openMap({
                    // start: "My Location",
                    latitude: props.currentLocation.latitude,
                    longitude: props.currentLocation.longitude,
                    travelType: "drive",
                    provider: "google",
                    zoom: 100
                });
        }

        return Geocoder.from({
            latitude: mainDestination.latitude,
            longitude: mainDestination.longitude
        }).then((positionReverse) => {
            return _openMap(positionReverse)
        })

    }


    function handleFinishTransaction() {
        // if delivered then, call latest transaction to get reset the object property of transactionData
        props.onLoadRiderLatestTransaction()
        setTransactionComletedModalShow()
    }

    function startTimer(duration) {
        let timer = duration, minutes, seconds;
        const timerInterval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            if ((minutes) === 0 && seconds === 0) {
                setPingTimer('')
                return clearInterval(timerInterval)
            }
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            setPingTimer(minutes + ":" + seconds)

            if (--timer < 0) {
                timer = duration;
            }
        }, 1000);
    }

    useEffect(() => {
        if (props.hasArrived) {
            switch (orderStatus) {
                case 2:
                    setDropOffModalShow(true)
                    break;
                case 3:
                    setArrivedModalShow(true)
                    break;
                default:
                    break;
            }
            props.setHasArrived(false)
        }
    }, [props.hasArrived])

    useEffect(() => {
        setOrderStatus(props.transactionData.status)
    }, [props.transactionData.status])

    return (
        <View style={styles.mapControlsContainer}>
            <View style={{ marginLeft: 10, marginRight: 10 }}>
                <View style={{ margin: 5 }}>
                    <Button
                        buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 40, height: 50, width: '100%' }}
                        type="solid"
                        title={getActiveStatus().label}
                        onPress={() => {
                            getActiveStatus().function(orderStatus)
                        }}
                    />
                </View>

                <View style={{ margin: 5 }}>
                    <Button
                        buttonStyle={{ backgroundColor: '#c9c9c9', borderRadius: 40, height: 50, width: '100%' }}
                        type="solid"
                        title={"(Re) Open Integrated MAPS"}
                        onPress={() => { handleOpenMapWithCurrentLocation(orderStatus) }}
                    />
                </View>
            </View>

            {/* PICK UP MODAL */}
            <Modal isVisible={pickUpModalShow} onBackdropPress={() => setPickUpModalShow(false)} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 30 }}>Go to pick up</Text>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Are you sure do you want to go to merchant location?</Text>
                    </View>
                    <View style={{ margin: 10 }}>
                        <View style={{ margin: 5 }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 40, height: 50, width: '100%' }}
                                type="solid"
                                title={"Yes, Go to pick up location"}
                                onPress={() => { handleGoPickUpLocation() }}
                                loading={props.updateTransactionStatusLoading}
                            />
                        </View>
                        <View style={{ margin: 5 }}>
                            <Button
                                buttonStyle={{ backgroundColor: 'white', borderRadius: 40, height: 50, width: '100%' }}
                                type="solid"
                                title={"Cancel"}
                                titleStyle={{ color: 'black' }}
                                onPress={() => setPickUpModalShow(false)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Drop Off MODAL */}
            <Modal isVisible={dropOffModalShow} onBackdropPress={() => setDropOffModalShow(false)} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 30 }}>Got the item?</Text>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Are you sure do you want to go to drop off location?</Text>
                    </View>
                    <View style={{ margin: 10 }}>
                        <View style={{ margin: 5 }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 40, height: 50, width: '100%' }}
                                type="solid"
                                title={"Got the Item, Go to drop off location"}
                                onPress={() => { handleGoDropOffLocation() }}
                                loading={props.updateTransactionStatusLoading}
                            />
                        </View>
                        <View style={{ margin: 5 }}>
                            <Button
                                buttonStyle={{ backgroundColor: 'white', borderRadius: 40, height: 50, width: '100%' }}
                                type="solid"
                                title={"Cancel"}
                                titleStyle={{ color: 'black' }}
                                onPress={() => setDropOffModalShow(false)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Arrived MODAL */}
            <Modal isVisible={arrivedModalShow} onBackdropPress={() => setArrivedModalShow(false)} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 30 }}>Arrived at the location?</Text>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Whats Up? what do you want to do?</Text>
                    </View>
                    <View style={{ margin: 10 }}>
                        <View style={{ margin: 5 }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 40, height: 50, width: '100%' }}
                                type="solid"
                                title={pingTimer === '' ? "Ping the customer that you arrived" : "Ping again in " + pingTimer}
                                onPress={() => { handleGotArrived() }}
                                loading={droppedOffLocationLoading}
                                disabled={pingTimer !== '' && true}
                            />
                        </View>
                        <View style={{ margin: 5 }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 40, height: 50, width: '100%' }}
                                type="solid"
                                title={"Item Submitted"}
                                onPress={() => {
                                    handleSuccessfullyDelivered()
                                }}
                                loading={deliveredLoading}
                            />
                        </View>
                        <View style={{ margin: 5 }}>
                            <Button
                                buttonStyle={{ backgroundColor: 'white', borderRadius: 40, height: 50, width: '100%' }}
                                type="solid"
                                title={"Cancel"}
                                titleStyle={{ color: 'black' }}
                                onPress={() => setArrivedModalShow(false)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Completed Transaction MODAL */}
            <Modal isVisible={transactionCompletedModalShow} onBackdropPress={() => setTransactionComletedModalShow(false)} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 30 }}>Delivered Succesfully</Text>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Thanks for using `Beahero` APP</Text>
                    </View>
                    <View style={{ margin: 10 }}>
                        <View style={{ margin: 5 }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 40, height: 50, width: '100%' }}
                                type="solid"
                                title={"COMPLETED"}
                                onPress={() => { handleFinishTransaction() }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    map: {
        ...StyleSheet.absoluteFillObject
    },
    mapControlsContainer: {
        elevation: 3,
        flexDirection: "column",
        justifyContent: 'flex-end',
        padding: 10,
        opacity: 0.9,
        // marginVertical: 20,
        // backgroundColor: "#dedede",
        backgroundColor: 'rgba(247, 255, 249, 0.9)',
        height: 140,
        width: '100%'
    }
});


function mapStateToProps(state) {
    return {
        acceptDeliveryLoading: state.riders.maps.acceptDeliveryLoading,
        updateTransactionStatusLoading: state.riders.maps.updateTransactionStatusLoading
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onUpdateStatus: (transactionId, status) => dispatch(updateStatus(transactionId, status)),
        onLoadRiderLatestTransaction: () => dispatch(loadLatestTransactionOfRider())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(KmWatcher);
