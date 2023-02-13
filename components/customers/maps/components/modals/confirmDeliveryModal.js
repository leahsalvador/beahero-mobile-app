import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import haversine from "haversine";
import config from '../../../../../config'
import { Divider, Avatar, Button } from 'react-native-elements'
import { formatMoney } from '../../../../utilities/helper'
import { loadCustomerLatestTransaction, loadRates } from '../../actions'
import _ from 'lodash'
import Modal from 'react-native-modal';

const ConfirmDelivery = (props) => {
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        props.onLoadCustomerLatestTransaction()
        props.onLoadRates()
    }, [])

    function computeDistance(start, end) {
        return Number(haversine(start, end).toFixed(2) || 0)
    }

    function getRatesAmount(type) {
        const found = props.ratesData.find(data => data.type === type)
        return found && found.amount || 0
    }


    const { customer, merchant, rider, products, dropOffDestination, pickUpDestination } = props.transactionData

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
    const overallTotalInPesos =
        Number(subTotal) + // products
        Number(serviceFeeTotal) + // service fee and pesoPerKm
        Number(pesoPerKm) +
        Number(getRatesAmount('basefare')) // basefare

    return (

        <Modal isVisible={props.visible} onBackdropPress={() => props.onCancel()} swipeDirection="left" useNativeDriver   >
            <View style={styles.container}>
                <View style={{ margin: 15 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>You have a rider!</Text>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar
                                containerStyle={{ margin: 5 }}
                                activeOpacity={0.2}
                                rounded
                                showAccessory
                                size="medium"
                                source={{ uri: `${config.REACT_APP_STORAGE}/${rider && rider.image}` }}
                            />
                            <View style={{ marginLeft: 10 }}>
                                <Text style={{ fontWeight: 'bold', color: 'gray', fontSize: 22 }}>{rider && rider.firstName} {rider && rider.lastName}</Text>
                                <Text style={{ fontWeight: 'bold', color: 'gray', fontSize: 12 }}>{rider && rider.email}</Text>
                                <Text style={{ fontWeight: 'bold', color: 'gray', fontSize: 12 }}>{rider && rider.phoneNumber}</Text>
                            </View>
                        </View>
                    </View>


                </View>
                <Divider />

                <ScrollView>
                    <View>
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


                            <View style={{ marginTop: 10, marginBottom: 10 }}>
                                <Text>DELIVERY FEE</Text>
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
                                <Text style={{ color: 'gray', fontSize: 14 }}>{products && formatMoney(getRatesAmount('basefare'))}</Text>
                            </View>
                            {
                                //removing pesoPerKm at the list because its been defined to the top variable and has its own computations
                                props.transactionData.serviceFee && props.transactionData.serviceFee.filter(data => data.type !== 'pesoPerKm').map((serviceFee, index) => {
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

                            <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
                                <Text style={{ color: 'gray', fontSize: 20 }}>TOTAL </Text>
                                <Text style={{ fontSize: 32, fontWeight: 'bold' }}>₱{formatMoney(overallTotalInPesos)}</Text>
                            </View>

                        </View>

                        <Divider />

                    </View>
                </ScrollView>
                <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                    <Button
                        buttonStyle={{ backgroundColor: '#F12D55', height: 50, borderRadius: 10, width: '100%' }}
                        type="solid"
                        title={"Got It!"}
                        onPress={() => {
                            props.onCancel()
                        }}
                        loading={loading}
                    />
                </View>
                <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                    <Button
                        buttonStyle={{ backgroundColor: '#c9c9c9', height: 50, width: '100%' }}
                        type="solid"
                        title={"Find Another Rider"}
                        onPress={() => {
                            props.navigation.navigate('Confirm', { transactionId: props.transactionData.id })
                            props.onCancel()
                        }}
                        loading={loading}
                    />
                </View>
            </View >
        </Modal>


    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: '#FCFCFD'
    }
});

function mapStateToProps(state) {
    return {
        transactionData: state.customers.maps.customerLatestTransactionData,
        ratesData: state.customers.maps.ratesData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadCustomerLatestTransaction: () => dispatch(loadCustomerLatestTransaction()),
        onLoadRates: () => dispatch(loadRates()),
    };

}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmDelivery);



