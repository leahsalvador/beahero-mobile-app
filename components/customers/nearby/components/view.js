import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    Image,
    Text,
    View,
    ImageBackground,
    Linking,
    StyleSheet
} from "react-native";
import Map from '../../../../assets/images/map.png'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card, Button, Divider } from 'react-native-elements'
import { setCartData } from '../../carts/actions'
import { submitTransaction, POST_TRANSACTION_FULFILLED } from '../actions'
import SQLite from "react-native-sqlite-2";
import jwt_decode from "jwt-decode";
import Modal from 'react-native-modal';
import { formatMoney } from '../../../utilities/helper'
import GoogleStaticMap from 'react-native-google-static-map'
import config from '../../../../config'
import { geoCode, geoCodeReverse } from '../../../utilities/googleapis'
const REACT_APP_STORAGE = config.REACT_APP_STORAGE
const GOOGLE_MAPS_APIKEY = config.GOOGLE_MAPS_APIKEY

const db = SQLite.openDatabase('test.db', '1.0', '', 1)

function _sessionStore() {
    return new Promise((resolve, reject) => {
        db.transaction(function (txn) {
            // Create the table and define the properties of the columns
            txn.executeSql('CREATE TABLE IF NOT EXISTS SessionToken(id INTEGER PRIMARY KEY NOT NULL, token VARCHAR(20000))', [])
            // Select all inserted records, loop over them while printing them on the console.
            txn.executeSql('SELECT * FROM `SessionToken`', {}, function (tx, res) {
                if (res.rows._array[0]) {
                    const data = jwt_decode(res.rows._array[0].token)
                    return resolve({ ...data })
                }
            })
        })
    })
}

