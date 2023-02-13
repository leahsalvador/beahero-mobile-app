import React, { useEffect } from 'react';
import { connect } from "react-redux";
import {
    View,
} from "react-native";
import { loadPosts } from '../actions'


const Dashboard = (props) => {
    useEffect(() => {
        props.onLoadPosts()
    }, [])
    return (
        <View >

        </View>
    );
}


function mapStateToProps(state) {
    return {
        postsData: []
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onLoadPosts: data => dispatch(loadPosts(data))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



