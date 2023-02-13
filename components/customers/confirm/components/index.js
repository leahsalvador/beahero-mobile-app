import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Alert,
    Platform
} from "react-native";
import haversine from "haversine";
import { loadTransaction, notifyRiders, loadNearbyRiders, loadCustomerLatestTransaction, loadRates, GET_NEARBY_RIDERS_FULFILLED, POST_NOTIFY_RIDERS_FULFILLED } from '../actions'
import { Avatar, Divider, Button } from 'react-native-elements'
import RiderRequestList from './modals/riderRequestListModal'
import config from '../../../../config'
import MarketImage from '../../../../assets/images/market.png'
import FlagImage from '../../../../assets/images/flag.png'
import { formatMoney } from '../../../utilities/helper'
import _, { filter } from 'lodash'


let hasLookForAriders = false
const Confirm = (props) => {
    const [pingTimer, setPingTimer] = useState('')
    function computeDistance(start, end) {
        return Number(haversine(start, end).toFixed(2) || 0)
    }

    function handleBookNow(data) {
        const { customer, products, dropOffDestination, pickUpDestination } = props.customerLatestTransactionData

        let userData = customer

        props.onLoadNearbyRiders().then(riders => {
            if (riders.type === GET_NEARBY_RIDERS_FULFILLED) {
                const ridersList = riders.payload
                if (ridersList.length === 0) {
                    Alert.alert(
                        'Riders Not Available',
                        'It seems that there are no available riders at this moment. You may try again later.',
                        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                        { cancelable: false }
                    );
                }

                if (ridersList.length !== 0) {
                    const { customerLatestTransactionData } = props

                    // extract only riders in in riders array.
                    let riderIds = _.map(ridersList, 'id');
                    const submitData = {
                        "riderIds": riderIds,
                        "customerId": userData.id,
                        "transactionId": customerLatestTransactionData.id,
                        "name": `${userData.firstName} ${userData.lastName}`,
                        "pickUpDestination": pickUpDestination,
                        "dropOffDestination": dropOffDestination,
                        "products": products
                    }
                    console.log("customerLatestTransactionData====================================>", customerLatestTransactionData.id)
                    props.onNotifyRiders(submitData).then(res => {
                        const duration = 60 * 2 //2mins
                        startTimer(duration)
                        if (res.type === POST_NOTIFY_RIDERS_FULFILLED) {
                            // reload customer latest transaction to refresh assigned data
                            props.onLoadCustomerLatestTransaction()
                        }
                    })
                }
            }
        })

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

    function getRatesAmount(type) {
        const found = props.ratesData.find(data => data.type === type)
        return found && found.amount || 0
    }

    useEffect(() => {
        // const { route: { params: { transactionId } } } = props
        // props.onLoadTransaction(transactionId)
        props.onLoadCustomerLatestTransaction()
        props.onLoadRates()
    }, [])



    const { customer, merchant, products, dropOffDestination, pickUpDestination } = props.customerLatestTransactionData

    const distanceKm = computeDistance({ ...pickUpDestination }, { ...dropOffDestination })
    const kmExceeded = 3 // once the km exceed to 3km. it will automatically add an additional flat rate to base rate.

    // currency total
    const subTotal = products && products.reduce((a, b) => { return (a + (b.price * b.quantity)) }, 0) || 0
    // Use Math.max to convert the negative results to 0
    // https://stackoverflow.com/questions/4924842/javascript-math-object-methods-negatives-to-zero
    const pesoPerKm = kmExceeded ? Math.max(0, distanceKm - kmExceeded) * getRatesAmount('pesoPerKm') : 0
    const overallTotalInPesos = Number(subTotal || 0) + Number(pesoPerKm || 0) + Number(getRatesAmount('basefare') || 0)

    return (
        <View style={styles.container}>
            <ScrollView>
                <View>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: 15 }}>
                        <Text style={{ color: 'gray' }}>Transaction ID</Text>
                        <Text style={{ color: 'gray' }}>{props.customerLatestTransactionData.id}</Text>
                    </View>

                    <Divider />

                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 10 }}>
                        <Avatar
                            containerStyle={{ margin: 5 }}
                            activeOpacity={0.2}
                            rounded
                            showAccessory
                            size="medium"
                            source={{ uri: `${config.REACT_APP_STORAGE}/${merchant && merchant.image}` }}
                        />

                        <View style={{ margin: 15 }}>
                            <Text style={{ color: 'gray', fontSize: 18, fontWeight: 'bold' }}>{merchant && merchant.name}</Text>
                            <Text style={{ color: 'gray', fontSize: 11, fontStyle: 'italic', fontWeight: 'bold' }}>From Pick up to Drop off in KM: {distanceKm} Km</Text>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ margin: 10 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar
                                containerStyle={{ margin: 5 }}
                                activeOpacity={0.2}
                                rounded
                                showAccessory
                                size="small"
                                source={MarketImage}
                                title="P"
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'gray', fontSize: 12 }} >{pickUpDestination && pickUpDestination.address}</Text>
                            </View>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar
                                containerStyle={{ margin: 5 }}
                                activeOpacity={0.2}
                                rounded
                                showAccessory
                                size="small"
                                source={FlagImage}
                                title="P"
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'gray', fontSize: 12 }}>{dropOffDestination && dropOffDestination.address}</Text>
                            </View>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ margin: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'gray' }}>Ordered Items</Text>
                        {
                            products && products.map((item, index) => {
                                return (
                                    <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Avatar
                                                containerStyle={{ margin: 5 }}
                                                activeOpacity={0.2}
                                                rounded
                                                showAccessory
                                                size="small"
                                                source={{ uri: item && item.product && `${config.REACT_APP_STORAGE}/${item.product.image}` }}
                                            />
                                            <Text style={{ color: 'gray', fontSize: 12 }}>{item && item.product && item.product.title} ({item && item.quantity || 0}x)</Text>
                                        </View>
                                        <View>
                                            <Text>{item && formatMoney((item.quantity * item.price) || 0)}</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>

                    <Divider />

                    <View style={{ margin: 15 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>Order Total</Text>
                            <Text >{products && formatMoney(subTotal)}</Text>
                        </View>

                        <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'gray', marginTop: 20 }}>Delivery Fee</Text>

                        {/* <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ color: 'gray', fontSize: 12 }}>Additional KM fee once 3Km Exceeded</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>₱{getRatesAmount('pesoPerKm') || 0} Per KM ({(distanceKm - kmExceeded).toFixed(2) || 0} KM) </Text>
                            <Text>{formatMoney(pesoPerKm)}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>Basefare</Text>
                            <Text>{products && formatMoney(getRatesAmount('basefare'))}</Text>
                        </View> */}

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>Basefare</Text>
                            <Text>{products && formatMoney(getRatesAmount('basefare'))}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>Succeeding KM ({(distanceKm - kmExceeded).toFixed(2) || 0} KM) </Text>
                            <Text>{formatMoney(pesoPerKm)}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>Delivery Fee Total</Text>
                            <Text>{products && formatMoney(+getRatesAmount('basefare') + pesoPerKm)}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
                            <Text style={{ color: 'gray', fontSize: 20 }}>TOTAL </Text>
                            <Text style={{ fontSize: 20 }}>{formatMoney(overallTotalInPesos)}</Text>
                        </View>


                        <View style={{ marginTop: 20 }}>
                            <Text style={{ color: 'gray', fontSize: 11, textAlign: 'justify' }}> ** Delivery Fees are computed based on distance from Pickup to Drop-off. Your Hero may charge Service Charges based on item size, weight, or value; and
                            other factors that may effect the delivery.
                            </Text>
                        </View>
                    </View>

                    <Divider />
                    <View style={{ marginBottom: 30 }}></View>

                </View>
            </ScrollView>
            <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                {/* <Button
                    // loading={props.transactionLoading || loading}
                    // disabled={cartDataList.length === 0}
                    title={`(₱ ${formatMoney(overallTotalInPesos)}) Proceed`}
                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                    type="solid"
                    onPress={() => { setOrderConfirmModalShow(true) }}
                /> */}

                <Button
                    buttonStyle={{ backgroundColor: '#FD2D55', height: 50, borderRadius: 10, width: '100%' }}
                    type="solid"
                    title={pingTimer === '' ? (!hasLookForAriders ? `Agree and Proceed` : '(Re) Find available heroes') : "Finding you a hero " + pingTimer}
                    onPress={() => {
                        hasLookForAriders = true
                        // startTimer(duration)
                        handleBookNow()
                    }}
                    // loading={droppedOffLocationLoading}
                    disabled={pingTimer !== '' && true}
                />
            </View>

            <RiderRequestList
                navigation={props.navigation}
            />

        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFD'
    },

    advImage: {
        width: 'auto',
        height: 360,
        marginTop: 20,
        resizeMode: "contain",
        // position: 'absolute'
    },
});

function mapStateToProps(state) {
    return {
        transactionData: state.customers.confirm.transactionData,
        // nearByRidersData: state.customers.maps.nearByRidersData,
        customerLatestTransactionData: state.customers.maps.customerLatestTransactionData,
        ratesData: state.customers.confirm.ratesData,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadTransaction: transactionId => dispatch(loadTransaction(transactionId)),
        onNotifyRiders: (data) => dispatch(notifyRiders(data)),
        onLoadRates: () => dispatch(loadRates()),
        onLoadCustomerLatestTransaction: () => dispatch(loadCustomerLatestTransaction()),
        onLoadNearbyRiders: () => dispatch(loadNearbyRiders()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Confirm);



