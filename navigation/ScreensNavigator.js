import React from 'react';
import { createStackNavigator } from 'react-navigation';

import Results from '../screens/Results';
import NewMeeting from '../screens/NewMeeting';

export default createStackNavigator({
  Results: Results,
  NewMeeting: NewMeeting,
});