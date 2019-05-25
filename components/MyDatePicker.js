import React, { Component } from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    PanResponder
} from 'react-native'
import DatePicker from 'react-native-datepicker'

export default class MyDatePicker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            date: '',
        };
    }

    render() {
        return (
            <DatePicker
                style={{ width: 200 }}
                date={this.state.date}
                mode="date"
                placeholder="בחר תאריך"
                format="DD-MM-YYYY"
                // minDate="2016-05-01"
                // maxDate="2016-06-01"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
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
                // onDateChange={(date) => { this.setState({ date: date }) }}
                onDateChange={(date) => { this.props.onDateChange && this.props.onDateChange(date); this.setState({ date }); }}
            />
        )
    }
}