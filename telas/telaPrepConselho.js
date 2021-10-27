import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, TextInput, FAB, IconButton } from 'react-native-paper';
import firebase from 'firebase';
import "firebase/firestore";
import AwesomeAlert from 'react-native-awesome-alerts';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';
import { Pages } from 'react-native-pages';

import importarNotas from "./assets/importarNotas.png";
import autoAvalDocente from "./assets/autoAvalDocente.png";
import seta from "./assets/right-arrow.png";

const Stack = createStackNavigator();

function telaPrepConselho({ navigation }) {

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("ImportarNotas")}>
				<Image style={styles.iconBotao} source={importarNotas} />
				<Text style={styles.txtbotaohome}>Importar Notas</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("AutoAval")}>
				<Image style={styles.iconBotao} source={autoAvalDocente} />
				<Text style={styles.txtbotaohome}>Autoavaliação Docente</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaImportarNotas({ navigation }) {

	async function openLink() {
		WebBrowser.openBrowserAsync('https://convertio.co/pt/xlsx-csv/', {showInRecents: true});	
	}

	async function pickCSV() {

		let doc = DocumentPicker.getDocumentAsync({
			copyToCacheDirectory: false,
		}).then(async p => {
			const payloadJson = await FileSystem.readAsStringAsync(p.uri);
			console.log((payloadJson));
		});
	}

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
					}}>Para atualizar as notas, clique no botão "Abrir conversor", selecione a planilha de notas da turma e baixe o arquivo em formato CSV. Após isso, clique no botão "Selecionar CSV" e selecione o arquivo CSV do seu dispositivo.</Paragraph> 
				</View>
				<Image source={seta} style={{width: 50, height: 50, marginTop: 5}} />
			</View>
		);
	}

	const Conversor = () => {
		
		return(
			<View style={styles.container}>
				<TouchableOpacity onPress={() => openLink()} style={styles.butaoHomePuro}>
					<Text style={styles.txtbotaohomePuro}>Abrir conversor</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => pickCSV()} style={styles.butaoHomePuro}>
					<Text style={styles.txtbotaohomePuro}>Selecionar CSV</Text>
				</TouchableOpacity>
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

function telaAutoAval({ navigation }) {

	const [avalArr, setAvalArr] = useState([]);
	const [arrIds, setArrIds] = useState([]);
	const [prontoAval, setProntoAval] = useState(false);
	let currentUserUID = firebase.auth().currentUser.uid;
	let lastAval = 0;
	var teste = -1;
	var arrTeste = [];
	let width = 0.9 * Dimensions.get('window').width;

	useEffect(() => {

		async function getAutoAvaliações() {

			if (!prontoAval) {
				let doc = await firebase
					.firestore()
					.collection('users')
					.doc(currentUserUID)
					.collection('autoaval')
					.onSnapshot((query) => {

						const list = [], listId = [];

						query.forEach((doc) => {
							list.push(doc.data());
							listId.push(doc.id);
						})

						setAvalArr(list);
						setArrIds(listId);
						setProntoAval(true);
					})
			}
		}

		getAutoAvaliações();
	}, [])

	function deleteAval(id){

		firebase
			.firestore()
			.collection('users')
			.doc(currentUserUID)
			.collection('autoaval')
			.doc(id)
			.delete()
	}

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					{!prontoAval &&
						<ActivityIndicator size='large' color="#766ec5" />
					}
					{prontoAval && avalArr.map((a, index) => {

						teste++;

						if((teste % avalArr.length) == avalArr.length - 1){
							lastAval = arrIds[teste % avalArr.length];
						}

						arrTeste[teste] = arrIds[teste % avalArr.length];

						console.log(arrTeste);

						return (
							<Card style={styles.cardAutoAval} key={teste % avalArr.length} idTeste={arrIds[teste % avalArr.length]}>
								<Card.Content>
									<View style={styles.headerCard}>
										<Title>Autoavaliação {a.data}</Title>
										<View style={{ flexDirection: "row" }}>
											<IconButton icon="pencil" color="#534d8a" size={25} onPress={() => navigation.navigate("EditarAutoAval", { txt: a.txt, id: arrTeste[index]})}></IconButton>
											<IconButton icon="delete" color="#534d8a" size={25} onPress={() => deleteAval(arrTeste[index])}></IconButton>
										</View>
									</View>
									<Paragraph>{a.txt}</Paragraph>
								</Card.Content>
							</Card>
						)
					})}
				</View>
			</ScrollView>
			<FAB
				style={styles.fab}
				icon="plus"
				color="white"
				onPress={() => navigation.navigate("EscreverAutoAval", { lastAval })}
			/>
		</View>
	);
}

