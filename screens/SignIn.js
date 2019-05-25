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
    TextInput
} from 'react-native';
import { Button, Input, Icon, Avatar } from 'react-native-elements';
// import { cacheFonts } from '../helpers/AssetsCaching';
import { LinearGradient } from "../components/LinearGradient";

const SCREEN_WIDTH = Dimensions.get('window').width;

const IMAGE_SIZE = SCREEN_WIDTH - 80;

class CustomButton extends Component {
    constructor() {
        super();

        this.state = {
            selected: false,
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            gender: '',
            preferences: [],
        };
    }

    componentDidMount() {
        const { selected } = this.props;

        this.setState({
            selected,
        });
    }

    emailHandler = val => {
        this.setstate({
            email: val
        });
    };

    genderHandler = () => {
        this.setstate({
            gender: 'זכר'
        });
    };

    render() {
        const { title } = this.props;
        const { selected } = this.state;

        return (
            <Button
                title={title}
                titleStyle={{ fontSize: 15, color: 'black' }}
                buttonStyle={
                    selected
                        ? {
                            backgroundColor: 'rgba(171, 189, 219, 1)',
                            borderRadius: 100,
                            width: 127,
                        }
                        : {
                            borderWidth: 1,
                            borderColor: 'black',
                            borderRadius: 30,
                            width: 127,
                            backgroundColor: 'transparent',
                        }
                }
                containerStyle={{ marginRight: 10 }}
                onPress={() => this.setState({ selected: !selected })}
            />
        );
    }
}

export default class LoginScreen1 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // fontLoaded: false,
        };
    }

    async componentDidMount() {
        // await cacheFonts({
        //     georgia: require('../assets/fonts/Georgia.ttf'),
        //     regular: require('../assets/fonts/Montserrat-Regular.ttf'),
        //     light: require('../assets/fonts/Montserrat-Light.ttf'),
        //     bold: require('../assets/fonts/Montserrat-Bold.ttf'),
        // });

        // this.setState({ fontLoaded: true });
    }

    insertParticipant = () => {
        var NewParticipant = {
            Email: this.state.email,
            FirstName: this.state.firstName,
            LastName: this.state.lastName,
            Password: this.state.password,
            Phone: this.state.phone,
            Gender: this.state.gender,
            Image: this.state.image,
            Address: this.state.address,
            Preferences: ''
        };
        console.warn(NewParticipant);

        fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/participant', {
            method: 'POST',
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(NewParticipant),
        })
            .then(res => res.json())
            .then(response => {
            })

            .catch(error => console.warn('Error:', error.message));
    };

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />

                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={styles.statusBar} />
                    <View style={styles.navBar}>
                        <Text style={styles.nameHeader}>Aviel</Text>
                    </View>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            {/* <Image
 source={{
 uri:
 'https://static.pexels.com/photos/428336/pexels-photo-428336.jpeg', 
 }}
 style={{
 width: IMAGE_SIZE,
 height: IMAGE_SIZE,
 borderRadius: 10,
 }}
 /> */}
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
                            <Text
                                style={{
                                    flex: 1,
                                    fontSize: 26,
                                    color: 'black',
                                    // fontFamily: 'bold',
                                }}
                            >
                                Theresa
 </Text>
                            <Text
                                style={{
                                    flex: 0.5,
                                    fontSize: 15,
                                    color: 'gray',
                                    textAlign: 'left',
                                    marginTop: 5,
                                }}
                            >
                                0.8 mi
 </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                marginTop: 20,
                                width: SCREEN_WIDTH - 80,
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
                                {console.warn(this.state.firstName)}
                            </View>
                            <View>
                                <Text style={styles.title}>שם משפחה </Text>
                            </View>
                            <Input
                                onChangeText={(lastName) => this.setState({ lastName })}
                                value={this.state.lastName}
                            />
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
                            <View>
                                <View >
                                    <Text style={styles.title}>כתובת</Text>
                                </View>
                                <Input
                                    onChangeText={(address) => this.setState({ address })}
                                    value={this.state.address}
                                />
                            </View>
                            <View >
                                <View >
                                    <Text style={styles.title} >טלפון </Text>
                                </View>
                            </View>
                            <Input

                                maxLength={10}
                                onChangeText={(phone) => this.setState({ phone })}
                                value={this.state.phone}
                                style={{ flex: 1, marginTop: 30, left: 50 }}
                            />
                        </View>
                        <View >
                            <Text
                                style={styles.title}
                            >
                                מין
 </Text>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <CustomButton title="זכר" selected={true} onPress={this.genderHandler} />
                                <CustomButton title="נקבה" />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginTop: 30, left: 50 }}>
                            <Text
                                style={{
                                    flex: 1,
                                    fontSize: 20,
                                    color: 'black',
                                    // fontFamily: 'bold',
                                }}
                            >
                                העדפות
 </Text>
                            <View style={{ flex: 1, width: SCREEN_WIDTH, marginTop: 20, right: 50 }}>
                                <ScrollView
                                    style={{ flex: 1 }}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'column',
                                            height: 170,
                                            marginLeft: 40,
                                            marginRight: 10,
                                        }}
                                    >

                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <CustomButton title="צמחוני" selected={true} />
                                            <CustomButton title="טבעוני" />
                                            {/* <CustomButton title="Swimming" selected={true} />
 <CustomButton title="Religion" /> */}
                                        </View>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <CustomButton title="נגישות" />
                                            <CustomButton title="איטלקי" selected={true} />
                                            {/* <CustomButton title="Radiohead" selected={true} />
 <CustomButton title="Micheal Jackson" /> */}
                                        </View>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <CustomButton title="אסייתי" selected={true} />
                                            <CustomButton title="עישון" />
                                            {/* <CustomButton title="Dogs" selected={true} />
 <CustomButton title="France" selected={true} /> */}
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                        <View style={{
                            left: 100
                        }}>
                            <Button
                                containerStyle={{ marginVertical: 20 }}
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    left: 65
                                }}
                                buttonStyle={{
                                    height: 55,
                                    width: SCREEN_WIDTH - 160,
                                    borderRadius: 30,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                linearGradientProps={{
                                    colors: ['rgb(250, 114, 185)', 'rgb(16, 202, 185)'],
                                    start: [1, 0],
                                    end: [0.2, 0],
                                }}
                                ViewComponent={LinearGradient}
                                title="שלח"
                                titleStyle={{
                                    // fontFamily: 'regular',
                                    fontSize: 20,
                                    color: 'black',
                                    textAlign: 'center',
                                }}
                                onPress={() => { console.log('send'); this.insertParticipant() }}
                                //onPress={() => { this.props.setFilters({ sort: 'specificArea' }); this.onSpecificAreaButtonPress() }}
                                activeOpacity={0.5}
                            />
                        </View>
                    </ScrollView>
                </View>

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    statusBar: {
        height: 10,
    },
    navBar: {
        height: 60,
        width: SCREEN_WIDTH,
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
});