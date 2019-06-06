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
            firstName: 'מעיין',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            gender: '',
            preferences: '',
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
                titleStyle={{ fontSize: 15, color: '#FF5975' }}
                buttonStyle={
                    selected
                        ? {
                            backgroundColor: '#5DBCD2',

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

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />

                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={styles.statusBar} />
                    <View style={styles.navBar}>
                        <Text style={styles.nameHeader} >יסמין</Text>
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
                        <View style={{ flex: 1, marginTop: 30, left: 50 }}>
                            <Text
                                style={{
                                    flex: 1,
                                    fontSize: 20,
                                    color: 'black',
                                    // fontFamily: 'bold',
                                }}
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
                                }}
                            > העדפות
                            </Text>
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
                            {/* </View> */}
                            {/* </ScrollView> */}

                        </View>
                        <View style={{ flex: 1, marginTop: 30 }}>
                            <Text
                                style={{
                                    flex: 1,
                                    fontSize: 15,
                                    color: 'rgba(216, 121, 112, 1)',
                                    // fontFamily: 'regular',
                                    marginLeft: 40,
                                }}
                            >
                                פרטים אישיים
 </Text>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    marginTop: 20,
                                    marginHorizontal: 30,
                                }}
                            >
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoTypeLabel}>Age</Text>
                                        <Text style={styles.infoTypeLabel}>Height</Text>
                                        <Text style={styles.infoTypeLabel}>Ethnicity</Text>
                                        <Text style={styles.infoTypeLabel}>Sign</Text>
                                        <Text style={styles.infoTypeLabel}>Religion</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.infoAnswerLabel}>26</Text>
                                        <Text style={styles.infoAnswerLabel}>5'4"</Text>
                                        <Text style={styles.infoAnswerLabel}>black</Text>
                                        <Text style={styles.infoAnswerLabel}>Pisces</Text>
                                        <Text style={styles.infoAnswerLabel}>Catholic</Text>
                                    </View>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoTypeLabel}>Body Type</Text>
                                        <Text style={styles.infoTypeLabel}>Diet</Text>
                                        <Text style={styles.infoTypeLabel}>Smoke</Text>
                                        <Text style={styles.infoTypeLabel}>Drink</Text>
                                        <Text style={styles.infoTypeLabel}>Drugs</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 10, marginRight: -20 }}>
                                        <Text style={styles.infoAnswerLabel}>Fit</Text>
                                        <Text style={styles.infoAnswerLabel}>Vegan</Text>
                                        <Text style={styles.infoAnswerLabel}>No</Text>
                                        <Text style={styles.infoAnswerLabel}>No</Text>
                                        <Text style={styles.infoAnswerLabel}>Never</Text>
                                    </View>
                                </View>
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
                                title="שמור"
                                titleStyle={{
                                    // fontFamily: 'regular',
                                    fontSize: 20,
                                    color: 'black',
                                    textAlign: 'center',
                                }}
                                onPress={() => console.log('save')}
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
    group: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#5DBCD2',
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
        backgroundColor: '#FF5A76',
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
});