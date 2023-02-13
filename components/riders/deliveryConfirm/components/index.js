import React, { useEffect, useRef, useState } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert
} from "react-native";
import haversine from "haversine";
import config from '../../../../config'
import MarketImage from '../../../../assets/images/market.png'
import FlagImage from '../../../../assets/images/flag.png'
import { Card, Divider, Avatar, Button } from 'react-native-elements'
import { formatMoney } from '../../../utilities/helper'
import { loadLatestTransactionOfRider, loadRates, submitFinishedDelivery, POST_FINISHED_DELIVERY_FULFILLED } from '../actions'
import { loadLatestTransactionOfRider as reloadLatestTransactionOfRiderInMaps } from '../../maps/actions'

import _ from 'lodash'
import moment from 'moment'
import { getDataFromToken } from '../../../utilities/token'
import { io } from 'socket.io-client';
import { loadWallet } from '../../wallets/actions'


const ConfirmDelivery = (props) => {
    const [additionalServiceFeeList, setAdditionalServiceFeeList] = useState([])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        props.onLoadRiderLatestTransaction()
        props.onLoadRates()
    }, [])

    function computeDistance(start, end) {
        return Number(haversine(start, end).toFixed(2) || 0)
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
            'surgePrice'
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

    const { customer, merchant, products, dropOffDestination, pickUpDestination } = props.transactionData

    const distanceKm = computeDistance({ ...pickUpDestination }, { ...dropOffDestination })

    const kmExceeded = 3 // once the km exceed to 3km. it will automatically add an additional flat rate to base rate.
    // currency total
    const subTotal = products && products.reduce((a, b) => { return (a + (b.price * b.quantity)) }, 0) || 0
    // if km exceeded to 3 add addition flat rate per km, if not remain it 0
    // Use Math.max to convert the negative results to 0
    // https://stackoverflow.com/questions/4924842/javascript-math-object-methods-negatives-to-zero
    const pesoPerKm = kmExceeded ? Math.max(0, distanceKm - kmExceeded) * getRatesAmount('pesoPerKm') : 0
    // remove pesoPerKm In list because its been defined in 'pesoPerKm' variable at the top.
    const serviceFeeTotal = (props.transactionData.serviceFee && props.transactionData.serviceFee.filter(data => data.type !== 'pesoPerKm').reduce((a, b) => { return (a + (b.amount)) }, 0) + Number(pesoPerKm)) || 0
    console.log("serviceFeeTotal", distanceKm, kmExceeded, Math.max(0, distanceKm - kmExceeded))
    const overallTotalInPesos =
        Number(subTotal) + // products
        Number(serviceFeeTotal) + // service fee and pesoPerKm
        Number(getRatesAmount('basefare')) // basefare

    async function handleSubmitDelivery() {
        setLoading(true)
        const riderData = await getDataFromToken()
        const peroPerKmObj = props.ratesData.find(data => data.type === 'pesoPerKm')
        // always 20%(.20) for beahero
        const totalAmountDeducted = (serviceFeeTotal * .20) + 12
        let serviceFee = []
        serviceFee = [...additionalServiceFeeList]

        //if more than 3km, will add peroPerKm object in service fee
        if (distanceKm > kmExceeded) {
            serviceFee.push(peroPerKmObj)
        }

        const submitData = {
            'transactionId': props.transactionData.id,
            'riderId': riderData.id,
            'walletDeduction': totalAmountDeducted,
            // 'serviceFee': serviceFee
        }

        props.onSubmitFinishedDelivery(submitData).then(res => {
            if (res.type === POST_FINISHED_DELIVERY_FULFILLED) {
                setLoading(false)
                props.navigation.navigate('Maps')
                props.loadLatestTransactionOfRiderInMaps()
                Alert.alert(
                    "Transaction Complete",
                    "You have successfully delivered the item. Thank you for using beahero app. You will be redirected to Maps and get a request delivery again.",
                    [
                        { text: "OK", onPress: () => { props.onLoadWallet(riderData.id) } }
                    ],
                    { cancelable: false }
                );

            } else {
                setLoading(false)
                Alert.alert(
                    "Something went wrong.",
                    "Sorry for the inconvenience. You will be redirected to maps.",
                    [
                        { text: "Go to maps", onPress: () => props.navigation.navigate('Maps') }
                    ],
                    { cancelable: false }
                );
            }
        })
    }

    return (
        <View style={styles.container}>
            <View style={{ margin: 15 }}>
                <Text style={{ fontSize: 26, fontWeight: 'bold' }}>Summary Reports</Text>
            </View>
            <ScrollView>
                <View>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
                        <Text style={{ color: 'gray' }}>Transaction ID</Text>
                        <Text style={{ color: 'gray' }}>{props.transactionData.id}</Text>
                    </View>

                    <Divider />

                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 5 }}>
                        <Avatar
                            containerStyle={{ margin: 10 }}
                            activeOpacity={0.2}
                            rounded
                            showAccessory
                            size="medium"
                            source={{ uri: `${config.REACT_APP_STORAGE}/${merchant && merchant.image}` }}
                            title={merchant && !merchant.image ? merchant.name.substring(0, 1) : ""}
                        />
                        <View>
                            <Text style={{ color: 'gray', fontSize: 20, fontWeight: 'bold' }}>{merchant && merchant.name}</Text>
                            <Text style={{ color: 'gray', fontSize: 11, fontWeight: 'bold' }}>{distanceKm} KM</Text>
                        </View>

                    </View>

                    <Divider />

                    <View style={{ margin: 10 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar
                                containerStyle={{ margin: 10 }}
                                activeOpacity={0.2}
                                rounded
                                showAccessory
                                size="small"
                                source={MarketImage}
                                title="P"
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'gray', fontSize: 12 }}>{pickUpDestination && pickUpDestination.address}</Text>
                            </View>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar
                                containerStyle={{ margin: 10 }}
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

                    <View style={{ margin: 15 }}>
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
                                                title={item && item.product && !item.product.image ? item.product.title.substring(0, 1) : ''}
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
                            <Text style={{ color: 'gray', fontSize: 14 }}>Sub Total</Text>
                            <Text>{products && formatMoney(subTotal)}</Text>
                        </View>

                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                        <View style={{ marginTop: 10, marginBottom: 10 }}>
                            <Text>DELIVERY FEE</Text>
                            {/* <Text style={{ fontSize: 11 }}>(You may add service fee by clicking the button)</Text> */}
                        </View>
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
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 14 }}>Basefare</Text>
                            <Text>{products && formatMoney(getRatesAmount('basefare'))}</Text>
                        </View>
                        {
                            //removing pesoPerKm at the list because its been defined to the top variable and has its own computations
                            props.transactionData.serviceFee && props.transactionData.serviceFee.filter(data => data.type !== 'pesoPerKm').map((serviceFee, index) => {
                                return (
                                    <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: 'gray', fontSize: 14 }}> {_.startCase(serviceFee && serviceFee.type)}</Text>
                                            {/* <TouchableOpacity onPress={() => { handleRemoveServiceFee(serviceFee) }}>
                                                <Text style={{ marginLeft: 5, color: 'red', fontSize: 12, textDecorationLine: 'underline' }}> Remove</Text>
                                            </TouchableOpacity> */}
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

                    <Card style={{ marginBottom: 20 }}>
                        <Text style={{ marginBottom: 10 }}>Wallet Deductions</Text>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 12 }}>Delivery Fee (Sub Total + Basefare)</Text>
                            <Text style={{ color: 'gray', fontSize: 12 }}>{products && formatMoney(subTotal + getRatesAmount('basefare'))}</Text>
                        </View>

                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 12 }}>Delivery Fee deducted</Text>
                            <Text style={{ color: 'gray', fontSize: 12 }}>-12.00</Text>
                        </View>
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />


                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 12 }}>Service Fee (Overall Service fee)</Text>
                            <Text style={{ color: 'gray', fontSize: 12 }}>{products && formatMoney(serviceFeeTotal)}</Text>
                        </View>

                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ color: 'gray', fontSize: 12 }}>Service Fee Deductions(20%)</Text>
                                <Text style={{ color: 'gray', fontSize: 12 }}>(20% of service fee ({formatMoney(serviceFeeTotal)}) will be deducted)</Text>
                            </View>
                            <Text style={{ color: 'gray', fontSize: 12 }}>-{products && formatMoney(serviceFeeTotal * .20)}</Text>
                        </View>

                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: 'gray', fontSize: 12 }}>Overall Deductions</Text>
                            <Text style={{ color: 'black', fontSize: 14 }}>₱{formatMoney((serviceFeeTotal * .20) + 12)}</Text>
                        </View>

                    </Card>
                    <View style={{ marginBottom: 20 }} />

                    <Divider />

                </View>
            </ScrollView>
            <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                <Button
                    buttonStyle={{ backgroundColor: '#F12D55', height: 50, borderRadius: 10, width: '100%' }}
                    type="solid"
                    title={"Confirm Delivered"}
                    onPress={() => {
                        // startTimer(duration)
                        handleSubmitDelivery()
                    }}
                    loading={loading}
                />
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFD'
    }
});

function mapStateToProps(state) {
    return {
        transactionData: state.riders.deliveryConfirm.transactionData,
        ratesData: state.riders.deliveryConfirm.ratesData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadWallet: riderId => dispatch(loadWallet(riderId)),
        onLoadRiderTransactions: riderId => dispatch(loadRiderTransactions(riderId)),
        onLoadRiderLatestTransaction: () => dispatch(loadLatestTransactionOfRider()),
        onLoadRates: () => dispatch(loadRates()),
        onSubmitFinishedDelivery: (data) => dispatch(submitFinishedDelivery(data)),
        loadLatestTransactionOfRiderInMaps: (data) => dispatch(reloadLatestTransactionOfRiderInMaps(data))

    };

}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmDelivery);



