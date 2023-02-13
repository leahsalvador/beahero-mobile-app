

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatMoney } from '../../../utilities/helper'

const Wallet = (props) => {
    return (
        <View style={styles.container}>
            <View style={{ margin: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: 'gray', fontWeight: 'bold' }}>My Wallet</Text>
                <View>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Text style={{ fontSize: 24, color: 'green', margin: 4 }}>₱</Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', margin: 4, color: 'green' }}>{formatMoney(props.amount || 0)}</Text>
                    </View>
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        // flex: 1
        height: 60
    }
});



export default Wallet