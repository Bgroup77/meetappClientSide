import React from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage,
  Modal
} from 'react-native';
import { WebBrowser } from 'expo';
import { connect } from 'react-redux';
import { setFilters } from '../modules/campings';
import { Card, ListItem, Button, Icon, List, FlatList } from 'react-native-elements';

const activeType = (key) => type === key;
class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onMeetingsCreatedButton = this.onMeetingsCreatedButton.bind(this);
    this.onMeetingsInvitedButton = this.onMeetingsInvitedButton.bind(this);
    //this.onApprovedButtonPress = this.onApprovedButtonPress.bind(this);
    //this.onRejectButtonPress = this.onRejectButtonPress.bind(this);
    this.checkParticipantsApprovedMeeting = this.checkParticipantsApprovedMeeting.bind(this);
    //this.show = this.show.bind(this);

    this.state = {
      MeetingsIWasInvited: [],
      MeetingsICreated: [],
      email: '',
      userInfo: [],
      currentMeetingID: 0,
      meetingsIWascreatedOn: 1,
      meetingsIWasInvitedOn: 0,
      modalVisible: false,
      participantsApprovedStr: "",
      participantsInsertedPreferencesStr: "",
      approved: false,
      meetingsIApproved: [75, 140],
      meetingsIRejected: [150, 151],
      meetingsIsetPreferences: [152, 153, 140, 93],

      //didApproveCurrentMeeting: false,
      // startTime: '',
      // endTime: '',
      // specificLocation: '',
      // participants: [],
      // placeId: 0,
      // placeName: '',
      //aviel's
      participantsApprovedMeeting: [],
      isDialogVisible: false,
      acceptParticipantsNames: "",
      insertedPreferencesNamesState: "",
      meetingPreferences: [],
    };
  }

  static navigationOptions = {
    title: 'מסך הבית',
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

  onMeetingsCreatedButton = () => {
    this.setState({
      meetingsIWascreatedOn: true,
      meetingsIWasInvitedOn: false
    });
  }

  onMeetingsInvitedButton = () => {
    this.setState({
      meetingsIWascreatedOn: false,
      meetingsIWasInvitedOn: true
    });
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

  checkParticipantsApprovedMeeting(meetingId) {
    console.warn("meeting ID", meetingId);
    this.setState({
      currentMeetingID: meetingId
    })
    urlAcceptedMeeting = "http://proj.ruppin.ac.il/bgroup77/prod/api/meeting/GetParticipantsAccepted?meetingId=" + meetingId;

    fetch(urlAcceptedMeeting, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          participantsApprovedMeeting: response
        }, () => {
          console.warn("participantsApprovedMeeting", this.state.participantsApprovedMeeting)
        }
        )
      }
      ))
      .catch((error) => {
        console.log(error);
      })
  }

  participantsInsertedPreferences(meetingId) {  // get participants with their preferences - per meeting
    urlPreferencesMeeting = "http://proj.ruppin.ac.il/bgroup77/prod/api/meeting/GetPreferencesParticipantsByMeetingId?meetingId=" + meetingId;
    fetch(urlPreferencesMeeting, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          meetingPreferences: response
        })
      }))
      .then(() => {
        console.warn("meetingPreferences", this.state.meetingPreferences);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  async componentDidMount() {
    await this.getStorageValue();
  }

  onPressSetPreferencesButton(PassedMeetingID, passedPlaceType) {
    AsyncStorage.setItem("currentMeetingID", JSON.stringify(PassedMeetingID));
    AsyncStorage.setItem("currentPlaceType", JSON.stringify(passedPlaceType));
    this.props.navigation.navigate('Preferences');
  }

  onPressGetResultsButton(PassedMeetingID, passedPlaceType) {
    AsyncStorage.setItem("currentMeetingID", JSON.stringify(PassedMeetingID));
    AsyncStorage.setItem("currentPlaceType", JSON.stringify(passedPlaceType));
    this.props.navigation.navigate('Results');
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

  onRejectButtonPress = (meetingID) => {
    console.warn("meetingID:", meetingID)
    // this.setState({
    //   approved: false
    // });
  }

  _handleButtonPress = () => {
    this.setModalVisible(true);
  };

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };

  render() {
    const {
      sort,
    } = this.props.filters;

    var modalBackgroundStyle = {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    };
    var innerContainerTransparentStyle = { backgroundColor: '#fff', padding: 20 };

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.helloContainer}>
            <TouchableOpacity >
              <Text style={styles.helloText} >היי {this.state.userInfo.FirstName},</Text>
            </TouchableOpacity>
            <View style={styles.group}>
              <TouchableOpacity
                style={[styles.button, styles.first, sort === 'created' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ sort: 'created' }); this.onMeetingsCreatedButton() }}
              >
                <Text style={[styles.buttonText, sort === 'created' ? styles.activeText : null]}>פגישות שיזמתי</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.last, sort === 'invited' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ sort: 'invited' }); this.onMeetingsInvitedButton() }}
              >
                <Text style={[styles.buttonText, sort === 'invited' ? styles.activeText : null]}>פגישות שזומנתי</Text>
              </TouchableOpacity>
            </View>

            {//פגישות שיזמתי
              (this.state.meetingsIWascreatedOn == 1) &&
              <View style={styles.section}>
                {this.state.MeetingsICreated.map((m, i) => {
                  subject = 'נושא: ';
                  subject += m.Subject;
                  subject += ' ';
                  subject += m.Id
                  didSetPreferences = false;

                  this.state.meetingsIsetPreferences.map(meetingNum => {
                    if (m.Id == meetingNum) didSetPreferences = true;
                  })

                  return (
                    <Card key={i} title={subject} >
                      <View key={i}>
                        <Text> תאריך:   {m.StartDate} </Text>
                        <Text> שעה:   {m.StartHour} </Text>
                        <Text> הערות:   {m.Notes} </Text>

                        {m.PlaceType == "restaurant" && <Text> סוג מקום: מסעדה   </Text>}
                        {m.PlaceType == "cafe" && <Text> סוג מקום: בית קפה   </Text>}
                        {m.PlaceType == "pub" && <Text> סוג מקום: פאב   </Text>}

                        {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                        {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                        {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                        {m.StatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>}

                        <View>
                          <View style={styles.groupSmall}>
                            <TouchableOpacity
                              style={[styles.buttonSmall]}
                              onPress={() => {
                                this._handleButtonPress();
                                { this.checkParticipantsApprovedMeeting(m.Id) }
                                { this.participantsInsertedPreferences(m.Id) };
                              }}
                            >
                              <Text style={[styles.buttonText]}>סטטוס הגעת משתתפים</Text>
                            </TouchableOpacity>
                          </View>
                          <Modal
                            width='0.8'
                            animationType='fade'
                            transparent={true}
                            visible={this.state.modalVisible}
                            onRequestClose={() => this.setModalVisible(false)}
                          >
                            <View style={styles.modalContainer}>
                              <View style={styles.innerContainer}>
                                <Text style={{ color: '#000000', fontWeight: 'bold', }}>סטטוס הגעת משתתפים</Text>
                                <Text>{"\n"}</Text>
                                <Text>המשתתפים שאישרו הגעה:</Text>
                                {this.state.participantsApprovedMeeting.map((u, i) => {
                                  user = u.FirstName + " " + u.LastName;

                                  return (
                                    <Text>{user}</Text>
                                  );
                                })}
                                <Text>{"\n"}</Text>
                                <Text>המשתתפים שהזינו העדפות:</Text>
                                {this.state.meetingPreferences.map((u, i) => {
                                  user = u.FirstName + " " + u.LastName
                                  return (
                                    <Text>{user}</Text>
                                  );
                                })}
                                <Button title='סגור'
                                  buttonStyle={{ backgroundColor: '#808080', color: '#000000' }}
                                  onPress={this.setModalVisible.bind(this, false)} />
                              </View>
                            </View>
                          </Modal>
                          <View style={styles.groupSmall}>
                            <TouchableOpacity
                              disabled={didSetPreferences} style={[styles.buttonSmall]}
                              onPress={() => this.onPressSetPreferencesButton(m.Id, m.PlaceType)}>
                              <Text style={[didSetPreferences ? styles.buttonTextDisabled : styles.buttonText]}>הזן העדפות לפגישה</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.groupSmall}>
                            <TouchableOpacity
                              style={[styles.buttonSmall]}
                              onPress={() => this.onPressGetResultsButton(m.Id, m.PlaceType)}>
                              <Text style={[styles.buttonText]}>הרץ לקבלת תוצאות</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            }

            {//meetings I was invited
              (this.state.meetingsIWasInvitedOn == 1) &&
              <View style={styles.section}>
                {this.state.MeetingsIWasInvited.map((m, i) => {
                  didApprove = false;
                  didReject = false;
                  didSetPreferences = false;

                  // approvedGrayedOut= false,
                  // rejectedGrayedOut= false,
                  // setPreferencesGrayedOut= false,

                  this.state.meetingsIApproved.map(meetingNum => {
                    if (m.Id == meetingNum) didApprove = true;
                  })
                  this.state.meetingsIRejected.map(meetingNum => {
                    if (m.Id == meetingNum) didReject = true;
                  })
                  this.state.meetingsIsetPreferences.map(meetingNum => {
                    if (m.Id == meetingNum) didSetPreferences = true;
                  })
                  subject = 'נושא: ';
                  subject += m.Subject;
                  subject += ' ';
                  subject += m.Id
                  return (
                    <Card key={i} title={subject} >
                      <View key={i}>
                        <Text> תאריך:   {m.StartDate} </Text>
                        <Text> שעה:   {m.StartHour} </Text>
                        <Text> הערות:   {m.Notes} </Text>

                        {m.PlaceType == "restaurant" && <Text> סוג מקום: מסעדה   </Text>}
                        {m.PlaceType == "cafe" && <Text> סוג מקום: בית קפה   </Text>}
                        {m.PlaceType == "pub" && <Text> סוג מקום: פאב   </Text>}

                        {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                        {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                        {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                        {m.SatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>}



                        <View>
                          {
                            (didReject !== true) &&
                            <View>
                              {/* button: */}
                              <View style={styles.groupSmall}>
                                <TouchableOpacity
                                  disabled={didApprove}
                                  style={[styles.buttonSmall]}
                                //onPress={() => this.onApprovedButtonPress(m.Id)}
                                >
                                  <Text style={[didApprove ? styles.buttonTextDisabled : styles.buttonText]}>אשר</Text>
                                </TouchableOpacity>
                              </View>

                              {(didApprove == true) &&
                                /* button: */
                                <View style={styles.groupSmall}>
                                  <TouchableOpacity
                                    disabled={didSetPreferences}
                                    style={[styles.buttonSmall]}
                                    onPress={() => this.onPressSetPreferencesButton(m.Id, m.PlaceType)}
                                  >
                                    <Text style={[didSetPreferences ? styles.buttonTextDisabled : styles.buttonText]}>הזן העדפות לפגישה</Text>
                                  </TouchableOpacity>
                                </View>
                              }
                            </View>
                          }

                          {(didApprove !== true) &&
                            /* button: */
                            <View style={styles.groupSmall}>
                              <TouchableOpacity
                                disabled={didReject}
                                style={[styles.buttonSmall]}
                                onPress={() => this.onRejectButtonPress(m.Id)}
                              >
                                <Text style={[didReject ? styles.buttonTextDisabled : styles.buttonText]}>דחה</Text>
                              </TouchableOpacity>
                            </View>
                          }


                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            }
            <View >
              <Button
                //small
                buttonStyle={{ backgroundColor: '#FF5A76' }}
                title="יצירת פגישה חדשה"
                onPress={() => this.props.navigation.navigate('NewMeetingStack')}
              />
            </View>
            <View style={styles.welcomeContainer}>
              <Image
                source={
                  require('../assets/images/logo.png')
                }
                style={styles.welcomeImage}
              />
            </View>
          </View>
        </ScrollView>
      </View >
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

export default connect(moduleState, moduleActions)(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    //backgroundColor: 'white',
    //backgroundColor: 'rgba(0, 0, 0, 0.5)', //?may
    flexDirection: 'column',
    alignItems: 'center'
  },
  innerContainer: {
    top: 0,
    alignItems: 'center',
    //justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
    alignSelf: 'stretch',
    //height: 300,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 10,
  },
  helloText: {
    padding: 20,
    bottom: 20,
    textAlign: 'right',
    alignSelf: 'stretch'
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
  group: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#5DBCD2',
    justifyContent: 'space-between',
  },
  groupSmall: {
    flexDirection: 'row',
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#5DBCD2',
    justifyContent: 'space-between',
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
    flex: 1,
    marginTop: 12,
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
  button: {
    flex: 1,
    padding: 14,
    alignContent: 'center',
    alignItems: 'center',
  },
  buttonSmall: {
    flex: 1,
    padding: 8,
    alignContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonTextDisabled: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#BEBEBE',
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
  section: {
    flexDirection: 'column',
    marginHorizontal: 14,
    marginBottom: 14,
    paddingBottom: 24,
    borderBottomColor: '#EAEAED',
    borderBottomWidth: 1,
  },
});
