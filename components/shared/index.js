import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginIndex from './login/components/customers/index'
import Login from './login/components/index'
import LoginWithFacebook from './login/components/customers/loginWithFacebook'
import Customers from '../customers/index'
import Riders from '../riders/index'
const Stack = createStackNavigator();

// This is for open navigation like 
// 'Change Password', 'Forgot Password', 'Login'
function OpenNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                {/* <Stack.Screen name="LoginIndex"
                    options={{
                        headerShown: false
                    }}
                    component={LoginIndex}
                />
                <Stack.Screen name="Login"
                    options={{
                        headerShown: false
                    }}
                    component={Login}
                />
                <Stack.Screen name="LoginWithFacebook"
                    options={{
                        headerShown: false
                    }}
                    component={LoginWithFacebook}
                /> */}

                <Stack.Screen name="Login"
                    options={{
                        headerShown: false
                    }}
                    component={Login}
                />
                <Stack.Screen name="Customers"
                    options={{
                        headerShown: false
                    }}
                    component={Customers}
                />
                <Stack.Screen name="Riders"
                    options={{
                        headerShown: false
                    }}
                    component={Riders}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default OpenNavigation