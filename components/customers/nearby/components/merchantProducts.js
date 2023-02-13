import React, { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast, { DURATION } from 'react-native-easy-toast'
import { connect } from "react-redux";
import haversine from "haversine";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    PermissionsAndroid,
    ActivityIndicator,
    Alert
} from "react-native";
import { loadMerchantProducts } from '../actions'
import { setCartData } from '../../carts/actions'
import { Button, Input, Slider } from 'react-native-elements'
import { formatMoney } from '../../../utilities/helper'
import _ from 'lodash'
import SQLite from "react-native-sqlite-2";
import config from '../../../../config'
const REACT_APP_STORAGE = config.REACT_APP_STORAGE
const db = SQLite.openDatabase('test.db', '1.0', '', 1)

const MerchantProducts = (props) => {
    let toastRef;
    const [addToCartModalShow, setAddToCartModalShow] = useState(false)
    const [addToCartSuccessModalShow, setAddToCartSuccessModalShow] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState({})
    const [radiusSliderShow, setRadiusSliderShow] = useState(false)
    const [radiusSliderValue, setRadiusSliderValue] = useState(5)
    const [quantity, setQuantity] = useState(1)
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 })
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (searchTerm !== '') {
            const delayDebounceFn = setTimeout(() => {
                setLoading(true)
                const { route: { params: { selectedRow: { id } } } } = props
                const categoryId = id
                const params = {
                    categoryId: categoryId,
                    searchTerm: searchTerm,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radiusInKm: radiusSliderValue
                }
                props.onLoadProducts(params).then(res => {
                    setLoading(false)
                })
            }, 3000)

            return () => clearTimeout(delayDebounceFn)
        }
    }, [searchTerm])


    function _deleteSessionToken() {
        return new Promise((resolve, reject) => {
            try {
                db.transaction(tx => {
                    tx.executeSql('DROP TABLE IF EXISTS SessionToken', [])
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    function handleLogout() {
        Alert.alert(
            'Location Permission',
            'Seems the app does not allow to access location, You may grant it manually in your settings or open your GPS',
            [
                {
                    text: 'Proceed to logout', onPress: () => {
                        _deleteSessionToken()
                        props.navigation.navigate('LoginIndex')
                    }
                }
            ],
            { cancelable: false }
        );


    }

    useEffect(() => {
        const { route: { params: { merchant, kmDistance } } } = props
        // console.log("merchantId, kmDistance", merchantId, kmDistance)
        props.onLoadMerchantProducts(merchant.id)
    }, [])


    function handleAddToCartModalClose() {
        setQuantity(1)
        setAddToCartModalShow(false)
    }

    function submitAddToCart() {
        const submitData = {
            product: selectedProduct,
            productId: selectedProduct.id,
            categoryId: selectedProduct.categoryId,
            quantity: quantity,
            price: selectedProduct.price,
            cost: selectedProduct.price,
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

        setAddToCartModalShow(false)
        setAddToCartSuccessModalShow(true)
        setQuantity(1)
        props.submitCartData(combinedData)
        toastRef.show("Nice! You have successfully place your item to cart.", 4000)
    }

    function calcDistance(newLatLng) {
        return haversine(location, newLatLng) || 0;
    };

    const { route: { params: { merchant, kmDistance } } } = props

    return (
        <View style={styles.container}>
            {
                loading && <View style={styles.overlayLoading}>
                    <ActivityIndicator size="large" color="#FD2D55" />
                </View>
            }
            <ScrollView>
                <View >
                    <View>
                        <Image source={{ uri: `${REACT_APP_STORAGE}/${merchant.image}` }}
                            style={{ width: '100%', height: 180, marginHorizontal: 4 }}
                        />
                        <View style={{ position: 'absolute', top: 10, left: 10 }}>
                            <TouchableOpacity onPress={() => props.navigation.goBack()}>
                                <Icon
                                    name="arrow-left"
                                    size={30}
                                    color="white"
                                    style={{
                                        textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                        textShadowOffset: { width: -1, height: 1 },
                                        textShadowRadius: 10
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ position: 'absolute', bottom: 10, margin: 10 }}>
                            <Text style={{
                                fontSize: 35, color: 'white', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                textShadowOffset: { width: -1, height: 1 },
                                textShadowRadius: 20
                            }}>{merchant.name}</Text>
                        </View>
                    </View>
                    <View style={{ marginLeft: 10, marginBottom: 10, marginTop: 20 }}>
                        <Text style={{ fontSize: 20, color: 'white' }}>Products</Text>
                    </View>

                    <View >
                        {
                            props.merchantProductsData.map((item, index) => {
                                return (
                                    <TouchableOpacity key={index} onPress={() => {
                                        (item.stocks === 0) ? toastRef.show("This item are not available right now. Try again later.", 2000) :
                                            props.navigation.navigate('NearbyView', { selected: item })
                                    }} >
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 5 }} key={index}>
                                            <View style={{ position: 'absolute', zIndex: 1, top: 2, right: 15, margin: 1 }}>
                                                <Button
                                                    disabled={item.stocks === 0 || item.price === 0}
                                                    icon={<Icon name="cart-plus" size={15} color="white" />}
                                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 30, width: 30 }}
                                                    type="solid"
                                                    onPress={() => {
                                                        setSelectedProduct(item)
                                                        setAddToCartModalShow(true)
                                                    }}
                                                />
                                            </View>
                                            <Image source={{ uri: `${REACT_APP_STORAGE}/${item.image}` }}
                                                style={{ width: 80, height: 80, marginHorizontal: 4, borderRadius: 20 }}
                                            />
                                            <View style={{ margin: 10, display: 'flex', flexDirection: 'column', justifyContent: "center" }}>
                                                <Text style={{ color: 'white', fontSize: 15 }}>₱{formatMoney(item.price)}</Text>
                                                <Text style={{ color: 'white', fontSize: 15 }}>{item.title}</Text>

                                                <Text style={{ color: 'white', fontSize: 10, opacity: 0.8 }}>{item.description.substring(0, 50)}{item.description.length >= 50 && '...'}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            </ScrollView>
            <View style={{ margin: 10 }}>
                <Button
                    disabled={props.cartsData.length === 0}
                    // title='Proceed to order'
                    title='Continue'
                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                    type="solid"
                    onPress={() => { props.navigation.navigate("Carts"), setRadiusSliderShow(false) }}
                />
            </View>
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
                            <Image source={{ uri: `${REACT_APP_STORAGE}/${selectedProduct.image}` }}
                                style={{ width: 140, height: 100, marginHorizontal: 4, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                            />
                            <View style={{ margin: 10 }}>
                                <Text style={{ fontSize: 24, color: 'white' }} >₱ {formatMoney(selectedProduct.price * quantity)}</Text>
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
            {/* <Modal isVisible={addToCartSuccessModalShow} onBackdropPress={() => { setAddToCartSuccessModalShow(false) }} swipeDirection="left" useNativeDriver
                style={{ height: 39 }}>
                <View style={{ backgroundColor: '#2A2E43' }}>
                    <View style={{ margin: 10 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 24 }}>Success! </Text>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Your Item is currently in your cart </Text>
                    </View>
                    <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                        <Button
                            // loading={props.transactionLoading || loading}
                            title='Check my cart'
                            buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50 }}
                            type="solid"
                            onPress={() => {
                                setAddToCartSuccessModalShow(false)
                                props.navigation.navigate("Carts")
                            }}
                        />
                    </View>
                    <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                        <Button
                            title='Close'
                            buttonStyle={{ backgroundColor: 'white', borderRadius: 10, height: 50 }}
                            titleStyle={{ color: 'gray' }}
                            type="solid"
                            onPress={() => { setAddToCartSuccessModalShow(false) }}
                        />
                    </View>
                </View>
            </Modal> */}
            <Toast ref={(toast) => toastRef = toast} opacity={1} style={{ backgroundColor: 'white' }} textStyle={{ color: 'black' }} fadeInDuration={0} />
        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2A2E43'
    },

    overlayLoading: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        backgroundColor: 'rgba(255,255,255,0.5)',
        display: 'flex'
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
        merchantProductsData: state.customers.products.merchantProductsData
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadMerchantProducts: (merchantId) => dispatch(loadMerchantProducts(merchantId)),
        submitCartData: (data) => dispatch(setCartData(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MerchantProducts);



