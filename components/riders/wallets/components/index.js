import React, { useEffect, useRef, useState } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { Card, Divider } from 'react-native-elements'
import { formatMoney } from '../../../utilities/helper'
import { loadWallet, loadRiderTransactions } from '../actions'
import _ from 'lodash'
import moment from 'moment'
import { getDataFromToken } from '../../../utilities/token'

const Wallets = (props) => {
    const [riderData, setRiderData] = useState({})

    useEffect(() => {
        async function getTokenData() {
            let userData = await getDataFromToken()
            const riderId = userData.id
            setRiderData([userData])
            props.onLoadWallet(riderId)
            props.onLoadRiderTransactions(riderId)
        }
        getTokenData()
    }, [])


    function getTransactionLabel(transaction) {
        if (transaction.products) {
            return 'Delivery'
        }
    }

    function getTransactionAmount(transaction) {
        const totalProducts = transaction.products && transaction.products.reduce((a, b) => {
            return a + (b.price * b.quantity)
        }, 0)
        return totalProducts
    }

    return (
        <View style={styles.container}>
            <Card>
                <View style={{ marginLeft: 20, marginRight: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 26, fontWeight: 'bold' }}>Wallet</Text>
                </View>

                <View style={{ margin: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: 'gray' }}>Total Balance</Text>
                    {
                        Object.keys(props.walletData).length !== 0 ?
                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <Text style={{ fontSize: 24, color: 'green', margin: 4 }}>₱</Text>
                                <Text style={{ fontSize: 24, fontWeight: 'bold', margin: 4, color: 'green' }}>{formatMoney(props.walletData && props.walletData.amount || 0)}</Text>
                            </View> :
                            <Text style={{ fontSize: 16, color: 'red' }}>You dont have wallet yet.</Text>
                    }
                </View>
            </Card>

            <View style={{ marginLeft: 10, marginTop: 20, display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'gray' }}>Transactions</Text>
            </View>

            <View style={{ margin: 10 }}>
                <ScrollView>
                    {
                        props.riderTransactionsData.map((item, index) => {
                            return (
                                <View key={index}>
                                    <View style={{ padding: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <View>
                                                <Text style={{ fontSize: 16, color: 'gray' }}>{getTransactionLabel(item)}</Text>
                                                {/* <Text style={{ fontSize: 11, color: 'gray' }}>{moment(item.created_at).format('LLL')}</Text> */}
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 11, color: 'gray' }}>{moment(item.created_at).format('LLL')}</Text>
                                                {/* <Text style={{ fontSize: 16, fontWeight: 'bold', margin: 4, color: 'gray' }}>{formatMoney(getTransactionAmount(item))}</Text> */}
                                            </View>
                                        </View>
                                    </View>
                                    <Divider style={{ backgroundColor: 'gray' }} />
                                </View>
                            )
                        })
                    }
                </ScrollView>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFD'
    }
});

function mapStateToProps(state) {
    return {
        walletData: state.riders.wallets.walletData,
        riderTransactionsData: state.riders.wallets.riderTransactionsData,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadWallet: riderId => dispatch(loadWallet(riderId)),
        onLoadRiderTransactions: riderId => dispatch(loadRiderTransactions(riderId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Wallets);



