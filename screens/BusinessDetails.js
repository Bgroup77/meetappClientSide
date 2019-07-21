import React from 'react';
// import { ExpoConfigView } from '@expo/samples';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, AsyncStorage, Alert
} from 'react-native';
import RNGooglePlaces from 'react-native-google-places';

export default class BusinessDetails extends React.Component {
  static navigationOptions = {
    title: 'צפייה בפרטי המקום',
  };

  openSearchModal() {
    RNGooglePlaces.openAutocompleteModal()
      .then((place) => {
        console.log(place);
        // place represents user's selection from the
        // suggestions and it is a simplified Google Place object.
      })
      .catch(error => console.log(error.message));  // error is a Javascript Error object
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.openSearchModal()}
        >
          <Text>Pick a Place</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // state = {
  //   place: [],
  // }

  // async componentDidMount() {
  //   await this.getStorageValue();
  // }

  // getStorageValue = async () => {
  //   place = await AsyncStorage.getItem('businessDetails');
  //   this.setPlaceDetailsState();
  // };

  // setPlaceDetailsState() {
  //   this.setState({
  //     place: place,
  //   })
  //   console.warn("place from state", this.state.place)
  //   console.warn("place name", this.state.place.name)
  // }

  // render() {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         flexDirection: 'row',
  //         marginTop: 10,
  //         marginHorizontal: 40,
  //         padding: 5,
  //       }}>
  //       <View>
  //         <Text style={styles.title} >שם המקום:  {this.state.place.name}</Text>
  //       </View>
  //     </View >

  //   )
  // }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    marginVertical: 14,
    fontWeight: 'bold'
  },

  regular: {
    fontSize: 18,
    marginVertical: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    padding: 14,
    alignContent: 'center',
    alignItems: 'center',
  },
});