const ProductView = (props) => {
    const [loading, setLoading] = useState(false)
    const [addToCartModalShow, setAddToCartModalShow] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [address, setAddress] = useState('')
    function submitAddToCart() {
        const { route: { params: { selected } } } = props

        const submitData = {
            product: selected,
            productId: selected.id,
            categoryId: selected.categoryId,
            quantity: quantity,
            price: selected.price,
            cost: selected.price,
            // transactionId: "",
        }

        const findIndex = props.cartsData.findIndex(item => item.productId === submitData.productId)
        let combinedData
        if (findIndex === -1) {
            // if not found
            combinedData = props.cartsData.concat(submitData)
        } else {
            // if found
            props.cartsData[findIndex].quantity = (props.cartsData[findIndex].quantity + submitData.quantity)
            combinedData = props.cartsData
        }

        props.submitCartData(combinedData)
        props.navigation.goBack()

    }

    function handleAddToCartModalClose() {
        setQuantity(1)
        setAddToCartModalShow(false)
    }

    function handleCall(phoneNumber) {
        Linking.openURL(`tel:${phoneNumber}`)
    }

    const { route: { params: { selected } } } = props

    const staticMapSettings = {
        latitude: selected.merchant.latitude.toString(),
        longitude: selected.merchant.longitude.toString(),
        zoom: 14,
        size: {
            width: 330,
            height: 150
        }
    }

    useEffect(() => {
        async function geoCode() {
            const address = await geoCodeReverse(selected.merchant.latitude, selected.merchant.longitude)
            setAddress(address.formatted_address || '')
        }
        geoCode()
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: '#2A2E43' }}>
            <ScrollView>
                <View style={{ width: '100%' }}>
                    <ImageBackground
                        source={{ uri: `${REACT_APP_STORAGE}/${selected.image}` }}
                        style={{
                            height: 300,

                            display: 'flex', justifyContent: 'flex-end'
                        }}
                    >
                        <View style={{ margin: 20 }}>
                            <Text style={{
                                fontSize: 35, color: 'white', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                textShadowOffset: { width: -1, height: 1 },
                                textShadowRadius: 20
                            }}>{selected.title}</Text>
                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <Icon
                                    name="star"
                                    size={20}
                                    color="#FFB900"
                                />
                                <Icon
                                    name="star"
                                    size={20}
                                    color="#FFB900"
                                />
                                <Icon
                                    name="star"
                                    size={20}
                                    color="#FFB900"
                                />
                                <Icon
                                    name="star"
                                    size={20}
                                    color="#FFB900"
                                />
                                <Icon
                                    name="star"
                                    size={20}
                                    color="#FFB900"
                                />
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                <View style={{ margin: 20, marginBottom: 0 }}>
                    <Text style={{ fontSize: 28, textAlign: 'justify', color: 'yellow' }}>₱ {formatMoney(selected.price)}</Text>
                </View>

                <View style={{ margin: 20 }}>
                    <Text style={{ fontSize: 22, textAlign: 'justify', color: 'white' }}>Description</Text>
                    <Text style={{ fontSize: 15, textAlign: 'justify', color: 'white', opacity: 0.7, marginTop: 10 }}>{selected.description}</Text>
                    <Divider style={{ backgroundColor: 'white', marginTop: 30 }} />
                </View>

                <View style={{ margin: 15, marginBottom: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Button
                        onPress={() => handleCall(selected.merchant && selected.merchant.phoneNumber)}
                        containerStyle={{ width: 50 }}
                        buttonStyle={{ height: 50, backgroundColor: '#353A50' }}
                        icon={
                            <Icon
                                name="home"
                                size={20}
                                color="white"
                            />
                        }
                    />
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Text style={{ flexShrink: 1, fontSize: 15, color: 'white', padding: 10 }}>{selected.merchant && selected.merchant.name}</Text>
                    </View>
                </View>

                <View style={{ margin: 15, marginBottom: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Button
                        onPress={() => handleCall(selected.merchant && selected.merchant.phoneNumber)}
                        containerStyle={{ width: 50 }}
                        buttonStyle={{ height: 50, backgroundColor: '#353A50' }}
                        icon={
                            <Icon
                                name="phone"
                                size={20}
                                color="white"
                            />
                        }
                    />
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Text style={{ flexShrink: 1, fontSize: 15, color: 'white', padding: 10 }}>{selected.merchant && selected.merchant.phoneNumber} ( Press the button to call )</Text>
                    </View>
                </View>

                <View style={{ margin: 15, marginBottom: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Button
                        containerStyle={{ width: 50 }}
                        buttonStyle={{ height: 50, backgroundColor: '#353A50' }}
                        icon={
                            <Icon
                                name="location-arrow"
                                size={20}
                                color="white"
                            />
                        }
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, color: 'white', padding: 10 }}>{address}</Text>
                    </View>
                </View>

                <View style={{ margin: 15, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <GoogleStaticMap
                        style={styles.map}
                        {...staticMapSettings}
                        apiKey={GOOGLE_MAPS_APIKEY}
                    />
                </View>

                <View style={{ margin: 20 }}>
                    <Button
                        // loading={props.transactionLoading || loading}
                        title='Add To Cart'
                        buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                        type="solid"
                        onPress={() => {
                            setAddToCartModalShow(true)
                        }}
                    />
                </View>

            </ScrollView>
            {/* <Toast ref={(toast) => toastRef = toast} opacity={0.9} style={{ backgroundColor: 'white' }} textStyle={{ color: 'black' }} fadeInDuration={0} /> */}
            <Modal isVisible={addToCartModalShow} onBackdropPress={() => handleAddToCartModalClose()} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: 'white', textAlign: 'center', marginBottom: 10 }}>Are you sure you want to add this item to cart? </Text>
                        {
                            props.cartsData.length === 0 &&
                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 11, fontStyle: 'italic', opacity: 0.8 }}>Note: That Beahero allows one merchant at one delivery, 'Adding this to cart' will display only the products of your selected merchant in your list the next time you select an item. </Text>
                        }
                    </View>
                    <View style={{ margin: 10 }}>
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Image source={{ uri: `${REACT_APP_STORAGE}/${selected.image}` }}
                                style={{ width: 140, height: 100, marginHorizontal: 4, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                            />
                            <View style={{ margin: 10 }}>
                                <Text style={{ fontSize: 24, color: 'white' }} >₱ {formatMoney(selected.price * quantity)}</Text>
                                <Text style={{ color: 'white', fontSize: 14 }}>Quantity</Text>
                                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10 }}>
                                    <Button
                                        title='-'
                                        buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 5, height: 30, width: 30 }}
                                        type="solid"
                                        onPress={() => { setQuantity(quantity - 1) }}
                                    />
                                    <View style={{ marginLeft: 20, marginRight: 20 }}>
                                        <Text style={{ color: 'white', fontSize: 20 }}>{quantity}</Text>
                                    </View>
                                    <Button
                                        title='+'
                                        buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 5, height: 30, width: 30 }}
                                        type="solid"
                                        onPress={() => { setQuantity(quantity + 1) }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                        <Button
                            // loading={props.transactionLoading || loading}
                            title='Add To Cart'
                            buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                            type="solid"
                            onPress={() => {
                                submitAddToCart()
                            }}
                        />
                    </View>
                    <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                        <Button
                            title='Cancel'
                            buttonStyle={{ backgroundColor: 'white', borderRadius: 10, height: 50 }}
                            titleStyle={{ color: 'gray' }}
                            type="solid"
                            onPress={() => { handleAddToCartModalClose() }}
                        />
                    </View>
                </View>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4d4d4d'
    },

    map: {
        borderRadius: 5,
        borderColor: 'white',
        borderWidth: 1,
        width: 50
    }

});

function mapStateToProps(state) {
    return {
        transactionLoading: state.customers.products.transactionLoading,
        cartsData: state.customers.carts.cartsData

    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSubmitTransaction: data => dispatch(submitTransaction(data)),
        submitCartData: (data) => dispatch(setCartData(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductView);



