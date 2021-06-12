import 'react-native-gesture-handler'; //esse import tem q ta no topo
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import SideMenu from 'react-native-side-menu';
import firebase from 'firebase';
import "firebase/firestore";
import { logout } from "../firebase/firebaseMethods.js";
import { useNavigation } from '@react-navigation/native';

import logo from "./assets/logo.png";
import gerencTurmas from "./assets/iconGerenciarTurmas.png";
import prepConselho from "./assets/iconPrepConselho.png";
import visualizarEstat from "./assets/iconVisualizarEstat.png";

import stackGerenciarTurmas from "./telaGerenciarTurmas.js";
import stackPrepConselho from "./telaPrepConselho.js";
import stackVisualizarEstat from "./telaVisualizarEstat.js";

import { IDContext } from "./context.js";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MenuPerfil(){
	
	const navigation = useNavigation();
	
	let currentUserUID = firebase.auth().currentUser.uid;
	const [nome, setNome] = useState('');

	useEffect(() => {
		
		async function getUserInfo(){
			let doc = await firebase
			.firestore()
			.collection('users')
			.doc(currentUserUID)
			.get();

			if (doc.exists){
				let dataObj = doc.data();
				setNome(dataObj.nome);
			}
		}
		
		getUserInfo();
	})
	
	const press = () => {
		logout();
		navigation.replace('Loading');
	};
	
	return(
		<View style={styles.containerMenu}>
			<Image style={styles.logo1} source={logo} />
			<Text style={styles.txtbotaoTransparente}>Logado como {nome}</Text>
			<TouchableOpacity style={styles.butao} onPress={press}>
				<Text style={styles.txtbotao}>Sair</Text>
			</TouchableOpacity>
		</View>
	);
}

function TelaSelectTurma(){
	
	const navigation = useNavigation();
	
	let currentUserUID = firebase.auth().currentUser.uid;
	const [email, setEmail] = useState('');
	const [turmas, setTurmas] = useState([]);

	useEffect(() => {
		
		async function getUserInfo(){
			let doc = await firebase
			.firestore()
			.collection('users')
			.doc(currentUserUID)
			.get();

			if (doc.exists){
				let dataObj = doc.data();
				setEmail(dataObj.email);
			}
		}
		
		getUserInfo();
		
		async function getTurmas(){
			let doc = await firebase
			.firestore()
			.collection('turmas')
			.onSnapshot((query) => {
				
				const list = [];
				
				query.forEach((doc) => {
					if(doc.data().professor === email){
						list.push(doc.id);
					}
				})
				
				setTurmas(list);
			})
		}
		
		getTurmas();
	})
	
	function press(id){
		navigation.navigate("HomeTabs", { id: id });
	}
	
	return(
		<View style={styles.container}>
			<Text style={styles.txtbotao}>Selecione uma turma</Text>
			{turmas.map((t) => {
				return(
					<TouchableOpacity style={styles.butaoHome} onPress={() => press(t)}>
						<Text style={styles.txtbotaohomePuro}>{t.toUpperCase()}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
}

function homeTabs({route, navigation}){	

	const menu = <MenuPerfil />

	return(
		<IDContext.Provider value={route.params.id}>
			<SideMenu menu={menu}>
				<Tab.Navigator tabBarOptions={{activeBackgroundColor: '#ffffff', inactiveBackgroundColor: '#ffffff', activeTintColor: '#766ec5',}} >
					<Tab.Screen name="Gerenciar Turmas" component={stackGerenciarTurmas} options={{
						tabBarIcon: () => (
							<View>
								<Image style={styles.iconTab} source={gerencTurmas}/>
							</View>
						),}}/>
					<Tab.Screen name="Preparação Para o Conselho" component={stackPrepConselho} options={{
						tabBarIcon: () => (
							<View>
								<Image style={styles.iconTab} source={prepConselho}/>
							</View>
						),}}/>
					<Tab.Screen name="Visualizar Estatísticas" component={stackVisualizarEstat} options={{
						tabBarIcon: () => (
							<View>
								<Image style={styles.iconTab} source={visualizarEstat}/>
							</View>
						),}}/>
				</Tab.Navigator>
			</SideMenu>
		</IDContext.Provider>
	);
}

export default function homeStack(){
	
	return(
		<Stack.Navigator>
			<Stack.Screen name="SelectTurma" component={TelaSelectTurma} options={{headerShown: false}}/>
			<Stack.Screen name="HomeTabs" component={homeTabs} options={{headerShown: false}}/>
		</Stack.Navigator>
	);
}

const styles = StyleSheet.create({
	
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#f4f9fc',
		alignItems: 'center',
		justifyContent: 'center',
	},
	
	containerMenu: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#766ec5',
		alignItems: 'center',
		justifyContent: 'center',
	},
	
	iconTab: {
		height: 30,
		width: 30,
		resizeMode: 'contain',
	},
  
	logo1: {
		height: 70,
		width: 262,
		marginBottom: 150,
	},
  
	txtbotaohome: {
		fontSize: 20,
		color: '#d9d9d9',
		textAlign: 'center',
	},
  
	butaoHome: {
		backgroundColor: '#766ec5',
		padding: 5,
		borderRadius: 5,
		marginBottom: 50,
		width: "80%",
	},	

	butao: {
		backgroundColor: '#ffffff',
		borderRadius: 5,
		padding: 5,
		marginTop: 30,
		marginBottom: 30,
	},
	
	txtbotao: {
		fontSize: 18,
		color: '#1f1f1f',
	},
	
	txtbotaohomePuro: {
		fontSize: 20,
		color: '#f4f9fc',
		textAlign: 'center',
	},
 
});