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
import Dialog, { DialogFooter, DialogButton, DialogTitle, SlideAnimation, DialogContent } from 'react-native-popup-dialog';

const activeType = (key) => type === key;
class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onMeetingsCreatedButton = this.onMeetingsCreatedButton.bind(this);
    this.onMeetingsInvitedButton = this.onMeetingsInvitedButton.bind(this);
    this.onApprovedButtonPress = this.onApprovedButtonPress.bind(this);
    this.onRejectButtonPress = this.onRejectButtonPress.bind(this);
    this.createApprovedArray = this.createApprovedArray.bind(this);

    this.state = {
      MeetingsIWasInvited: [],
      MeetingsICreated: [],
      email: '',
      userInfo: [],
      currentMeetingID: 0,
      meetingsIWascreatedOn: 1,
      meetingsIWasInvitedOn: 0,
      modalVisible: false,
      meetingsIApproved: [],
      meetingsIRejected: [],
      meetingsIsetPreferences: [],
      participantsApprovedMeeting: [],
      isDialogVisible: false,
      acceptParticipantsNames: "",
      participantsInsertedPreferences: [],
      allUsers: [],
      meetingParticipants: [],

    };
  }

  static navigationOptions = {
    title: 'מסך הבית',
  };

  async componentDidMount() {
    await this.getStorageValue();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.getStorageValue();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }


  getStorageValue = async () => {
    userToken = await AsyncStorage.getItem('userToken');
    //console.warn("userToken", userToken)
    this.getUserInfo();
  };

  getUserInfo() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participant/details?mail=" + userToken;

    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          userInfo: response
        }, () => {
          //console.warn("user info from state", this.state.userInfo);
          AsyncStorage.setItem("userInfo", JSON.stringify(this.state.userInfo));
        })
      }
      ))
      .then(() => {
        this.getUsersFromDB();

      })
      .catch((error) => {
        console.log(error);
      })
  }

  getUsersFromDB() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participants";
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          allUsers: response
        })
      }
      ))
      .then(() => {
        //console.warn("allUsers", this.state.allUsers)

        //TBD- to add first+last+id name of each participant to an array .fullName= .id=
      })
      .then(() => {
        this.getMeetingsIapproved();
      })
      .catch((error) => {
        console.warn("error in getting users from DB");
      })
  }

  getMeetingsIapproved() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/GetMeetingsApprovedPerParticipant?participantId=" + this.state.userInfo.Id;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        meetingsIapprovedIds = [];
        response.map(meeting => {
          meetingsIapprovedIds.push(meeting.Id)
        })
        this.setState({
          meetingsIApproved: meetingsIapprovedIds
        })
        //console.warn("meetingsIApproved", this.state.meetingsIApproved)
      }
      ))
      .then(() => {
        this.getMeetingsIrejected();
      })
      .catch((error) => {
        console.log(error);
      })
  }

  getMeetingsIrejected() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/GetMeetingsDeclinePerParticipant?participantId=" + this.state.userInfo.Id;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        meetingsIrejectedIds = [];
        response.map(meeting => {
          meetingsIrejectedIds.push(meeting.Id)
        })
        this.setState({
          meetingsIRejected: meetingsIrejectedIds
        })
        //console.warn("meetingsIRejected", this.state.meetingsIRejected)
      }
      ))
      .then(() => {
        this.getMeetingsIsetPreferences();
      })
      .catch((error) => {
        console.warn(error);
      })
  }

  getMeetingsIsetPreferences() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/GetMeetingsISetPreferences?participantId=" + this.state.userInfo.Id;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        meetingsIsetPreferenceIds = [];
        response.map(meeting => {
          meetingsIsetPreferenceIds.push(meeting.Id)
        })
        this.setState({
          meetingsIsetPreferences: meetingsIsetPreferenceIds
        })
        //console.warn("meetingsIsetPreferences", this.state.meetingsIsetPreferences)
      }
      ))
      .then(() => {
        this.getMeetingsIWasInvited();
      })
      .catch((error) => {
        console.warn(error);
      })
  }

  getMeetingsIWasInvited() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participant/meetings?email=" + userToken + "&participantId=" + this.state.userInfo.Id;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          MeetingsIWasInvited: response
        })
        //console.warn("MeetingsIWasInvited", this.state.MeetingsIWasInvited)
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
      // .then(() => {
      //   console.warn("meetingsICreated", this.state.MeetingsICreated)
      // })
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

  checkMeetingParticipants(meetingId, participantsIdsArr) {
    this.state.meetingParticipants = [];
    this.state.allUsers.map((user) => {
      participantsIdsArr.map(p => {
        if (p == user.Id) {
          particiant = {
            Name: user.FirstName + " " + user.LastName + "    ",
            Id: user.Id
          }
          this.state.meetingParticipants.push(particiant)
        }
      })
    })

    //console.warn("meetingParticipants state", this.state.meetingParticipants)
    this.createApprovedArray(meetingId)
  }


  createApprovedArray(meetingId) {
    //console.warn("meeting ID", meetingId);
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
          //console.warn("participantsApprovedMeeting", this.state.participantsApprovedMeeting)
          // participantsApprovedArr = [];

          // for (var i = 0; i < this.state.meetingParticipants; i++) {
          //   for (var j = 0; j < this.state.participantsApprovedMeeting; j++) {
          //     if (meetingParticipants[i].Id == this.state.participantsApprovedMeeting[j].Id) {
          //       participantsApprovedArr[j] = "כן"
          //     }
          //     else participantsApprovedArr[j] = "לא"
          //   }
          // }
          // console.warn("participantsApprovedArr", participantsApprovedArr)
        }
        )
      }
      ))

      .then(() => {
        this.createInsertedPreferencesArray(meetingId);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  createInsertedPreferencesArray(meetingId) {  // get participants with their preferences - per meeting
    urlPreferencesMeeting = "http://proj.ruppin.ac.il/bgroup77/prod/api/meeting/GetPreferencesParticipantsByMeetingId?meetingId=" + meetingId;
    fetch(urlPreferencesMeeting, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          participantsInsertedPreferences: response
        })
      }))
      // .then(() => {
      //   console.warn("participantsInsertedPreferences", this.state.participantsInsertedPreferences);
      //   console.warn("meetingParticipants", this.state.meetingParticipants)
      // })
      .catch((error) => {
        console.log(error);
      })
  }


  onPressSetPreferencesButton(PassedMeetingID, passedPlaceType) {
    AsyncStorage.setItem("currentMeetingID", JSON.stringify(PassedMeetingID));
    AsyncStorage.setItem("currentPlaceType", JSON.stringify(passedPlaceType));
    this.props.navigation.navigate('Preferences');
  }

  onPressGetResultsButton(PassedMeetingID, passedPlaceType, passedPriceLevel) {
    // console.warn("PassedMeetingID", PassedMeetingID)
    // console.warn("passedPriceLevel", passedPriceLevel)
    AsyncStorage.setItem("currentMeetingID", JSON.stringify(PassedMeetingID));
    AsyncStorage.setItem("currentPlaceType", JSON.stringify(passedPlaceType));
    AsyncStorage.setItem("currentPriceLevel", JSON.stringify(passedPriceLevel));

    this.props.navigation.navigate('Results');
  }

  onApprovedButtonPress = (meetingId) => {
    var PreferenceParticipantMeetingLocation = {
      PreferenceId: 11,
      ParticipantId: this.state.userInfo.Id,
      MeetingId: meetingId,
      Address: '',
      Longitude: 1,
      Latitude: 1,
    };

    //console.warn("PreferenceParticipantMeetingLocation", PreferenceParticipantMeetingLocation);

    fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/PostAccept', {
      method: 'POST',
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(PreferenceParticipantMeetingLocation),
    })
      .then(response => {
        newMeetingsIApproved = this.state.meetingsIApproved
        newMeetingsIApproved.push(meetingId)
        this.setState({
          meetingsIApproved: newMeetingsIApproved
        })
        //console.warn("newMeetingsIApproved", this.state.meetingsIApproved)
      })
      .catch(error => console.warn('Error:', error.message));
  }

  onRejectButtonPress = (meetingId) => {
    //console.warn("meetingId:", meetingId)

    var JsonUpdateReject = {
      PreferenceId: 10,
      ParticipantId: this.state.userInfo.Id,
      MeetingId: meetingId,
      Address: '',
      Latitude: 1,
      Longitude: 1,
    };

    //console.warn("JsonUpdateReject", JsonUpdateReject);

    fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/PostDecline', {
      method: 'POST',
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(JsonUpdateReject),
    })
      .then(response => {
        newMeetingsIrejected = this.state.meetingsIRejected
        newMeetingsIrejected.push(meetingId)
        this.setState({
          meetingsIRejected: newMeetingsIrejected
        })
        //console.warn("newMeetingsIrejected", this.state.meetingsIrejected)
      })
      .catch(error => console.warn('Error:', error.message));
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
                  placeWasChosen = false;

                  //console.warn("meetingsIsetInfo", m)

                  this.state.meetingsIsetPreferences.map(meetingNum => {
                    if (m.Id == meetingNum) didSetPreferences = true;
                    if (m.LocationName != "") placeWasChosen = true
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

                        {/* {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                        {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                        {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                        {m.StatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>} */}
                        {
                          (placeWasChosen) &&
                          <Text>
                            <Text>המקום הנבחר לפגישה: </Text>
                            <Text style={{ fontWeight: 'bold' }}>{m.LocationName}</Text>
                          </Text>
                        }
                        <View>
                          <View style={styles.groupSmall}>
                            <TouchableOpacity
                              style={[styles.buttonSmall]}
                              onPress={() => {
                                this._handleButtonPress();
                                { this.checkMeetingParticipants(m.Id, m.Participants) }
                                // { this.createApprovedArray(m.Id) }
                                // { this.createInsertedPreferencesArray(m.Id) };
                              }}
                            >
                              <Text style={[styles.buttonText]}>סטטוס הגעת משתתפים</Text>
                            </TouchableOpacity>
                          </View>
                          <Dialog
                            width='0.8'
                            footer={
                              <DialogFooter>
                                <View style={styles.modalContainer}>
                                  <View style={styles.rowView}>
                                    <View style={styles.columnView}>
                                      <Text style={{ fontWeight: 'bold' }}>הוזמנו לפגישה    </Text>
                                      {this.state.meetingParticipants.map((p) => {
                                        return (
                                          <Text>{p.Name}</Text>)
                                      })}
                                    </View>
                                    <View style={styles.columnView}>
                                      <Text style={{ fontWeight: 'bold' }}>אישרו הגעה    </Text>
                                      {this.state.participantsApprovedMeeting.map((p) => {
                                        return (
                                          <Text>{p.FirstName + " " + p.LastName + "    "}</Text>)
                                      })}
                                    </View>
                                    <View style={styles.columnView}>
                                      <Text style={{ fontWeight: 'bold' }}>הזינו העדפות    </Text>
                                      {this.state.participantsInsertedPreferences.map((p) => {
                                        return (
                                          <Text>{p.FirstName + " " + p.LastName + "    "}</Text>)
                                      })}
                                    </View>
                                  </View>
                                  {/* <View style={styles.innerContainer}>
                                    <Text>המשתתפים שאישרו הגעה:</Text>
                                    {this.state.participantsApprovedMeeting.map((u, i) => {
                                      user = u.FirstName + " " + u.LastName;

                                      return (
                                        <Text key={i}>{user}</Text>
                                      );
                                    })}
                                    <Text>{"\n"}</Text>
                                    <Text>המשתתפים שהזינו העדפות:</Text>
                                    {this.state.participantsInsertedPreferences.map((u, i) => {
                                      user = u.FirstName + " " + u.LastName
                                      return (
                                        <Text key={i}>{user}</Text>
                                      );
                                    })}
                                  </View> */}
                                </View>
                              </DialogFooter>
                            }
                            dialogTitle={<DialogTitle title="סטטוס משתתפים" />}
                            dialogAnimation={new SlideAnimation({
                              slideFrom: 'bottom',
                            })}
                            overlayOpacity={0.1}
                            visible={this.state.modalVisible}
                            overlayBackgroundColor={"grey"}
                            onTouchOutside={() => {
                              this.setModalVisible(false)
                            }}
                          >
                          </Dialog>
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
                              disabled={placeWasChosen}
                              onPress={() => this.onPressGetResultsButton(m.Id, m.PlaceType, m.PriceLevel)}>
                              <Text style={[placeWasChosen ? styles.buttonTextDisabled : styles.buttonText]}>הרץ לקבלת תוצאות</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            }

            {//פגישות שזומתי
              (this.state.meetingsIWasInvitedOn == 1) &&
              <View style={styles.section}>
                {this.state.MeetingsIWasInvited.map((m, i) => {
                  didApprove = false;
                  didReject = false;
                  didSetPreferences = false;
                  placeWasChosen = false;

                  this.state.meetingsIApproved.map(meetingNum => {
                    if (m.Id == meetingNum) didApprove = true;
                  })
                  this.state.meetingsIRejected.map(meetingNum => {
                    if (m.Id == meetingNum) didReject = true;
                  })
                  this.state.meetingsIsetPreferences.map(meetingNum => {
                    if (m.Id == meetingNum) didSetPreferences = true;
                    if (m.LocationName != "") placeWasChosen = true
                  })

                  //console.warn("meetingsIsetPreferences", this.state.meetingsIsetPreferences)

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

                        {/* {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                        {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                        {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                        {m.SatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>} */}
                        {
                          (placeWasChosen) &&
                          <Text>
                            <Text>המקום הנבחר לפגישה: </Text>
                            <Text style={{ fontWeight: 'bold' }}>{m.LocationName}</Text>
                          </Text>
                        }

                        <View>
                          {
                            (didReject !== true) &&
                            <View>
                              {/* button: */}
                              <View style={styles.groupSmall}>
                                <TouchableOpacity
                                  disabled={didApprove}
                                  style={[styles.buttonSmall]}
                                  onPress={() => this.onApprovedButtonPress(m.Id)}
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
  rowView: {
    flexDirection: 'row'
  },
  columnView: {
    flexDirection: 'column'
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
