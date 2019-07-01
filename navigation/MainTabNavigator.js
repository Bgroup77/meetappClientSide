import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import HomeScreenAviel from '../screens/HomeScreenAviel';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Results from '../screens/Results';
import NewMeeting from '../screens/NewMeeting';
import Login from '../screens/Login';
import Profile from '../screens/Profile';
// import PreferencesFromCreateMeeting from '../screens/PreferencesFromCreateMeeting';
import Preferences from '../screens/Preferences';
import Register from '../screens/Register';

const HomeStack = createStackNavigator({
  HomeScreen: HomeScreen,
  Preferences: Preferences,
  Results: Results,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'בית',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={'md-home'}
    />
  ),
};

const ProfileStack = createStackNavigator({
  Profile: Profile,
});

ProfileStack.navigationOptions = {
  tabBarLabel: 'פרופיל',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={'md-person'}
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'בתי עסק',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={'md-business'}
    />
  ),
};

const NewMeetingStack = createStackNavigator({
  NewMeeting: NewMeeting,
  Preferences: Preferences,
});

NewMeetingStack.navigationOptions = {
  tabBarLabel: 'פגישה חדשה',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={'md-add-circle-outline'}
    />
  ),
};


export default createBottomTabNavigator({
  //Results,
  // Register,
  //HomeScreenAviel,
  HomeStack,
  // Results,
  ProfileStack,
  NewMeetingStack,
  SettingsStack,
  // Login,
  //MyMeetings
});
