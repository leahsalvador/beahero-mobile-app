import React, { useEffect } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import haversine from "haversine";
import { loadTransaction, notifyRiders, loadNearbyRiders, loadCustomerLatestTransaction, loadRates, GET_NEARBY_RIDERS_FULFILLED, POST_NOTIFY_RIDERS_FULFILLED } from '../actions'
import { Divider } from 'react-native-elements'
import { formatMoney } from '../../../utilities/helper'
import _ from 'lodash'

let hasLookForAriders = false
const Receipt = (props) => {
    function computeDistance(start, end) {
        return Number(haversine(start, end).toFixed(2) || 0)
    }

    function getRatesAmount(type) {
        const found = props.ratesData.find(data => data.type === type)
        return found && found.amount || 0
    }

    useEffect(() => {
        props.onLoadTransaction(props.transactionId)
        props.onLoadRates()
    }, [])


    const { customer, merchant, products, dropOffDestination, pickUpDestination } = props.transactionData

    const distanceKm = computeDistance({ ...pickUpDestination }, { ...dropOffDestination })
    const kmExceeded = 3 // once the km exceed to 3km. it will automatically add an additional flat rate to base rate.

    // currency total
    const subTotal = products && products.reduce((a, b) => { return (a + (b.price * b.quantity)) }, 0) || 0
    // Use Math.max to convert the negative results to 0
    // https://stackoverflow.com/questions/4924842/javascript-math-object-methods-negatives-to-zero
    const pesoPerKm = kmExceeded ? Math.max(0, distanceKm - kmExceeded) * getRatesAmount('pesoPerKm') : 0
    const serviceFeeTotal = (props.transactionData.serviceFee && props.transactionData.serviceFee.filter(data => data.type !== 'pesoPerKm').reduce((a, b) => { return (a + (b.amount)) }, 0) + Number(pesoPerKm)) || 0

    const overallTotalInPesos =
        Number(subTotal) + // products
        Number(serviceFeeTotal) + // service fee and pesoPerKm
        Number(getRatesAmount('basefare')) // basefare
    return (
        <View style={styles.container}>
            <ScrollView     >
                <View style={{ flex: 1, marginLeft: 10, marginRight: 10 }}>
                    <View style={{ marginTop: 20, marginBottom: 20 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>DELIVERY COMPLETED!</Text>
                    </View>
                    <Divider />
                    <View style={{ marginTop: 20, marginBottom: 20 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>RECEIPT</Text>
                        <Text style={{ color: 'gray', fontSize: 14, textAlign: 'center' }}>Beahero Mobile App</Text>
                    </View>
                    <Divider />
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 10 }}>
                        <View>
                            <Text style={{ color: 'gray', fontSize: 18, fontWeight: 'bold' }}>{merchant && merchant.name}</Text>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: 'gray' }}>Transaction ID: {props.transactionData.id}</Text>
                            </View>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ margin: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'gray' }}>Ordered Items</Text>
                        {
                            products && products.map((item, index) => {
                                return (
                                    <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ color: 'gray', fontSize: 12 }}>{item && item.product && item.product.title} ({item && item.quantity || 0}x)</Text>
                                        </View>
                                        <View>
                                            <Text style={{ color: 'gray', fontSize: 14 }}>{item && formatMoney((item.quantity * item.price) || 0)}</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>

                    <Divider />

                    <View style={{ margin: 15 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>Sub Total</Text>
                            <Text>{products && formatMoney(subTotal)}</Text>
                        </View>


                        <View style={{ marginTop: 10, marginBottom: 10 }}>
                            <Text>DELIVERY FEE</Text>
                            {/* <Text style={{ fontSize: 11 }}>(You may add service fee by clicking the button)</Text> */}
                        </View>
                        {
                            // kmExceeded = 3KM
                            distanceKm > kmExceeded &&
                            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ color: 'gray', fontSize: 12 }}>Additional KM fee once 3Km Exceeded</Text>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 5 }}>
                                    <Text style={{ color: 'gray', fontSize: 14 }}>₱{getRatesAmount('pesoPerKm')} Per KM ({(distanceKm - kmExceeded).toFixed(2) || 0} KM) </Text>
                                    <Text style={{ color: 'gray', fontSize: 14 }}>{formatMoney(pesoPerKm)}</Text>
                                </View>
                            </View>
                        }
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginLeft: 5 }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>Basefare</Text>
                            <Text style={{ color: 'gray', fontSize: 14 }}>{products && formatMoney(getRatesAmount('basefare'))}</Text>
                        </View>

                        {
                            //removing pesoPerKm at the list because its been defined to the top variable and has its own computations
                            props.transactionData.serviceFee && props.transactionData.serviceFee.filter(data => data.type !== 'pesoPerKm').map((serviceFee, index) => {
                                return (
                                    <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 5 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: 'gray', fontSize: 14 }}> {_.startCase(serviceFee && serviceFee.type)}</Text>
                                        </View>
                                        <Text style={{ color: 'gray', fontSize: 14 }}>{formatMoney(serviceFee && serviceFee.amount || 0)}</Text>
                                    </View>
                                )
                            })
                        }

                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
                            <Text style={{ color: 'gray', fontSize: 20 }}>TOTAL </Text>
                            <Text style={{ fontSize: 32, fontWeight: 'bold' }}>₱{formatMoney(overallTotalInPesos)}</Text>
                        </View>

                    </View>


                    <Divider />
                    <View style={{ marginBottom: 40 }}></View>

                </View>
            </ScrollView>
        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        height: 600,
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
        // nearByRidersData: state.customers.maps.nearByRidersData,
        transactionData: state.customers.receipt.transactionData,
        ratesData: state.customers.receipt.ratesData,
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

export default connect(mapStateToProps, mapDispatchToProps)(Receipt);



