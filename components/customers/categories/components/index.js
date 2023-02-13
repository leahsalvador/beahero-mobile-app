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
    Alert,
    BackHandler
} from "react-native";
import { loadCategories } from '../actions'
import { loadCustomerLatestTransaction } from '../../maps/actions'
import { useFocusEffect } from "@react-navigation/native";
import config from '../../../../config'
const REACT_APP_STORAGE = config.REACT_APP_STORAGE
const Categories = (props) => {

    useEffect(() => {
        // disabled back button hardware
        // BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        console.log("CATEGORIES")
        props.onLoadCategories()
        props.onLoadCustomerLatestTransaction().then(res => {
            if (res.payload.status === 1 || //CONFIRMED
                res.payload.status === 2 || //FOR_PICK_UP
                res.payload.status === 3 || //FOR_DROP_OFF
                res.payload.status === 4  //DROPPED_OFF_LOCATION
            ) {
                Alert.alert(
                    "Unfinished Transaction",
                    "Our system detected that you have a unfinished transaction with the rider. You will be redirected to map and view the status changes.",
                    [
                        { text: "OK", onPress: () => props.navigation.navigate('Maps') }
                    ],
                    { cancelable: false }
                );
            }
        })

    }, [])

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                Alert.alert("Hold on!", "Are you sure you want to Exit?", [
                    {
                        text: "Cancel",
                        onPress: () => null,
                        style: "cancel"
                    },
                    { text: "YES", onPress: () => BackHandler.exitApp() }
                ]);
                return true;
            };

            BackHandler.addEventListener("hardwareBackPress", onBackPress);

            return () =>
                BackHandler.removeEventListener("hardwareBackPress", onBackPress);

        }, []));


    function handleGoToProducts(item) {
        const status = props.customerLatestTransactionData.status
        if (status === 1 || //CONFIRMED
            status === 2 || //FOR_PICK_UP
            status === 3 || //FOR_DROP_OFF
            status === 4  //DROPPED_OFF_LOCATION
        ) {
            Alert.alert(
                "On Going Delivery",
                "Your delivery is in process. You have to finish it first before you can add to cart and place an order again. Thank you",
                [
                    { text: "OK", onPress: () => props.navigation.navigate('Maps') }
                ],
                { cancelable: false }
            );
        } else {
            props.navigation.navigate('Nearby', { selectedRow: item })
        }
    }

    return (
        <View style={styles.container}>
            <View style={{ marginLeft: 20, marginRight: 20, marginTop: 10, marginBottom: 10 }}>
                {/* <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#454F63' }}>Category</Text> */}
            </View>
            <ScrollView>
                {
                    props.categoriesData.map((item, index) => {
                        return (
                            <TouchableOpacity key={index} onPress={() => {
                                handleGoToProducts(item)
                            }}>
                                <View style={{ marginTop: 22, marginBottom: 22, marginLeft: 30, marginRight: 30 }}>
                                    <ImageBackground
                                        source={{ uri: `${REACT_APP_STORAGE}/${item.image}` }}
                                        style={{
                                            backgroundColor: "transparent",
                                            padding: 10,
                                            margin: -15,
                                            height: 150,
                                            display: 'flex',
                                            justifyContent: 'flex-end'
                                        }}
                                        imageStyle={{ borderRadius: 20 }}
                                    >
                                        <View>
                                            <Text style={{
                                                color: 'white', fontSize: 40, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 1)',
                                                textShadowOffset: { width: -1, height: 1 },
                                                textShadowRadius: 20
                                            }}>{item.title}</Text>
                                            <Text style={{
                                                color: 'white', fontSize: 20, textShadowColor: 'rgba(0, 0, 0, 1 )',
                                                textShadowOffset: { width: -1, height: 1 },
                                                textShadowRadius: 20
                                            }}>{item.description}</Text>
                                        </View>
                                    </ImageBackground>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
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
        categoriesData: state.customers.categories.categoriesData,
        customerLatestTransactionData: state.customers.maps.customerLatestTransactionData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadCategories: data => dispatch(loadCategories(data)),
        onLoadCustomerLatestTransaction: () => dispatch(loadCustomerLatestTransaction()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Categories);



