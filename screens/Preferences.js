import React from 'react';
import {
    AsyncStorage,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    SafeAreaView,
    Switch,
    Slider,
    Alert
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
    // static navigationOptions = {
    //     header: null,
    // };

    state = {
        sort: 'distance',
        type: 'all',
        price: 'free',
        // sliderValue: 70, 
        // minValue: 10,
        // maxValue: 100,
        originLocation: '',
        lat: '',
        lng: '',
        foodType: '',
        dontCare: false,
        kosher: false,
        vegan: false,
        vegetarian: false,
        accessibility: false,
        preferencesPerMeeting: [],
        currentMeetingID: 0,
        userInfo: [],
        didSetPreferneces: false,
        placeType: '',
    }

    static navigationOptions = {
        title: 'העדפות לפגישה',
    };


    async componentDidMount() {
        await this.getStorageMeetingIDValue();
    }

    getStorageMeetingIDValue = async () => {
        const meetingId = JSON.parse(await AsyncStorage.getItem('currentMeetingID'));
        this.setState({
            currentMeetingID: meetingId
        })
        //console.warn("meetingId", this.state.currentMeetingID);
        this.getStorageuserInfoValue();
    };

    getStorageuserInfoValue = async () => {
        userInfo = JSON.parse(await AsyncStorage.getItem('userInfo'));
        this.setState({ userInfo: userInfo })
        //console.warn("userInfo", this.state.userInfo);
        this.getPlaceType();
    };

    getPlaceType = async () => {
        currentPlaceType = JSON.parse(await AsyncStorage.getItem('currentPlaceType'));
        this.setState({ placeType: currentPlaceType })
        //console.warn("placeType State", this.state.placeType);
        this.setPreferencesInStates();
    };

    setPreferencesInStates() {
        //console.warn("preferences", this.state.userInfo.Preferences);
        if (this.state.userInfo.Preferences.includes(1)) this.setState({ vegan: true });
        // console.warn("vegan", this.state.vegan);
        if (this.state.userInfo.Preferences.includes(2)) this.setState({ vegetarian: true });
        if (this.state.userInfo.Preferences.includes(3)) this.setState({ accessibility: true });
        if (this.state.userInfo.Preferences.includes(4)) this.setState({ kosher: true });
        if (this.state.userInfo.Preferences.includes(5)) this.setState({ foodType: 'italian' });
        if (this.state.userInfo.Preferences.includes(6)) this.setState({ foodType: 'assian' });
        if (this.state.userInfo.Preferences.includes(7)) this.setState({ foodType: 'middleEastern' });
        if (this.state.userInfo.Preferences.includes(8)) this.setState({ foodType: 'meet' });
        if (this.state.userInfo.Preferences.includes(9)) this.setState({ foodType: 'dontCare' });
        this.fillProfileButtons();
    }

    fillProfileButtons() {
        if (this.state.foodType == 'italian') { this.props.setFilters({ type: 'italian' }); }
        else if (this.state.foodType == 'assian') { this.props.setFilters({ type: 'assian' }); }
        else if (this.state.foodType == 'middleEastern') { this.props.setFilters({ type: 'middleEastern' }); }
        else if (this.state.foodType == 'meet') { this.props.setFilters({ type: 'meet' }); }
        else if (this.state.foodType == 'dontCare') { this.props.setFilters({ type: 'dontCare' }); }
        if (this.state.kosher == true) this.props.setFilters({ kosher: true });
        if (this.state.vegan == true) this.props.setFilters({ vegan: true });
        if (this.state.vegetarian == true) this.props.setFilters({ vegetarian: true });
        if (this.state.accessibility == true) this.props.setFilters({ accessibility: true });
    }

    addressHandler(loc) {
        this.setState({
            originLocation: loc

        });
        return;
    }

    latHandler(lat) {
        this.setState({
            lat: lat
        });
        return;
    }

    lngHandler(lng) {
        this.setState({
            lng: lng
        });
        return;
    }

    sendPreferences() {
        var preferenceIDs = []
        if (this.state.kosher == true) preferenceIDs.push(4);
        if (this.state.vegan == true) preferenceIDs.push(1);
        if (this.state.vegetarian == true) preferenceIDs.push(2);
        if (this.state.accessibility == true) preferenceIDs.push(3);
        if (this.state.foodType == 'italian') preferenceIDs.push(5);
        else if (this.state.foodType == 'assian') preferenceIDs.push(6);
        else if (this.state.foodType == 'middleEastern') preferenceIDs.push(7);
        else if (this.state.foodType == 'meet') preferenceIDs.push(8);

        //console.warn("preferenceIDs", preferenceIDs);

        var Preferences = {
            PreferenceId: preferenceIDs,
            ParticipantId: userInfo.Id,
            MeetingId: this.state.currentMeetingID,
            Address: this.state.originLocation,
            Latitude: this.state.lat,
            Longitude: this.state.lng,
        };

        //console.warn("Preferences", Preferences);

        fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/PostPreferences', {
            method: 'POST',
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(Preferences),
        })
            .then(() => {
                AsyncStorage.setItem("lastMeetingIsetPreferences", JSON.stringify(this.state.currentMeetingID));
            }

            )
            .then(res => {
                Alert.alert(
                    'הודעה',
                    'העדפות הוזנו בהצלחה',
                    [
                        { text: 'לחץ למעבר לדף הבית', onPress: () => this.props.navigation.navigate('HomeScreen') },
                        {
                            text: 'ביטול',
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            })
            .catch(error => console.warn('Error:', error.message));

    }


    render() {
        const {
            sort,
            type,
            price,
            kosher,
            vegan,
            vegetarian,
            accessibility,
        } = this.props.filters;

        const activeType = (key) => type === key;

        return (
            <SafeAreaView style={styles.container}>
                {/* {this.renderHeader()} */}
                <ScrollView style={styles.container}>
                    <View style={styles.section}>
                        <View>
                            {/* to decide- if this will be shown only if the creator did not enter specific area */}
                            <Text style={styles.title}>מאיפה אגיע לפגישה?</Text>
                        </View>
                        <View>
                            <AddressAutocomplete
                                addressHandler={this.addressHandler.bind(this)}
                                latHandler={this.latHandler.bind(this)}
                                lngHandler={this.lngHandler.bind(this)}
                            />
                        </View>
                        {//optional- effort mesure
                            /* <View>
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
                    {/* <View style={styles.section}>
                        <View>
                            <Text style={styles.title}>סוג אוכל</Text>
                        </View>
                        <View style={styles.group}>
                            <TouchableOpacity
                                //sort: all, rv
                                style={[styles.button, styles.first, activeType('italian') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'italian' }); this.setState({ foodType: 'italian' }) }}
                            >

                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={24} color={activeType('italian') ? '#FFF' : '#ff5a76'} />
                                </View>
                                <Text style={[styles.buttonText, activeType('italian') ? styles.activeText : null]}>איטלקי</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.first, activeType('assian') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'assian' }); this.setState({ foodType: 'assian' }) }}
                            >
                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={24} color={activeType('assian') ? '#FFF' : '#FF5975'} />
                                </View>
                                <Text style={[styles.buttonText, activeType('assian') ? styles.activeText : null]}>אסייתי</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.first, activeType('middleEastern') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'middleEastern' }); this.setState({ foodType: 'middleEastern' }) }}
                            >
                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={24} color={activeType('middleEastern') ? '#FFF' : '#FF5975'} />
                                </View>
                                <Text style={[styles.buttonText, activeType('middleEastern') ? styles.activeText : null]}>מזרח תיכוני</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.last, activeType('meet') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'meet' }); this.setState({ foodType: 'meet' }) }}
                            >
                                <MaterialIcons name="star" size={24} color={activeType('meet') ? '#FFF' : '#FF5975'} />
                                <Text style={[styles.buttonText, activeType('meet') ? styles.activeText : null]}>בשרים</Text>
                            </TouchableOpacity>
                   

                        </View>
                    </View> */}
                    <View style={styles.section}>
                        <View>
                            <Text style={styles.title}> סוג אוכל מועדף</Text>
                        </View>
                        <View style={styles.group}>
                            <TouchableOpacity
                                //sort: all, rv
                                style={[styles.button, styles.first, activeType('italian') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'italian' }); this.setState({ foodType: 'italian' }) }}
                            >

                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={26} color={activeType('italian') ? '#FFF' : '#ff5a76'} />
                                </View>
                                <Text style={[styles.buttonTextFoodType, activeType('italian') ? styles.activeText : null]}>איטלקי</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.first, activeType('assian') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'assian' }); this.setState({ foodType: 'assian' }) }}
                            >
                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={26} color={activeType('assian') ? '#FFF' : '#FF5975'} />
                                </View>
                                <Text style={[styles.buttonTextFoodType, activeType('assian') ? styles.activeText : null]}>אסייתי</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.first, activeType('middleEastern') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'middleEastern' }); this.setState({ foodType: 'middleEastern' }) }}
                            >
                                <View style={{ flexDirection: 'row', }}>
                                    <MaterialIcons name="star" size={26} color={activeType('middleEastern') ? '#FFF' : '#FF5975'} />
                                </View>
                                <Text style={[styles.buttonTextFoodType, activeType('middleEastern') ? styles.activeText : null]}>מזרח תיכוני</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.last, activeType('meet') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'meet' }); this.setState({ foodType: 'meet' }) }}
                            >
                                <MaterialIcons name="star" size={26} color={activeType('meet') ? '#FFF' : '#FF5975'} />
                                <Text style={[styles.buttonTextFoodType, activeType('meet') ? styles.activeText : null]}>בשרי</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.last, activeType('dontCare') ? styles.active : null]}
                                onPress={() => { this.props.setFilters({ type: 'dontCare' }); this.setState({ dontCare: !this.state.dontCare }) }}
                            >
                                <MaterialIcons name="star" size={26} color={activeType('dontCare') ? '#FFF' : '#FF5975'} />
                                <Text style={[styles.buttonTextFoodType, activeType('dontCare') ? styles.activeText : null]}>זורם על הכל</Text>
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
                                    value={kosher}
                                    trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                    // onValueChange={() => { this.props.setFilters({ kosher: !kosher }) }; this.setState({kosher: !this.state.kosher})}
                                    onValueChange={() => { this.props.setFilters({ kosher: !kosher }); { this.setState({ kosher: !this.state.kosher }) } }}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text style={{ fontWeight: '500', }}>טבעוני</Text>
                                <Switch
                                    value={vegan}
                                    trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                    onValueChange={() => { this.props.setFilters({ vegan: !vegan }); { this.setState({ vegan: !this.state.vagan }) } }}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text style={{ fontWeight: '500', }}>צמחוני</Text>
                                <Switch
                                    value={vegetarian}
                                    trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                    onValueChange={() => { this.props.setFilters({ vegetarian: !vegetarian }); { this.setState({ vegetarian: !this.state.vegetarian }) } }}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text style={{ fontWeight: '500', }}>נגישות</Text>
                                <Switch
                                    value={accessibility}
                                    ios_backgroundColor="#EAEAED"
                                    trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                    onValueChange={() => { this.props.setFilters({ accessibility: !accessibility }); { this.setState({ accessibility: !this.state.accessibility }) } }}
                                />
                            </View>
                        </View>
                        <View>
                            <Button
                                buttonStyle={{ backgroundColor: '#FF5A76' }}
                                title="שלח"
                                onPress={() => this.sendPreferences()}
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
        padding: 12,
        alignContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '500',
    },
    buttonTextFoodType: {
        textAlign: 'center',
        fontWeight: '100',
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
