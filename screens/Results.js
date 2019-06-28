
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
import { connect } from 'react-redux';
import { MapView } from 'expo';
import { Ionicons, FontAwesome, Foundation, SimpleLineIcons } from '@expo/vector-icons';
//import { Map, GoogleApiWrapper } from 'google-maps-react';

import { setLocation, setFilters, setCampings } from '../modules/campings';
import * as mock from '../mock/campings';

const { Marker } = MapView;
const { width, height } = Dimensions.get('screen');
var googleMapsClient = require('react-native-google-maps-services').createClient({
  key: 'AIzaSyAQJQRnhGCQj_MLfWgIIaeaPni4Vzw2eMI',
  Promise: Promise
});

class Results extends React.Component {

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
    // optimalPoint: [],
    // preferencesPerMeetingToSend:[],
  }

  async componentDidMount() {
    await this.getStorageMeetingIDValue();

    //after there are results
    // this.props.setCampings(mock.campings);
  }

  getStorageMeetingIDValue = async () => {
    const currentMeetingID = JSON.parse(await AsyncStorage.getItem('currentMeetingID'));
    this.setState({
      currentMeetingID: currentMeetingID
    })
    console.warn("CurrentMeetingId", this.state.currentMeetingID);
    global.placeType = JSON.parse(await AsyncStorage.getItem('currentPlaceType'));

    console.warn("placeType", global.placeType);
    this.getOriginInfo();
    //this.getMeetingPreferences();
  };

  getOriginInfo() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/PreferenceParticipantMeetingLocation/getLocationsByMeeting?meetingId=" + this.state.currentMeetingID;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => {
        this.setState({
          locationsdata: response
        })
      }
      ))
      .then(() => {
        this.getLatLngArrays();
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
        // console.warn("response center point: ", centerPoint);
        firstCenterPoint = { lat: centerPoint[0], lng: centerPoint[1] };
        // console.warn("first center point: ", firstCenterPoint);
      })
      .then(() => {
        // console.warn("centerPoint", centerPoint);
        allOptionalCenterPoints = this.generateRandomPoints(centerPoint, 0.5, 2);
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
    //console.warn("destinations", destinations);
    //console.warn("this.state.originsLatLngArr", this.state.originsLatLngArr);
    //console.warn("final dest", destinations);
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
      //console.warn("response", response)
      originList = response.json.origin_addresses;
      destinationList = response.json.destination_addresses;
      console.warn('originList', originList); //google's Origins array, in actual-those are the destinations
      console.warn('destinationList', destinationList); //google's destinations, in actual-those are the origins

      //find the distance from the current center point to each origin point and display it on a div

      for (var i = 0; i < originList.length; i++) {
        flagZeroResults = 0;
        console.warn("maayan " + i)
        sumDistances = 0;
        distancesArr = [];
        currentLatDest = global.destinations[i].lat
        currentLngDest = global.destinations[i].lng
        currentDest = [currentLatDest, currentLngDest];
        //console.warn("currentDest", currentDest);
        row = response.json.rows[i].elements; //google's Origins, in actual-those are the destinations
        console.warn("row before exiting when zero res", row)
        row.map(row => {
          if (row.status != "OK") {
            flagZeroResults = 1;
            console.warn("flagZeroResults", flagZeroResults)
            //return false;
          }
        })

        if (flagZeroResults == 1) continue;

        console.warn("row after exiting when zero res ", row)

        // row.map(row => {
        //   if (row.status != 'OK')
        //     continue;
        // })


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
        console.warn("object", object);
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
    //console.warn('strKeywords from PreferencesPerMeetingToSend', global.strKeywords);
    this.generateRequest();
  }

  // generateRequest() {
  //   console.warn("inside generateRequest");

  //   optimalPointHardCoded = {
  //     lat: 32.1554945,
  //     lng: 34.89788340000007
  //   }
  //   console.warn("optimalPointHardCoded", optimalPointHardCoded);

  //   // request = {
  //   //   location: global.optimalPoint,
  //   //   radius: global.radius,
  //   //   types: global.placeType,
  //   //   keyword: global.strKeywords
  //   //   //keyword: 'vegan AND accessibility AND kosher AND (italian OR asian)'
  //   // };
  //   // 

  //   googleMapsClient.places({
  //     // language: 'iw',
  //     // location: global.optimalPoint,
  //     location: {
  //       lat: 32.1554945,
  //       lng: 34.89788340000007
  //     },
  //     // radius: global.radius,
  //     radius: 500,
  //     // minprice: 2,
  //     // maxprice: 2,
  //     keyword: 'vegan AND accessibility',
  //     //keyword: global.strKeywords
  //     //type: global.placeType,

  //     // opennow: v.optional(v.boolean),
  //     // pagetoken: v.optional(v.string),
  //     // retryOptions: v.optional(utils.retryOptions),
  //     // timeout: v.optional(v.number),
  //     // region: v.optional(v.string)
  //   })
  //     .asPromise()
  //     .then((response) => {
  //       console.warn("resonse placesNearby", response.json)
  //     })

  //     .catch((err) => {
  //       console.warn("err placesNearby:", err);
  //     })

  // }

  generateRequest() {
    console.warn("optimalPoint from generateReq", global.optimalPoint);

    googleMapsClient.placesNearby({
      // language: 'iw',
      location: global.optimalPoint,
      // radius: global.radius,
      radius: 4000,
      // minprice: 2,
      // maxprice: 2,
      //keyword: '',
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

      })
      .catch((err) => {
        console.warn("err placesNearby:", err);
      })
  }

  handleTab = (tabKey) => {
    this.props.setFilters({ type: tabKey });
  }

  // renderMap() {
  //   const campingMarker = ({ type }) => (
  //     <View style={[styles.marker, styles[`${type}Marker`]]}>

  //       <FontAwesome name="map-marker" size={18} color="#FFF" />
  //       {/* : <Foundation name="mountains" size={18} color="#FFF" /> */}

  //     </View>
  //   )
  //   const { filters, campings } = this.props;
  //   const mapSpots = filters.type === 'all' ? campings
  //     : campings.filter(camping => camping.type === filters.type);

  //   return (
  //     <View style={styles.map}>
  //       <MapView
  //         style={{ flex: 1, height: height * 0.35, width }}
  //         showsMyLocationButton
  //         initialRegion={{
  //           latitude: 32.304190,
  //           longitude: 34.871150,
  //           latitudeDelta: 0.01,
  //           longitudeDelta: 0.01,
  //         }}
  //       >
  //         <Marker coordinate={this.props.mylocation}>
  //           <View style={styles.myMarker}>
  //             <View style={styles.myMarkerDot} />
  //           </View>
  //         </Marker>

  //         {mapSpots.map(marker => (
  //           <Marker
  //             key={`marker-${marker.id}`}
  //             coordinate={marker.latlng}
  //           >
  //             {campingMarker(marker)}
  //           </Marker>
  //         ))}
  //       </MapView>
  //     </View>
  //   )
  // }

  renderMap() {
    return (
      <View style={styles.map}>
        <MapView
          style={{ flex: 1, height: height * 0.45, width }}
          showsMyLocationButton
          region={{
            latitude: global.optimalPoint[0],
            longitude: global.optimalPoint[1],
            // latitude: 32.1554945,
            // longitude: 34.89788340000007,
            latitudeDelta: 0.3,
            longitudeDelta: 0.3,
          }}
        >
          {/* <Marker coordinate={{ //marker for center point
            // latitude: 32.1554945,
            // longitude: 34.89788340000007,
            latitude: global.optimalPoint[0],
            longitude: global.optimalPoint[1],
          }}
            // image={require('../assets/images/marker.png')}
            title='מיקום אופטימלי'
          >
          </Marker> */}
          {console.warn("places-res-from render", this.state.placesResults.results)}
          {(this.state.status == 1) && this.state.placesResults.results.map((place, i) => {
            //console.warn("place", place.name);
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
        </MapView>
      </View >
    )
  }

  renderTabs() {
    const { filters } = this.props;

    return (
      <View style={styles.tabs}>
        <View
          style={[
            styles.tab,
            filters.type === 'all' ? styles.activeTab : null
          ]}
        >
          <Text
            style={[
              styles.tabTitle,
              filters.type === 'all' ? styles.activeTabTitle : null
            ]}
            onPress={() => this.handleTab('all')}
          >
            כל המקומות
          </Text>
        </View>
        <View
          style={[
            styles.tab,
            filters.type === 'tent' ? styles.activeTab : null
          ]}
        >
          <Text
            style={[
              styles.tabTitle,
              filters.type === 'tent' ? styles.activeTabTitle : null
            ]}
            onPress={() => this.handleTab('tent')}
          >
            איכותי
          </Text>
        </View>
        <View
          style={[
            styles.tab,
            filters.type === 'rv' ? styles.activeTab : null
          ]}
        >
          <Text
            style={[
              styles.tabTitle,
              filters.type === 'rv' ? styles.activeTabTitle : null
            ]}
            onPress={() => this.handleTab('rv')}
          >
            זול
          </Text>
        </View>
      </View>
    )
  }

  renderList() {
    const { filters, campings } = this.props;
    const mapSpots = filters.type === 'all' ? campings
      : campings.filter(camping => camping.type === filters.type);

    return mapSpots.map(
      camping => {
        return (
          <View key={`camping-${camping.id}`} style={styles.camping}>
            <ImageBackground
              style={styles.campingImage}
              imageStyle={styles.campingImage}
              source={{ uri: camping.image }}
            />

            <View style={styles.campingDetails}>
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
                  {camping.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#A5A5A5', paddingTop: 5 }}>
                  {camping.description}
                </Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', }}>
                <View style={styles.campingInfo}>
                  <FontAwesome name="star" color="#FFBA5A" size={12} />
                  <Text style={{ marginLeft: 4, color: '#FFBA5A' }}>{camping.rating}</Text>
                </View>
                <View style={styles.campingInfo}>
                  <FontAwesome name="location-arrow" color="#ff5a76" size={12} />
                  <Text style={{ marginLeft: 4, color: '#ff5a76' }}>{camping.distance} ק"מ</Text>
                </View>
                <View style={styles.campingInfo}>
                  <Ionicons name="md-pricetag" color="black" size={12} />
                  <Text style={{ marginLeft: 4, color: 'black' }}>{camping.price}</Text>
                </View>
              </View>
            </View>
            <View style={{ flex: 0.2, justifyContent: 'center' }}>
              <SimpleLineIcons name="options-vertical" color="#A5A5A5" size={24} />
            </View>
          </View>
        )
      })
  }

  render() {

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          {this.renderTabs()}
        </View>
        <ScrollView style={styles.container}>
          {this.renderMap()}
          {this.renderList()}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const moduleState = state => ({
  campings: state.campings.spots,
  filters: state.campings.filters,
  mylocation: state.campings.mylocation,
});

const moduleActions = {
  setLocation,
  setCampings,
  setFilters,
}

export default connect(moduleState, moduleActions)(Results);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    top: 0,
    height: height * 0.2,
    height: 0,
    width: width,
  },
  // header: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   height: height * 0.15,
  //   paddingHorizontal: 14,
  // },
  location: {
    height: 24,
    width: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7657',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  rvMarker: {
    backgroundColor: '#FFBA5A',
  },
  tentMarker: {
    backgroundColor: '#FF7657',
  },
  settings: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    flex: 1,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.1,
    width: width,
    paddingHorizontal: 14,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  tab: {
    paddingHorizontal: 14,
    marginHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
  },
  activeTab: {
    borderBottomColor: '#FF7657',
  },
  activeTabTitle: {
    color: '#ff5a76',
  },
  map: {
    flex: 1,
  },
  camping: {
    flex: 1,
    flexDirection: 'row',
    borderBottomColor: '#A5A5A5',
    borderBottomWidth: 0.5,
    padding: 20,
  },
  campingDetails: {
    flex: 2,
    paddingLeft: 20,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  campingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  campingImage: {
    width: width * 0.30,
    height: width * 0.25,
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
