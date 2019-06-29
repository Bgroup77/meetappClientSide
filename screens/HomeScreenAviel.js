import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    AsyncStorage,
    AlertAndroid
} from 'react-native';
import { WebBrowser } from 'expo';
// import { MonoText } from '../components/StyledText';
import { Card, ListItem, Button, Icon, List, FlatList } from 'react-native-elements';
import Dialog, { DialogFooter, DialogButton, DialogTitle, SlideAnimation, DialogContent } from 'react-native-popup-dialog';
import { TabView, SceneMap } from 'react-native-tab-view';
import Animated from 'react-native-reanimated';
import { Constants } from 'expo';
import ScrollableTabView, { DefaultTabBar, } from 'react-native-scrollable-tab-view';

const FirstRoute = () => (
    <View style={[styles.container, { backgroundColor: '#ff4081' }]} />
);
const SecondRoute = () => (
    <View style={[styles.container, { backgroundColor: '#673ab7' }]} />
);

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.onApprovedButtonPress = this.onApprovedButtonPress.bind(this);
        this.onRejectButtonPress = this.onRejectButtonPress.bind(this);
        this.onPressMeetingDetails = this.onPressMeetingDetails.bind(this);
        this.show = this.show.bind(this);
        const { Names } = props;
        this.state = {
            MeetingsIWasInvited: [],
            MeetingsICreated: [],
            email: '',
            userInfo: [],
            // cardMeetingID: 0,
            currentMeetingID: 0,
            approved: false,
            meetingApproved: [],
            isDialogVisible: false,
            acceptParticipantsNames: "",
            insertedPreferencesNamesState: "",
            meetingPreferences: [],
            index: 0,
            routes: [
                { key: 'first', title: 'first' },
                { key: 'second', title: 'Second' },
            ],
            // startTime: '',
            // endTime: '',
            // specificLocation: '',
            // participants: [],
            // placeId: 0,
            // placeName: '',
        };
    }

    static navigationOptions = {
        title: 'מסך הבית',
    };


    _handleIndexChange = index => this.setState({ index });


    _renderTabBar = props => {
        const inputRange = props.navigationState.routes.map((x, i) => i);

        return (
            <View style={styles.tabBar}>
                {props.navigationState.routes.map((route, i) => {
                    const color = Animated.color(
                        Animated.round(
                            Animated.interpolate(props.position, {
                                inputRange,
                                outputRange: inputRange.map(inputIndex =>
                                    inputIndex === i ? 255 : 0
                                ),
                            })
                        ),
                        0,
                        0
                    );

                    return (
                        <TouchableOpacity
                            style={styles.tabItem}
                            onPress={() => this.setState({ index: i })}>
                            <Animated.Text style={{ color }}>{route.title}</Animated.Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    _renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    toggleVisible = () => {
        //console.warn("dialog state",this.state.isDialogVisible)
        this.setState({ isDialogVisible: true });
    };

    getStorageValue = async () => {
        userToken = await AsyncStorage.getItem('userToken');
        // this.getMeetingsIWasInvited();
        this.getUserInfo();
    };

    getMeetingsIWasInvited() {
        url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participant/meetings?email=" + userToken;
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then((response => {
                this.setState({
                    MeetingsIWasInvited: response
                })
            }
            ))
            .then(() => {
                this.getMeetingsICreated();
            })

            .catch((error) => {
                console.log(error);
            })
    }

    getMeetingsICreated() {
        url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participant/meetings/creator?email=" + userToken;
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then((response => {
                this.setState({
                    MeetingsICreated: response
                })
            }
            ))
            .then(() => {
                console.warn("meetingsICreated", this.state.MeetingsICreated)
            })
            .catch((error) => {
                console.log(error);
            })

    }

    getUserInfo() {
        url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participant/details?mail=" + userToken;

        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then((response => {
                this.setState({
                    userInfo: response
                }, () => {
                    console.warn("user info from state", this.state.userInfo);
                    AsyncStorage.setItem("userInfo", JSON.stringify(this.state.userInfo));
                })
            }
            ))
            .then(() => {
                this.getMeetingsIWasInvited();
            })
            .catch((error) => {
                console.log(error);
            })

    }

    onPressMeetingDetails(meetingId) {
        console.warn("meeting ID", meetingId);
        urlAcceptedMeeting = "http://proj.ruppin.ac.il/bgroup77/prod/api/meeting/GetParticipantsAccepted?meetingId=" + meetingId;

        fetch(urlAcceptedMeeting, { method: 'GET' })
            .then(response => response.json())
            .then((response => {
                this.setState({
                    meetingApproved: response
                }, () => {
                    var renderedParticipants = '';
                    this.state.meetingApproved.map((user, i) => {
                        renderedParticipants += user.FirstName + " " + user.LastName + "\n";
                    });
                    this.setState({
                        acceptParticipantsNames: renderedParticipants

                    })
                    Names = this.state.acceptParticipantsNames;
                    console.warn("acceptParticipantsNames: ", this.state.acceptParticipantsNames)
                    //console.warn("stam ")
                }
                )
            }
            ))
            .catch((error) => {
                console.log(error);
            })
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // get preferences of participants per meeting 
        urlPreferencesMeeting = "http://proj.ruppin.ac.il/bgroup77/prod/api/meeting/GetPreferencesParticipantsByMeetingId?meetingId=" + meetingId;
        fetch(urlPreferencesMeeting, { method: 'GET' })
            .then(response => response.json())
            .then((response => {
                this.setState({
                    meetingPreferences: response
                }, () => {
                    var tempParticipants = '';
                    this.state.meetingPreferences.map((user, i) => {
                        tempParticipants += user.FirstName + " " + user.LastName + "\n";
                    });
                    this.setState({
                        insertedPreferencesNamesState: tempParticipants

                    })
                    insertedPreferencesNames = this.state.insertedPreferencesNamesState;
                    console.warn("insertedPreferencesNamesState:", this.state.insertedPreferencesNamesState)
                }
                )
            }
            ))
            .catch((error) => {
                console.log(error);
            })
    }

    async componentDidMount() {
        console.warn(this.state.approved);
        await this.getStorageValue();
    }

    onApprovedButtonPress = (meetingI2) => {
        this.setState({
            approved: true
        });
        var PreferenceParticipantMeetingLocation = {
            PreferenceId: 11,
            ParticipantId: 4,
            MeetingId: meetingI2,
            LocationId: 22, //will be removed
            //Location: this.state.originLocation
        };

        console.warn("PreferenceParticipantMeetingLocation", PreferenceParticipantMeetingLocation);

        fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/UpdateAccept', {
            method: 'PUT',
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(PreferenceParticipantMeetingLocation),
        })
            .then(res => res.json())
            .then(response => {
            })
            .catch(error => console.warn('Error:', error.message));
        alert(
            'הודעה',
            'הפגישה אושרה',
            [
                { text: 'חזרה לדף הבית', onPress: () => this.props.navigation.navigate('HomeStack') },
                {
                    text: 'ביטול',
                    style: 'cancel',
                },
            ],
            { cancelable: false },
        );
    }

    onRejectButtonPress = () => {
        this.setState({
            approved: false
        });
    }

    showArrayItem = (item) => {

        alert(item);

    }

    onPressSetPreferencesButton(PassedMeetingID) {
        var meetingID = PassedMeetingID
        console.warn("meeting id from hp", meetingID);
        AsyncStorage.setItem("currentMeetingID", JSON.stringify(meetingID));
        this.props.navigation.navigate('Preferences');
    }

    onPressGetResultsButton(PassedMeetingID) {
        var meetingID = PassedMeetingID
        console.warn("meeting id for results page", meetingID);
        AsyncStorage.setItem("currentMeetingID", JSON.stringify(meetingID));
        this.props.navigation.navigate('Results');
    }
    alertItemName = (item) => {
        alert(item.FirstName)
    }

    show = (Names) => {
        alert(Names)
    }

    render() {
        return <ScrollableTabView
            style={{ marginTop: 20 }}
            initialPage={1}
            renderTabBar={() => <DefaultTabBar />}
        >

            <View style={styles.container}>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.welcomeContainer}>
                        <TabView
                            navigationState={this.state}
                            renderScene={this._renderScene}
                            renderTabBar={this._renderTabBar}
                            onIndexChange={this._handleIndexChange}
                        />
                        {/* <Image
              source={
                require('../assets/images/logo.png')
              }
              style={styles.welcomeImage}
            /> */}
                    </View>
                    <View style={styles.helloContainer}>
                        <View tabLabel='פגישות שיזמתי'>
                            <TouchableOpacity >
                                <Text style={styles.helpLinkText} >היי {this.state.userInfo.FirstName}, הפגישות אותן יזמת:</Text>
                            </TouchableOpacity>
                            <View style={styles.section}>
                                {this.state.MeetingsICreated.map((m, i) => {
                                    //save meeting id in state as card property. later-property will be taken from the card
                                    return (
                                        <Card key={i}  >
                                            <Button title={m.Subject} onPress={() => { this.onPressMeetingDetails(m.Id); { this.toggleVisible() } }} buttonStyle={{
                                                backgroundColor: '#87CEFA',
                                            }} type="outline" raised={true}
                                                titleStyle={{ fontWeight: 'bold', color: '#FFFFFF' }} />
                                            <View key={i}>
                                                <Dialog
                                                    width='0.8'
                                                    footer={
                                                        <DialogFooter>
                                                            <DialogButton
                                                                text="אישרו הגעה"
                                                                onPress={() => { Names = this.state.acceptParticipantsNames; this.show(Names) }}
                                                            />
                                                            <DialogButton
                                                                text="הזינו העדפות"
                                                                onPress={() => { Names = this.state.insertedPreferencesNamesState; this.show(Names) }}
                                                            />
                                                        </DialogFooter>
                                                    }
                                                    dialogTitle={<DialogTitle title="פרטיי הפגישה" />}
                                                    dialogAnimation={new SlideAnimation({
                                                        slideFrom: 'bottom',
                                                    })}
                                                    visible={this.state.isDialogVisible}
                                                    overlayBackgroundColor="#BEE4ED"
                                                    onTouchOutside={() => {
                                                        this.setState({ isDialogVisible: false });
                                                    }}
                                                >
                                                    {/* <DialogContent>
                        <Text>{this.state.acceptParticipantsNames}</Text>
                      </DialogContent> */}
                                                </Dialog>
                                                {/* {this.state.meetingApproved[m]!=null && <Text>"dsadas"</Text>} */}
                                                {/* <Text>{console.warn(this.props.meetingID)}</Text> */}
                                                {/* {this.setState({ currentMeetingID: m.Id })} */}
                                                {/* {console.warn("currentMeetingID", this.state.currentMeetingID)} */}
                                                <Text> שעה:   {m.StartHour} </Text>
                                                <Text> תאריך:   {m.StartDate} </Text>
                                                <Text> הערות:   {m.Notes} </Text>
                                                <Text> סוג מקום:   {m.PlaceType} </Text>
                                                {/* {console.warn('status id:', m.StatusID)} */}
                                                {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                                                {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                                                {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                                                {m.StatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>}
                                                {console.warn("placeType", m.PlaceType)}
                                                <View>
                                                    {/* <Button
                          // large
                          type="outline"
                          raised={true}
                          // buttonStyle={{ backgroundColor: '#BEE4ED' }}
                          // borderRadius='10'
                          // borderColor='#fff'
                          title="הזן העדפות לפגישה"
                          // onPress={() => this.props.navigation.navigate('Preferences')}
                          onPress={() => this.onPressSetPreferencesButton(m.Id)}
                        /> */}
                                                    <Button
                                                        titleStyle={{ fontWeight: 'bold' }}
                                                        // large
                                                        type="outline"
                                                        raised={true}
                                                        // buttonStyle={{ backgroundColor: '#BEE4ED' }}
                                                        // borderRadius='10'
                                                        // borderColor='#fff'
                                                        title="אשר"
                                                        onPress={() => this.onApprovedButtonPress(m.Id)}
                                                    />
                                                    {this.state.approved && <Button titleStyle={{ fontWeight: 'bold' }} onPress={() => this.onPressSetPreferencesButton()} title="הזן העדפות לפגישה" type="outline" raised={true} />}

                                                    <Button
                                                        titleStyle={{ fontWeight: 'bold' }}
                                                        // large
                                                        type="outline"
                                                        raised={true}
                                                        title="דחה"
                                                        onPress={() => this.onRejectButtonPress()}
                                                    />
                                                    <Button
                                                        titleStyle={{ fontWeight: 'bold' }}
                                                        // large
                                                        // buttonStyle={{ backgroundColor: '#FF5A76' }}
                                                        type="outline"
                                                        raised={true}
                                                        // buttonStyle={{ backgroundColor: '#BEE4ED' }}
                                                        // borderRadius='10'
                                                        // borderColor='#fff'
                                                        title="הרץ לקבלת תוצאות"
                                                        // onPress={() => this.props.navigation.navigate('Preferences')}
                                                        onPress={() => this.onPressGetResultsButton(m.Id)}
                                                    />
                                                    {/* {console.warn(m.Id)} */}
                                                </View>
                                            </View>
                                        </Card>

                                    );
                                })}
                            </View>
                        </View>
                        <View tabLabel='פגישות שזומנתי'></View>
                        <TouchableOpacity >
                            <Text style={styles.helpLinkText} > הפגישות אליהן זומנת:</Text>
                        </TouchableOpacity>
                        <View style={styles.section}>
                            {this.state.MeetingsIWasInvited.map((m, i) => {
                                //save meeting id in state as card property. later-property will be taken from the card
                                return (
                                    <Card key={i}  >
                                        <View key={i}>
                                            <Button title={m.Subject} onPress={() => this.onPressMeetingDetails(m.Id)} buttonStyle={{
                                                backgroundColor: '#87CEFA',
                                            }} type="outline" raised={true}
                                                titleStyle={{ fontWeight: 'bold', color: '#FFFFFF' }} />
                                            {/* <Text>{console.warn(this.props.meetingID)}</Text> */}
                                            {/* {this.setState({ currentMeetingID: m.Id })} */}
                                            {/* {console.warn("currentMeetingID", this.state.currentMeetingID)} */}
                                            <Text> שעה:   {m.StartHour} </Text>
                                            <Text> תאריך:   {m.StartDate} </Text>
                                            <Text> הערות:   {m.Notes} </Text>
                                            {/* {console.warn('status id:', m.StatusID)} */}
                                            {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                                            {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                                            {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                                            {m.SatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>}
                                            <View>
                                                <Button
                                                    // large
                                                    type="outline"
                                                    raised={true}
                                                    // buttonStyle={{ backgroundColor: '#BEE4ED' }}
                                                    // borderRadius='10'
                                                    // borderColor='#fff'
                                                    title="אשר"
                                                    onPress={() => this.onApprovedButtonPress(m.Id)}
                                                />
                                                {this.state.approved && <Button onPress={() => this.onPressSetPreferencesButton()} title="הזן העדפות לפגישה" type="outline" raised={true} />}

                                                <Button
                                                    // large
                                                    type="outline"
                                                    raised={true}
                                                    title="דחה"
                                                    onPress={() => this.onRejectButtonPress()}
                                                />
                                                <Button
                                                    // large
                                                    // buttonStyle={{ backgroundColor: '#FF5A76' }}
                                                    type="outline"
                                                    raised={true}
                                                    // buttonStyle={{ backgroundColor: '#BEE4ED' }}
                                                    // borderRadius='10'
                                                    // borderColor='#fff'
                                                    title="הרץ לקבלת תוצאות"
                                                    // onPress={() => this.props.navigation.navigate('Preferences')}
                                                    onPress={() => this.onPressGetResultsButton(m.Id)}
                                                />
                                                {/* {console.warn(m.Id)} */}
                                            </View>
                                        </View>
                                    </Card>
                                );
                            })}
                        </View>
                        <View >
                            <Button
                                large
                                buttonStyle={{ backgroundColor: '#FF5A76' }}
                                title="יצירת פגישה חדשה"
                                onPress={() => this.props.navigation.navigate('NewMeetingStack')}
                            />
                            {/* <Button title="התנתק" onPress={this._signOutAsync} /> */}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </ScrollableTabView>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // padding: 10,
        // marginTop: 3,
        // backgroundColor: '#d9f9b1',
        // alignItems: 'center',
    },

    tabBar: {
        flexDirection: 'row',
        paddingTop: Constants.statusBarHeight,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },

    text: {
        color: '#4f603c'
    },

    contentContainer: {
        paddingTop: 30,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10,
    },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)',
    },
    codeHighlightContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        paddingHorizontal: 4,
    },
    navigationFilename: {
        marginTop: 5,
    },
    helloContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#34495e',
    },
    section: {
        flexDirection: 'column',
        marginHorizontal: 14,
        marginBottom: 14,
        paddingBottom: 24,
        // borderBottomColor: '#EAEAED',
        // borderBottomWidth: 1,
    },
    activeText: {
        color: '#FFF'
    },

});