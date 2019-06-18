import React, { Component } from 'react';
//import react in our code.
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
//import all the components we are going to use.
import Autocomplete from 'react-native-autocomplete-input';
//import Autocomplete component

const API = 'https://swapi.co/api';
//Demo base API to get the data for the Autocomplete suggestion
class AutocompleteExample extends Component {
  constructor(props) {
    super(props);
    //Initialization of state
    //films will contain the array of suggestion
    //query will have the input from the autocomplete input
    this.state = {
      films: [],
      query: '',
      films: [],
      query: '',
    };
  }
  componentDidMount() {
    url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participants";
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response => this.setState({
        participants: response

      })))
      .catch((error) => {
        console.log(error);
      })

    //First method to be called after components mount
    //fetch the data from the server for the suggestion
    fetch(`${API}/films/`)
      .then(res => res.json())
      .then(json => {
        const { results: films } = json;
        this.setState({ films });
        //setting the data in the films state
      });
  }
  findFilm(query) {
    //method called everytime when we change the value of the input
    if (query === '') {
      //if the query is null then return blank
      return [];
    }

    const { films } = this.state;
    //making a case insensitive regular expression to get similar value from the film json
    const regex = new RegExp(`${query.trim()}`, 'i');
    //return the filtered film array according the query from the input
    return films.filter(film => film.title.search(regex) >= 0);
  }

  render() {
    contents = this.state.participants.map((user) => {
      emails = [user.Email];
      // emails => this.setState({ emails })
      this.state.emails.push(user.Email)
      //We need to return the corresponding mapping for each user too.
      return (
        <View key={user.Id}>
          <Text >
            {console.warn(this.state.emails)}
            {/* {console.warn(emails)} */}
          </Text>
        </View>
      );
    });

    const { query } = this.state;
    const films = this.findFilm(query);
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

    return (
      <View style={styles.container}>
        <View>
          {contents}
        </View>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.autocompleteContainer}
          //data to show in suggestion
          data={films.length === 1 && comp(query, films[0].title) ? [] : films}
          //default value if you want to set something in input
          defaultValue={query}
          /*onchange of the text changing the state of the query which will trigger
          the findFilm method to show the suggestions*/
          onChangeText={text => this.setState({ query: text })}
          placeholder="Enter the film title"
          renderItem={({ title, release_date }) => (
            //you can change the view you want to show in suggestion from here
            <TouchableOpacity onPress={() => this.setState({ query: title })}>
              <Text style={styles.itemText}>
                {title} ({release_date})
              </Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.descriptionContainer}>
          {films.length > 0 ? (
            <Text style={styles.infoText}>{this.state.query}</Text>
          ) : (
              <Text style={styles.infoText}>Enter The Film Title</Text>
            )}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
    padding: 16,
    marginTop: 40,
  },
  autocompleteContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 15,
    paddingTop: 5,
    paddingBottom: 5,
    margin: 2,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
export default AutocompleteExample;