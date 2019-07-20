
import React from 'react';
import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  SafeAreaView,
  AsyncStorage,
} from 'react-native';
//import { connect } from 'react-redux';
import { MapView } from 'expo';
import { Ionicons, FontAwesome, Foundation, SimpleLineIcons } from '@expo/vector-icons';
//import { Map, GoogleApiWrapper } from 'google-maps-react';

//import { setLocation, setFilters, setCampings } from '../modules/campings';
//import * as mock from '../mock/campings';

const { Marker } = MapView;
const { width, height } = Dimensions.get('screen');
var googleMapsClient = require('react-native-google-maps-services').createClient({
  key: 'AIzaSyC6KP6IjpwiP7jW1hsPJGF_YqSrqRaM_sM',

  Promise: Promise
});

export default class Results extends React.Component {
  static navigationOptions = {
    title: 'בחר מקום לפגישה',
  };

  constructor() {
    super();
    //setting global variables
    global.minSumDistances = 1000;
    global.minVariance = 1000;
    global.optimalPoint = [];
    global.allDestinationDistances = [];
    global.radius = 300;
    global.strKeywords = '';
    global.preferencesPerMeetingToSend = [];
    global.placeType = '';
    global.meetingPreferences = [];
    global.mostWantedFoodTypeIndexes = [];
    global.mostWantedFoodTypeNames = [];
    global.destinations = [];
    global.uniquePreferencesPerMeeting = [];
    global.priceLevel = 2;

    const wrappedCallback = (...args) => this.otherFunc(...args);
  }

  state = {
    currentMeetingID: 0,
    locationsdata: [],
    latList: [],
    lngList: [],
    originsLatLngArr: [],
    minSumDistances: 1000,
    minVariance: 1000,
    placesResults: [],
    status: 0,
    optimalPoint: [],
    statusOptimalPoint: 0,
    foodTypePreferenceExists: false,
    // optimalPoint: [],
    // preferencesPerMeetingToSend:[],
  }

  async componentDidMount() {
    await this.getStorageMeetingIDValue();
  }

  getStorageMeetingIDValue = async () => {
    const currentMeetingID = JSON.parse(await AsyncStorage.getItem('currentMeetingID'));
    this.setState({
      currentMeetingID: currentMeetingID
    })
    console.warn("CurrentMeetingId", this.state.currentMeetingID);

    global.placeType = JSON.parse(await AsyncStorage.getItem('currentPlaceType'));
    console.warn("placeType", global.placeType);

    global.priceLevel = JSON.parse(await AsyncStorage.getItem('currentPriceLevel'));
    console.warn("priceLevel", global.priceLevel);

    this.getOriginInfo();
    //this.getMeetingPreferences();
  };

