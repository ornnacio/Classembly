import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { FAB, Paragraph } from 'react-native-paper';
import firebase from 'firebase';
import "firebase/firestore";
import { logout } from "../firebase/firebaseMethods.js";
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';

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

function telaSelectTurma(){
	
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
				.onSnapshot((query) => {
					
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
			<View style={styles.containerTurmas}>
				{!prontoTurmas && 
					<ActivityIndicator size='large' color="#766ec5" style={{marginVertical: 40}}/>
				}
				{prontoTurmas && turmas.map((t, index) => {
					return(
						<TouchableOpacity key={index} style={styles.butaoHome} onPress={() => press(t)}>
							<Text style={styles.txtbotaohomePuro}>{t.toUpperCase()}</Text>
						</TouchableOpacity>
					);
				})}
				{(prontoTurmas && (turmas.length == 0)) && 
					<Text style={styles.txtbotao}>Nenhuma turma encontrada</Text>
				}
			</View>
			<TouchableOpacity style={styles.butaoSair} onPress={() => sair()}>
				<Text style={styles.txtbotaohomePuro}>Sair</Text>
			</TouchableOpacity>
			<FAB
				style={styles.fab}
				icon="plus"
				color="white"
				onPress={() => navigation.navigate("Adicionar Turma")}
			/>
		</View>
	);
}

function telaAddTurma(){

	let currentUserUID = firebase.auth().currentUser.uid;
	const [email, setEmail] = useState('');
	const [prontoEmail, setProntoEmail] = useState(false);

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
	})

	async function openLink() {
		WebBrowser.openBrowserAsync('https://convertio.co/pt/xlsx-csv/', {showInRecents: true});	
	}

	async function pickCSV() {

		let doc = DocumentPicker.getDocumentAsync({
			copyToCacheDirectory: false,
		}).then(async p => { //CW: codigo ruim

			const stringCSV = await FileSystem.readAsStringAsync(p.uri);
			let arr = stringCSV.split('\n');
			arr.pop();
			let idTurma = null, nomeTurma = null, count = 0;

			arr.forEach((linha, index) => {

				let arr2 = linha.replace('/', '').split('","');

				if(index == 0 || index == 1 || index == 3 || index == 4 || index == 5 || index == 6 || index == 7 || index == 8 || index == 9 || index == arr.length - 1){
					//aqui é pra ignorar as linhas vazias
				}else if(index == 2){
					idTurma = arr2[1].split(' - ')[0];
					nomeTurma = arr2[1].split(' - ')[1];
					firebase
						.firestore()
						.collection('turmas')
						.doc(idTurma)
						.set({
							nome: nomeTurma,
							professor: email
						});

				}else{
					let obj = {
						matricula: arr2[1],
						nome: arr2[2],
					};
					firebase
						.firestore()
						.collection('alunos')
						.doc(obj.matricula)
						.set({
							nome: obj.nome
						});
					count += 1;
					firebase
						.firestore()
						.collection('turmas')
						.doc(idTurma)
						.collection('alunos')
						.doc('a' + String(count).padStart(2, '0'))
						.set({
							aprendizado: 'Auditivo',
							comp: 'Participativo',
							id_aluno: obj.matricula,
							motivo_prio: null,
							nome: obj.nome,
							prio: false
						})
				}
			});
		});
	}

	return (
		<View style={styles.container}>
			<Paragraph style={{textAlign: 'center', marginBottom: 15}}>Para adicionar uma turma, clique no botão abaixo para abrir o conversor, selecione a planilha de notas da turma e baixe o arquivo em formato CSV. Após isso, clique no segundo botão e selecione o arquivo CSV do seu dispositivo.</Paragraph> 
			<TouchableOpacity onPress={() => openLink()} style={styles.butaoHomePuro}>
				<Text style={styles.txtbotaohomePuro}>Abrir Conversor</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => pickCSV()} style={styles.butaoHomePuro}>
				<Text style={styles.txtbotaohomePuro}>Selecionar planilha</Text>
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
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#766ec5' }, headerTintColor: '#f4f9fc' }}>
			<Stack.Screen name="SelectTurma" component={telaSelectTurma} options={{headerShown: false}}/>
			<Stack.Screen name="Adicionar Turma" component={telaAddTurma}/>
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

	containerTurmas: {
		marginVertical: 20, 
		width: Dimensions.get('window').width,
		justifyContent: 'center',
		alignItems: 'center',
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
		marginVertical: 15,
		width: "80%",
	},
	
	butaoSair: {
		backgroundColor: '#766ec5',
		padding: 5,
		borderRadius: 5,
	},

	butao: {
		backgroundColor: '#ffffff',
		borderRadius: 5,
		padding: 5,
		marginTop: 30,
		marginBottom: 30,
	},
	
	butaoHomePuro: {
		backgroundColor: '#766ec5',
		padding: 5,
		borderRadius: 5,
		marginBottom: 50,
		width: "80%",
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

	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: '#766ec5',
	},
 
});
