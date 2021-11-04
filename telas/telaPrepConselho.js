import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, TextInput, FAB, IconButton, Portal, Dialog } from 'react-native-paper';
import firebase from 'firebase';
import "firebase/firestore";
import { IDContext } from "./context.js";
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

	const idTurma = React.useContext(IDContext);

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

		const [visibleDialog1, setVisibleDialog1] = React.useState(false);
		const [visibleDialog2, setVisibleDialog2] = React.useState(false);

		async function openLink() {
			WebBrowser.openBrowserAsync('https://convertio.co/pt/xlsx-csv/', {showInRecents: true});	
		}

		async function pickCSV() {
	
			let doc = DocumentPicker.getDocumentAsync({
				copyToCacheDirectory: false,
			}).then(async p => {

				if(p.type === "cancel"){
					return;
				}
				setVisibleDialog1(true);
	
				const stringCSV = await FileSystem.readAsStringAsync(p.uri);
				let arr = stringCSV.split('\n');
				arr.pop();
				var count = 0;
	
				arr.forEach((linha, index) => {
					let arr2 = linha.replace('/', '').split('","');
	
					if(index == 0 || index == 1 || index == 2 || index == 3 || index == 4 || index == 5 || index == 6 || index == 7 || index == 8 || index == 9 || index == arr.length - 1){
						//aqui é pra ignorar as linhas vazias
					}else{
						let obj = {
							n1: arr2[3],
							n2: arr2[4],
							n3: arr2[5],
							n4: arr2[6],
							media: arr2[7]
						}
						count += 1;
	
						firebase
							.firestore()
							.collection('turmas')
							.doc(idTurma)
							.collection('alunos')
							.doc('a' + String(count).padStart(2, '0'))
							.set({
								n1: obj.n1,
								n2: obj.n2,
								n3: obj.n3,
								n4: obj.n4,
								media: obj.media
							}, {merge: true});
	
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
							<Paragraph>Salvando notas...</Paragraph>
						</Dialog.Content>
					</Dialog>
					<Dialog visible={visibleDialog2} onDismiss={() => confirm()}>
						<Dialog.Content>
							<Paragraph>Notas salvas com sucesso!</Paragraph>
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

function telaAutoAval({ navigation }) {

	const [avalArr, setAvalArr] = useState([]);
	const [arrIds, setArrIds] = useState([]);
	const [prontoAval, setProntoAval] = useState(false);
	const [visibleDialog1, setVisibleDialog1] = React.useState(false);
	const [visibleDialog2, setVisibleDialog2] = React.useState(false);
	let currentUserUID = firebase.auth().currentUser.uid;
	let lastAval = 'aa00';
	var count = -1;
	var arr = [];
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

		Alert.alert(
			"Deletar autoavaliação?",
			null,
			[
			  	{
					text: "Não",
					onPress: () => {
						
					},
			 	},
			 	{ 
					text: "Sim", 
					onPress: () => {

						setVisibleDialog1(true);

						firebase
							.firestore()
							.collection('users')
							.doc(currentUserUID)
							.collection('autoaval')
							.doc(id)
							.delete()

						setVisibleDialog1(false);
						setVisibleDialog2(true);

					} 
				}
			]
		);

	}

	function confirm() {
		setVisibleDialog2(false);
	}

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					{!prontoAval &&
						<ActivityIndicator size='large' color="#766ec5" />
					}
					{prontoAval && avalArr.length == 0 && 
						<Paragraph>Nenhuma autoavaliação salva.</Paragraph>
					}
					{prontoAval && avalArr.map((a, index) => {

						count++;

						if((count % avalArr.length) == avalArr.length - 1){
							lastAval = arrIds[count % avalArr.length];
						}

						arr[count] = arrIds[count % avalArr.length];

						return (
							<Card style={styles.cardAutoAval} key={count % avalArr.length} idTeste={arrIds[count % avalArr.length]}>
								<Card.Content>
									<View style={styles.headerCard}>
										<Title>Autoavaliação {a.data}</Title>
										<View style={{ flexDirection: "row" }}>
											<IconButton icon="pencil" color="#534d8a" size={25} onPress={() => navigation.navigate("EditarAutoAval", { txt: a.txt, id: arr[index]})}></IconButton>
											<IconButton icon="delete" color="#534d8a" size={25} onPress={() => deleteAval(arr[index])}></IconButton>
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
			<Portal>
				<Dialog visible={visibleDialog1} dismissable={false}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#766ec5"/>
						<Paragraph>Excluindo autoavaliação...</Paragraph>
					</Dialog.Content>
				</Dialog>
				<Dialog visible={visibleDialog2} dismissable={true} onDismiss={() => confirm()}>
					<Dialog.Content>
						<Paragraph>Autoavaliação removida com sucesso!</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function telaEscreverAutoAval({ route, navigation }) {

	const [txt, setTxt] = React.useState('');
	const [visibleDialog1, setVisibleDialog1] = React.useState(false);
	const [visibleDialog2, setVisibleDialog2] = React.useState(false);
	let currentUserUID = firebase.auth().currentUser.uid;

	var today = new Date();
	var d = String(today.getDate()).padStart(2, '0');
	var m = String(today.getMonth() + 1).padStart(2, '0');

	function press() {

		setVisibleDialog1(true);
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

		setVisibleDialog1(false);
		setVisibleDialog2(true);

	}

	function confirm() {
		setVisibleDialog2(false);
		navigation.goBack();
	}

	return (
		<View style={styles.container}>
			<Text style={{fontSize: 22, textAlign: 'center'}}>Escrever autoavaliação</Text>
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
			<Portal>
				<Dialog visible={visibleDialog1} dismissable={false}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#766ec5"/>
						<Paragraph>Salvando autoavaliação...</Paragraph>
					</Dialog.Content>
				</Dialog>
				<Dialog visible={visibleDialog2} onDismiss={() => confirm()}>
					<Dialog.Content>
						<Paragraph>Autoavaliação salva com sucesso!</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function telaEditarAutoAval({ route }) {

	const [txt, setTxt] = React.useState(route.params.txt);
	const [visibleDialog1, setVisibleDialog1] = React.useState(false);
	const [visibleDialog2, setVisibleDialog2] = React.useState(false);
	let idAval = route.params.id;
	let currentUserUID = firebase.auth().currentUser.uid;
	const navigation = useNavigation();

	function press(){

		setVisibleDialog1(true);

		firebase
			.firestore()
			.collection('users')
			.doc(currentUserUID)
			.collection('autoaval')
			.doc(idAval)
			.update({
				txt: txt,
			});

		setVisibleDialog1(false);
		setVisibleDialog2(true);
	}

	function confirm() {
		setTxt('');
		setVisibleDialog2(false);
		navigation.navigate('AutoAval');
	}

	return (
		<View style={styles.container}>
			<Text style={{fontSize: 22, textAlign: 'center'}}>Escrever autoavaliação</Text>
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
			<Portal>
				<Dialog visible={visibleDialog1} dismissable={false}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#766ec5"/>
						<Paragraph>Salvando autoavaliação...</Paragraph>
					</Dialog.Content>
				</Dialog>
				<Dialog visible={visibleDialog2} onDismiss={() => confirm()}>
					<Dialog.Content>
						<Paragraph>Autoavaliação salva com sucesso!</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
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
