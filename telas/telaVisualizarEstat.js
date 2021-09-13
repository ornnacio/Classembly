import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button, Dimensions, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { FAB, Card, Title, Paragraph, Button as ButtonPaper, IconButton } from 'react-native-paper';
import firebase from 'firebase';
import 'firebase/firestore';
import { IDContext } from "./context.js";

import alunosPrioridade from "./assets/alunosPrioridade.png";
import estatIndividuais from "./assets/estatIndividuais.png";
import estatComparadas from "./assets/estatComparadas.png";

const Stack = createStackNavigator();

function telaVisualizarEstat({navigation}){
	
	return(
		<View style={styles.container}>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("EstudantesPrio")}>
				<Image style={styles.iconBotao} source={alunosPrioridade} />
				<Text style={styles.txtbotaohome}>Estudantes com Prioridade de Discussão</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("EstatIndividuais")}>
				<Image style={styles.iconBotao} source={estatIndividuais} />
				<Text style={styles.txtbotaohome}>Visualizar Estatísticas Individuais</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("EstatComparadas")}>
				<Image style={styles.iconBotao} source={estatComparadas} />
				<Text style={styles.txtbotaohome}>Visualizar Estatísticas Comparadas</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaEstudantesPrio({navigation}){

	const [alunos, setAlunos] = React.useState([]);
	const [alunosId, setAlunosId] = React.useState([]);
	const [alunosDisp, setAlunosDisp] = React.useState([]);
	const [alunosDispId, setAlunosDispId] = React.useState([]);
	const [prontoAlunos, setProntoAlunos] = React.useState(false);
	const idTurma = React.useContext(IDContext);
	const isFocused = useIsFocused();
	
	useEffect(() => {
		
		async function getAlunos(){
			
			if(!prontoAlunos){

				let doc = await firebase
				.firestore()
				.collection('turmas')
				.doc(idTurma)
				.collection('alunos')
				.get()
				.then((query) => {
					
					const list = [], listId = [], listDisp = [], listDispId = [];
					
					query.forEach((doc) => {
						
						list.push(doc.data());
						listId.push(doc.id);
						
						if(!doc.data().prio){
							listDisp.push(doc.data());
							listDispId.push(doc.id);
						}
					})
					
					setAlunos(list);
					setAlunosId(listId);
					setAlunosDisp(listDisp);
					setAlunosDispId(listDispId);
					setProntoAlunos(true);
				})
			}
		}
		
		getAlunos();
	
	}, [isFocused]);
	
	return(
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				{alunos.map((a, index) => {
					
					if(a.prio){
						return(
							<Card style={styles.cardPrio}>
								<Card.Content>
									<View style={styles.headerCard}>
										<Title>{a.nome}</Title>
										<View style={{flexDirection: "row"}}>
											<IconButton icon="pencil" color="#534d8a" size={25} onPress={() => alert("macactoooo")}></IconButton>
											<IconButton icon="delete" color="#534d8a" size={25} onPress={() => alert("macactoooo")}></IconButton>
										</View>
									</View>
									<Paragraph>{a.motivo_prio}</Paragraph>
								</Card.Content>
							</Card>
						);
					}
				})}
				</View>
			</ScrollView>
			<FAB
				style={styles.fab}
				icon="plus"
				color="white"
				onPress={() => navigation.navigate("AddEstudantePrio", {alunos: alunosDisp, ids: alunosDispId})}
			/>
		</View>
	);
}

function adicionarEstudantePrio({ route, navigation }){
	
	let alunos = route.params.alunos, ids = route.params.ids;
	
	return(
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					{alunos.map((a, index) => {
					
						return(
							<Card style={styles.cardPrio}>
								<Card.Content>
									<View style={styles.headerCard}>
										<Title>{a.nome}</Title>
										<IconButton icon="plus" color="#534d8a" size={25} onPress={() => alert("macactoooo")}></IconButton>
									</View>
								</Card.Content>
							</Card>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
}

function telaEstatIndividuais({navigation}){
	return(
		<View style={styles.container}>
			<Text>placeholder 2</Text>
		</View>
	);
}

function telaEstatComparadas({navigation}){
	return(
		<View style={styles.container}>
			<Text>placeholder 3</Text>
		</View>
	);
}

export default function stackVisualizarEstat({navigation}){
	return(
		<Stack.Navigator screenOptions={{headerStyle: {backgroundColor: '#766ec5'}, headerTintColor: '#f4f9fc'}} initialRouteName="MainVisualizarEstat">
			<Stack.Screen 
				name={"MainVisualizarEstat"} 
				component={telaVisualizarEstat} 
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen 
				name={"EstudantesPrio"} 
				component={telaEstudantesPrio}
				options={{
					title: 'Estudantes com prioridade de discussão'
				}}
			/>
			<Stack.Screen 
				name={"AddEstudantePrio"} 
				component={adicionarEstudantePrio}
				options={{
					title: 'Adicionar aluno com prioridade de discussão'
				}}
			/>
			<Stack.Screen 
				name={"EstatIndividuais"} 
				component={telaEstatIndividuais} 
				options={{
					title: 'Visualizar estatísticas individuais'
				}}
			/>
			<Stack.Screen 
				name={"EstatComparadas"} 
				component={telaEstatComparadas} 
				options={{
					title: 'Visualizar estatísticas comparadas'
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
		backgroundColor: '#766ec5',
		padding: 5,
		borderRadius: 5,
		marginBottom: 50,
		width: "80%",
	},
	
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: '#766ec5',
	},
	
	cardPrio: {
		width: 0.95 * Dimensions.get('window').width,
		margin: 10,
	},
	
	headerCard: {
		flexDirection: 'row', 
		justifyContent: 'space-between', 
		alignItems: 'center'
	},
 
});