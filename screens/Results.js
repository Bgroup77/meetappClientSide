
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
  Alert
} from 'react-native';
import { MapView } from 'expo';
import { Ionicons, FontAwesome, Foundation, SimpleLineIcons } from '@expo/vector-icons';

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
    //console.warn("CurrentMeetingId", this.state.currentMeetingID);

    global.placeType = JSON.parse(await AsyncStorage.getItem('currentPlaceType'));
    //console.warn("placeType", global.placeType);

    global.priceLevel = JSON.parse(await AsyncStorage.getItem('currentPriceLevel'));
    //console.warn("priceLevel", global.priceLevel);

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
        //console.warn("originsInfo", this.state.locationsdata)
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
        //console.warn("from server- center point: ", centerPoint);
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
        //console.warn("destinations", global.destinations);
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
    //console.warn("final originsLatLngArr", this.state.originsLatLngArr);

    googleMapsClient.distanceMatrix({
      origins: destinations,
      destinations: this.state.originsLatLngArr,
      // avoidHighways: false,
      // avoidTolls: false
    })
      .asPromise()
      .then((response) => {
        //console.warn("response google matrix", response.json)
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
      //('originList', originList); //google's Origins array, in actual-those are the destinations
      //console.warn('destinationList', destinationList); //google's destinations, in actual-those are the origins

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

          //console.warn("optimal Point: ", global.optimalPoint);
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
      // .then(() => {
      //   console.warn("meetingPreferences", global.meetingPreferences);
      // })
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
      //console.warn('uniqe preferencesPerMeetingToSend', global.uniquePreferencesPerMeeting);

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

      //console.warn("foodTypePreferenceExists", this.state.foodTypePreferenceExists)
      if (this.state.foodTypePreferenceExists == true) {
        FindMostWantedFoodTypePerMeeting();
        //console.warn("mostWantedFoodTypeIndexes", global.mostWantedFoodTypeIndexes);
        //console.warn("mostWantedFoodTypeNames", global.mostWantedFoodTypeNames);
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
        //console.warn('strKeywords', global.strKeywords);
      }
    }
    else if (global.placeType == 'cafe') {
      for (var i = 0; i < global.meetingPreferences.length; i++) {//insert general preferences
        if (global.meetingPreferences[i].Name == 'kosher' || global.meetingPreferences[i].Name == 'accessibility' || global.meetingPreferences[i].Name == 'vegan' || global.meetingPreferences[i].Name == 'vegetarian')
          global.preferencesPerMeetingToSend.push(global.meetingPreferences[i].Name);
      }
      global.uniquePreferencesPerMeeting = [...new Set(global.preferencesPerMeetingToSend)];
      //console.warn('uniquePreferencesPerMeeting', global.uniquePreferencesPerMeeting);

      global.strKeywords += "'";

      //converting to str - will contain the keys for google places request
      global.uniquePreferencesPerMeeting.map((p) => {//preferences str
        global.strKeywords += (p + " AND ");
      });

      global.strKeywords = global.strKeywords.slice(0, -5);
      global.strKeywords += "'";
      //console.warn('strKeywords', global.strKeywords);
    }
    else {// placeType = bar
      for (var i = 0; i < global.meetingPreferences.length; i++) {//insert general preferences
        if (global.meetingPreferences[i].Name == 'kosher' || global.meetingPreferences[i].Name == 'accessibility')
          global.preferencesPerMeetingToSend.push(global.meetingPreferences[i].Name);
      }
      global.uniquePreferencesPerMeeting = [...new Set(global.preferencesPerMeetingToSend)];
      //console.warn('uniquePreferencesPerMeeting', global.uniquePreferencesPerMeeting);

      global.strKeywords += "'";

      //converting to str - will contain the keys for google places request
      global.uniquePreferencesPerMeeting.map((p) => {//preferences str
        global.strKeywords += (p + " AND ");
      });
      global.strKeywords = global.strKeywords.slice(0, -5);
      global.strKeywords += "'";

    }
    //console.warn('strKeywords', global.strKeywords);
    this.generateRequest();
  }

  generateRequest() {
    //console.warn("optimalPoint from generateReq", global.optimalPoint);

    googleMapsClient.placesNearby({
      language: 'iw',
      location: global.optimalPoint,
      // radius: global.radius,
      radius: 5000,
      minprice: global.priceLevel,
      maxprice: 2,
      keyword: global.priceLevel,
      keyword: global.strKeywords,
      type: global.placeType,
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
    //console.warn("place", place)
    AsyncStorage.setItem("businessDetails", JSON.stringify(place));

    var JsonChoosePlace = {
      Address: place.vicinity,
      Latitude: place.geometry.location.lat,
      Longitude: place.geometry.location.lng,
      Name: place.name,
      MeetingId: this.state.currentMeetingID
    };

    //console.warn("JsonChoosePlace", JsonChoosePlace);

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
            { text: 'חזרה לדף הבית', style: 'cancel', onPress: () => this.props.navigation.navigate('HomeScreen') },
            // { text: 'פרטי המקום', onPress: () => this.props.navigation.navigate('BusinessDetails') },
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

            img = ""
            if (global.placeType == 'restaurant') img = 'https://image.shutterstock.com/image-vector/black-restaurant-logo-260nw-787714876.jpg'
            else if (global.placeType == 'cafe') img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw6XZOP5ripT0Z243mUCdpZQinPzNdCEaA3UbyiNF03cLeI8nF'
            else if (global.placeType == 'pub') img = 'data:image/jpeg;base64,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'
            //console.warn("img", img);

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
                    source={{ uri: img }}
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
