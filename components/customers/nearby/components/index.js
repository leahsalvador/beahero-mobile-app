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
    Alert,
    BackHandler
} from "react-native";
import { loadProducts, loadMerchants } from '../actions'
import { setCartData } from '../../carts/actions'
import { Button, Input, Slider } from 'react-native-elements'
import { formatMoney } from '../../../utilities/helper'
import config from '../../../../config'
// import Toast from 'react-native-simple-toast';
import _ from 'lodash'
import SQLite from "react-native-sqlite-2";
const db = SQLite.openDatabase('test.db', '1.0', '', 1)
const REACT_APP_STORAGE = config.REACT_APP_STORAGE

const Nearby = (props) => {
    let toastRef;
    let watchID
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

    useEffect(() => {
        const { route: { params: { selectedRow: { id } } } } = props
        const businessCategoryType = id
        props.onLoadMerchants(businessCategoryType)
    }, [])


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
        const { route: { params: { selectedRow: { id } } } } = props
        const categoryId = id

        async function asyncLoadProduct() {
            setLoading(true)

            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message:
                            "Beahero needs access to your application " +
                            "so you can use map.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {

                    watchID = Geolocation.getCurrentPosition(
                        position => {
                            const { latitude, longitude } = position.coords;
                            const params = {
                                categoryId: categoryId,
                                searchTerm: searchTerm,
                                latitude: latitude,
                                longitude: longitude,
                                radiusInKm: radiusSliderValue
                            }
                            setLocation({ latitude, longitude })
                            // run only if the products are empty
                            props.onLoadProducts(params).then(res => {
                                setLoading(false)
                            })

                        },
                        error => {
                            console.log(error)
                            handleLogout()
                        },
                        // { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
                        // enableHighAccuracy when "true", will use internet location
                        // enableHighAccuracy when "false", will use GPS
                        { maximumAge: 60000, timeout: 5000, enableHighAccuracy: false }
                    );
                    // return () => {
                    //     Geolocation.clearWatch(watchId);
                    // };
                } else {
                    setLoading(false)
                    console.log("Permission denied");
                }
            } catch (err) {
                setLoading(false)
                console.warn("location error", err);
            }
        }
        asyncLoadProduct()

    }, [])

    function handleSlidingComplete() {
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
    }

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
        // setAddToCartSuccessModalShow(true)
        setQuantity(1)
        props.submitCartData(combinedData)
        toastRef.show("Nice! You have successfully place your item to cart.", 4000)
    }

    function calcDistance(newLatLng) {
        return haversine(location, newLatLng) || 0;
    };

    let filteredProductData
    if (props.cartsData[0] && props.cartsData[0].product.merchantId) {
        // allow only one merchant at one delivery
        // if the user choose a product with its merchant, the next
        // data will show up will be the product of the selected merchant.
        filteredProductData = props.productsData.filter(data => data.merchantId === props.cartsData[0].product.merchantId)
    } else {
        filteredProductData = props.productsData
    }

    var a = _.groupBy(filteredProductData, function (n) {
        return n.meta;
    });

    return (
        <View style={styles.container}>
            {
                loading && <View style={styles.overlayLoading}>
                    <ActivityIndicator size="large" color="#FD2D55" />
                </View>
            }
            <ScrollView>
                <Input
                    style={{ color: 'white' }}
                    placeholder='Search Burger, Fries'
                    value={searchTerm}
                    leftIcon={{ type: 'font-awesome', name: 'search', color: 'white' }}
                    onChangeText={(value) => setSearchTerm(value)}
                />
                <View style={{ marginLeft: 10, marginTop: -15, display: 'flex', flexDirection: 'row' }}>
                    <Button
                        title={`${radiusSliderValue} KM Away`}
                        buttonStyle={{ backgroundColor: '#FD2D55', margin: 2, borderRadius: 10, height: 30, width: 100 }}
                        titleStyle={{ fontSize: 12 }}
                        type="solid"
                        onPress={() => { setRadiusSliderShow(!radiusSliderShow) }}
                    />
                    <Button
                        disabled={props.cartsData.length === 0}
                        title='My Cart'
                        buttonStyle={{ backgroundColor: '#FD2D55', margin: 2, borderRadius: 10, height: 30, width: 100 }}
                        titleStyle={{ fontSize: 12 }}
                        type="solid"
                        onPress={() => { props.navigation.navigate("Carts"), setRadiusSliderShow(false) }}
                    />
                </View>
                <View style={{ margin: 10, zIndex: 1, display: radiusSliderShow ? 'flex' : 'none' }}>
                    <Slider
                        animateTransitions
                        animationType="timing"
                        maximumTrackTintColor="#ccc"
                        maximumValue={40}
                        minimumTrackTintColor="#FD2D55"
                        minimumValue={0}
                        onSlidingComplete={() =>
                            handleSlidingComplete()
                        }
                        onValueChange={value =>
                            setRadiusSliderValue(value)
                        }
                        orientation="horizontal"
                        step={1}
                        style={{ width: "100%", height: 20 }}
                        thumbStyle={{ height: 20, width: 20 }}
                        thumbTintColor="#FD2D55"
                        thumbTouchSize={{ width: 40, height: 40 }}
                        trackStyle={{ height: 10, borderRadius: 20 }}
                        value={radiusSliderValue}
                    />
                </View>
                <View style={{ marginTop: 20 }}>
                    {
                        Object.keys(a).map(function (key, index) {
                            // a[key].meta
                            return (
                                <View key={index}>
                                    <View style={{ marginLeft: 20, marginBottom: 20 }}>
                                        <Text style={{ fontSize: 20, color: 'white' }}>{a[key][0].meta}</Text>
                                    </View>
                                    <ScrollView
                                        horizontal={true}
                                        contentContainerStyle={{ minHeight: 200 }}
                                        // style={{ scaleX: -1 }}
                                        showsHorizontalScrollIndicator={false}>
                                        {
                                            a[key].map((data, index) => {
                                                return (
                                                    <TouchableOpacity key={index} onPress={() => {
                                                        (data.stocks === 0) ? toastRef.show("This item are not available right now. Try again later.", 2000) :
                                                            props.navigation.navigate('NearbyView', { selected: data })
                                                        setRadiusSliderShow(false)
                                                    }} >
                                                        <View style={{ position: 'absolute', zIndex: 1, top: 2, right: 5, margin: 1 }}>
                                                            <Button
                                                                disabled={data.stocks === 0 || data.price === 0}
                                                                icon={<Icon name="cart-plus" size={15} color="white" />}
                                                                buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 30, width: 30 }}
                                                                type="solid"
                                                                onPress={() => {
                                                                    setSelectedProduct(data)
                                                                    setAddToCartModalShow(true)
                                                                }}
                                                            />
                                                        </View>
                                                        <Image source={{ uri: `${REACT_APP_STORAGE}/${data.image}` }}
                                                            style={{ width: 160, height: 100, marginHorizontal: 4, borderTopLeftRadius: 12, borderTopRightRadius: 12, opacity: (data.stocks === 0) ? 0.5 : 1 }}
                                                        />
                                                        <View source={{ uri: `${REACT_APP_STORAGE}/${data.image}` }}
                                                            style={{ width: 160, height: 160, marginHorizontal: 4, }}
                                                        >
                                                            <View style={{ width: '100%' }}>
                                                                <View style={{ backgroundColor: '#353A50', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                                                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: (data.stocks === 0) && 'red' }}>
                                                                        <Text style={{ color: 'white', fontSize: 17, marginLeft: 10, marginRight: 10, fontWeight: 'bold', marginTop: 5, marginBottom: 2, textDecorationLine: (data.stocks === 0) ? 'line-through' : 'none' }}>₱ {formatMoney(data.price)}</Text>
                                                                        {
                                                                            (data.stocks === 0) &&
                                                                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', marginRight: 10 }}>Not Available</Text>
                                                                        }
                                                                    </View>

                                                                    <Text style={{ color: 'white', fontSize: 15, marginLeft: 10, marginRight: 10 }}>{data.title}</Text>
                                                                    <Text style={{ color: 'white', fontSize: 10, marginLeft: 10, marginRight: 10, marginBottom: 5 }}>{data.merchant && data.merchant.name && data.merchant.name.substring(0, 25)}...</Text>
                                                                    <Text style={{ color: 'white', fontSize: 12, marginLeft: 10, marginRight: 10, marginBottom: 10, opacity: 0.5 }}>{data.description && data.description.substring(0, 40)}...</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </ScrollView>
                                </View>
                            )
                        })
                    }
                </View>

                <View >
                    <View style={{ marginLeft: 20, marginBottom: 10 }}>
                        <Text style={{ fontSize: 20, color: 'white' }}>Hero Partners</Text>
                    </View>
                    <View style={{ margin: 5 }}>
                        {
                            props.merchantsData.map((item, index) => {
                                // added this so the customer can add items only in one merchant
                                if (props.cartsData.length > 0) {
                                    if (props.cartsData[0].product.merchantId !== item.id) return
                                }
                                return (
                                    <TouchableOpacity key={index} onPress={() => props.navigation.navigate('MerchantProducts', { merchant: item, kmDistance: calcDistance({ latitude: item.latitude, longitude: item.longitude }).toFixed(2) })}>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 5 }}>
                                            <Image source={{ uri: `${REACT_APP_STORAGE}/${item.image}` }}
                                                style={{ width: 80, height: 80, marginHorizontal: 4, borderRadius: 20 }}
                                            />
                                            <View style={{ margin: 10, display: 'flex', flexDirection: 'column', justifyContent: "center" }}>
                                                <Text style={{ color: 'white', fontSize: 15 }}>{item.name}</Text>
                                                <Text style={{ color: 'white', fontSize: 10, opacity: 0.8 }}>{item && item.phoneNumber}</Text>
                                                <Text style={{ color: 'white', fontSize: 10, opacity: 0.8 }}>{item && item.address && item.address.substring(0, 50)} {item && item.address && item.address.length >= 50 && '...'}</Text>
                                                <Text style={{ color: 'white', fontSize: 10, opacity: 0.8 }}>{calcDistance({ latitude: item.latitude, longitude: item.longitude }).toFixed(2)} KM</Text>
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
        productsData: state.customers.products.productsData,
        cartsData: state.customers.carts.cartsData,
        merchantsData: state.customers.products.merchantsData
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadProducts: (params) => dispatch(loadProducts(params)),
        onLoadMerchants: (businessCategoryType) => dispatch(loadMerchants(businessCategoryType)),
        submitCartData: (data) => dispatch(setCartData(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Nearby);



