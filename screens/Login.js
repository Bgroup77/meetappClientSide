import React, { Component } from 'react';
import { Alert, TextInput, View, StyleSheet, AsyncStorage, Image } from 'react-native';
import ActionButton from 'react-native-action-button';
import { Input, Button, Icon } from 'react-native-elements';
var firstPage = '';
import MyMeetings from '../screens/MyMeetings';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.checkAuthentic = this.checkAuthentic.bind(this);
        this.state = {
            ifExists: false,
            fontLoaded: false,
            email: '',
            email_valid: true,
            password: '',
            login_failed: false,
            showLoading: false,
        };
    }

    validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return re.test(email);
    }
    submitLoginCredentials() {
        const { showLoading } = this.state;

        this.setState({
            showLoading: !showLoading,
        });
    }

    checkAuthentic() {
        console.log(this.state.ifExists);
        if (this.state.ifExists == true) {
            console.log(this.state.ifExists);
            AsyncStorage.setItem("email", JSON.stringify(this.state.email));

            alert("ברוכים הבאים");
            email1 = AsyncStorage.getItem("email");

            // alert(email1);

            this.props.navigation.navigate(
                'HomeStack',
                // email = AsyncStorage.getItem("email")

            );
        }
        else { alert("האימייל ו/או הסיסמא שגויים"); }
    }
    // testfunc = async () => {

    //     try {
    //         let user = await AsyncStorage.getItem("login");
    //         alert(user);
    //     }
    //     catch (error) {
    //         alert("Not Success");
    //     }

    // }

    onLogin() {
        url = "http://proj.ruppin.ac.il/bgroup77/prod/api/participants/login?email=";
        url += this.state.email;
        url += "&password=";
        url += this.state.password;
        debugger;
        console.log(url);
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then((response => this.setState({
                ifExists: response
            })))
            .then(() => {
                this.checkAuthentic();
            })
            .catch((error) => {
                console.log(error);
            })

        const { email, password } = this.state;
    }


    // testFunc = async () => {
    //     try {
    //         let test = await AsyncStorage.getItem("login");
    //         alert(test)
    //     }
    //     catch (error) {
    //         alert("stam");
    //     }
    // }

    render() {
        const { email, password, email_valid, showLoading } = this.state;
        return (
            <View style={styles.container}>
                <View style={styles.welcomeContainer}>
                    <Image
                        source={
                            require('../assets/images/logo.png')
                        }
                        style={styles.welcomeImage}
                    />
                </View>
                <Input
                    leftIcon={
                        <Icon
                            name="user-o"
                            type="font-awesome"
                            color="#FF5975"
                            size={25}
                        />
                    }
                    containerStyle={{ marginVertical: 10 }}
                    onChangeText={email => this.setState({ email })}
                    value={email}
                    inputStyle={{ marginLeft: 10, color: 'black' }}
                    keyboardAppearance="light"
                    placeholder="Email"
                    autoFocus={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    ref={input => (this.emailInput = input)}
                    onSubmitEditing={() => {
                        this.setState({ email_valid: this.validateEmail(email) });
                        this.passwordInput.focus();
                    }}
                    blurOnSubmit={false}
                    placeholderTextColor="#BEE4ED"
                    errorStyle={{ textAlign: 'center', fontSize: 12 }}
                    errorMessage={
                        email_valid ? null : 'Please enter a valid email address'
                    }
                />
                <Input
                    leftIcon={
                        <Icon
                            name="lock"
                            type="font-awesome"
                            color="#FF5975"
                            size={25}
                        // color="rgba(171, 189, 219, 1)"
                        />
                    }
                    containerStyle={{ marginVertical: 10 }}
                    onChangeText={password => this.setState({ password })}
                    value={password}
                    inputStyle={{ marginLeft: 10, color: 'black' }}
                    secureTextEntry={true}
                    keyboardAppearance="light"
                    placeholder="Password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                    returnKeyType="done"
                    ref={input => (this.passwordInput = input)}
                    blurOnSubmit={true}
                    placeholderTextColor="#BEE4ED"
                />
                <Button
                    title="LOG IN"
                    activeOpacity={1}
                    underlayColor="transparent"
                    onPress={this.onLogin.bind(this)}
                    loading={showLoading}
                    loadingProps={{ size: 'small', color: 'black' }}
                    disabled={!email_valid && password.length < 8}
                    buttonStyle={{
                        height: 50,
                        width: 250,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderColor: '#5DBCD2',
                        borderRadius: 30,
                    }}
                    containerStyle={{ marginVertical: 10 }}
                    titleStyle={{ fontWeight: 'bold', color: '#5DBCD2' }}
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    contentContainer: {
        paddingTop: 10,
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10,
    },
    input: {
        width: 200,
        height: 44,
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        marginBottom: 10,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,

    },
});

export default Login;