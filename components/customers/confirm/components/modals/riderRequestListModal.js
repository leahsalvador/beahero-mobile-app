import React, { useEffect, useReducer, useState } from 'react';
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
import config from '../../../../../config'
import { Divider, Avatar, Button } from 'react-native-elements'
import { formatMoney } from '../../../../utilities/helper'
import { loadCustomerLatestTransaction, loadRates, acceptRider, POST_ACCEPT_RIDER_FULFILLED } from '../../actions'
import _ from 'lodash'
import Modal from 'react-native-modal';
import Accordion from '../modals/accordion'
import PushNotification from "react-native-push-notification";

// make it global variable, having a problem in usestate with update in socket io
let riderRequestList = []
const RiderRequestListModal = (props) => {
    const [loading, setLoading] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState('')
    const [showModal, setShowModal] = useState(false)
    // const [riderRequestList, setRiderRequestList] = useState([])
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => {
        props.onLoadCustomerLatestTransaction()
        props.onLoadRates()
        riderRequestList = []
    }, [])

    function computeDistance(start, end) {
        return Number(haversine(start, end).toFixed(2) || 0)
    }

    function getRatesAmount(type, serviceFee) {
        const found = serviceFee.find(data => data.type === type)
        return found && found.amount || 0
    }

    function getBaseFare() {
        const found = props.ratesData.find(data => data.type === 'basefare')
        return found && found.amount || 0
    }

    function removeRiderFromRequests(transactionId) {
        let filtered = riderRequestList.filter(item => item.transactionId !== transactionId)
        riderRequestList = filtered
        forceUpdate()
    }

    function updateRiderRequestList(data) {
        // check if rider id is in the list
        const isFound = riderRequestList.find(item => item.transactionId === data.transactionId)
        if (!isFound) {
            riderRequestList.unshift(data)
            forceUpdate();
            PushNotification.localNotification({
                message: `You have a new rider - ${data.riderName}`, // (required)
                soundName: "positive.mp3"
            })
        }
    }

    function handleAcceptRider(riderId, transactionId, serviceFee) {
        props.onAcceptRider(riderId, transactionId, serviceFee).then(res => {
            if (res.type === POST_ACCEPT_RIDER_FULFILLED) {
                props.navigation.navigate('Maps')
                // need to refresh customer latest transaction before redirecting to maps
                props.onLoadCustomerLatestTransaction()
            } else {
                Alert.alert(
                    "Rider has been taken",
                    "You've choose a rider that has been taken by another customer. You may select another.",
                    [
                        { text: "OK", onPress: () => removeRiderFromRequests(transactionId) }
                    ]
                );
            }
        })

    }

    useEffect(() => {
        const { customer } = props.transactionData
        const userData = customer

        window.Echo.channel(`customer.${userData.id}`)
            .listen('.customer-accept-delivery-channel', (response) => {
                const { data } = response
                if (riderRequestList !== 0) setShowModal(true)
                return updateRiderRequestList(data)

            })
    }, [riderRequestList])

    const { customer, merchant, rider, products, dropOffDestination, pickUpDestination } = props.transactionData

    const distanceKm = computeDistance({ ...pickUpDestination }, { ...dropOffDestination })

    // currency total
    const subTotal = products && products.reduce((a, b) => { return (a + (b.price * b.quantity)) }, 0) || 0

    return (
        <Modal isVisible={(riderRequestList.length !== 0) && showModal} onBackdropPress={() => setShowModal(false)} swipeDirection="left" useNativeDriver   >
            <View style={styles.container}>
                <View style={{ margin: 15 }}>
                    <Text style={{ fontSize: 18 }}>Riders Request</Text>
                </View>
                <Divider />

                <ScrollView>
                    {
                        riderRequestList.map((data, index) => {
                            // if km exceeded to 3 add addition flat rate per km, if not remain it 0
                            // Use Math.max to convert the negative results to 0
                            const kmExceeded = 3 // once the km exceed to 3km. it will automatically add an additional flat rate to base rate.
                            // https://stackoverflow.com/questions/4924842/javascript-math-object-methods-negatives-to-zero
                            const pesoPerKm = kmExceeded ? Math.max(0, distanceKm - kmExceeded) * getRatesAmount('pesoPerKm', data.serviceFee) : 0
                            // remove pesoPerKm In list because its been defined in 'pesoPerKm' variable at the top.
                            const serviceFeeTotal = (data.serviceFee && data.serviceFee.filter(data => data.type !== 'pesoPerKm').reduce((a, b) => { return (a + (b.amount)) }, 0) + Number(pesoPerKm)) || 0
                            const overallTotalInPesos =
                                Number(subTotal) + // products
                                Number(serviceFeeTotal) + // service fee and pesoPerKm
                                Number(getBaseFare()) // basefare
                            return (
                                <TouchableOpacity key={`${data.riderId}-${index}`}>
                                    <View style={{ margin: 15 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                                                <Avatar
                                                    // containerStyle={{ margin: 5 }}
                                                    activeOpacity={0.2}
                                                    rounded
                                                    showAccessory
                                                    size="small"
                                                    source={{ uri: data && `${config.REACT_APP_STORAGE}/${data.image}` }}
                                                // source={{ uri: 'https://images.pexels.com/photos/1915149/pexels-photo-1915149.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }}
                                                />
                                                <View>
                                                    <Text style={{ color: 'gray', fontSize: 16, marginHorizontal: 10 }}>{data.riderName} </Text>
                                                    <Text style={{ color: 'gray', fontSize: 13, marginHorizontal: 10 }}>Transaction ID: {data.transactionId} </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View >
                                            <Accordion >
                                                <View >
                                                    <View style={{ marginVertical: 10 }}>
                                                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'gray' }}>Ordered Items</Text>
                                                        {
                                                            products && products.map((item, index) => {
                                                                return (
                                                                    <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                                            <Avatar
                                                                                activeOpacity={0.2}
                                                                                rounded
                                                                                showAccessory
                                                                                size="small"
                                                                                source={{ uri: item && item.product && `${config.REACT_APP_STORAGE}/${item.product.image}` }}
                                                                                title={item && item.product && !item.product.image ? item.product.title.substring(0, 1) : ''}
                                                                            />
                                                                            <View style={{ width: 150, marginLeft: 10 }}>
                                                                                <Text
                                                                                    numberOfLines={2}
                                                                                    style={{ color: 'gray', fontSize: 12, }}>
                                                                                    {item && item.product && item.product.title} ({item && item.quantity || 0}x)
                                                                                          </Text>
                                                                            </View>
                                                                        </View>
                                                                        <View>
                                                                            <Text style={{ color: 'gray' }}>{item && formatMoney((item.quantity * item.price) || 0)}</Text>
                                                                        </View>
                                                                    </View>
                                                                )
                                                            })
                                                        }
                                                    </View>

                                                    <Divider />
                                                    {
                                                        // kmExceeded = 3KM
                                                        distanceKm > kmExceeded &&
                                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 }}>
                                                            <View>
                                                                <Text style={{ color: 'gray', fontSize: 12 }}> Additional KM fee once 3Km Exceeded</Text>
                                                                <Text style={{ color: 'gray', fontSize: 14 }}> ₱{getRatesAmount('pesoPerKm', data.serviceFee)} Per KM ({(distanceKm - kmExceeded).toFixed(2) || 0} KM) </Text>
                                                            </View>
                                                            <Text style={{ color: 'gray', fontSize: 14 }}>{formatMoney(pesoPerKm)}</Text>
                                                        </View>
                                                    }
                                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 }}>
                                                        <Text style={{ color: 'gray', fontSize: 14 }}> Basefare</Text>
                                                        <Text style={{ color: 'gray', fontSize: 14 }}>{products && formatMoney(getBaseFare())}</Text>
                                                    </View>
                                                    {
                                                        //removing pesoPerKm at the list because its been defined to the top variable and has its own computations
                                                        data.serviceFee && data.serviceFee.filter(data => data.type !== 'pesoPerKm').map((serviceFee, index) => {
                                                            return (
                                                                <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 }}>
                                                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                                        <Text style={{ color: 'gray', fontSize: 14 }}> {_.startCase(serviceFee && serviceFee.type)}</Text>
                                                                    </View>
                                                                    <Text style={{ color: 'gray', fontSize: 14 }}>{formatMoney(serviceFee && serviceFee.amount || 0)}</Text>
                                                                </View>
                                                            )
                                                        })
                                                    }
                                                </View>
                                                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                                            </Accordion>
                                        </View>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={{ color: 'gray', fontSize: 16 }}>TOTAL </Text>
                                            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>₱{formatMoney(overallTotalInPesos)}</Text>
                                        </View>
                                    </View>
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ marginHorizontal: 12, marginBottom: 10 }}>
                                            <Button
                                                buttonStyle={{ backgroundColor: '#F12D55', borderRadius: 10, height: 35, width: 150 }}
                                                type="solid"
                                                title={"Accept"}
                                                onPress={() => {
                                                    setSelectedTransaction(data.transactionId)
                                                    handleAcceptRider(data.riderId, data.transactionId, data.serviceFee)
                                                }}
                                                loading={props.acceptRiderLoading && (selectedTransaction === data.transactionId)}
                                                disabled={props.acceptRiderLoading && (selectedTransaction !== data.transactionId)}

                                            />
                                        </View>
                                        <View style={{ marginHorizontal: 12, marginBottom: 10 }}>
                                            <Button
                                                buttonStyle={{ backgroundColor: '#454F63', borderRadius: 10, height: 35, width: 150 }}
                                                type="solid"
                                                title={"Decline"}
                                                onPress={() => {
                                                    removeRiderFromRequests(data.transactionId)
                                                }}
                                                loading={loading}
                                            />
                                        </View>
                                    </View>

                                    <Divider style={{ marginVertical: 10 }} />

                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
            </View >
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: '#FCFCFD'
    },
    content: {
        width: '100%'
    }
});

function mapStateToProps(state) {
    return {
        transactionData: state.customers.maps.customerLatestTransactionData,
        ratesData: state.customers.maps.ratesData,
        acceptRiderLoading: state.customers.confirm.acceptRiderLoading
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadCustomerLatestTransaction: () => dispatch(loadCustomerLatestTransaction()),
        onLoadRates: () => dispatch(loadRates()),
        onAcceptRider: (riderId, transactionId, serviceFee) => dispatch(acceptRider(riderId, transactionId, serviceFee))
    };

}

export default connect(mapStateToProps, mapDispatchToProps)(RiderRequestListModal);



