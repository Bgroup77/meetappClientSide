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
  Alert
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

const { width, height } = Dimensions.get('screen');

class NewMeeting extends React.Component {
  constructor(props) {
    super(props);
    this.onSpecificAreaButtonPress = this.onSpecificAreaButtonPress.bind(this);
    this.notOnSpecificAreaButtonPress = this.notOnSpecificAreaButtonPress.bind(this);
  }

  static navigationOptions = {
    header: null,
  };

  state = {
    sort: 'distance',
    type: 'all',
    price: 'free',
    option_full: true,
    option_rated: true,
    option_free: false,
    sliderValue: 70,
    minValue: 10,
    maxValue: 100,
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
  }

  //get all users from DB
  componentWillMount() {
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
        console.log("error in getting users");
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

  // getChosenParticipantsIDs() {

  // }

  sendNewMeetingInfo() {
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
    };
    console.warn(NewMeeting);

    fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/meeting', {
      method: 'POST',
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(NewMeeting),
    })
      .then(res => res.json())
      .then(response => {
      })

      .catch(error => console.warn('Error:', error.message));
    Alert.alert(
      'הודעה',
      'פגישה נוצרה בהצלחה',
      [
        { text: 'לחץ להזנת העדפות', onPress: () => this.props.navigation.navigate('Preferences') },
        {
          text: 'ביטול',
          onPress: () => console.warn('Cancel Pressed'),
          style: 'cancel',
        },

      ],
      { cancelable: false },
    );
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

  // componentDidMount() {
  //   url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participants";
  //   fetch(url, { method: 'GET' })
  //     .then(response => response.json())
  //     .then((response => this.setState({
  //       participants: response
  //     })))
  //     .then((res) => {
  //       console.warn("participants from api")
  //     }
  //     )
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   this.state.participants.map((user) => {

  //     this.state.emails.push(user.Email)

  //   });
  // }

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

  // GetUsers = (emails) => {
  //   this.setState({
  //     emails: emails
  //   });
  //   console.warn("emails: ", emails);
  // };

  // onPressSend() {

  //   fetch('../api/meeting', {
  //     method: 'POST',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       Subject: this.state.subject,
  //       // secondParam: 'yourOtherValue',
  //     }),
  //   }).then((res) => res.json())
  //     .then((data) => console.log(data))
  //     .catch((err) => console.log(err))
  // }

  renderHeader() {
    return (
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('')}>
            <Ionicons name="md-arrow-back" size={24} />
          </TouchableOpacity> */}
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>פגישה חדשה</Text>
        </View>
      </View>
    )
  }

  render() {
    const {
      sort,
      type,
      price,
      option_full,
      option_rated,
      option_free,
    } = this.props.filters;

    const activeType = (key) => type === key;

    //ceate data for autocomplete
    var i = 0;
    var name = '';

    if (this.state.allUsers !== null) {
      dataForAutocomplete = this.state.allUsers.map((user) => {
        // i++;
        userName = user.FirstName + " " + user.LastName
        return { id: user.Id, name: userName }
      });
    }
    else {
      this.setState({
        allusers:
          [
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
    }
    console.warn('all users:', this.state.allUsers);

    return (
      <SafeAreaView style={styles.container} >
        {this.renderHeader()}
        < ScrollView style={styles.container} >
          {/* <View style={styles.section}> */}
          <View>
            <Text style={styles.title}>נושא הפגישה</Text>
          </View>
          <View>
            {<Input
              onChangeText={subject => this.setState({ subject })}
            />}
            {console.warn(this.state.subject)}
          </View>
          <View style={styles.section}>
            <View>
              <Text style={styles.title}>תאריך הפגישה</Text>
            </View>
            <View>
              <MyDatePicker onDateChange={(date) => { this.setState({ date: date }) }} />
            </View>
            {console.warn(this.state.date)}
            <View>
              <Text style={styles.title}> שעת התחלה</Text>
            </View>
            <View>
              <MyTimePicker onDateChange={(time) => { this.setState({ startTime: time }) }} />
            </View>
            {console.warn(this.state.startTime)}
            <View>
              <Text style={styles.title}> שעת סיום</Text>
            </View>
            <View>
              <MyTimePicker onDateChange={(time) => { this.setState({ endTime: time }) }} />
            </View>
            {console.warn(this.state.endTime)}
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
              {console.warn('chosen participants details:', this.state.chosenParticipants)}
              {console.warn('chosen participants ids:', this.state.chosenParticipantIds)}
            </View>
            <View>
              {/* <ListView /> */}
              {/* <SearchBar /> */}
            </View>
          </View>
          <View style={styles.section}>
            <View><Text style={styles.title}>:המשתתפים שנבחרו לפגישה</Text></View>
            {this.renderChosenParticipants()}
          </View>
          {/* {console.warn(this.state.allUsers)} */}
          {/* {console.warn(this.state.emails)} */}
          <View style={styles.section}>
            <View>
              <Text style={styles.title}>? האם להתמקד בעיר מסוימת לפגישה</Text>
            </View>
            <View style={styles.group}>
              <TouchableOpacity
                style={[styles.button, styles.first, sort === 'specificArea' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ sort: 'specificArea' }); this.onSpecificAreaButtonPress() }}
              >
                <Text style={[styles.buttonText, sort === 'specificArea' ? styles.activeText : null]}>כן</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, sort === 'notSpecificArea' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ sort: 'notSpecificArea' }); this.notOnSpecificAreaButtonPress() }}
              >
                <Text style={[styles.buttonText, sort === 'notSpecificArea' ? styles.activeText : null]}>לא</Text>
              </TouchableOpacity>
            </View>
            <View>
              {this.state.specificAreaOn && <Input onChangeText={specificArea => this.setState({ specificArea })} placeholder='הכנס אזור לפגישה' />}
            </View>
            {console.warn(this.state.specificArea)}
            <View>
            </View>
          </View>
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
              {console.warn(this.state.placeType)}
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
                style={[styles.button, styles.last, price === '$' ? styles.active : null]}
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
                style={[styles.button, price === '$$$' ? styles.active : null]}
                onPress={() => { this.props.setFilters({ price: '$$$' }); { this.HandlePressHighPrice() } }}
              >
                {console.warn(this.state.priceLevel)}
                <Text style={[styles.buttonText, price === '$$$' ? styles.activeText : null]}>$$$</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text style={styles.title}>הערות</Text>
          </View>
          <View>
            {<Input
              onChangeText={notes => this.setState({ notes })}
            />}
            {console.warn(this.state.notes)}
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
