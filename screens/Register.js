import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    Image,
    ScrollView,
    Dimensions,
    StatusBar,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { Button, Input, Icon, Avatar } from 'react-native-elements';
import { setFilters } from '../modules/campings';
import { connect } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
// import { cacheFonts } from '../helpers/AssetsCaching';
import { LinearGradient } from "../components/LinearGradient";

// const SCREEN_WIDTH = Dimensions.get('window').width;
const { width, height } = Dimensions.get('screen');

const IMAGE_SIZE = width - 80;

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sort: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            // address: '',
            gender: '',
            kosher: false,
            vegan: false,
            vegetarian: false,
            accessibility: false,
            preferencesPerMeeting: [],
        };
    }

    static navigationOptions = {
        title: 'הרשמה',
    };

    insertNewParticipant = () => {
        var preferenceIDs = this.createPreferencesArray();
        console.warn("preferenceIDs", preferenceIDs);

        var NewParticipant = {
            FirstName: this.state.firstName,
            LastName: this.state.lastName,
            Email: this.state.email,
            Password: this.state.password,
            Phone: '1',
            Gender: this.state.gender,
            Image: '',
            Address: '',
            Preferences: preferenceIDs
        };
        console.warn("NewParticipant", NewParticipant);

        fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/participant', {
            method: 'POST',
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(NewParticipant),
        })
            .then(() => {
                Alert.alert(
                    'הודעה',
                    'נרשמת בהצלחה',
                    [
                        { text: 'חזרה לדף התחברות', onPress: () => this.props.navigation.navigate('Login') },
                        {
                            text: 'ביטול',
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            })
            .catch(error => console.warn('Error:', error.message));
    };

    createPreferencesArray() {
        var preferenceIDs = []
        if (this.state.kosher == true) preferenceIDs.push(4);
        if (this.state.vegan == true) preferenceIDs.push(1);
        if (this.state.vegetarian == true) preferenceIDs.push(2);
        if (this.state.accessibility == true) preferenceIDs.push(3);
        if (this.state.foodType == 'italian') preferenceIDs.push(5);
        else if (this.state.foodType == 'assian') preferenceIDs.push(6);
        else if (this.state.foodType == 'middleEastern') preferenceIDs.push(7);
        else if (this.state.foodType == 'meet') preferenceIDs.push(8);
        else if (this.state.foodType == 'dontCare') preferenceIDs.push(9);
        return preferenceIDs;
    }

    onMaleGenderButtonPress = () => {
        this.setState({
            gender: 0
        });
    }

    onFemaleGenderButtonPress = () => {
        this.setState({
            gender: 1
        });
    }

    render() {
        const {
            sort,
            type,
            kosher,
            vegan,
            vegetarian,
            accessibility,
        } = this.props.filters;

        const activeType = (key) => type === key;

        return (
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={styles.statusBar} />
                    {/* <View style={styles.navBar}>
                        <Text style={styles.nameHeader}>הרשמה</Text>
                    </View> */}
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Avatar
                                source={{
                                    uri:
                                        'https://static.pexels.com/photos/428336/pexels-photo-428336.jpeg',
                                }}
                                size="xlarge"
                                rounded
                                title="CR"
                                onPress={() => console.log("Avatar Works!")}
                                activeOpacity={0.7}
                            />
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                marginTop: 20,
                                marginHorizontal: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                        </View>
                        <View
                            style={{
                                flex: 1,
                                marginTop: 20,
                                width: width - 80,
                                marginLeft: 40,
                            }}
                        >
                            <View>
                                <Text style={styles.title}>שם פרטי</Text>
                            </View>
                            <View>
                                <Input
                                    onChangeText={(firstName) => this.setState({ firstName })}
                                    value={this.state.firstName}
                                />
                            </View>
                            <View>
                                <Text style={styles.title}>שם משפחה </Text>
                            </View>
                            <View>
                                <Input
                                    onChangeText={(lastName) => this.setState({ lastName })}
                                    value={this.state.lastName}
                                />
                            </View>
                            <View>
                                <Text style={styles.title}> אימייל</Text>
                            </View>
                            <Input value={this.state.email}
                                onChangeText={(email) => this.setState({ email })}
                                value={this.state.email}
                            />
                            <View>
                                <Text style={styles.title}> סיסמא</Text>
                            </View>
                            <Input
                                onChangeText={(password) => this.setState({ password })}
                                value={this.state.password}
                            />
                        </View>
                        <View style={styles.section}>
                            <View>
                                <Text style={styles.title}>מין</Text>
                            </View>
                            <View style={styles.group}>
                                <TouchableOpacity
                                    style={[styles.button, styles.first, sort === 'male' ? styles.active : null]}
                                    onPress={() => {
                                        this.props.setFilters({ sort: 'male' });
                                        this.onMaleGenderButtonPress()
                                    }}
                                >
                                    <Text style={[styles.buttonText, sort === 'male' ? styles.activeText : null]}>זכר</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, sort === 'female' ? styles.active : null]}
                                    onPress={() => {
                                        this.props.setFilters({ sort: 'female' });
                                        this.onFemaleGenderButtonPress()
                                    }}
                                >
                                    <Text style={[styles.buttonText, sort === 'female' ? styles.activeText : null]}>נקבה</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.section}>
                            <View>
                                <Text style={styles.title}> סוג אוכל מועדף</Text>
                            </View>
                            <View style={styles.group}>
                                <TouchableOpacity
                                    style={[styles.button, styles.first, activeType('italian') ? styles.active : null]}
                                    onPress={() => { this.props.setFilters({ type: 'italian' }); this.setState({ foodType: 'italian' }) }}
                                >

                                    <View style={{ flexDirection: 'row', }}>
                                        <MaterialIcons name="star" size={24} color={activeType('italian') ? '#FFF' : '#ff5a76'} />
                                    </View>
                                    <Text style={[styles.buttonTextFoodType, activeType('italian') ? styles.activeText : null]}>אטלקי</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, activeType('assian') ? styles.active : null]}
                                    onPress={() => { this.props.setFilters({ type: 'assian' }); this.setState({ foodType: 'assian' }) }}
                                >
                                    <View style={{ flexDirection: 'row', }}>
                                        <MaterialIcons name="star" size={24} color={activeType('assian') ? '#FFF' : '#FF5975'} />
                                    </View>
                                    <Text style={[styles.buttonTextFoodType, activeType('assian') ? styles.activeText : null]}>אסייתי</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, activeType('middleEastern') ? styles.active : null]}
                                    onPress={() => { this.props.setFilters({ type: 'middleEastern' }); this.setState({ foodType: 'middleEastern' }) }}
                                >
                                    <View style={{ flexDirection: 'row', }}>
                                        <MaterialIcons name="star" size={24} color={activeType('middleEastern') ? '#FFF' : '#FF5975'} />
                                    </View>
                                    <Text style={[styles.buttonTextFoodType, activeType('middleEastern') ? styles.activeText : null]}>מזרח תיכוני</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, activeType('meet') ? styles.active : null]}
                                    onPress={() => { this.props.setFilters({ type: 'meet' }); this.setState({ foodType: 'meet' }) }}
                                >
                                    <MaterialIcons name="star" size={24} color={activeType('meet') ? '#FFF' : '#FF5975'} />
                                    <Text style={[styles.buttonTextFoodType, activeType('meet') ? styles.activeText : null]}>בשר</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.last, activeType('dontCare') ? styles.active : null]}
                                    onPress={() => { this.props.setFilters({ type: 'dontCare' }); this.setState({ foodType: "dontCare" }) }}
                                >
                                    <MaterialIcons name="star" size={24} color={activeType('dontCare') ? '#FFF' : '#FF5975'} />
                                    <Text style={[styles.buttonTextFoodType, activeType('dontCare') ? styles.activeText : null]}>לא אכפת לי</Text>
                                </TouchableOpacity>

                                {console.warn(this.state.foodType)}
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
                                        onValueChange={() => { this.props.setFilters({ kosher: !kosher }); { this.setState({ kosher: !this.state.kosher }) } }}
                                    />
                                </View>
                                {/* {console.warn("kosher?", this.state.kosher)} */}
                                <View style={styles.option}>
                                    <Text style={{ fontWeight: '500', }}>טבעוני</Text>
                                    <Switch
                                        value={vegan}
                                        trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                        onValueChange={() => { this.props.setFilters({ vegan: !vegan }); { this.setState({ vegan: !this.state.vegan }) } }}
                                    />
                                    {/* {console.warn("vegan?", this.state.vegan)} */}

                                </View>
                                <View style={styles.option}>
                                    <Text style={{ fontWeight: '500', }}>צמחוני</Text>
                                    <Switch
                                        value={vegetarian}
                                        trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                        onValueChange={() => {
                                            this.props.setFilters({ vegetarian: !vegetarian });
                                            { this.setState({ vegetarian: !this.state.vegetarian }) }
                                        }}
                                    />
                                    {/* {console.warn("vegetarian?", this.state.vegetarian)} */}
                                </View>
                                <View style={styles.option}>
                                    <Text style={{ fontWeight: '500', }}>נגישות</Text>
                                    <Switch
                                        value={accessibility}
                                        ios_backgroundColor="#EAEAED"
                                        trackColor={{ false: "#EAEAED", true: "#FF5975" }}
                                        onValueChange={() => { this.props.setFilters({ accessibility: !accessibility }); { this.setState({ accessibility: !this.state.accessibility }) } }}
                                    />
                                    {/* {console.warn("accessibility?", this.state.accessibility)} */}
                                </View>
                            </View>
                        </View>
                        <View>
                            <Button
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    left: 65
                                }}
                                containerStyle={{ marginVertical: 20 }}
                                buttonStyle={{
                                    // height: 55,
                                    // width: width - 160,
                                    // borderRadius: 30,
                                    // justifyContent: 'center',
                                    // alignItems: 'center',
                                    backgroundColor: '#FF5A76'
                                }}
                                title="שלח"
                                onPress={() => this.insertNewParticipant()}
                            />
                        </View>
                    </ScrollView>
                </View>

            </SafeAreaView>
        );
    }
}

