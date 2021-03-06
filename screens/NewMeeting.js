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
  Slider,
  Alert,
  AsyncStorage
} from 'react-native';
import { connect } from 'react-redux';
import { Constants } from 'expo';
import { Ionicons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import MyDatePicker from '../components/MyDatePicker';
import MyTimePicker from '../components/MyTimePicker';
// import GetUsers-draft1 from '../components/GetUsers';
// import ListView from '../components/ListView';
// import SearchBar from '../components/SearchBar';
import { setFilters } from '../modules/campings';
import { Input, Button, ListItem } from 'react-native-elements';
import { InputAutoSuggest } from 'react-native-autocomplete-search';
import { FlatList } from 'react-native-gesture-handler';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import Preferences from './PreferencesFromHomePage';

const { width, height } = Dimensions.get('screen');

class NewMeeting extends React.Component {
  constructor(props) {
    super(props);
    this.onSpecificAreaButtonPress = this.onSpecificAreaButtonPress.bind(this);
    this.notOnSpecificAreaButtonPress = this.notOnSpecificAreaButtonPress.bind(this);
  }

  static navigationOptions = {
    title: 'פגישה חדשה',
  };

  state = {
    sort: '',
    type: '',
    price: '',
    // option_full: true,
    // option_rated: true,
    // option_free: false,
    // sliderValue: 70,
    // minValue: 10,
    // maxValue: 100,
    specificAreaOn: false,
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    allUsers: [],
    specificArea: '',
    placeType: '',
    priceLevel: '2',
    notes: '',
    chosenParticipantIds: [],
    chosenParticipants: [],
    chosenMails: [],
    meetingId: 0
  }

  //get all users from DB
  async componentWillMount() {
    await this.getStorageValue();
  }

  getStorageValue = async () => {
    userInfo = JSON.parse(await AsyncStorage.getItem('userInfo'));
    this.setState({
      userInfo: userInfo,
      // firstName: userInfo.FirstName,
      // lastName: userInfo.LastName,
      // gender: userInfo.Gender,
      // email: userInfo.Email,
      // password: userInfo.Password,
      // address: userInfo.Address,
    })

    this.getUsersFromDB();
  };

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
      .catch((error) => {
        console.warn("error in getting users from DB");

        //setting 'allUsers' state with hard-coded users
        this.setState({
          allusers:
            [
              {
                Address: null,
                Email: "maayan1010@gmail.com",
                FirstName: "מעיין",
                Gender: 0,
                Id: 3,
                Image: null,
                LastName: "כהן",
                Password: null,
                Phone: null,
                Preferences: [1,]
              },
              {
                Address: null,
                Email: "aviel_iluz@gmail.com",
                FirstName: "אביאל",
                Gender: 0,
                Id: 1,
                Image: null,
                LastName: "אילוז",
                Password: null,
                Phone: null,
                Preferences: [1,],
              },
              {
                Address: null,
                Email: "shlomi@gmail.com",
                FirstName: "שלומי",
                Gender: 0,
                Id: 0,
                Image: null,
                LastName: "קוריאט",
                Password: null,
                Phone: null,
                Preferences: [1,],
              },
            ],
        })
      })
  }

  onSpecificAreaButtonPress = () => {
    this.setState({
      specificAreaOn: true
    });
  }

  notOnSpecificAreaButtonPress = () => {
    this.setState({
      specificAreaOn: false
    });
  }

  async sendNewMeetingInfo() {
    if (this.state.subject=="")
    alert("נא להזין נושא");

    else if (this.state.date=="")
    alert("נא להזין תאריך");

    else if (this.state.startTime=="")
    alert("נא להזין שעת התחלה");

    else if (this.state.startTime>this.state.endTime)
    alert("נא לבחור שעת סיום מאוחרת משעת התחלה");

    else if (this.state.chosenParticipantIds=="")
    alert("נא לבחור משתתפים לפגישה");

    else if (this.state.placeType=="")
    alert("נא לבחור סוג מקום מועדף לפגישה");
    
    else if (this.state.priceLevel=="")
    alert("נא לבחור רמת מחיר לפגישה");

    else {

    userInfo = JSON.parse(await AsyncStorage.getItem('userInfo'));
    //console.warn("user info", userInfo);

    var NewMeeting = {
      Subject: this.state.subject,
      StartDate: this.state.date,
      StartHour: this.state.startTime,
      EndHour: this.state.endTime,
      PriceLevel: this.state.priceLevel,
      SpecificLocation: this.state.specificArea,
      Notes: this.state.notes,
      Participants: this.state.chosenParticipantIds,
      PlaceType: this.state.placeType,
      CreatorEmail: userInfo.Email,
    };
    //console.warn(NewMeeting);

    fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/meeting', {
      method: 'POST',
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(NewMeeting),
    })
      .then(res => res.json())
      .then(response => {
        let meetingId = response;
        this.setState({
          meetingId: meetingId
        })
        AsyncStorage.setItem("currentMeetingID", JSON.stringify(meetingId));
      })
      // .then(() => {
      //   console.warn("meetingId from new meeting state", this.state.meetingId);
      // })
      .then(() => {
        AsyncStorage.setItem("currentPlaceType", JSON.stringify(this.state.placeType));
      })
      .then(() => {
        this.getToken();
      })
      .then(() => {
        Alert.alert(
          'הודעה',
          'פגישה נוצרה בהצלחה',
          [
            { text: 'לחץ להזנת העדפות', onPress: () => this.props.navigation.navigate('Preferences') },
            {
              text: 'ביטול',
              style: 'cancel',
            },
          ],
          { cancelable: false },
        );
      })

      //to return
      // .then(() => {
      //   chosenMails = []
      //   this.state.allUsers.map(user => {
      //     this.state.chosenParticipantIds.map(participant => {
      //       if (participant.Id == user.Id) chosenMails.push(user.Email)
      //     })
      //   })
      //   this.setState({
      //     chosenMails: chosenMails
      //   })
      //   console.warn("chosenMails", this.state.chosenMails)
      //   //add GetToken Call +  this.sendPushNotification as implemented in Dana's example
      // })

      .catch(error => console.warn('Error:', error.message));
  }
}



  getToken() {
    //will receive chosen participants mails array. will map
    //console.warn("meetingId sendNotifications", this.state.meetingId);
    fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/participant/GetToken?email=lihi@gmail.com', {
      method: 'GET',
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then(res => res.json())
      .then(response => {
        //console.warn("response from get token", response)
        this.sendPushNotification(response, "הוזמנת לפגישה חדשה");
      })
      .catch(error => console.warn('Error:', error.message));
  }

  sendPushNotification(Token, message) {
    //console.warn("token from sendPushNotification", Token)
    //console.warn("message", message)
    var pnd = {
      to: Token,
      title: message,
      body: '',
      badge: 1
    }
    fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/sendpushnotification', {
      body: JSON.stringify(pnd),
      method: 'POST',
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then(response => {
      })
      .catch(error => console.warn('Error:', error.message));
  }

  //show chosen participants
  renderChosenParticipants() {
    if (this.state.chosenParticipants != null) {
      return this.state.chosenParticipants.map((value) => {
        return (
          <View><Text style={styles.chosenParticipants}>{value.name}</Text></View>
        )
      })
    }
  }

  HandlePressRestaurant = () => {
    this.setState({
      placeType: 'restaurant'
    });
  };

  HandlePressCafe = () => {
    this.setState({
      placeType: 'cafe'
    });
  };

  HandlePressPub = () => {
    this.setState({
      placeType: 'pub'
    });
  };

  HandlePressLowPrice = () => {
    this.setState({
      priceLevel: '1'
    });
  };

  HandlePressMediumPrice = () => {
    this.setState({
      priceLevel: '2'
    });
  };

  HandlePressHighPrice = () => {
    this.setState({
      priceLevel: '3'
    });
  };

  render() {
    const {
      sort,
      type,
      price,
      // option_full,
      // option_rated,
      // option_free,
    } = this.props.filters;

    const activeType = (key) => type === key;

    //ceate data for autocomplete
    var i = 0;
    var name = '';

    if (this.state.allUsers !== null) {
      dataForAutocomplete = this.state.allUsers.map((user) => {
        if (userInfo.Email != user.Email) {
          userName = user.FirstName + " " + user.LastName
          return { id: user.Id, name: userName }
        }
      });
    }
    else {
      dataForAutocomplete = [
        {
          id: 3,
          name: 'מעיין כהן'
        },
        {
          id: 1,
          name: 'ליהי שפירא'
        },
        {
          id: 2,
          name: 'אביאל אילוז'
        },
      ]
    }
    //console.warn('all users:', this.state.allUsers);

    return (
      <SafeAreaView style={styles.container} >
        < ScrollView style={styles.container} >
          <View style={styles.section}>
            <View>
              <Text style={styles.title}>נושא הפגישה</Text>
            </View>
            <View>
              {<Input
                onChangeText={subject => this.setState({ subject })}
              />}
              {/* {console.warn(this.state.subject)} */}
            </View>
          </View>
          <View style={styles.section}>
            <View>
              <Text style={styles.title}>תאריך הפגישה</Text>
            </View>
            <View>
              <MyDatePicker onDateChange={(date) => { this.setState({ date: date }) }} />
            </View>
            {/* {console.warn(this.state.date)} */}
            <View>
              <Text style={styles.title}> שעת התחלה</Text>
            </View>
            <View>
              <MyTimePicker onDateChange={(time) => { this.setState({ startTime: time }) }} />
            </View>
            {/* {console.warn(this.state.startTime)} */}
            <View>
              <Text style={styles.title}> שעת סיום</Text>
            </View>
            <View>
              <MyTimePicker onDateChange={(time) => { this.setState({ endTime: time }) }} />
            </View>
            {/* {console.warn(this.state.endTime)} */}
          </View>
          <View >
            <View>
              <Text style={styles.title}>הוסף משתתפים לפגישה</Text>
            </View>
            <View>
              <InputAutoSuggest
                style={{ flex: 1 }}
                staticData={dataForAutocomplete}
                onDataSelectedChange={
                  chosenParticipant => {
                    if (chosenParticipant != null) {
                      this.setState({
                        chosenParticipants: [
                          ...this.state.chosenParticipants,
                          chosenParticipant
                        ]
                      })
                      this.setState({
                        chosenParticipantIds: [
                          ...this.state.chosenParticipantIds,
                          chosenParticipant.id,

                        ]
                      })
                    }
                  }}
              />
              {/* {console.warn('chosen participants details:', this.state.chosenParticipants)}
              {console.warn('chosen participants ids:', this.state.chosenParticipantIds)} */}
            </View>
            <View>
              {/* <ListView /> */}
              {/* <SearchBar /> */}
            </View>
          </View>
          <View style={styles.section}>
            <View><Text style={styles.title}>משתתפי הפגישה שנבחרו</Text></View>
            {this.renderChosenParticipants()}
          </View>
          {/* <View style={styles.section}>
            <View>
              <Text style={styles.title}>האם להתמקד בעיר מסוימת לפגישה?</Text>
            </View>
            <View style={styles.group}>
              <TouchableOpacity
                style={[styles.button, styles.first, sort === 'specificArea' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ sort: 'specificArea' }); this.onSpecificAreaButtonPress() }}
              >
                <Text style={[styles.buttonText, sort === 'specificArea' ? styles.activeText : null]}>כן</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.last, sort === 'notSpecificArea' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ sort: 'notSpecificArea' }); this.notOnSpecificAreaButtonPress() }}
              >
                <Text style={[styles.buttonText, sort === 'notSpecificArea' ? styles.activeText : null]}>לא</Text>
              </TouchableOpacity>
            </View>
            <View>
              {this.state.specificAreaOn && <Input onChangeText={specificArea => this.setState({ specificArea })} placeholder='הכנס אזור לפגישה' />}
            </View>
            <View>
            </View>
          </View> */}
          <View style={styles.section}>
            <View>
              <Text style={styles.title}>מה אני מחפש?</Text>
            </View>
            <View style={styles.group}>
              <TouchableOpacity
                style={[styles.button, styles.first, type === 'restaurant' ? styles.active : null]}

                onPress={() => { this.props.setFilters({ type: 'restaurant' }); { this.HandlePressRestaurant() } }}
              >
                <Text style={[styles.buttonText, type === 'restaurant' ? styles.activeText : null]}>מסעדה</Text>
              </TouchableOpacity>
              {/* {console.warn(this.state.placeType)} */}
              <TouchableOpacity
                style={[styles.button, type === 'coffe' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ type: 'coffe' }); { this.HandlePressCafe() } }}
              >
                <Text style={[styles.buttonText, type === 'coffe' ? styles.activeText : null]}>בית קפה</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.last, type === 'pub' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ type: 'pub' }); { this.HandlePressPub() } }}
              >
                <Text style={[styles.buttonText, type === 'pub' ? styles.activeText : null]}>פאב</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View>
              <Text style={styles.title}>רמת מחיר</Text>
            </View>
            <View style={styles.group}>
              <TouchableOpacity
                style={[styles.button, styles.first, price === '$' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ price: '$' }); { this.HandlePressLowPrice() } }}
              >
                <Text style={[styles.buttonText, price === '$' ? styles.activeText : null]}>$</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, price === '$$' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ price: '$$' }); { this.HandlePressMediumPrice() } }}
              >
                <Text style={[styles.buttonText, price === '$$' ? styles.activeText : null]}>$$</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.last, price === '$$$' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ price: '$$$' }); { this.HandlePressHighPrice() } }}
              >
                {/* {console.warn(this.state.priceLevel)} */}
                <Text style={[styles.buttonText, price === '$$$' ? styles.activeText : null]}>$$$</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>הערות</Text>
            {<Input
              onChangeText={notes => this.setState({ notes })}
            />}
          </View>
          <View>
            <Button
              // large
              // rightIcon={{ name: 'code' }}
              buttonStyle={{ backgroundColor: '#FF5A76' }}
              title="צור פגישה"
              onPress={() => this.sendNewMeetingInfo()}
            />
          </View>
        </ScrollView >
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

export default connect(moduleState, moduleActions)(NewMeeting);

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
  },
  chosenParticipants: {
    fontSize: 18,
    marginVertical: 2,
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
  colorGrey: {
    color: '#d3d3d3'
  },
  colorYellow: {
    color: 'rgb(252, 228, 149)'
  },
});