function telaEscreverAutoAval({ route }) {

	const [txt, setTxt] = React.useState('');
	const [showAlert, setShowAlert] = React.useState(false);
	let currentUserUID = firebase.auth().currentUser.uid;
	const navigation = useNavigation();

	var today = new Date();
	var d = String(today.getDate()).padStart(2, '0');
	var m = String(today.getMonth() + 1).padStart(2, '0');

	function press() {

		let numberId = String((parseInt(route.params.lastAval.split('aa')[1]) + 1)).padStart(2, '0');
		let strId = 'aa' + numberId;
		let strData = d + '/' + m;

		firebase
			.firestore()
			.collection('users')
			.doc(currentUserUID)
			.collection('autoaval')
			.doc(strId)
			.set({
				txt: txt,
				data: strData,
			});

		setShowAlert(true);

	}

	function confirm() {
		setTxt('');
		setShowAlert(false);
		navigation.navigate('AutoAval');
	}

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.inputBox}
				underlineColor='#766ec5'
				multiline={true}
				numberOfLines={6}
				onChangeText={(text) => setTxt(text)}
				value={txt}
				placeholder="Digite a autoavaliação..."
			/>
			<FAB
				style={styles.fab}
				icon="content-save"
				color="white"
				onPress={() => press()}
			/>
			<AwesomeAlert
				show={showAlert}
				showProgress={false}
				message="Autoavaliação salva com sucesso!"
				closeOnTouchOutside={false}
				closeOnHardwareBackPress={false}
				showCancelButton={false}
				showConfirmButton={true}
				confirmText="Voltar"
				confirmButtonColor="green"
				onConfirmPressed={() => confirm()}
			/>
		</View>
	);
}

function telaEditarAutoAval({ route }) {

	const [txt, setTxt] = React.useState(route.params.txt);
	const [showAlert, setShowAlert] = React.useState(false);
	let idAval = route.params.id;
	let currentUserUID = firebase.auth().currentUser.uid;
	const navigation = useNavigation();

	console.log(route.params.id);

	function press(){
		firebase
			.firestore()
			.collection('users')
			.doc(currentUserUID)
			.collection('autoaval')
			.doc(idAval)
			.update({
				txt: txt,
			});

		setShowAlert(true);
	}

	function confirm() {
		setTxt('');
		setShowAlert(false);
		navigation.navigate('AutoAval');
	}

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.inputBox}
				underlineColor='#766ec5'
				multiline={true}
				numberOfLines={6}
				onChangeText={(text) => setTxt(text)}
				value={txt}
				placeholder="Digite a autoavaliação..."
			/>
			<FAB
				style={styles.fab}
				icon="content-save"
				color="white"
				onPress={() => press()}
			/>
			<AwesomeAlert
				show={showAlert}
				showProgress={false}
				message="Autoavaliação salva com sucesso!"
				closeOnTouchOutside={false}
				closeOnHardwareBackPress={false}
				showCancelButton={false}
				showConfirmButton={true}
				confirmText="Voltar"
				confirmButtonColor="green"
				onConfirmPressed={() => confirm()}
			/>
		</View>
	);
}

export default function stackPrepConselho({ navigation }) {
	return (
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#766ec5' }, headerTintColor: '#f4f9fc' }} initialRouteName="MainPrepConselho">
			<Stack.Screen
				name={"MainPrepConselho"}
				component={telaPrepConselho}
				options={{
					title: 'Preparação para o conselho',
					headerLeft: null
				}}
			/>
			<Stack.Screen
				name={"ImportarNotas"}
				component={telaImportarNotas}
				options={{
					title: 'Importar notas'
				}}
			/>
			<Stack.Screen
				name={"AutoAval"}
				component={telaAutoAval}
				options={{
					title: 'Autoavaliação'
				}}
			/>
			<Stack.Screen
				name={"EscreverAutoAval"}
				component={telaEscreverAutoAval}
				options={{
					title: 'Escrever autoavaliação'
				}}
			/>
			<Stack.Screen
				name={"EditarAutoAval"}
				component={telaEditarAutoAval}
				options={{
					title: 'Escrever autoavaliação'
				}}
			/>
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

	containerScroll: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: Dimensions.get('window').width,
	},

	iconBotao: {
		flex: 0.2,
		padding: 10,
		margin: 5,
		height: 75,
		width: 75,
		resizeMode: 'contain',
	},

	iconTab: {
		height: 30,
		width: 30,
		resizeMode: 'contain',
	},

	txtbotaohome: {
		flex: 0.8,
		fontSize: 20,
		color: '#f4f9fc',
		textAlign: 'center',
	},

	txtbotaohomePuro: {
		fontSize: 20,
		color: '#766ec5',
		textAlign: 'center',
	},

	butaoHome: {
		backgroundColor: '#766ec5',
		flexDirection: 'row',
		alignItems: 'center',
		padding: 5,
		borderRadius: 5,
		marginBottom: 50,
		width: "80%",
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

	inputBox: {
		margin: 25,
		borderRadius: 5,
		width: 0.7 * Dimensions.get('window').width,
	},

	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: '#766ec5',
	},

	cardAutoAval: {
		width: 0.95 * Dimensions.get('window').width,
		margin: 10,
	},

	headerCard: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},

});
