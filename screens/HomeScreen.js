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

// import { MonoText } from '../components/StyledText';
import { Card, ListItem, Button, Icon, List, FlatList } from 'react-native-elements';

export default class HomeScreen extends React.Component {

  constructor(props) {
    super(props);
    // global.userToken = '';
    // this.getStorageValue();

    this.state = {
      meetings: [],
      email: '',
      userInfo: '',
      // cardMeetingID: 0,
      currentMeetingID: 0,
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
    //userToken = JSON.parse(userToken);
    console.warn(userToken);
    this.getMeetings();
  };

  getMeetings() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participant/meetings?email=" + userToken;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          meetings: response
        })
      }
      ))
      .then(() => {
        this.getUserInfo();
      })
      .catch((error) => {
        console.log(error);
      })

  }

  getUserInfo() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participant/details?mail=" + userToken;
    console.warn(url);
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          userInfo: response
        }, () => {
          console.warn("user info from state", this.state.userInfo);
          AsyncStorage.setItem("userInfo", this.state.userInfo);
        })
      }
      ))

      .catch((error) => {
        console.log(error);
      })

  }

  async componentDidMount() {
    await this.getStorageValue();
    // this.getMeetings();
    // this.getUserInfo(); //TBD- not working, need to fix get user info method
  }


  onPressSetPreferencesButton(PassedMeetingID) {
    var meetingID = PassedMeetingID
    AsyncStorage.setItem("currentMeetingID", JSON.stringify(meetingID));
    this.props.navigation.navigate('Preferences');
  }

  render() {
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
              <Text style={styles.helpLinkText} >היי {this.state.userInfo.FirstName}, פגישותייך הקרובות:</Text>
            </TouchableOpacity>
            <View style={styles.section}>
              {this.state.meetings.map((m, i) => {
                //save meeting id in state as card property. later-property will be taken from the card
                return (
                  <Card key={i} title={m.Subject} >
                    <View key={i}>
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
                          // buttonStyle={{ backgroundColor: '#FF5A76' }}
                          type="outline"
                          raised={true}
                          // buttonStyle={{ backgroundColor: '#BEE4ED' }}
                          // borderRadius='10'
                          // borderColor='#fff'
                          title="הזן העדפות לפגישה"
                          // onPress={() => this.props.navigation.navigate('Preferences')}
                          onPress={() => this.onPressSetPreferencesButton(m.Id)}
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
    );
  }
}

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
});
