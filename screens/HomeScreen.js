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

    this.state = {
      meetings: [],
      email: ''
      // id: 0,
      // subject: '',
      // date: '',
      // startTime: '',
      // endTime: '',
      // specificLocation: '',
      // note: '',
      // participants: [],
      // placeId: 0,
      // placeName: '',
    };
  }

  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    // email = AsyncStorage.getItem("email");
    // this.setState.email(email);
    // AsyncStorage.getItem('email')
    //   .then((email) => {
    //     this.setState({
    //       email: email
    //     })
    //   })
    //email should be taken from local storage
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participant/meetings?email=maayan1010@gmail.com";
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          meetings: response
        })
        console.warn(this.state.meetings)
      }

      ))
      // .then(() => {
      //   this.getMeetings();
      // })

      .catch((error) => {
        console.log(error);
      })
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
              <Text style={styles.helpLinkText}>היי בני, פגישותיך הקרובות :</Text>
            </TouchableOpacity>
            <View style={styles.section}>
              {this.state.meetings.map((m, i) => {
                return (
                  <Card key={i} title={m.Subject}>
                    <Text> שעה:   {m.StartHour} </Text>
                    <Text> תאריך:   {m.StartDate} </Text>
                    {console.warn(m.StartDate)}
                    <Text> הערות:   {m.Notes} </Text>
                    {m.StatusID == 1 && <Text> סטאטוס: ממתין להזנת העדפות </Text>}
                    {m.StatusID == 2 && <Text> סטאטוס: ממתין לבחירת מקום </Text>}
                    {m.StatusID == 3 && <Text>סטאטוס: פגישה עתידית</Text>}
                    {m.StatusID == 4 && <Text>סטאטוס: פגישת עבר</Text>}
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
