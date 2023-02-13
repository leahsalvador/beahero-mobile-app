

import React, { useEffect, useState, useReducer } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert
} from "react-native";
import { connect } from 'react-redux'
import { loadWallet } from '../../wallets/actions'
import { loadLatestTransactionOfRider } from '../actions'
import { formatMoney } from '../../../utilities/helper'
import { getDataFromToken } from '../../../utilities/token'
import PushNotification from "react-native-push-notification";

let requestList = []
const FindDelivery = (props) => {
    const [isFinding, setIsFinding] = useState(false)
    const [requestData, setRequestData] = useState([])
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        setRequestData(props.requestDelivery)
    }, [props])

    useEffect(() => {
        async function listen() {
            let userData = await getDataFromToken()
            console.log("IS RIDER ACCCEPT", userData.id);
            window.Echo.channel(`rider-request-accepted.${userData.id}`)
                .listen('.is-rider-request-accepted-channel', (response) => {
                    const { data } = response
                    PushNotification.localNotification({
                        message: `You have a delivery`, // (required)
                        soundName: "positive.mp3"
                    })
                    Alert.alert(
                        "You have a delivery!",
                        `Assigned to deliver an item for ${data.customer && data.customer.firstName} ${data.customer && data.customer.lastName}. Click Ok to start.`,
                        [
                            { text: "OK", onPress: () => props.onLoadRiderLatestTransaction() }
                        ]
                    );
                    // window.Echo.leaveChannel(`rider-request-accepted.${userData.riderId}`)
                    window.Echo.leaveChannel(`rider-notification.${userData.riderId}`)
                    props.onBackdropPress()
                })
        }
        listen()
    }, [])

    useEffect(() => {
        requestList = requestData
    }, [requestData])

    useEffect(() => {
        if (isFinding) {
            async function listen() {
                let userData = await getDataFromToken()
                window.Echo.channel(`rider-notification.${userData.id}`)
                    .listen('.rider-notification-channel', (response) => {
                        const { data } = response
                        const isFound = requestList.find(item => item.transactionId === data.transactionId)
                        if (!isFound) {
                            requestList.unshift(data)
                            PushNotification.localNotification({
                                message: `You have a new rider - ${data.riderName}`, // (required)
                                soundName: "positive.mp3"
                            })
                        }
                        props.updateRequestDelivery(requestList)
                        props.showDeliveryRequestModal(true)
                    })
            }
            listen()
        } else {
            async function stopListen() {
                let userData = await getDataFromToken()
                window.Echo.leaveChannel(`rider.${userData.id}`)
            }
            stopListen()
        }
    }, [isFinding])

    async function hadleToggleFind(status) {
        const { walletData } = props
        let userData = await getDataFromToken()
        if ((props.walletData.amount < 100) || Object.keys(props.walletData).length === 0) {
            return Alert.alert(
                "Insufficient Amount",
                `Unable to Start, You have insufficient amount of ₱${formatMoney(walletData.amount)}. Our minimum allowable wallet are ₱100. Please reload your wallet to start a new transaction.`,
                [
                    { text: "OK", onPress: () => props.onLoadWallet(userData.id) }
                ]
            );
        }
        setIsFinding(status)
    }

    return (
        <View style={styles.mapControlsContainer}>
            {  isFinding ? <Stop data={requestData} hadleToggleFind={hadleToggleFind} /> : <Go data={requestData} hadleToggleFind={hadleToggleFind} />}
        </View>
    )
}

const Go = ({ data, hadleToggleFind }) => {
    return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => { hadleToggleFind(true, data) }} style={{ width: 80, height: 80, backgroundColor: '#282F39', borderRadius: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }} elevation={5}>
                <View style={{
                    width: 70, height: 70, borderRadius: 35, display: 'flex', justifyContent: 'center', alignItems: 'center', borderWidth: 1,
                    borderColor: "white",
                }}>
                    <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>GO</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const Stop = ({ data, hadleToggleFind }) => {
    return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => hadleToggleFind(false, data)} style={{
                width: 80, height: 80, backgroundColor: 'white', borderRadius: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', borderWidth: 1,
                borderColor: "lightgray",
            }} elevation={5}>
                <View style={{
                    width: 70, height: 70, borderRadius: 35, display: 'flex', justifyContent: 'center', alignItems: 'center', borderWidth: 1,
                    borderColor: "#F23A5F",
                }}>
                    <Text style={{ color: '#F23A5F', fontSize: 18, fontWeight: 'bold' }}>Stop</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
    mapControlsContainer: {
        position: 'absolute',
        bottom: 0,
        display: 'flex',
        // elevation: 3,
        flexDirection: "column",
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'transparent',
        height: 100,
        width: '100%',
    }
});

function mapStateToProps(state) {
    return {
        walletData: state.riders.wallets.walletData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadWallet: riderId => dispatch(loadWallet(riderId)),
        onLoadRiderLatestTransaction: () => dispatch(loadLatestTransactionOfRider()),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(FindDelivery);
