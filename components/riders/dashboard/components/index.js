import React, { useEffect } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    TextInput,
    Text,
    View,
    ImageBackground,
    TouchableOpacity
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card, Button } from 'react-native-elements'
import { loadPosts } from '../actions'
// import { TouchableOpacity } from 'react-native-gesture-handler';


const Dashboard = (props) => {
    useEffect(() => {
        props.onLoadPosts()
    }, [])
    return (
        <View >
            <ScrollView>
                <View style={{ backgroundColor: '#306fff' }}>
                    <View style={{ margin: 20 }}>
                        <Text style={{ fontSize: 18, color: 'white' }}>Quick Links</Text>
                    </View>
                    <View style={{ margin: 20 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <TouchableOpacity style={{ width: '25%' }}
                                onPress={() => props.navigation.navigate('Announcements', { selected: '' })}
                            >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="newspaper-o" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Announcements</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '25%' }} >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
                                    <Icon name="bullhorn" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Policies</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '25%' }} >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
                                    <Icon name="building" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Memorandums</Text>

                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '25%' }} >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="credit-card" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Billings</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                    <View style={{ margin: 20 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <TouchableOpacity style={{ width: '25%' }} >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="pencil-square" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Service Requests</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '25%' }} >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
                                    <Icon name="ticket" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Tickets</Text>

                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '25%' }}
                                onPress={() => props.navigation.navigate('Reservations', { selected: '' })}
                            >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
                                    <Icon name="calendar" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Reservations</Text>

                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '25%' }} >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="exclamation-triangle" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Incident Reports</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ margin: 20 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <TouchableOpacity style={{ width: '25%' }} >
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="sign-out" size={30} color={'#f2f2f2'} />
                                    <Text style={{ textAlign: 'center', fontSize: 11, color: "#f2f2f2" }} >Logout</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{ margin: 20 }}>
                    <Text style={{ fontSize: 18 }}>
                        Announcements and Events
                    </Text>
                </View>
                <View>
                    <ScrollView
                        horizontal={true}
                        contentContainerStyle={{ height: 160 }}
                        style={{ scaleX: -1 }}
                        showsHorizontalScrollIndicator={false}>
                        {
                            props.postsData.map((data, index) => {
                                return (
                                    <TouchableOpacity key={index}
                                        onPress={() => props.navigation.navigate('ViewPost', { selected: data })}
                                    >
                                        <ImageBackground source={{ uri: data.image }}
                                            style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', width: 300, height: 160, backgroundColor: 'yellow', marginHorizontal: 4, scaleX: -1 }}>
                                            <View style={{ width: '100%' }}>
                                                <View style={{ backgroundColor: 'black', opacity: 0.6 }}>
                                                    <Text style={{ color: 'white', fontSize: 15, margin: 10 }}>{data.title}</Text>
                                                </View>
                                            </View>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>
                <View style={{ margin: 20 }}>
                    <Text style={{ fontSize: 18 }}>
                        Review Our Policies
                    </Text>
                </View>
                <View>
                    <ScrollView
                        horizontal={true}
                        contentContainerStyle={{ height: 100 }}
                        style={{ scaleX: -1 }}
                        showsHorizontalScrollIndicator={false}>
                        {
                            samplepolicy.map((data, index) => {
                                return (
                                    <TouchableOpacity key={index}  >
                                        <ImageBackground source={{ uri: data.image }}
                                            style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', width: 300, height: 100, marginHorizontal: 4, scaleX: -1 }}>
                                            <View style={{ width: '100%' }}>
                                                <View style={{ backgroundColor: 'black', opacity: 0.6 }}>
                                                    <Text style={{ color: 'white', fontSize: 15, margin: 10 }}>{data.title}</Text>
                                                </View>
                                            </View>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>

                <View style={{ marginBottom: 100 }} />

            </ScrollView>
        </View>
    );
}

const samplepolicy = [
    {
        title: 'Efficient Handling of Rental Policies and Procedures',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCE37OaCP8paMmvrQbRuph6wQWAWYMQIwm0Q&usqp=CAU'
    },
    {
        title: 'Statement of Rental Policy Activity',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnuWAMdPDdfB2XDXNgpOv3xjx4wO2WOOTVxg&usqp=CAU'
    },
    {
        title: 'Policies and Procedures Opening Remarks',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJCBKpYp3okWG5FuC7vO5Ph3DA3ZWIuvU40w&usqp=CAU'
    },
    {
        title: 'Rental Lease Agreement Documents',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTri8vHW9hpRYnKGlzoz1-XumslnMuo1HyPJg&usqp=CAU'
    },
]

function mapStateToProps(state) {
    return {
        // postsData: state.clientPosts.postsData
        postsData: []
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadPosts: data => dispatch(loadPosts(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



