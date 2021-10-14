import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, TextInput, FAB } from 'react-native-paper';
import firebase from 'firebase';
import "firebase/firestore";
import AwesomeAlert from 'react-native-awesome-alerts';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';
import CSVReader from 'react-csv-reader';

import importarNotas from "./assets/importarNotas.png";
import autoAvalDocente from "./assets/autoAvalDocente.png";

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
				<Text style={styles.txtbotaohome}>Auto-Avaliação Docente</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaImportarNotas({ navigation }) {

	async function openLink() {
		WebBrowser.openBrowserAsync('https://convertio.co/pt/xlsx-csv/', {showInRecents: true});	
	}

	async function pickCSV() {

		let doc = DocumentPicker.getDocumentAsync().then(async p => {
			//pepino
		});
	}

	return (
		<View style={styles.container}>
			<Text>Para atualizar as notas desta turma, clique no botão abaixo para abrir o conversor, selecione a planilha de notas e baixe o arquivo em formato CSV. Após isso, clique no segundo botão e selecione o arquivo CSV do seu dispositivo.
			</Text> 
			<TouchableOpacity onPress={() => openLink()} style={styles.butaoHomePuro}>
				<Text style={styles.txtbotaohomePuro}>Abrir Conversor</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => pickCSV()} style={styles.butaoHomePuro}>
				<Text style={styles.txtbotaohomePuro}>Selecionar planilha</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaAutoAval({ navigation }) {

	const [avalArr, setAvalArr] = useState([]);
	const [prontoAval, setProntoAval] = useState(false);
	let currentUserUID = firebase.auth().currentUser.uid;
	let lastAval = 0;
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

						const list = [];

						query.forEach((doc) => {
							list.push(doc.data());
						})

						setAvalArr(list);
						setProntoAval(true);
					})
			}
		}

		getAutoAvaliações();
	}, [])

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					{!prontoAval &&
						<ActivityIndicator size='large' color="#766ec5" />
					}
					{prontoAval && avalArr.map((a, index) => {

						lastAval += 1;

						return (
							<Card style={{ width: width, marginBottom: 15, marginTop: 15 }} key={index}>
								<Card.Content>
									<Title>Auto-Avaliação {a.data}</Title>
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

		let numberId = String((route.params.lastAval + 1)).padStart(2, '0');
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
			/>
			<TouchableOpacity style={styles.butaoHomePuro} onPress={press}>
				<Text style={styles.txtbotaohomePuro}>Salvar</Text>
			</TouchableOpacity>
			<AwesomeAlert
				show={showAlert}
				showProgress={false}
				message="Auto-avaliação salva com sucesso!"
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
					headerShown: false
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
					title: 'Auto-avaliação'
				}}
			/>
			<Stack.Screen
				name={"EscreverAutoAval"}
				component={telaEscreverAutoAval}
				options={{
					title: 'Escrever auto-avaliação'
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
		color: '#f4f9fc',
		textAlignVertical: "center",
		textAlign: "center",
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
		backgroundColor: '#766ec5',
		padding: 5,
		borderRadius: 5,
		marginBottom: 50,
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

});