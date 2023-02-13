import React from 'react'
import { View, Text, TextInput, Alert, PermissionsAndroid, Dimensions, Image, ScrollView } from 'react-native';
import { Button, Input, Badge, Avatar } from 'react-native-elements';

const deliveryStatus = (props) => {
    return (
        <View>
            <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', padding: 5 }}>
                <Badge
                    badgeStyle={{ width: 18, height: 18, borderRadius: 9, marginLeft: 10, marginRight: 10, backgroundColor: props.transactionStatus >= 1 ? "#52C41A" : "lightgray" }}
                />
                <Text style={{ fontSize: 12 }}>We've found a hero for your delivery</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', padding: 5 }}>
                <Badge
                    badgeStyle={{ width: 18, height: 18, borderRadius: 9, marginLeft: 10, marginRight: 10, backgroundColor: props.transactionStatus >= 2 ? "#52C41A" : "lightgray" }}
                />
                <Text style={{ fontSize: 12 }}>Your items are ready for pick up</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', padding: 5 }}>
                <Badge
                    badgeStyle={{ width: 18, height: 18, borderRadius: 9, marginLeft: 10, marginRight: 10, backgroundColor: props.transactionStatus >= 3 ? "#52C41A" : "lightgray" }}
                />
                <Text style={{ fontSize: 12 }}>Your rider is on the way to the drop off location</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', padding: 5 }}>
                <Badge
                    badgeStyle={{ width: 18, height: 18, borderRadius: 9, marginLeft: 10, marginRight: 10, backgroundColor: props.transactionStatus >= 4 ? "#52C41A" : "lightgray" }}
                />
                <Text style={{ fontSize: 12 }}>Your rider just got arrived at the dropped off location</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', padding: 5 }}>
                <Badge
                    badgeStyle={{ width: 18, height: 18, borderRadius: 9, marginLeft: 10, marginRight: 10, backgroundColor: props.transactionStatus >= 5 ? "#52C41A" : "lightgray" }}
                />
                <Text style={{ fontSize: 12 }}>Successful Delivery!</Text>
            </View>
        </View>
    )
}

export default deliveryStatus