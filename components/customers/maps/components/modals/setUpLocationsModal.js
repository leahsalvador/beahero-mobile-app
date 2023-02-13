import React, { useState, Component, useEffect } from 'react';
import { View, Text, TextInput, Alert, PermissionsAndroid } from 'react-native';
import { Button, Input, Divider } from 'react-native-elements';
import { geoCode, geoCodeReverse } from '../../../../utilities/googleapis'
import Modal from 'react-native-modal';
import { TouchableOpacity } from 'react-native';

export const SetUpLocationModal = (props) => {
    const [submitLoading, setSubmitLoading] = useState(false)
    const [pickUpLocationLoading, setPickUpLocationLoading] = useState(false)
    const [dropOffLocationLoading, setDropOffLocationLoading] = useState(false)
    const [pickUpError, setPickUpError] = useState(false)
    const [dropOffError, setDropOffError] = useState(false)
    const [useOtherLocationForDropOff, setUseOtherLocationForDropOff] = useState(false)
    const [pickUpDestination, setPickUpDestination] = useState({
        latitude: 0,
        longitude: 0,
        address: ''
    })

    const [dropOffDestination, setDropOffDestination] = useState({
        latitude: 0,
        longitude: 0,
        address: ''
    })

    useEffect(() => {
        async function setGeoLocationPickUp() {
            const { merchantData } = props
            await geoCodeReverse(merchantData.latitude, merchantData.longitude).then(res => {
                const { geometry: { location } } = res
                setPickUpDestination({
                    latitude: location.lat,
                    longitude: location.lng,
                    address: res.formatted_address
                })
                setPickUpLocationLoading(false)

            })
        }

        async function setGeoLocationDropOff() {
            const { currentLocation } = props
            await geoCodeReverse(currentLocation.latitude, currentLocation.longitude).then(res => {
                const { geometry: { location } } = res
                setDropOffDestination({
                    latitude: location.lat,
                    longitude: location.lng,
                    address: res.formatted_address
                })
                setPickUpLocationLoading(false)

            })
        }
        setGeoLocationPickUp()
        setGeoLocationDropOff()
    }, [])

    async function handleSetPickUpDestination() {
        setPickUpError(false)
        setPickUpLocationLoading(true)
        //get code reverse params (latitude, longitude)
        const { latitude, longitude } = props.merchantData
        await geoCodeReverse(latitude, longitude).then(res => {
            const { geometry: { location } } = res
            setPickUpDestination({
                latitude: location.lat,
                longitude: location.lng,
                address: res.formatted_address
            })
            setPickUpLocationLoading(false)

        })
    }

    async function handleSetDropOffDestination() {
        setDropOffError(false)
        setDropOffLocationLoading(true)
        //get code reverse params (address)
        const { latitude, longitude } = props.currentLocation
        await geoCodeReverse(latitude, longitude).then(res => {
            const { geometry: { location } } = res
            setDropOffDestination({
                latitude: location.lat,
                longitude: location.lng,
                address: res.formatted_address
            })
            setDropOffLocationLoading(false)
        })
    }

    async function handleSubmit() {
        setSubmitLoading(true)
        setPickUpError(false)
        setDropOffError(false)
        let pickUpAsync
        let dropOffAsync

        pickUpAsync = await geoCode(pickUpDestination.address).then((res) => {
            if (res) {
                const { geometry: { location } } = res
                return ({
                    latitude: location.lat,
                    longitude: location.lng,
                    address: res.formatted_address
                })
            } else {
                return false
            }
        })

        dropOffAsync = await geoCode(dropOffDestination.address).then((res) => {
            if (res) {
                const { geometry: { location } } = res
                return ({
                    latitude: location.lat,
                    longitude: location.lng,
                    address: res.formatted_address
                })
            } else {
                return false
            }

        })

        Promise.all([
            pickUpAsync,
            dropOffAsync
        ]).then(resultArray => {
            if (resultArray.every(data => data !== false)) {
                const submitData = {
                    "pickUpDestination": resultArray[0],
                    "dropOffDestination": resultArray[1]
                }
                props.handleUpdateLocation(submitData)
                props.onBackdropPress()
            } else {
                if (resultArray[0] === false) setPickUpError(true)
                if (resultArray[1] === false) setDropOffError(true)
            }
            setSubmitLoading(false)
        })
    }

    function toggleSetAnotherDropOffLocation() {
        handleSetDropOffDestination()
        setUseOtherLocationForDropOff(!useOtherLocationForDropOff)
    }
    const { merchantData } = props
    return (
        <Modal isVisible={props.visible} swipeDirection="left" useNativeDriver onBackdropPress={() => props.onBackdropPress()} style={{ height: 39 }}>
            <View style={{ backgroundColor: '#2A2E43' }}>
                <View style={{ padding: 10 }}>
                    <View style={{ margin: 10 }}>
                        <Text style={{ color: 'white', fontSize: 17 }}>{merchantData && merchantData.name}</Text>
                        <Text style={{ color: 'white', fontSize: 15, marginTop: 10 }}>Pick up destination</Text>
                        <Text style={{ color: 'white', fontSize: 14, marginTop: 5, opacity: 0.7 }}>{pickUpDestination && pickUpDestination.address}</Text>
                        {/* <Input inputStyle={{ color: 'white' }} errorMessage={pickUpError ? "Pick Up Destination is invalid." : ""} placeholder='Type your pick up destination' value={pickUpDestination.address} onChangeText={value => setPickUpDestination({ address: value })} /> */}
                        {/* <Button disabled={!pickUpDestination.latitude && !pickUpDestination.longitude} title={(!pickUpDestination.latitude && !pickUpDestination.longitude) ? 'Merchant address unavailable' : 'Use Merchant Address'} loading={pickUpLocationLoading} buttonStyle={{ backgroundColor: '#FD2D55', height: 35, borderRadius: 5 }} titleStyle={{ fontWeight: 'bold' }} onPress={() => handleSetPickUpDestination()} /> */}
                    </View>

                    <Divider style={{ marginTop: 20, marginBottom: 10 }} />
                    <View style={{ margin: 10 }}>
                        <Text style={{ color: 'white', fontSize: 15 }}>Drop off destination</Text>
                        {
                            useOtherLocationForDropOff ?
                                <Input inputStyle={{ color: 'white', fontSize: 12, marginBottom: -10 }} style={{ marginLeft: -10, marginRight: -10 }} errorMessage={dropOffError ? "Drop Off Destination is invalid." : ""} placeholder='Type your drop off destination' value={dropOffDestination.address} onChangeText={value => setDropOffDestination({ address: value })} /> :
                                <Text style={{ color: 'white', fontSize: 14, marginTop: 10, opacity: 0.7 }}>{dropOffDestination && dropOffDestination.address}</Text>
                        }
                        <View style={{ marginTop: 20 }}>
                            <TouchableOpacity onPress={() => toggleSetAnotherDropOffLocation()}>
                                <Text style={{ color: '#FD2D55', fontWeight: 'bold', fontSize: 16, textDecorationLine: 'underline' }}>{!useOtherLocationForDropOff ? 'Deliver to different address' : 'Use my location'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* <Button buttonStyle={{ backgroundColor: '#FD2D55', height: 35, borderRadius: 5, marginTop: 10 }} titleStyle={{ fontWeight: 'bold' }} title={!useOtherLocationForDropOff ? 'Deliver to different address' : 'Use my location'} /> */}
                    </View>

                    <View style={{ marginLeft: 10, marginRight: 10, marginTop: 25 }}>
                        <Button title='Submit Booking' loading={submitLoading} buttonStyle={{ backgroundColor: '#FD2D55', height: 50, borderRadius: 10 }} titleStyle={{ fontWeight: 'bold' }} onPress={() => handleSubmit()} />
                    </View>
                    <Divider style={{ marginTop: 20, marginBottom: 10 }} />

                </View>
            </View>
        </Modal>
    )
}

export default SetUpLocationModal