//view info at https://github.com/FaridSafi/react-native-google-places-autocomplete

import React from 'react';
import { Image, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const homePlace = { description: 'בית', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } } };
const workPlace = { description: 'עבודה', geometry: { location: { lat: 48.8496818, lng: 2.2940881 } } };

export default class AddressAutocomplete extends React.Component {

  state = {
    originLocation: '',
  }

  render() {
    return (
      <GooglePlacesAutocomplete
        placeholder='חפש'
        minLength={2} // minimum length of text to search
        autoFocus={false}
        returnKeyType={'search'}
        listViewDisplayed='false'
        renderDescription={row =>
          row.description || row.formatted_address || row.name
        }
        fetchDetails={true}
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          this.props.addressHandler(data.description)
          this.props.latHandler(details.geometry.location.lat)
          this.props.lngHandler(details.geometry.location.lng)
        }}

        getDefaultValue={() => {
          return ''; // text input default value
        }}
        query={{
          // available options: https://developers.google.com/places/web-service/autocomplete
          key: 'AIzaSyDQrX6zJLFo30M5veloVeYsV7pBDMcAgH0',
          language: 'iw', // language of the results
          // types: 
          fields: 'address_component'
        }}

        styles={{
          textInputContainer: {
            width: '100%'
          },
          description: {
            fontWeight: 'bold'
          },
          predefinedPlacesDescription: {
            color: '#1faadb'
          }
        }}
        enablePoweredByContainer={true}
        currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
        currentLocationLabel="מיקום נוכחי"
        nearbyPlacesAPI='GoogleReverseGeocoding' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        GoogleReverseGeocodingQuery={{
          language: 'iw',
          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
        }}
        GooglePlacesSearchQuery={{
          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          rankby: 'distance',
          types: 'food',
        }}
        GooglePlacesDetailsQuery={{
          // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
          fields: 'formatted_address',
          language: 'iw'
        }}

        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3', 'administrative_area_level_1', 'administrative_area_level_2', 'route', 'street_number']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

      // predefinedPlaces={[homePlace, workPlace]}
      // predefinedPlacesAlwaysVisible={true}
      />

    );
  }
}