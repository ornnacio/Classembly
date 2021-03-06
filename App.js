//import de modulos
import 'react-native-gesture-handler'; //esse import tem q ta no topo
import React, { useState, state, Component, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-native-paper';
import firebase from 'firebase';
import "firebase/firestore";
import { firebaseConfig } from "./firebase/firebase.js";

//import de telas e assets
import telaLogin from "./telas/telaLogin.js";
import telaCadastro from "./telas/telaCadastro.js";
import telaLoading from "./telas/telaLoading.js";
import homeDrawer from "./telas/homeTabs.js";

//funções e consts 
const Stack = createStackNavigator();
console.disableYellowBox = true; 

//app em si

export default function App({ navigation }){
	
	if (!firebase.apps.length) {
		firebase.initializeApp(firebaseConfig);
	}
	
	return (
		<Provider>
			<NavigationContainer>
				<Stack.Navigator initialRouteName="Loading">
					<Stack.Screen name="Login" component={telaLogin} options={{headerTintColor: "#d9d9d9", headerStyle: {backgroundColor: '#766ec5', borderBottomWidth: 0, shadowColor: "transparent", elevation: 0,}}}/>
					<Stack.Screen name="Cadastro" component={telaCadastro} options={{headerTintColor: "#d9d9d9", headerStyle: {backgroundColor: '#766ec5', borderBottomWidth: 0, shadowColor: "transparent", elevation: 0,}}}/>
					<Stack.Screen name="Loading" component={telaLoading} options={{headerShown: false}}/>
					<Stack.Screen name="Home" component={homeDrawer} options={{headerShown: false}}/>
				</Stack.Navigator>
			</NavigationContainer>
		</Provider>
	);

}