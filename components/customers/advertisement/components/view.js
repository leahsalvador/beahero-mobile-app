import React, { useEffect } from 'react';
import { connect } from "react-redux";
import {
    ScrollView,
    StyleSheet,
    TextInput,
    Text,
    View,
    ImageBackground
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card, Button, Image } from 'react-native-elements'
import { loadPosts } from '../actions'
import { TouchableOpacity } from 'react-native-gesture-handler';

const PostView = (props) => {
    const { route: { params: { selected } } } = props
    console.log("SESECLECLE", props.route.params.selected)
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ScrollView>
                <View>
                    <Image
                        source={{ uri: selected.image }}
                        style={{ width: '100%', height: 300 }}
                    />
                </View>
                <View style={{ margin: 20 }}>
                    <Text style={{ fontSize: 28, color: 'gray' }}>{selected.title}</Text>
                </View>
                <View style={{ margin: 20 }}>
                    <Text style={{ opacity: 0.6, fontSize: 18, textAlign: 'justify' }}>{selected.description}</Text>
                </View>
            </ScrollView>
        </View>
    );
}


function mapStateToProps(state) {
    return {
        // postsData: state.clientPosts.postsData
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // onLoadPosts: data => dispatch(loadPosts(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostView);



