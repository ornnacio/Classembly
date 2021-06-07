import 'react-native-gesture-handler'; //esse import tem q ta no topo
import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TextInput, Image, TouchableOpacity, Alert, Button, Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph } from 'react-native-paper';
import firebase from 'firebase';
import "firebase/firestore";

import importarNotas from "./assets/importarNotas.png";
import autoAvalDocente from "./assets/autoAvalDocente.png";

const Stack = createStackNavigator();

function telaPrepConselho({navigation}){
	
	return(
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

function telaImportarNotas({navigation}){
	return(
		<View style={styles.container}>
			<Text>placeholder 1</Text>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("MainPrepConselho")}>
				<Text style={styles.txtbotaohomePuro}>Voltar</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaAutoAval({navigation}){
	
	const [avalArr, setAvalArr] = useState([]);
	let currentUserUID = firebase.auth().currentUser.uid;
	let lastAval = 0;
	let width = 0.9 * Dimensions.get('window').width;
	
	useEffect(() => {
		
		async function getAutoAvaliações(){
			
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
			})
		}
		
		getAutoAvaliações();
	})
	
	return(
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					{avalArr.map((a) => {
						
						lastAval += 1;
						
						return(
							<Card style={{width: width}}>
								<Card.Content>
								  <Title>Auto-Avaliação {a.data}</Title>
								  <Paragraph>{a.txt}</Paragraph>
								</Card.Content>
							</Card>
						)
					})}
					<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("EscreverAutoAval", {lastAval})}>
						<Text style={styles.txtbotaohomePuro}>Escrever Auto-Avaliação</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("MainPrepConselho")}>
						<Text style={styles.txtbotaohomePuro}>Voltar</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
}

function telaEscreverAutoAval({ route }){
	
	const [txt, setTxt] = React.useState('');
	let currentUserUID = firebase.auth().currentUser.uid;
	const navigation = useNavigation();
	
	var today = new Date();
	var d = String(today.getDate()).padStart(2, '0');
	var m = String(today.getMonth() + 1).padStart(2, '0');
	
	function press(){
		
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
		
		alert('Auto-Avaliação salva com sucesso!');
		setTxt('');
		navigation.navigate('AutoAval');
	}
	
	return(
		<View style={styles.container}>
			<TextInput
				style={{backgroundColor: '#d9d9d9'}}
				multiline={true}
				numberOfLines={4}
				onChangeText={(text) => setTxt(text)}
				value={txt}
			/>
			<TouchableOpacity style={styles.butaoHome} onPress={press}>
				<Text style={styles.txtbotaohomePuro}>Salvar</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("AutoAval")}>
				<Text style={styles.txtbotaohomePuro}>Voltar</Text>
			</TouchableOpacity>
		</View>
	);
}

export default function stackPrepConselho({navigation}){
	return(
		<Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="MainPrepConselho">
			<Stack.Screen name={"MainPrepConselho"} component={telaPrepConselho} />
			<Stack.Screen name={"ImportarNotas"} component={telaImportarNotas} />
			<Stack.Screen name={"AutoAval"} component={telaAutoAval} />
			<Stack.Screen name={"EscreverAutoAval"} component={telaEscreverAutoAval} />
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
 
});