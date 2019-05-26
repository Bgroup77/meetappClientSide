import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    Platform,
    TextInput,
    Button,
    FlatList
} from 'react-native'
import Autocomplete from 'react-native-autocomplete-input';

export default class GetUsers extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participants";
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then((response => { this.props.GetUsers(response); }))
            //     this.setState({
            //     participants: response

            // })
            // contents = this.state.participants.map((user) => {
            //     emails = [user.Email];
            //     // emails => this.setState({ emails })
            //     this.state.emails.push(user.Email)
            // }

            .catch((error) => {
                console.log(error);
            })
    }


    render() {

        return null;
    }
    //     contents = this.state.participants.map((user) => {
    //         emails = [user.Email];
    //         // emails => this.setState({ emails })
    //         this.state.emails.push(user.Email)
    //We need to return the corresponding mapping for each user too.
    //     return (
    //         <View key={user.Id}>
    //             <Text >
    //                 {console.warn(this.state.emails)}
    //                 {/* {console.warn(emails)} */}
    //             </Text>
    //         </View>
    //     );
    // });
    // return (
    //     <View>
    //         {contents}
    //     </View>
    // )
    //}
}