  getOriginInfo() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/getLocationsByMeeting?meetingId=" + this.state.currentMeetingID;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        //ignore when locationId=1
        originsInfo = [];
        response.map(origin => {
          if (origin.Id != 1) originsInfo.push(origin)
        })
        this.setState({
          locationsdata: originsInfo
        })
      }
      ))
      .then(() => {
        console.warn("originsInfo", this.state.locationsdata)
        if (this.state.locationsdata.length == 0) alert("לא הוכנסו מקומות מוצא לפגישה. לא ניתן להביא תוצאות")
        else this.getLatLngArrays();
      })
      .catch((error) => {
        console.log(error);
      })
  }

  getLatLngArrays() {
    this.state.locationsdata.map((location) => {
      this.state.latList.push(location.Latitude);
      this.state.lngList.push(location.Longitude);
      this.state.originsLatLngArr.push({ lat: location.Latitude, lng: location.Longitude });
    });
    this.calcFirstCenterPoint();
  };

  calcFirstCenterPoint() {
    OriginPoints = {
      //Xarr and Yarr for calculating averages separately for X and Y
      LatList: this.state.latList,
      LngList: this.state.lngList
    }
    //console.warn("calcFirstCenterPoint-OriginPoints", OriginPoints);

    fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/algorithm/PutOriginPoints', {
      method: 'POST',
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(OriginPoints),
    })
      .then(res => res.json())
      .then(response => {
        centerPoint = response;
        console.warn("from server- center point: ", centerPoint);
        firstCenterPoint = { lat: centerPoint[0], lng: centerPoint[1] };
        // console.warn("first center point: ", firstCenterPoint);
      })
      .then(() => {
        // console.warn("centerPoint", centerPoint);
        allOptionalCenterPoints = this.generateRandomPoints(centerPoint, 0.005, 15);
        //console.warn("allOptionalCenterPoints", allOptionalCenterPoints);

        allOptionalCenterPoints.push(firstCenterPoint);
        //console.warn("allOptionalCenterPointsWithFirstCP", allOptionalCenterPoints);
        global.destinations = allOptionalCenterPoints;
        console.warn("destinations", global.destinations);
      })
      .then(() => {
        this.findDistances(allOptionalCenterPoints);
      })

      .catch(error => console.warn('Error:', error.message));
  }

  generateRandomPoints(centerPoint, radius, numOfPoints) {
    randomPointsArr = [];
    for (var i = 0; i < numOfPoints; i++) {
      r = radius * Math.sqrt(Math.random())
      theta = Math.random() * 2 * Math.PI
      point = {
        lat: centerPoint[0] + r * Math.cos(theta),
        lng: centerPoint[1] + r * Math.sin(theta)
      }
      randomPointsArr.push(point);
    }
    return randomPointsArr;
  }

  findDistances(destinations) {
    var sumDistances = 0;
    let distancesArr = [];
    console.warn("final originsLatLngArr", this.state.originsLatLngArr);

    googleMapsClient.distanceMatrix({
      origins: destinations,
      destinations: this.state.originsLatLngArr,
      // avoidHighways: false,
      // avoidTolls: false
    })
      .asPromise()
      .then((response) => {
        console.warn("response google matrix", response.json)
        this.findOptimalPoint(response);
      })
      .catch((err) => {
        console.warn("err distance matrix:", err);
      })
  }

  findOptimalPoint(response) {
    if (response) {
      originList = response.json.origin_addresses;
      destinationList = response.json.destination_addresses;
      console.warn('originList', originList); //google's Origins array, in actual-those are the destinations
      console.warn('destinationList', destinationList); //google's destinations, in actual-those are the origins

      //find the distance from the current center point to each origin point and display it on a div
      for (var i = 0; i < originList.length; i++) {
        flagZeroResults = 0;
        //console.warn("maayan " + i)
        sumDistances = 0;
        distancesArr = [];
        currentLatDest = global.destinations[i].lat
        currentLngDest = global.destinations[i].lng
        currentDest = [currentLatDest, currentLngDest];
        //console.warn("currentDest", currentDest);
        row = response.json.rows[i].elements; //google's Origins, in actual-those are the destinations
        //console.warn("row before exiting when zero res", row)
        row.map(row => {
          if (row.status != "OK") {
            flagZeroResults = 1;
            console.warn("flagZeroResults", flagZeroResults)
            //return false;
          }
        })

        if (flagZeroResults == 1) continue;

        //console.warn("row after exiting when zero res ", row)

        for (var j = 0; j < row.length; j++) { //elenets array
          // if (row[i].status != 'OK') continue;
          //add current distance to the DistancesSum and to the DistancesArr
          sumDistances += (row[j].distance.value) / 1000; //distance in km
          distancesArr.push((row[j].distance.value) / 1000);
          //console.warn("sumDistances", sumDistances);
          //console.warn("distancesArr", distancesArr);
        }
        currentVariance = CalcVariance(distancesArr); // varience of distances arr
        object = {
          sumDistances: sumDistances,
          distancesArr: distancesArr,
          currentVariance: currentVariance
        }
        //console.warn("object", object);
        //finding the optimalPoint: minimum distances sum && minimum variance - comparing current destination to past destinations
        if (object.sumDistances < global.minSumDistances && object.currentVariance < global.minVariance) {
          global.minSumDistances = object.sumDistances;
          global.minVariance = object.currentVariance;

          global.optimalPoint = currentDest;

          console.warn("optimal Point: ", global.optimalPoint);
          // console.warn("global minSumDistances: ", global.minSumDistances);
          //console.warn("global minVariance: ", global.minVariance);
        }
        global.allDestinationDistances.push(object);
      }
      //console.warn("allDestinationDistances", global.allDestinationDistances);
      this.getMeetingPreferences();
    }
  }

  getMeetingPreferences() {
    //getting preferences for google nearby places
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/get?meetingId=" + this.state.currentMeetingID;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        global.meetingPreferences = response
      }))
      .then(() => {
        console.warn("meetingPreferences", global.meetingPreferences);
      })
      .then(() => {
        this.PreferencesPerMeetingToSend();
      })

      .catch((error) => {
        console.warn("error from getMeetingPreferences", error);
      })
  }

  PreferencesPerMeetingToSend() { //creating an array to send as key word to google
    if (global.placeType == 'restaurant') {
      global.meetingPreferences.map((p) => {
        if (p.Name == 'kosher' || p.Name == 'accessibility' || p.Name == 'vegan' || p.Name == 'vegetarian')
          global.preferencesPerMeetingToSend.push(p.Name);
      });
      global.uniquePreferencesPerMeeting = [...new Set(global.preferencesPerMeetingToSend)];
      console.warn('uniqe preferencesPerMeetingToSend', global.uniquePreferencesPerMeeting);

      global.strKeywords += "'";

      //converting to str - will contain the keys for google places request
      global.uniquePreferencesPerMeeting.map((p) => {
        global.strKeywords += (p + " AND ");
      });

      global.meetingPreferences.map((p) => {
        if (p.Id == 5 || p.Id == 6 || p.Id == 7 || p.Id == 8)
          this.setState({
            foodTypePreferenceExists: true
          })
      });

      console.warn("foodTypePreferenceExists", this.state.foodTypePreferenceExists)
      if (this.state.foodTypePreferenceExists == true) {
        FindMostWantedFoodTypePerMeeting();
        console.warn("mostWantedFoodTypeIndexes", global.mostWantedFoodTypeIndexes);
        console.warn("mostWantedFoodTypeNames", global.mostWantedFoodTypeNames);
        if (global.mostWantedFoodTypeNames.length > 1) {
          global.strKeywords += "("
          for (var i = 0; i < global.mostWantedFoodTypeNames.length; i++) {//food types str
            global.strKeywords += global.mostWantedFoodTypeNames[i] + " OR ";
          }
          global.strKeywords = global.strKeywords.slice(0, -4);
          global.strKeywords += ")"
        }
        else {
          global.strKeywords += " " + global.mostWantedFoodTypeNames[0];
        }
        global.strKeywords += "'";
        console.warn('strKeywords', global.strKeywords);
      }
    }
    else if (global.placeType == 'cafe') {
      for (var i = 0; i < global.meetingPreferences.length; i++) {//insert general preferences
        if (global.meetingPreferences[i].Name == 'kosher' || global.meetingPreferences[i].Name == 'accessibility' || global.meetingPreferences[i].Name == 'vegan' || global.meetingPreferences[i].Name == 'vegetarian')
          global.preferencesPerMeetingToSend.push(global.meetingPreferences[i].Name);
      }
      global.uniquePreferencesPerMeeting = [...new Set(global.preferencesPerMeetingToSend)];
      console.warn('uniquePreferencesPerMeeting', global.uniquePreferencesPerMeeting);

      global.strKeywords += "'";

      //converting to str - will contain the keys for google places request
      global.uniquePreferencesPerMeeting.map((p) => {//preferences str
        global.strKeywords += (p + " AND ");
      });

      global.strKeywords = global.strKeywords.slice(0, -5);
      global.strKeywords += "'";
      console.warn('strKeywords', global.strKeywords);
    }
    else {// placeType = bar
      for (var i = 0; i < global.meetingPreferences.length; i++) {//insert general preferences
        if (global.meetingPreferences[i].Name == 'kosher' || global.meetingPreferences[i].Name == 'accessibility')
          global.preferencesPerMeetingToSend.push(global.meetingPreferences[i].Name);
      }
      global.uniquePreferencesPerMeeting = [...new Set(global.preferencesPerMeetingToSend)];
      console.warn('uniquePreferencesPerMeeting', global.uniquePreferencesPerMeeting);

      global.strKeywords += "'";

      //converting to str - will contain the keys for google places request
      global.uniquePreferencesPerMeeting.map((p) => {//preferences str
        global.strKeywords += (p + " AND ");
      });
      global.strKeywords = global.strKeywords.slice(0, -5);
      global.strKeywords += "'";

    }
    console.warn('strKeywords', global.strKeywords);
    this.generateRequest();
  }

  generateRequest() {
    console.warn("optimalPoint from generateReq", global.optimalPoint);

    googleMapsClient.placesNearby({
      language: 'iw',
      location: global.optimalPoint,
      // radius: global.radius,
      radius: 4000,
      minprice: global.priceLevel,
      maxprice: 2,
      keyword: global.priceLevel,
      keyword: global.strKeywords,
      type: global.placeType,
      // opennow: v.optional(v.boolean),
      // pagetoken: v.optional(v.string),
      // retryOptions: v.optional(utils.retryOptions),
      // timeout: v.optional(v.number),
      // region: v.optional(v.string)
    })
      .asPromise()
      .then((response) => {

        this.setState({
          placesResults: response.json,
          status: 1
        })
        if (this.state.placesResults.length == 0) alert('לא נמצאו מקומות עד 4 קילומטר מהנקודה האופטימלית')
      })
      .catch((err) => {
        console.warn("err placesNearby:", err);
      })
  }

  onPressChoosePlace(place) {
    console.warn("place", place)

    var JsonChoosePlace = {
      Address: place.vicinity,
      Latitude: place.geometry.location.lat,
      Longitude: place.geometry.location.lng,
      Name: place.name,
      MeetingId: this.state.currentMeetingID
    };

    console.warn("JsonChoosePlace", JsonChoosePlace);

    fetch('http://proj.ruppin.ac.il/bgroup77/prod/api/Location', {
      method: 'POST',
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(JsonChoosePlace),
    })
      .then(() => {
        Alert.alert(
          'הודעה',
          'המקום נבחר בהצלחה',
          [
            { text: 'לחץ למעבר לדף הבית', onPress: () => this.props.navigation.navigate('HomeScreen') },
            {
              text: 'ביטול',
              style: 'cancel',
            },
          ],
          { cancelable: false },
        );
      })
      .catch(error => console.warn('Error:', error.message));
  }

  renderMap() {
    return (
      <View style={styles.map}>
        <MapView
          style={{ flex: 1, height: height * 0.45 }}
          showsMyLocationButton
          region={{
            latitude: global.optimalPoint[0],
            longitude: global.optimalPoint[1],
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
        >
          {(this.state.status == 1) &&
            <Marker coordinate={{ //marker for center point
              latitude: global.optimalPoint[0],
              longitude: global.optimalPoint[1],
            }}
              title='מיקום אופטימלי'
            >
            </Marker>
          }
          {(this.state.status == 1) && console.log("places-res-from render", this.state.placesResults.results)}
          {(this.state.status == 1) && this.state.placesResults.results.map((place, i) => {
            //console.warn("place", place.name);

            // placeImg = ""
            // if (global.placeType == 'restaurant') img = 'https://images.rest.co.il/Customers/80020238/ab2b0ca29e4a4c74a98e7cfa5351fecd.jpg'
            // else if (global.placeType == 'cafe') img = ''
            // else if (global.placeType == 'pub') img = ''
            // console.warn("placeImg", placeImg);

            return (
              <Marker
                key={i}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng
                }}
                image={require('../assets/images/marker.png')}
                title={place.name}
              >
              </Marker>
            )
          })
          }
          <View>
          </View>
        </MapView>
        <View>
          {
            (this.state.status == 1) &&
            this.state.placesResults.results.map((place, i) => {
              //console.warn("place", place);
              return (
                <View key={i} style={styles.place}>
                  <ImageBackground
                    style={styles.placeImage}
                    imageStyle={styles.placeImage}
                    source={{ uri: 'https://images.rest.co.il/Customers/80020238/ab2b0ca29e4a4c74a98e7cfa5351fecd.jpg' }}
                  />
                  <View style={styles.placeDetails}>
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
                        {place.name}
                      </Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', }}>
                      <View style={styles.placeInfo}>
                        <FontAwesome name="star" color="#FFBA5A" size={12} />
                        <Text style={{ marginLeft: 4, color: '#FFBA5A' }}>דירוג: {place.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.placeInfo}>
                      <Ionicons name="md-pricetag" color="black" size={12} />
                      {place.price_level == 1 && <Text style={{ marginLeft: 4, color: 'black' }}>רמת מחיר: $</Text>}
                      {place.price_level == 2 && <Text style={{ marginLeft: 4, color: 'black' }}>רמת מחיר: $$</Text>}
                      {place.price_level == 3 && <Text style={{ marginLeft: 4, color: 'black' }}>רמת מחיר: $$$</Text>}
                    </View>
                    {/* button: */}
                    <View style={styles.groupSmall}>
                      <TouchableOpacity
                        style={[styles.buttonSmall]}
                        onPress={() => this.onPressChoosePlace(place)}
                      >
                        <Text style={[styles.buttonText]}>בחר מקום זה</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }


  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.container}>
          {this.renderMap()}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    top: 0,
    height: height * 0.15,
    width: width,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.15,
    paddingHorizontal: 14,
  },
  buttonSmall: {
    flex: 1,
    padding: 4,
    alignContent: 'center',
    alignItems: 'center',
  },
  groupSmall: {
    flexDirection: 'row',
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#5DBCD2',
    justifyContent: 'space-between',
  },
  place: {
    flex: 1,
    flexDirection: 'row',
    borderBottomColor: '#A5A5A5',
    borderBottomWidth: 0.5,
    padding: 20,
  },
  placeDetails: {
    flex: 2,
    paddingLeft: 20,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  placeImage: {
    width: width * 0.30,
    height: width * 0.20,
    borderRadius: 6,
  },
  myMarker: {
    zIndex: 2,
    width: 60,
    height: 60,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 83, 251, 0.2)'
  },
  myMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#3353FB'
  },
  title: {
    fontSize: 18,
    marginVertical: 14,
    // alignItems: 'flex-end'
  },
});

