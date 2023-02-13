import React, { useEffect, useRef, useState } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    TextInput,
    Text,
    View,
    ImageBackground,
    Image,
    TouchableOpacity
} from "react-native";
import { getDataFromToken } from '../../../utilities/token'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card, Button, Avatar, Divider } from 'react-native-elements'
import { loadRider } from '../../profile/actions/index'
import SQLite from "react-native-sqlite-2";
import config from '../../../../config'
const REACT_APP_STORAGE = config.REACT_APP_STORAGE
const db = SQLite.openDatabase('test.db', '1.0', '', 1)
const Settings = (props) => {
    const [userData, setUserData] = useState({})
    useEffect(() => {
        async function getUserData() {
            let userData = await getDataFromToken()
            setUserData(userData)
            props.onLoadRider(userData.id)
        }
        getUserData()
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
        _deleteSessionToken()
        props.refDrawer.current.close()
        props.refNavigation.current.navigate('LoginIndex')
    }

    const { riderData } = props
    return (
        <View style={styles.container}>
            <View style={{ backgroundColor: '#282F39', height: 200 }}>
                <View style={{ height: 20, display: 'flex', justifyContent: 'center', margin: 15 }}>
                    <TouchableOpacity onPress={() => props.refDrawer.current.close()}>
                        <Icon name="close" size={24} color={'#f2f2f2'} />
                    </TouchableOpacity>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                    <View style={{ margin: 10 }}>
                        <Avatar rounded size="large" source={{ uri: riderData && `${REACT_APP_STORAGE}/${riderData.image}` }} />
                    </View>
                    <View >
                        <View style={{ width: 200 }}>
                            <Text style={{ color: 'white', fontSize: 16 }}>{`${riderData && riderData.firstName} ${riderData && riderData.lastName}`}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="star" size={16} color={'#a3a34d'} />
                            <Icon name="star" size={16} color={'#a3a34d'} />
                            <Icon name="star" size={16} color={'#a3a34d'} />
                            <Icon name="star" size={16} color={'#a3a34d'} />
                            <Icon name="star" size={16} color={'#a3a34d'} />
                            <Text style={{ marginLeft: 10, color: 'white' }}>100%</Text>
                        </View>
                    </View>
                </View>

            </View>
            <View style={{ margin: 20 }}>
                <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => {
                        props.refDrawer.current.close()
                        props && props.refNavigation && props.refNavigation.current && props.refNavigation.current.navigate('Profile')
                    }}>
                        <Text style={{ fontSize: 18, color: 'gray' }} >Profile</Text>
                    </TouchableOpacity>
                </View>
                <Divider />
                <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => {
                        props.refDrawer.current.close()
                        props && props.refNavigation && props.refNavigation.current && props.refNavigation.current.navigate('Wallets')
                    }}>
                        <Text style={{ fontSize: 18, color: 'gray' }} >Wallet</Text>
                    </TouchableOpacity>
                </View>
                <Divider />
                <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => handleLogout()}>
                        <Text style={{ fontSize: 18, color: 'gray' }} >Logout</Text>
                    </TouchableOpacity>
                </View>
                <Divider />
            </View>
        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});



function mapStateToProps(state) {
    return {
        riderData: state.riders.profile.riderData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadRider: (riderId) => dispatch(loadRider(riderId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);





