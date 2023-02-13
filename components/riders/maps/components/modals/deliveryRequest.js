import React, { Fragment, useState, useEffect } from "react";
import {
    View,
    Text,
    Alert,
    TouchableOpacity
} from "react-native";
import haversine from "haversine";
import Modal from 'react-native-modal';
import { connect } from 'react-redux'
import { Button, Divider } from 'react-native-elements'
import { submitAcceptDelivery, loadTransaction, loadRates, POST_ACCEPT_DELIVERY_REJECTED } from '../../actions'
import { formatMoney } from '../../../../utilities/helper'
import { ScrollView } from "react-native-gesture-handler";
import _ from 'lodash'

const DeliveryRequest = (props) => {
    const [additionalServiceFeeList, setAdditionalServiceFeeList] = useState([])
    const [selectedRequestId, setSelectedRequestId] = useState()
    const [requestDeliveryAwarded, setRequestDeliveryAwarded] = useState(false)
    const [requestData, setRequestData] = useState([])

    useEffect(() => {
        setRequestData([...props.requestDelivery])
    }, [props])

    useEffect(() => {
        props.onLoadRates()
    }, [])

    useEffect(() => {
        setAdditionalServiceFeeList([])
    }, [props.isVisible])

    function handleAcceptDelivery(data, { distanceKm }) {

        const peroPerKmObj = props.ratesData.find(data => data.type === 'pesoPerKm')
        let serviceFee = []
        serviceFee = [...additionalServiceFeeList]

        //if more than 3km, will add peroPerKm object in service fee
        if (distanceKm > kmExceeded) {
            serviceFee.push(peroPerKmObj)
        }

        const submitData = {
            customerId: data.customerId,
            riderId: data.riderId,
            riderName: `${props.riderData && props.riderData.firstName} ${props.riderData && props.riderData.lastName}`,
            image: props.riderData.image,
            transactionId: data.transactionId,
            serviceFee: serviceFee
        }

        props.onSubmitAcceptDelivery(submitData).then(res => {
            const filteredItem = requestData.filter(item => item.transactionId !== data.transactionId)
            props.updateRequestDelivery(filteredItem)
            Alert.alert(
                "Delivery Requested!",
                "You have requested a delivery. Please wait for the confirmation of customer.",
                [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ],
                { cancelable: false }
            );


            // if (res.type === POST_ACCEPT_DELIVERY_REJECTED) {
            //     const filteredItem = requestData.filter(item => item.transactionId !== data.transactionId)
            //     props.updateRequestDelivery(filteredItem)
            //     Alert.alert(
            //         "Ops Sorry!",
            //         "This Delivery request has been taken by another rider.",
            //         [
            //             { text: "OK", onPress: () => console.log("OK Pressed") }
            //         ],
            //         { cancelable: false }
            //     );
            // } else {
            //     // if success
            //     window.Echo.leaveChannel(`rider.${data.riderId}`)
            //     props.onLoadTransaction(data.transactionId)
            //     setRequestDeliveryAwarded(true)
            //     onBackdropPress()
            // }
        })
    }

    function handleDeclinedRequest(transactionId) {
        const filteredItem = requestData.filter(item => item.transactionId !== transactionId)
        props.updateRequestDelivery(filteredItem)
    }

    function computeDistance(start, end) {
        return haversine(start, end).toFixed(2) || 0
    }

    function getRatesAmount(type) {
        const found = props.ratesData.find(data => data.type === type)
        return found && found.amount || 0
    }

    function getServiceFee() {
        const serviceFeeList = [
            'queuingFee',
            'cashHandlingFee',
            'detour',
            // 'surgePrice'
        ]

        additionalServiceFeeList.map(item => {
            const index = serviceFeeList.findIndex(type => type === item.type)
            serviceFeeList.splice(index, 1)
        })

        const serviceArray = []
        serviceFeeList.map(serviceFee => {
            const found = props.ratesData.find(data => data.type === serviceFee)
            if (found !== -1) {
                serviceArray.push(found)
            }
        })
        return props.ratesData.length !== 0 ? serviceArray : []
    }

    function handleAddServiceFee(serviceFee) {
        const newServiceFee = additionalServiceFeeList.concat(serviceFee)
        setAdditionalServiceFeeList(newServiceFee)
    }

    function handleRemoveServiceFee(serviceFee) {
        const newServiceFee = additionalServiceFeeList.filter(data => data.type !== serviceFee.type)
        setAdditionalServiceFeeList(newServiceFee)
    }

    const { isVisible, onBackdropPress, requestDelivery } = props

    const kmExceeded = 3 // once the km exceed to 3km. it will automatically add an additional flat rate to base rate.

    return (
        <Fragment>
            <Modal isVisible={isVisible} onBackdropPress={() => onBackdropPress()} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 20 }}>New Delivery Request</Text>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Do you want to accept the delivery?</Text>
                    </View>

                    <View style={{ maxHeight: '80%' }} onStartShouldSetResponder={() => true}>
                        <ScrollView>
                            {
                                requestData.map((item, index) => {
                                    // currency total
                                    const distanceKm = computeDistance({ ...item.pickUpDestination }, { ...item.dropOffDestination })
                                    const subTotal = item.products && item.products.reduce((a, b) => { return (a + (b.price * b.quantity)) }, 0) || 0
                                    // if km exceeded to 3 add addition flat rate per km, if not remain it 0
                                    // Use Math.max to convert the negative results to 0
                                    // https://stackoverflow.com/questions/4924842/javascript-math-object-methods-negatives-to-zero
                                    const pesoPerKm = kmExceeded ? Math.max(0, distanceKm - kmExceeded) * getRatesAmount('pesoPerKm') : 0
                                    const serviceFeeTotal = (additionalServiceFeeList.reduce((a, b) => { return (a + (b.amount)) }, 0) + Number(pesoPerKm)) || 0
                                    const overallTotalInPesos =
                                        Number(subTotal) + // products
                                        Number(serviceFeeTotal) + // service fee and pesoPerKm
                                        Number(getRatesAmount('basefare')) // basefare

                                    return (
                                        <View key={index}>
                                            <Divider />
                                            <View style={{ paddingLeft: 25, paddingTop: 25 }}>
                                                <Text style={{ color: 'white', fontSize: 20 }}>Name: {item.name}</Text>
                                                <Text style={{ color: 'white', fontSize: 11, fontStyle: 'italic', fontWeight: 'bold' }}>From Pick up to Drop off in KM: {computeDistance({ ...item.pickUpDestination }, { ...item.dropOffDestination }) || 0} Km</Text>
                                            </View>

                                            <View style={{ paddingLeft: 25, paddingRight: 25, paddingTop: 15 }}>
                                                <Text style={{ color: 'white' }}>Pick Up Destination</Text>
                                                <Text style={{ color: 'white', fontSize: 10 }}>Address: {item.pickUpDestination.address}</Text>
                                            </View>

                                            <View style={{ paddingLeft: 25, paddingRight: 25, paddingTop: 15 }}>
                                                <Text style={{ color: 'white' }}>Drop off Destination</Text>
                                                <Text style={{ color: 'white', fontSize: 10 }}>Address: {item.dropOffDestination.address}</Text>
                                            </View>

                                            <View style={{ paddingLeft: 25, paddingRight: 25, paddingTop: 15 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'gray' }}>Ordered Items</Text>
                                                {
                                                    item.products && item.products.map((item, index) => {

                                                        return (
                                                            <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={{ color: 'gray', fontSize: 12 }}>{item && item.product && item.product.title} ({item && item.quantity || 0}x)</Text>
                                                                </View>
                                                                <View>
                                                                    <Text style={{ color: 'gray', fontSize: 12 }}>{item && formatMoney((item.quantity * item.price) || 0)}</Text>
                                                                </View>
                                                            </View>
                                                        )
                                                    })
                                                }
                                                <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                                                <View>
                                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ color: 'gray', fontSize: 14 }}>Sub Total</Text>
                                                        <Text style={{ color: 'gray', fontSize: 14 }}>{item.products && formatMoney(subTotal)}</Text>
                                                    </View>

                                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ color: 'gray', fontSize: 14 }}>Basefare</Text>
                                                        <Text style={{ color: 'gray', fontSize: 14 }}>{item.products && formatMoney(getRatesAmount('basefare'))}</Text>
                                                    </View>
                                                    <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                                                    {
                                                        // kmExceeded = 3KM
                                                        distanceKm > kmExceeded &&
                                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <View>
                                                                <Text style={{ color: 'gray', fontSize: 12 }}>Additional KM fee once 3Km Exceeded</Text>
                                                                <Text style={{ color: 'gray', fontSize: 14 }}>₱{getRatesAmount('pesoPerKm')} Per KM ({(distanceKm - kmExceeded).toFixed(2) || 0} KM) </Text>
                                                            </View>
                                                            <Text style={{ color: 'gray', fontSize: 14 }}>{formatMoney(pesoPerKm)}</Text>
                                                        </View>
                                                    }

                                                    {
                                                        additionalServiceFeeList.map((serviceFee, index) => {
                                                            return (
                                                                <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 }}>
                                                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                                        <Text style={{ color: 'gray', fontSize: 14 }}> {_.startCase(serviceFee && serviceFee.type)}</Text>
                                                                        <TouchableOpacity onPress={() => { handleRemoveServiceFee(serviceFee) }}>
                                                                            <Text style={{ marginLeft: 5, color: 'red', fontSize: 12, textDecorationLine: 'underline' }}> Remove</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                    <Text style={{ color: 'gray', fontSize: 14 }}>{formatMoney(serviceFee && serviceFee.amount || 0)}</Text>
                                                                </View>
                                                            )
                                                        })
                                                    }
                                                    {
                                                        getServiceFee() && getServiceFee().map((serviceFee, index) => {
                                                            return (
                                                                <Button
                                                                    key={index}
                                                                    buttonStyle={{ backgroundColor: '#F12D55', height: 30, width: 180, margin: 3 }}
                                                                    type="solid"
                                                                    titleStyle={{ fontSize: 11 }}
                                                                    title={`+ ${_.startCase(serviceFee && serviceFee.type)} (₱${serviceFee && formatMoney(serviceFee.amount)})`}
                                                                    onPress={() => { handleAddServiceFee(serviceFee) }}
                                                                />
                                                            )
                                                        })

                                                    }
                                                    <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
                                                        <Text style={{ color: 'white', fontSize: 20 }}>TOTAL </Text>
                                                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>₱{formatMoney(overallTotalInPesos)}</Text>
                                                    </View>

                                                </View>
                                            </View>

                                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', padding: 20 }}>
                                                <Button
                                                    buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 10, height: 35, width: 150 }}
                                                    loading={props.acceptDeliveryLoading && (selectedRequestId === item.transactionId)}
                                                    type="solid"
                                                    title={"Accept"}
                                                    disabled={props.acceptDeliveryLoading && (selectedRequestId !== item.transactionId)}
                                                    onPress={() => {
                                                        setSelectedRequestId(item.transactionId)
                                                        handleAcceptDelivery(item, { distanceKm })
                                                    }}
                                                />
                                                <Button
                                                    buttonStyle={{ backgroundColor: '#454F63', borderRadius: 10, height: 35, width: 150 }}
                                                    type="solid"
                                                    title={"Decline"}
                                                    onPress={() => handleDeclinedRequest(item.transactionId)}
                                                />
                                            </View>

                                            <Divider />



                                        </View>
                                    )
                                })
                            }

                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* <Modal isVisible={requestDeliveryAwarded} onBackdropPress={() => setRequestDeliveryAwarded(false)} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 30 }}>Success</Text>
                        <Text style={{ color: 'white', textAlign: 'center' }}>You have accepted the request delivery.</Text>
                    </View>
                    <View style={{ margin: 20 }}>
                        <Button
                            buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 40, height: 50, width: '100%' }}
                            type="solid"
                            title={"OK"}
                            onPress={() => setRequestDeliveryAwarded(false)}
                        />
                    </View>
                </View>
            </Modal> */}
        </Fragment>
    )
}

function mapStateToProps(state, ownProps) {
    return {
        acceptDeliveryLoading: state.riders.maps.acceptDeliveryLoading,
        onLoadTransaction: state.riders.maps.loadTransaction,
        ratesData: state.riders.maps.ratesData,
        riderData: state.riders.profile.riderData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadRates: () => dispatch(loadRates()),
        onSubmitAcceptDelivery: data => dispatch(submitAcceptDelivery(data)),
        onLoadTransaction: transactionId => dispatch(loadTransaction(transactionId))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryRequest);