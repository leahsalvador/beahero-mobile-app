import React, { useEffect, useRef, useState } from 'react';
import { connect } from "react-redux";
import {
    StyleSheet,
    Text,
    View,
    Image,
    ActivityIndicator
} from "react-native";
import Vegetable from '../../../../assets/images/vegetable.png'
import CircularAds from '../../../../assets/images/circularAds.png'
import WeDeliver from '../../../../assets/images/weDeliver.png'
import VegetableWRice from '../../../../assets/images/vegetableWrice.png'
import Gift from '../../../../assets/images/gift.jpg'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements'
import { updateAdsView } from '../actions'
import { loadCustomer } from '../../profile/actions'
import Swiper from 'react-native-web-swiper';
import SQLite from "react-native-sqlite-2";
import { getDataFromToken } from '../../../utilities/token'
import fromPairs from 'lodash.frompairs';

const db = SQLite.openDatabase('test.db', '1.0', '', 1)
const Advertisement = (props) => {
    const swiperRef = useRef(null);
    const [activePage, setActivePage] = useState(0)

    async function handleUpdateViewAds() {
        const userDetails = await getDataFromToken()
        props.onUpdateAdsView(userDetails.id)
    }

    useEffect(() => {
        async function isViewAds() {
            const userDetails = await getDataFromToken()
            const customerId = userDetails.id
            props.onLoadCustomer(customerId).then(res => {
                if (res.payload && res.payload.isViewAds) {
                    props.navigation.navigate('Categories')
                }
            })
        }
        isViewAds()
    }, [])

    return (
        <View style={styles.container}>
            {
                props.customerLoading ?
                    <View style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#FD2D55" />
                    </View> :
                    props.customerData && (props.customerData.isViewAds === 0) &&
                    <>
                        <Swiper
                            onIndexChanged={page => setActivePage(page)}
                            ref={swiperRef}
                            controlsProps={{
                                prevTitle: 'prev button title',
                                nextTitle: 'next button title',
                                dotsTouchable: true,
                                prevPos: false,
                                nextPos: false

                            }}
                        >
                            <View style={[styles.slideContainer, styles.slide1]}>
                                <View>
                                    <Image
                                        source={Vegetable}
                                        style={styles.advImage}
                                    />
                                    <View style={{ margin: 20 }}>
                                        <Text style={{ fontSize: 20, color: '#454F63', textAlign: 'left', fontWeight: "bold", textTransform: 'uppercase' }}>Beahero</Text>
                                        <Text style={{ fontSize: 55, color: '#454F63', textAlign: 'center', fontWeight: "bold" }}>Customer</Text>
                                        <Text style={{ fontSize: 20, color: '#454F63', textAlign: 'right', fontWeight: "bold" }}>App</Text>
                                        <Text style={{ fontSize: 16, color: '#454F63', textAlign: 'justify', fontWeight: "400", marginTop: 10 }}>This is an app designed to respond to the changing needs
                            of the filipino. Envisioned during the COVID-19 Pandemic, this app hopes to serve booking, ordering, delivery and other logistical concerns.</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.slideContainer, styles.slide2]}>
                                <View>
                                    <Image
                                        source={WeDeliver}
                                        style={{
                                            width: 'auto',
                                            height: 460,
                                            // marginTop: 20,
                                            resizeMode: "stretch",
                                        }}
                                    />
                                    <View style={{ margin: 20 }}>
                                        <Text style={{ fontSize: 20, color: '#FD2D55', fontWeight: "bold", marginBottom: 30, marginTop: 20 }}>Food. Parcel. Pets. Everything else.</Text>
                                        <Text style={{ fontSize: 20, color: '#454F63', fontWeight: "bold", }}>Get them delivered to you -fast</Text>
                                        <Text style={{ fontSize: 20, color: '#454F63', fontWeight: "bold", marginBottom: 30 }}>affordable, convinient.</Text>


                                        <Text style={{ fontSize: 18, color: '#454F63', fontWeight: "bold", textTransform: 'uppercase' }}>STAY HOME, STAY SAFE.</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.slideContainer, styles.slide3]}>
                                <View style={{ backgroundColor: '#FD2D55', margin: 20, height: 600, borderRadius: 20 }}>
                                    <Image
                                        source={CircularAds}
                                        style={{
                                            width: 'auto',
                                            height: 200,
                                            marginTop: 50,
                                            resizeMode: "contain",
                                        }}
                                    />
                                    <View style={{ margin: 20 }}>
                                        <Text style={{ fontSize: 20, color: 'white', textAlign: 'center', fontWeight: "bold", marginVertical: 40 }}>Book Appointments</Text>
                                        <Text style={{ fontSize: 18, color: 'white', textAlign: 'left', marginBottom: 35 }}>Not everything can be delivered. Book appointments with your
                                        favorite barbers, salons, car service, centers and many more.</Text>


                                        <Text style={{ fontSize: 20, color: 'white', textAlign: 'left', fontWeight: "bold", textTransform: 'uppercase' }}>FOR FREE.</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.slideContainer, styles.slide4]}>
                                <View style={{ margin: 20, borderRadius: 20 }}>
                                    <Image
                                        source={VegetableWRice}
                                        style={{
                                            width: 'auto',
                                            height: 430,
                                            // marginTop: 20,
                                            resizeMode: "stretch",
                                        }}
                                    />
                                    <View style={{ backgroundColor: 'white', padding: 10 }}>
                                        <Text style={{ fontSize: 24, color: '#FD2D55', textAlign: 'center', fontWeight: "bold" }}>Home Service</Text>
                                        <Text style={{ fontSize: 16, color: '#454F63', textAlign: 'center', marginVertical: 25 }}>Need aircon cleaning, plumbing, carpentry or other home repairs, maintenance or improvements?</Text>
                                        <Text style={{ fontSize: 18, color: '#454F63', textAlign: 'center', fontWeight: 'bold' }}>DO IT WITH A FEW CLICKS.</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.slideContainer, styles.slide5]}>
                                <View style={{ margin: 20, borderRadius: 20 }}>
                                    <Image
                                        source={Gift}
                                        style={{
                                            width: 'auto',
                                            height: 430,
                                            // marginTop: 20,
                                            resizeMode: "stretch",
                                        }}
                                    />
                                    <View style={{ backgroundColor: 'white', padding: 10 }}>
                                        <Text style={{ fontSize: 24, color: '#FD2D55', textAlign: 'center', fontWeight: "bold" }}>Get Rewarded.</Text>
                                        <Text style={{ fontSize: 16, color: '#454F63', textAlign: 'center', marginVertical: 15 }}>Whether you're a Customer, Rider, or Merchant - get Loyalty and Reward Points simply by referring
                                        other Riders, Customers, or Merchants.</Text>
                                        <Text style={{ fontSize: 18, color: '#454F63', textAlign: 'center', fontWeight: 'bold' }}>SELECT YOUR REWARDS OR USE YOUR POINTS FOR FUTURE PURCHASES.</Text>
                                    </View>
                                </View>
                            </View>
                        </Swiper>
                        {
                            (activePage === 0) &&
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignContent: 'flex-end', backgroundColor: 'white' }}>
                                <Button
                                    buttonStyle={{ backgroundColor: '#454F63', borderRadius: 10, height: 50, width: 50, margin: 5 }}
                                    type="solid"
                                    icon={<Icon name="arrow-left" size={16} color={'#f2f2f2'} />}
                                    onPress={() => {
                                        swiperRef.current.goToPrev();
                                    }}
                                />
                                <Button
                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50, width: 50, margin: 5 }}
                                    type="solid"
                                    icon={<Icon name="arrow-right" size={16} color={'#f2f2f2'} />}
                                    onPress={() => {
                                        swiperRef.current.goToNext();
                                    }}
                                />
                            </View>
                        }
                        {
                            (activePage === 1) &&
                            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }} >
                                <Button
                                    title='Next'
                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50, margin: 5, width: 100 }}
                                    type="solid"
                                    onPress={() => {
                                        swiperRef.current.goToNext();
                                    }}
                                />
                            </View>
                        }
                        {
                            (activePage === 2) &&
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <Button
                                    title='Back'
                                    style={{ color: 'black' }}
                                    buttonStyle={{ backgroundColor: '#E9EBEF', borderRadius: 10, height: 50, width: 150, margin: 5 }}
                                    type="solid"
                                    onPress={() => {
                                        swiperRef.current.goToPrev();
                                    }}
                                />
                                <Button
                                    title='Next'
                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50, width: 150, margin: 5 }}
                                    type="solid"
                                    onPress={() => {
                                        swiperRef.current.goToNext();
                                    }}
                                />
                            </View>
                        }
                        {
                            (activePage === 3) &&
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <Button
                                    title='Back'
                                    style={{ color: 'black' }}
                                    buttonStyle={{ backgroundColor: '#E9EBEF', borderRadius: 10, height: 50, width: 150, margin: 5 }}
                                    type="solid"
                                    onPress={() => {
                                        swiperRef.current.goToPrev();
                                    }}
                                />
                                <Button
                                    title='Next'
                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50, width: 150, margin: 5 }}
                                    type="solid"
                                    onPress={() => {
                                        swiperRef.current.goToNext();
                                    }}
                                />
                            </View>
                        }
                        {
                            (activePage === 4) &&
                            <View style={{ backgroundColor: 'white' }}>
                                <Button
                                    title='Continue'
                                    buttonStyle={{ backgroundColor: '#FD2D55', borderRadius: 10, height: 50, margin: 20 }}
                                    type="solid"
                                    onPress={() => {
                                        handleUpdateViewAds()
                                        props.navigation.navigate("Categories");
                                    }}
                                />
                            </View>
                        }

                    </>
            }



        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slideContainer: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    slide1: {
        backgroundColor: 'white',
    },
    slide2: {
        backgroundColor: 'white',
    },
    slide3: {
        backgroundColor: 'white',
    },
    slide4: {
        backgroundColor: 'white',
    },
    slide5: {
        backgroundColor: 'white',
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
        customerLoading: state.customers.profile.customerLoading,
        customerData: state.customers.profile.customerData
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onUpdateAdsView: id => dispatch(updateAdsView(id)),
        onLoadCustomer: (customerId) => dispatch(loadCustomer(customerId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Advertisement);



