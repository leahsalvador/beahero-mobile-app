import React, { useEffect, useRef, useState } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Alert
} from "react-native";
import { loadCategories } from '../actions'
import { Button, Input, Divider } from 'react-native-elements'
import { formatMoney } from '../../../utilities/helper'
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';
import { setCartData } from '../actions'
import { getDataFromToken } from '../../../utilities/token'
import { submitTransaction, POST_TRANSACTION_FULFILLED } from '../actions'
import config from '../../../../config'
const REACT_APP_STORAGE = config.REACT_APP_STORAGE

const Carts = (props) => {
    const [cartDataList, setCartDataList] = useState([])
    const [orderConfirmModalShow, setOrderConfirmModalShow] = useState(false)

    useEffect(() => {
        setCartDataList(props.cartsData)
    }, [])

    function updateAddQuantity(productId) {
        const index = cartDataList.findIndex(data => data.productId === productId)
        cartDataList[index].quantity = cartDataList[index].quantity + 1
        setCartDataList([...cartDataList])
        props.submitCartData(cartDataList)
    }

    function updateMinusQuantity(productId) {
        const index = cartDataList.findIndex(data => data.productId === productId)
        if (cartDataList[index].quantity > 1) {
            cartDataList[index].quantity = cartDataList[index].quantity - 1
        }
        setCartDataList([...cartDataList])
        props.submitCartData(cartDataList)
    }

    function removeFromCart(productId) {
        const filtereData = cartDataList.filter(data => data.productId !== productId)
        setCartDataList([...filtereData])
        props.submitCartData(filtereData)
    }

    function getTotalAmount() {
        return cartDataList.reduce((a, b) => {
            return a + (b.price * b.quantity)
        }, 0)
    }

    async function handleSubmitOrder() {
        const userData = await getDataFromToken()
        const products = cartDataList.map(data => {
            return {
                categoryId: data.categoryId,
                cost: data.cost,
                price: data.price,
                productId: data.productId,
                quantity: data.quantity,
            }
        })


        const submitData = {
            "customerId": userData.id,
            "merchantId": cartDataList[0].product.merchantId,
            "products": products,
            "status": 0 // status Idle
        }


        props.onSubmitTransaction(submitData).then(res => {
            if (res.type === POST_TRANSACTION_FULFILLED) {
                // when success submitting transaction, then clear cart data
                setCartDataList([])
                setOrderConfirmModalShow(false)
                props.navigation.navigate("Maps");
            } else {
                Alert.alert(
                    "Something went wrong.",
                    "Transaction has been rejected",
                    [{ text: "OK", onPress: () => console.log("OK Pressed") }],
                    { cancelable: false }
                );
            }
        })

    }

    return (
        <View style={styles.container}>
            <View style={{ marginLeft: 20, marginRight: 20, marginTop: 10, marginBottom: 10 }}>
                {/* <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#454F63' }}>Category</Text> */}
            </View>
            <ScrollView>
                <View style={{ margin: 15 }}>
                    <Text style={{ color: 'white', fontSize: 24 }}>My Items</Text>
                </View>
                {
                    cartDataList.map((item, index) => {
                        return (
                            <View key={index}>
                                <View style={{ position: 'absolute', right: 20, top: 15 }}>
                                    <Button
                                        icon={<Icon name="trash" size={15} color="white" />}
                                        buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 5, height: 30, width: 30 }}
                                        type="solid"
                                        onPress={() => { removeFromCart(item.productId) }}
                                    />
                                </View>
                                <View style={{ margin: 10, display: 'flex', flexDirection: 'row' }}>
                                    <Image source={{ uri: `${REACT_APP_STORAGE}/${item.product && item.product.image}` }}
                                        style={{ width: 92, height: 92, borderRadius: 10, margin: 5 }}
                                    />
                                    <View >
                                        <Text style={{
                                            color: 'white', fontSize: 14, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 1)',
                                            textShadowOffset: { width: -1, height: 1 },
                                            textShadowRadius: 20
                                        }}>{item.product.title.substr(0, 16)} <Text style={{ opacity: 0.7 }}>(₱ {formatMoney(item.price)})</Text></Text>
                                        <View >
                                            <Text style={{ fontSize: 18, color: 'white' }} >₱ {formatMoney(item.price * item.quantity)}</Text>
                                            <Text style={{ color: 'white', fontSize: 11 }}>Quantity</Text>
                                            <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10 }}>
                                                <Button
                                                    title='-'
                                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 5, height: 30, width: 30 }}
                                                    type="solid"
                                                    onPress={() => { updateMinusQuantity(item.productId) }}
                                                />
                                                <View style={{ marginLeft: 20, marginRight: 20 }}>
                                                    <Text style={{ color: 'white', fontSize: 20 }}>{item.quantity}</Text>
                                                </View>
                                                <Button
                                                    title='+'
                                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 5, height: 30, width: 30 }}
                                                    type="solid"
                                                    onPress={() => { updateAddQuantity(item.productId) }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <Divider />
                            </View>
                        )
                    })
                }
            </ScrollView>
            <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                <Button
                    // loading={props.transactionLoading || loading}
                    disabled={cartDataList.length === 0}
                    title={`(₱ ${formatMoney(getTotalAmount())}) Proceed to order`}
                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                    type="solid"
                    onPress={() => {
                        // setOrderConfirmModalShow(true) 
                        handleSubmitOrder()
                    }}
                />
            </View>
            {/* <Modal isVisible={orderConfirmModalShow} onBackdropPress={() => { setOrderConfirmModalShow(false) }} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ margin: 10 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 24 }}>Proceed to Order </Text>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Are you sure do you want to proceed? </Text>
                    </View>
                    <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                        <Button
                            loading={props.transactionLoading}
                            title={`(₱ ${formatMoney(getTotalAmount())}) Confirm Order`}
                            buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                            type="solid"
                            onPress={() => { handleSubmitOrder() }}
                        />
                    </View>
                    <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                        <Button
                            title='Close'
                            buttonStyle={{ backgroundColor: 'white', borderRadius: 10, height: 50 }}
                            titleStyle={{ color: 'gray' }}
                            type="solid"
                            onPress={() => { setOrderConfirmModalShow(false) }}
                        />
                    </View>
                </View>
            </Modal> */}
        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2A2E43'
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
        cartsData: state.customers.carts.cartsData,
        transactionLoading: state.customers.carts.transactionLoading
    };
}

function mapDispatchToProps(dispatch) {
    return {
        submitCartData: (data) => dispatch(setCartData(data)),
        onSubmitTransaction: data => dispatch(submitTransaction(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Carts);
