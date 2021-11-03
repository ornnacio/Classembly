import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { FAB, Paragraph, Button, Portal, Dialog } from 'react-native-paper';
import firebase from 'firebase';
import "firebase/firestore";
import { logout } from "../firebase/firebaseMethods.js";
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';
import { Pages } from 'react-native-pages';

import logo from "./assets/logo.png";
import gerencTurmas from "./assets/iconGerenciarTurmas.png";
import prepConselho from "./assets/iconPrepConselho.png";
import visualizarEstat from "./assets/iconVisualizarEstat.png";
import seta from "./assets/right-arrow.png";

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
		Alert.alert(
			"Deseja realmente sair?",
			null,
			[
			  	{
					text: "Não",
					onPress: () => {
						console.log('cancelado')
					},
			 	},
			 	{ 
					text: "Sim", 
					onPress: () => {
						logout();
						navigation.replace('Loading');
					} 
				}
			]
		);
		
	};
	
	return(
		<View style={styles.containerMenu}>
			<View style={{
				flex: 0.3,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
				<Image style={styles.logo1} source={logo} />
			</View>
			<View style={{
				flex: 0.7,
				alignItems: 'center',
				justifyContent: 'flex-start',
			}}>
				<Text style={{color: 'white', fontSize: 18}}>Logado como {nome}</Text>
				<View style={{
					alignItems: 'flex-start',
					justifyContent: 'center',
				}}>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<View style={{flex: 1, height: 1, backgroundColor: 'white', marginVertical: 20}} />
					</View>
					<Button icon="selection-search" color="white" onPress={() => navigation.goBack()} style={{
						backgroundColor: '#766ec5',
						marginBottom: 15
					}}>Selecionar turma</Button>
					<Button icon="plus" color="white" onPress={() => navigation.navigate("Adicionar Turma")} style={{
						backgroundColor: '#766ec5',
						marginBottom: 15
					}}>Adicionar turma</Button>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<View style={{flex: 1, height: 1, backgroundColor: 'white', marginBottom: 20, width: 0.5 * Dimensions.get('window').width}} />
					</View>
					<Button icon="logout" color="white" onPress={() => press()} style={{
						backgroundColor: '#766ec5',
						marginBottom: 15
					}}>Sair</Button>
				</View>
			</View>
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
				.onSnapshot((query) => {
					let varEmail = query.data().email;
					setEmail(varEmail);
					setProntoEmail(true);
				});
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
							list.push({
								id: doc.id,
								data: doc.data()
							});
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
			<View style={{
				flex: 0.25,
				alignItems: 'center',
				textAlign: 'center',
				justifyContent: 'center',
				backgroundColor: '#766ec5',
				width: Dimensions.get('window').width,
				borderBottomLeftRadius: 15,
				borderBottomRightRadius: 15,
			}}>
				<Text style={{
					color: 'white',
					fontSize: 28,
					fontWeight: 'bold',
				}}>SELECIONE UMA TURMA</Text>
			</View>
			<View style={{
				flex: 0.75,
				alignItems: 'center',
				textAlign: 'center',
				justifyContent: 'center',
			}}>
				<ScrollView contentContainerStyle={styles.containerScroll}>
					<View style={styles.containerTurmas}>
						{!prontoTurmas && 
							<ActivityIndicator size='large' color="#766ec5" style={{marginVertical: 40}}/>
						}
						{prontoTurmas && turmas.map((t, index) => {
							return(<>
								<TouchableOpacity key={index} style={styles.butaoHomePuro} onPress={() => press(t.id)}>
									<Text style={styles.txtbotaohomePuro}>{t.data.nome} - {t.id}</Text>
								</TouchableOpacity>
							</>);
						})}
						{(prontoTurmas && (turmas.length == 0)) && 
							<Text style={styles.txtbotao}>Nenhuma turma encontrada</Text>
						}
					</View>
				</ScrollView>
			</View>
			<FAB
				style={styles.fab2}
				icon="account-arrow-left"
				color="white"
				onPress={() => sair()}
			/>
			<FAB
				style={styles.fab}
				icon="plus"
				color="white"
				onPress={() => navigation.navigate("Adicionar Turma")}
			/>
		</View>
	);
}

function telaAddTurma({ navigation }){

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

	const Instruções = () => {

		return(
			<View style={styles.container}>
				<View style={{
					alignItems: 'center',
					textAlign: 'center',
					justifyContent: 'center',
					width: 0.9 * Dimensions.get('window').width,
					height: 0.3 * Dimensions.get('window').height,
					borderRadius: 5,
					backgroundColor: '#766ec5',
				}}>
					<Paragraph style={{
						textAlign: 'center', 
						color: '#f4f9fc',
						fontSize: 14,
					}}>Para adicionar uma turma, clique no botão "Abrir conversor", selecione a planilha de notas da turma e baixe o arquivo em formato CSV. Após isso, clique no botão "Selecionar CSV" e selecione o arquivo CSV do seu dispositivo.</Paragraph> 
				</View>
				<Image source={seta} style={{width: 50, height: 50, marginTop: 5}} />
			</View>
		);
	}

	const Conversor = () => {

		const [visibleDialog1, setVisibleDialog1] = React.useState(false);
		const [visibleDialog2, setVisibleDialog2] = React.useState(false);

		async function openLink() {
			WebBrowser.openBrowserAsync('https://convertio.co/pt/xlsx-csv/', {showInRecents: true});	
		}
	
		async function pickCSV() {
	
			setVisibleDialog1(true);

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

				setVisibleDialog1(false);
				setVisibleDialog2(true);
			});
		}

		function confirm() {
			setVisibleDialog2(false);
			navigation.goBack();
		}
		
		return(
			<View style={styles.container}>
				<TouchableOpacity onPress={() => openLink()} style={styles.butaoHomePuro}>
					<Text style={styles.txtbotaohomePuro}>Abrir conversor</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => pickCSV()} style={styles.butaoHomePuro}>
					<Text style={styles.txtbotaohomePuro}>Selecionar CSV</Text>
				</TouchableOpacity>
				<Portal>
					<Dialog visible={visibleDialog1} dismissable={false}>
						<Dialog.Content>
							<ActivityIndicator size='large' color="#766ec5"/>
							<Paragraph>Adicionando turma...</Paragraph>
						</Dialog.Content>
					</Dialog>
					<Dialog visible={visibleDialog2} dismissable={true} onDismiss={() => confirm()}>
						<Dialog.Content>
							<Paragraph>Turma adicionada com sucesso!</Paragraph>
						</Dialog.Content>
					</Dialog>
				</Portal>
			</View>
		);
	}

	return (
		<Pages indicatorColor={'#766ec5'}>
			<Instruções />
			<Conversor />
		</Pages>
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
		width: Dimensions.get('window').width,
		justifyContent: 'center',
		alignItems: 'center',
	},

	containerScroll: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: Dimensions.get('window').width,
	},
	
	iconTab: {
		height: 30,
		width: 30,
		resizeMode: 'contain',
	},
  
	logo1: {
		width: "95%",
		height: undefined,
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
		marginBottom: 30,
		justifyContent: 'space-between',
		flexDirection: 'row',
	},
	
	butaoHomePuro: {
		backgroundColor: '#f4f9fc',
		borderColor: '#766ec5',
		borderWidth: 1,
		padding: 5,
		borderRadius: 5,
		marginBottom: 25,
		width: "80%",
	},

	txtbotao: {
		fontSize: 18,
		color: '#1f1f1f',
	},
	
	txtbotaohomePuro: {
		fontSize: 20,
		color: '#766ec5',
		textAlign: 'center',
	},

	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: '#766ec5',
	},

	fab2: {
		position: 'absolute',
		margin: 16,
		left: 0,
		bottom: 0,
		backgroundColor: '#766ec5',
	},
 
});
