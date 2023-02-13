import React, { useEffect, useRef, useState } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { Divider } from 'react-native-elements'
import { loadCustomerTransactions } from '../actions'
import _ from 'lodash'
import moment from 'moment'
import { getDataFromToken } from '../../../utilities/token'

const History = (props) => {
    const [customerData, setCustomerData] = useState({})

    useEffect(() => {
        async function getTokenData() {
            let userData = await getDataFromToken()
            const customerId = userData.id
            setCustomerData([userData])
            props.onLoadCustomerTransactions(customerId)
        }
        getTokenData()
    }, [])


    function getTransactionLabel(transaction) {
        if (transaction.products) {
            return 'Delivery'
        }
    }

    return (
        <View style={styles.container}>

            <View style={{ marginLeft: 10, marginTop: 20, display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'gray' }}>Transactions</Text>
            </View>

            <View style={{ margin: 10 }}>
                <ScrollView>
                    {
                        props.customerTransactionsData.map((item, index) => {
                            return (
                                <View key={index}>
                                    <View style={{ padding: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <View>
                                                <Text style={{ fontSize: 16, color: 'gray' }}>{getTransactionLabel(item)}</Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 11, color: 'gray' }}>{moment(item.created_at).format('LLL')}</Text>
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
        customerTransactionsData: state.customers.history.customerTransactionsData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadWallet: customerId => dispatch(loadWallet(customerId)),
        onLoadCustomerTransactions: customerId => dispatch(loadCustomerTransactions(customerId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(History);