//calculate variance of numbers' array
function CalcVariance(values) {
  var avg = CalcAverage(values); //calculte avg of distances
  //console.log('avg', avg);
  var squareDiffs = values.map(function (value) {
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });
  var avgSquareDiff = CalcAverage(squareDiffs)
  return avgSquareDiff;
}

//calculate average of numbers' array
function CalcAverage(data) {
  var sum = 0, i;
  for (i = 0; i < data.length; i += 1) {
    sum += data[i];
  }
  avg = sum / data.length;
  return avg;
}

function FindMostWantedFoodTypePerMeeting() {
  //find the most wanted food type/s of the current meeting as its participants' preferences were returned from DB table - Participant_Preference_Meeting
  //and after translating it trought Preferences table.

  result = CountFoodTypesPerMeeting(global.meetingPreferences);
  var foodTypesPreferences = result[0];
  var foodTypesPreferencesCounts = result[1];
  global.mostWantedFoodTypeIndexes = multipleMax(foodTypesPreferencesCounts);

  for (var i = 0; i < global.mostWantedFoodTypeIndexes.length; i++) {
    global.mostWantedFoodTypeNames[i] = foodTypesPreferences[global.mostWantedFoodTypeIndexes[i]].Name;
  }
}

function CountFoodTypesPerMeeting(meetingPreferencesArr) {
  var a = [], b = [], prev;
  meetingPreferencesArr.sort(function (a, b) {
    return a.Id - b.Id;
  });
  for (var i = 0; i < meetingPreferencesArr.length; i++) {
    if (meetingPreferencesArr[i].Type == "food type") {
      if (meetingPreferencesArr[i].Id != 9) {
        if (meetingPreferencesArr[i].Id !== prev) {
          a.push(meetingPreferencesArr[i]);
          b.push(1);
        } else {
          b[b.length - 1]++;
        }
        prev = meetingPreferencesArr[i].Id;
      }
    }
  }
  return [a, b]; //returns array of 2 arrays - first arr (in '0' index)- contains all meeting food preferences ids, second (in '1' index)- contains the occurrences count of each meeting's preference
}

function multipleMax(arr) {
  var max = -Infinity;
  var maxValuesArr = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === max) {
      maxValuesArr.push(i);
    } else if (arr[i] > max) {
      maxValuesArr = [i];
      max = arr[i];
    }
  }
  return maxValuesArr;
}
