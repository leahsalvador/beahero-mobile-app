import React, { useEffect, useRef, useState } from 'react';
import { connect } from "react-redux";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import _ from 'lodash'
import Accordion from 'react-native-collapsible/Accordion';

const AccordionTotal = (props) => {
    const [activeSections, setActiveSections] = useState([])

    function _renderHeader(section) {
        return (
            <View style={{ marginVertical: 5 }}>
                <Text style={{ fontSize: 14, color: 'gray' }}>{section.title}</Text>
            </View>
        );
    };

    function _renderContent(section) {
        return section.content
    };

    function _renderSectionTitle(section) {
        return (
            <View style={styles.content}>
                {/* <Text>{section.content}</Text> */}
            </View>
        );
    };

    function _updateSections(value) {
        setActiveSections([...value])
    };

    return (
        <Accordion
            sections={[
                {
                    title: 'Click to view details',
                    content: props.children
                }
            ]}
            activeSections={activeSections}
            renderSectionTitle={_renderSectionTitle}
            renderHeader={_renderHeader}
            renderContent={_renderContent}
            onChange={(e) => _updateSections(e)}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: '#FCFCFD'
    },
    content: {
        width: '100%'
    }
});

export default AccordionTotal