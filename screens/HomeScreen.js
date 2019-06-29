import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage
} from 'react-native';
import { WebBrowser } from 'expo';
import { connect } from 'react-redux';
import { setFilters } from '../modules/campings';
import { Card, ListItem, Button, Icon, List, FlatList } from 'react-native-elements';

class HomeScreen extends React.Component {

  constructor(props) {
    super(props);
    this.onMeetingsCreatedButton = this.onMeetingsCreatedButton.bind(this);
    this.onMeetingsInvitedButton = this.onMeetingsInvitedButton.bind(this);

    this.state = {
      MeetingsIWasInvited: [],
      MeetingsICreated: [],
      email: '',
      userInfo: [],
      currentMeetingID: 0,
      meetingsIWascreatedOn: 0,
      meetingsIWasInvitedOn: 0,
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

  render() {
    const {
      sort,
      // type,
      // price,
    } = this.props.filters;

    const activeType = (key) => type === key;
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                require('../assets/images/logo.png')
              }
              style={styles.welcomeImage}
            />
          </View>
          <View style={styles.helloContainer}>
            <TouchableOpacity >
              <Text style={styles.helloText} >היי {this.state.userInfo.FirstName}</Text>
            </TouchableOpacity>


            <View style={styles.group}>
              <TouchableOpacity
                style={[styles.button, styles.first, sort === 'created' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ sort: 'created' }); this.onMeetingsCreatedButton() }}
              >
                <Text style={[styles.buttonText, sort === 'created' ? styles.activeText : null]}>פגישות שיזמתי</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, sort === 'invited' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ sort: 'invited' }); this.onMeetingsInvitedButton() }}
              >
                <Text style={[styles.buttonText, sort === 'invited' ? styles.activeText : null]}>פגישות שזומנתי</Text>
              </TouchableOpacity>
            </View>

            {(this.state.meetingsIWascreatedOn == 1) &&
              <View style={styles.section}>
                {this.state.MeetingsICreated.map((m, i) => {
                  return (
                    <Card key={i} title={m.Subject} >
                      <View key={i}>
                        {/* <Text>{console.warn(this.props.meetingID)}</Text> */}
                        {/* {this.setState({ currentMeetingID: m.Id })} */}
                        {/* {console.warn("currentMeetingID", this.state.currentMeetingID)} */}
                        <Text> שעה:   {m.StartHour} </Text>
                        <Text> תאריך:   {m.StartDate} </Text>
                        <Text> הערות:   {m.Notes} </Text>

                        {m.PlaceType == "restaurant" && <Text> סוג מקום: מסעדה   </Text>}
                        {m.PlaceType == "cafe" && <Text> סוג מקום: בית קפה   </Text>}
                        {m.PlaceType == "pub" && <Text> סוג מקום: פאב   </Text>}

                        {/* {console.warn('status id:', m.StatusID)} */}
                        {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                        {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                        {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                        {m.StatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>}
                        <View>
                          <Button
                            // large
                            type="outline"
                            raised={true}
                            // buttonStyle={{ backgroundColor: '#BEE4ED' }}
                            // borderRadius='10'
                            // borderColor='#fff'
                            title="הזן העדפות לפגישה"
                            // onPress={() => this.props.navigation.navigate('Preferences')}
                            onPress={() => this.onPressSetPreferencesButton(m.Id, m.PlaceType)}
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
                            onPress={() => this.onPressGetResultsButton(m.Id, m.PlaceType)}
                          />
                          {/* {console.warn(m.Id)} */}
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            }

            {/* <TouchableOpacity>
              <Text > הפגישות אליהן זומנת:</Text>
            </TouchableOpacity> */}
            {(this.state.meetingsIWasInvitedOn == 1) &&
              <View style={styles.section}>
                {this.state.MeetingsIWasInvited.map((m, i) => {
                  return (
                    <Card key={i} title={m.Subject} >
                      <View key={i}>
                        <Text> שעה:   {m.StartHour} </Text>
                        <Text> תאריך:   {m.StartDate} </Text>
                        <Text> הערות:   {m.Notes} </Text>
                        <Text> סוג מקום:   {m.PlaceType} </Text>
                        {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                        {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                        {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                        {m.SatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>}
                        <View>
                          <Button
                            // large
                            // buttonStyle={{ backgroundColor: '#FF5A76' }}
                            type="outline"
                            raised={true}
                            // buttonStyle={{ backgroundColor: '#BEE4ED' }}
                            // borderRadius='10'
                            // borderColor='#fff'
                            title="הזן העדפות לפגישה"
                            // onPress={() => this.props.navigation.navigate('Preferences')}
                            onPress={() => this.onPressSetPreferencesButton(m.Id, m.PlaceType)}
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
                            onPress={() => this.onPressGetResultsButton(m.Id, m.PlaceType)}
                          />
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            }
            <View >
              <Button
                large
                buttonStyle={{ backgroundColor: '#FF5A76' }}
                title="יצירת פגישה חדשה"
                onPress={() => this.props.navigation.navigate('NewMeetingStack')}
              />
            </View>
          </View>
        </ScrollView>
      </View>
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
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 10,
  },
  helloText: {
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
  section: {
    flexDirection: 'column',
    marginHorizontal: 14,
    marginBottom: 14,
    paddingBottom: 24,
    borderBottomColor: '#EAEAED',
    borderBottomWidth: 1,
  },
});
