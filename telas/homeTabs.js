import 'react-native-gesture-handler'; //esse import tem q ta no topo
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
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
const Drawer = createDrawerNavigator();

function MenuPerfil( props ){
	
	const navigation = useNavigation();
	
	let currentUserUID = firebase.auth().currentUser.uid;
	const [nome, setNome] = useState('');
	const [prontoNome, setProntoNome] = useState(false);

	useEffect(() => {
		
		async function getUserInfo(){
			
			if(!prontoNome){
				let doc = await firebase
				.firestore()
				.collection('users')
				.doc(currentUserUID)
				.get();

				if (doc.exists){
					let dataObj = doc.data();
					setNome(dataObj.nome);
					setProntoNome(true);
				}
			}
		}
		
		getUserInfo();
	});
	
	const press = () => {
		logout();
		navigation.replace('Loading');
	};
	
	return(
		<View style={styles.containerMenu}>
			<Image style={styles.logo1} source={logo} />
			<Text style={{color: '#d9d9d9'}}>Logado como {nome}</Text>
			<TouchableOpacity style={styles.butao} onPress={() => navigation.goBack()}>
				<Text style={styles.txtbotao}>Selecionar turma</Text>
			</TouchableOpacity>
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
	const [prontoEmail, setProntoEmail] = useState(false);
	const [prontoTurmas, setProntoTurmas] = useState(false);

	useEffect(() => {
		
		async function getUserInfo(){
			
			if(!prontoEmail){
			
				let doc = await firebase
				.firestore()
				.collection('users')
				.doc(currentUserUID)
				.get();

				if (doc.exists){
					let dataObj = doc.data();
					setEmail(dataObj.email);
					setProntoEmail(true);
				}
			}
		}
		
		getUserInfo();
		
		async function getTurmas(){
			
			if(!prontoTurmas){
			
				let doc = await firebase
				.firestore()
				.collection('turmas')
				.get()
				.then((query) => {
					
					const list = [];
					
					query.forEach((doc) => {
						if(doc.data().professor === email){
							list.push(doc.id);
						}
					})
					
					setTurmas(list);
					setProntoTurmas(true);
				})
			}
		}
		
		getTurmas();
	});
	
	function press(id){
		navigation.navigate("HomeDrawer", {
			screen: 'HomeTabs', 
			params: { id: id, update: true }
		});
	}
	
	function sair(){
		logout();
		navigation.navigate('Loading');
	};
	
	return(
		<View style={styles.container}>
			<Text style={styles.txtbotao}>Selecione uma turma</Text>
			{turmas.map((t, index) => {
				return(
					<TouchableOpacity key={index} style={styles.butaoHome} onPress={() => press(t)}>
						<Text style={styles.txtbotaohomePuro}>{t.toUpperCase()}</Text>
					</TouchableOpacity>
				);
			})}
			<TouchableOpacity style={styles.butaoSair} onPress={() => sair()}>
				<Text style={styles.txtbotaohomePuro}>Sair</Text>
			</TouchableOpacity>
		</View>
	);
}

function homeTabs({route, navigation}){	

	return(
		<IDContext.Provider value={route.params.id}>
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
		</IDContext.Provider>
	);
}

function homeDrawer(){
	
	return(
		<Drawer.Navigator drawerContent={(props) => <MenuPerfil {...props} />}>
			<Drawer.Screen name="HomeTabs" component={homeTabs} />
		</Drawer.Navigator>
	);
}

export default function homeStack(){
	
	return(
		<Stack.Navigator>
			<Stack.Screen name="SelectTurma" component={TelaSelectTurma} options={{headerShown: false}}/>
			<Stack.Screen name="HomeDrawer" component={homeDrawer} options={{headerShown: false}}/>
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
		width: "90%",
		height: undefined,
		marginBottom: 150,
		aspectRatio: 1233/333,
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
	
	butaoSair: {
		backgroundColor: '#766ec5',
		padding: 5,
		borderRadius: 5,
		marginBottom: 50,
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