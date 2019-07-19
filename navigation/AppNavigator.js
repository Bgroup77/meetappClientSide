import React from 'react';
import { createAppContainer, createSwitchNavigator, createStackNavigator } from 'react-navigation';

// import ScreensNavigator from './ScreensNavigator';
import MainTabNavigator from './MainTabNavigator';

import HomeScreen from '../screens/HomeScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import Login from '../screens/Login';
import Profile from '../screens/Profile-old';
import Register from '../screens/Register';
// import Preferences from '../screens/Preferences';

const AppStack = createSwitchNavigator({
  Main: MainTabNavigator,
  Home: HomeScreen,
  Profile: Profile,
  // Preferences: Preferences,
});

const AuthStack = createStackNavigator({
  Login: Login,
  Register: Register,

});

// export default createAppContainer(createSwitchNavigator({
//   // You could add another route here for authentication.
//   // Read more at https://reactnavigation.org/docs/en/auth-flow.html
//   // Main: ScreensNavigator,

//   // Main: MainTabNavigator,
// }));

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));