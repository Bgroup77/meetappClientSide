import React, { Component } from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    PanResponder
} from 'react-native'
import DatePicker from 'react-native-datepicker'

export default class MyTimePicker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            time: '',
        };
    }

    render() {
        return (
            <DatePicker
                style={{ width: 200 }}
                date={this.state.time}
                mode="time"
                format="HH:mm"
                placeholder="בחר שעה"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                minuteInterval={10}
                customStyles={{
                    dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 4,
                        marginLeft: 0
                    },
                    dateInput: {
                        marginLeft: 36
                    }
                    // ... You can check the source to find the other keys.
                }}
                // onDateChange={(time) => { this.setState({ time: time }) }}
                onDateChange={(time) => { this.props.onDateChange && this.props.onDateChange(time); this.setState({ time }); }}
            />
            // <Text style={styles.instructions}>time: {this.state.time}</Text>
        )
    }
}