// class CustomButton extends Component {
//     constructor() {
//         super();

//         this.state = {
//             selected: false,
//             firstName: '',
//             lastName: '',
//             email: '',
//             password: '',
//             phone: '',
//             gender: -1,
//             // address: '',
//             originLocation: '',
//             foodType: '',
//             kosher: false,
//             vegan: false,
//             vegetarian: false,
//             accessibility: false,
//             preferences: [],
//         };

//     }

//     componentDidMount() {
//         const { selected } = this.props;

//         this.setState({
//             selected,
//         });
//     }

//     emailHandler = val => {
//         this.setstate({
//             email: val
//         });
//     };

//     render() {
//         const { title } = this.props;
//         const { selected } = this.state;

//         return (
//             <Button
//                 title={title}
//                 titleStyle={{ fontSize: 15, color: 'black' }}
//                 buttonStyle={
//                     selected
//                         ? {
//                             backgroundColor: 'rgba(171, 189, 219, 1)',
//                             borderRadius: 100,
//                             width: 127,
//                         }
//                         : {
//                             borderWidth: 1,
//                             borderColor: 'black',
//                             borderRadius: 30,
//                             width: 127,
//                             backgroundColor: 'transparent',
//                         }
//                 }
//                 containerStyle={{ marginRight: 10 }}
//                 onPress={() => this.setState({ selected: !selected })}
//             />
//         );
//     }


// }

const moduleState = state => ({
    filters: state.campings.filters,
    loading: state.campings.loading,
});

const moduleActions = {
    setFilters,
}

export default connect(moduleState, moduleActions)(Register);

const styles = StyleSheet.create({
    statusBar: {
        height: 10,
    },
    navBar: {
        height: 60,
        width: width,
        justifyContent: 'center',
        alignContent: 'center',
    },
    nameHeader: {
        color: 'black',
        fontSize: 22,
        textAlign: 'center',
    },
    infoTypeLabel: {
        fontSize: 15,
        textAlign: 'right',
        color: 'rgba(126,123,138,1)',
        // fontFamily: 'regular',
        paddingBottom: 10,
    },
    infoAnswerLabel: {
        fontSize: 15,
        color: 'black',
        // fontFamily: 'regular',
        paddingBottom: 10,
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
    activeText: {
        color: '#FFF'
    },
    active: {
        backgroundColor: '#FF5A76',
    },
    first: {
        borderTopLeftRadius: 13,
        borderBottomLeftRadius: 13,
    },
    last: {
        borderTopRightRadius: 13,
        borderBottomRightRadius: 13,
    },
    group: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#5DBCD2',
        justifyContent: 'space-between',
    },
});