import React from 'react';
import { createStackNavigator } from 'react-navigation';

import Results from '../screens/Results';
import NewMeeting from '../screens/NewMeeting';
import Preferences from '../screens/Preferences';

export default createStackNavigator({
  Results: Results,
  Preferences: Preferences,
});