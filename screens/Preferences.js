import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    SafeAreaView,
    Switch,
    Slider
} from 'react-native';
import { connect } from 'react-redux';
import { Constants } from 'expo';
import { Ionicons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import MyDatePicker from '../components/MyDatePicker';
import MyTimePicker from '../components/MyTimePicker';
import { setFilters } from '../modules/campings';
import { Input, Button } from 'react-native-elements';

import AddressAutocomplete from '../components/AddressAutocomplete';
// import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('screen');

class Preferences extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        sort: 'distance',
        type: 'all',
        price: 'free',
        option_full: true,
        option_rated: true,
        option_free: false,
        sliderValue: 70,
        minValue: 10,
        maxValue: 100,
        originLocation: '',
    }

    renderHeader() {
        return (
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Campings')}>
                        {/* <Ionicons name="md-arrow-back" size={24} /> */}
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.title}>  העדפות לפגישה </Text>
                </View>
                {/* TBD- add meeting subject */}
            </View>
        )
    }

    render() {
        const {
            sort,
            type,
            price,
            option_full,
            option_rated,
            option_free,
        } = this.props.filters;

        const activeType = (key) => type === key;

        return (
            <SafeAreaView style={styles.container}>
                {this.renderHeader()}
                <ScrollView style={styles.container}>
                    <View style={styles.section}>
                        <View>
                            {/* to decide- if this will be shown only if the creator did not enter specific area */}
                            <Text style={styles.title}>מאיפה אגיע לפגישה?</Text>
                        </View>
                        <View>
                            <AddressAutocomplete />
                        </View>
                        {/* <View>
                            <Text style={styles.title}>המרחק שאני מוכן לנסוע עבור הפגישה</Text>
                        </View>
                        <View style={styles.container}>
                            <Slider
                                style={{ width: 300 }}
                                step={1}
                                minimumValue={this.state.minValue}
                                maximumValue={this.state.maxValue}
                                value={this.state.sliderValue}
                                onValueChange={val => this.setState({ sliderValue: val })}
                                thumbTintColor='rgb(252, 228, 149)'
                                maximumTrackTintColor='#d3d3d3'
                                minimumTrackTintColor='rgb(252, 228, 149)'
                            />
                            <View style={styles.textCon}>
                                <Text style={styles.colorGrey}>אנטיפת</Text>
                                <Text style={styles.colorYellow}>
                                    {this.state.sliderValue + '%'}
                                </Text> 
                                <Text style={styles.colorGrey}>אכפתי</Text>
                            </View>
                        </View> */}
                    </View>
                    <View style={styles.section}>
                        <View>
                            <Text style={styles.title}>סוג אוכל</Text>
                        </View>
                        <View style={styles.group}>
                            <TouchableOpacity
                                //sort: all, rv
                                style={[styles.button, styles.first, activeType('italian') ? styles.active : null]}
                                onPress={() => this.props.setFilters({ type: 'italian' })}
                            >
                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={24} color={activeType('italian') ? '#FFF' : '#ff5a76'} />
                                </View>
                                <Text style={[styles.buttonText, activeType('italian') ? styles.activeText : null]}>איטלקי</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.first, activeType('asian') ? styles.active : null]}
                                onPress={() => this.props.setFilters({ type: 'asian' })}
                            >
                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={24} color={activeType('asian') ? '#FFF' : '#FF5975'} />
                                </View>
                                <Text style={[styles.buttonText, activeType('asian') ? styles.activeText : null]}>אסייתי</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.first, activeType('middleEastern') ? styles.active : null]}
                                onPress={() => this.props.setFilters({ type: 'middleEastern' })}
                            >
                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={24} color={activeType('middleEastern') ? '#FFF' : '#FF5975'} />
                                </View>
                                <Text style={[styles.buttonText, activeType('middleEastern') ? styles.activeText : null]}>מזרח תיכוני</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.last, activeType('meet') ? styles.active : null]}
                                onPress={() => this.props.setFilters({ type: 'meet' })}
                            >
                                <MaterialIcons name="star" size={24} color={activeType('meet') ? '#FFF' : '#FF5975'} />
                                <Text style={[styles.buttonText, activeType('meet') ? styles.activeText : null]}>בשרים</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View>
                            <Text style={styles.title}>העדפות נוספות</Text>
                        </View>
                        <View>
                            <View style={styles.option}>
                                <Text style={{ fontWeight: '500', }}>כשר</Text>
                                <Switch
                                    value={option_full}
                                    ios_backgroundColor="#EAEAED"
                                    trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                    onValueChange={() => this.props.setFilters({ option_full: !option_full })}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text style={{ fontWeight: '500', }}>טבעוני</Text>
                                <Switch
                                    value={option_rated}
                                    ios_backgroundColor="#EAEAED"
                                    trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                    onValueChange={() => this.props.setFilters({ option_rated: !option_rated })}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text style={{ fontWeight: '500', }}>צמחוני</Text>
                                <Switch
                                    value={option_rated}
                                    ios_backgroundColor="#EAEAED"
                                    trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                    onValueChange={() => this.props.setFilters({ option_rated: !option_rated })}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text style={{ fontWeight: '500', }}>נגישות</Text>
                                <Switch
                                    value={option_free}
                                    ios_backgroundColor="#EAEAED"
                                    trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                    onValueChange={() => this.props.setFilters({ option_free: !option_free })}
                                />
                            </View>
                        </View>
                        <View>
                            <Button
                                title="שלח"
                                onPress={() => this.props.navigation.navigate('Campings')}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView >
        );
    }
}

const moduleState = state => ({
    filters: state.campings.filters,
    loading: state.campings.loading,
});

const moduleActions = {
    setFilters,
}

export default connect(moduleState, moduleActions)(Preferences);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: height * 0.1,
        width: width,
        paddingHorizontal: 14,
    },
    section: {
        flexDirection: 'column',
        marginHorizontal: 14,
        marginBottom: 14,
        paddingBottom: 24,
        borderBottomColor: '#EAEAED',
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        marginVertical: 14,
        // alignItems: 'flex-end'
    },
    group: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#FF5975',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 14,
        alignContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '500',
    },
    active: {
        backgroundColor: '#FF5975',
    },
    activeText: {
        color: '#FFF'
    },
    first: {
        borderTopLeftRadius: 13,
        borderBottomLeftRadius: 13,
    },
    last: {
        borderTopRightRadius: 13,
        borderBottomRightRadius: 13,
    },
    option: {
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textCon: {
        width: 320,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    colorGrey: {
        color: '#d3d3d3'
    },
    colorYellow: {
        color: 'rgb(252, 228, 149)'
    },
});
