import 'react-native-gesture-handler'; //esse import tem q ta no topo
import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Button, ScrollView, Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import firebase from 'firebase';
import 'firebase/firestore';
import { DataTable, List, TextInput } from 'react-native-paper';
import { ExpandableListView } from 'react-native-expandable-listview';
import ModalDropdown from 'react-native-modal-dropdown';
import { IDContext } from "./context.js";

import visualizarTurmas from "./assets/visualizarTurmas.png";
import cadastrarEstatisticas from "./assets/cadastrarEstatisticas.png";

const Stack = createStackNavigator();

let arrNome = [], arrComp = [], arrModo = [], arrAlunos = [];

function telaGerenciarTurmas({route, navigation}){
	
	const [alunosDados, setAlunosDados] = React.useState([]);
	const idTurma = React.useContext(IDContext);
	
	useEffect(() => {
	
		async function getAlunos(){
			
			let doc = await firebase
			.firestore()
			.collection('turmas')
			.doc(idTurma)
			.collection('alunos')
			.get()
			.then((query) => {
				
				const list = [];
				
				query.forEach((doc) => {
					list.push(doc.data().nome);
				})
				
				setAlunosDados(list);
			})
		}
		
		getAlunos();
		
	})
	
	return(
		<View style={styles.container}>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("VisualizarTurma")}>
				<Image style={styles.iconBotao} source={visualizarTurmas}/>
				<Text style={styles.txtbotaohome}>Visualizar e Editar Parecer da Turma</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("ComentáriosIndividuais", {nomes: alunosDados})}>
				<Image style={styles.iconBotao} source={cadastrarEstatisticas} />
				<Text style={styles.txtbotaohome}>Visualizar e Cadastrar Comentários Individuais</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaVisualizarTurma({navigation}){
	
	const[alunos, setAlunos] = React.useState([]);
	const idTurma = React.useContext(IDContext);
	let c = -1;
	
	useEffect(() => {
		
		async function getUserInfo(){
			
			let doc = await firebase
			.firestore()
			.collection('turmas')
			.doc(idTurma)
			.collection('alunos')
			.get()
			.then((query) => {
				
				const list = [];
				
				query.forEach((doc) => {
					list.push(doc.data());
				})
				
				setAlunos(list);
			})
		}
		
		
		getUserInfo();
	})
	
	async function press(){
		
		for(var i = 0; i < alunos.length; i++){
			
			let str = 'a' + (i + 1);
			
			try{
				firebase
				.firestore()
				.collection('turmas')
				.doc(idTurma)
				.collection('alunos')
				.doc(str)
				.set({
					nome: arrNome[i],
					comp: arrComp[i],
					aprendizado: arrModo[i],
				});
			}catch(e){
				alert(e.message);
			}
		}
		
		alert("Alterações salvas com sucesso");
		
	}
	
	return(
		<View style={styles.container}>
			<DataTable style={{ width: '95%', marginBottom: 50 }}>
				<DataTable.Row>
					<DataTable.Title>Nome do aluno</DataTable.Title>
					<DataTable.Title>Comportamento</DataTable.Title>
					<DataTable.Title>Modo de aprendizado</DataTable.Title>
				</DataTable.Row>
				{alunos.map((a) => {
					
					let count = c + 1;
					c = c + 1;
					let indexA, indexC;
					arrNome.push(a.nome);
					arrModo.push(a.aprendizado);
					arrComp.push(a.comp);
					
					if(a.aprendizado === 'Auditivo'){
						indexA = 0;
					}else if(a.aprendizado === 'Cinestésico'){
						indexA = 1;
					}else{
						indexA = 2;
					}
					
					if(a.comp === 'Participativo'){
						indexC = 0;
					}else if(a.comp === 'Não Participativo'){
						indexC = 1;
					}
					
					return(
						<DataTable.Row>
							<DataTable.Cell>{arrNome[count]}</DataTable.Cell>
							<DataTable.Cell>
								<ModalDropdown 
									options={['Participativo', 'Não Participativo']}
									defaultIndex={indexC}
									defaultValue={a.comp}
									onSelect={(idx, value) => {arrComp[count] = value}}
									textStyle={styles.txtDropdownBotao}
									dropdownTextStyle={styles.txtDropdown}
								/>
							</DataTable.Cell>
							<DataTable.Cell>
								<ModalDropdown 
									options={['Auditivo', 'Cinestésico', 'Visual']}
									defaultIndex={indexA}
									defaultValue={a.aprendizado}
									onSelect={(idx, value) => {arrModo[count] = value}}
									textStyle={styles.txtDropdownBotao}
									dropdownTextStyle={styles.txtDropdown}
								/>
							</DataTable.Cell>
						</DataTable.Row>
					);
				})}
			</DataTable>

			<TouchableOpacity style={styles.butaoHomePuro} onPress={press}>
				<Text style={styles.txtbotaohomePuro}>Salvar</Text>
			</TouchableOpacity>
			
			<TouchableOpacity style={styles.butaoHomePuro} onPress={() => navigation.navigate("MainGerencTurmas")}>
				<Text style={styles.txtbotaohomePuro}>Voltar</Text>
			</TouchableOpacity>
		</View>
	);
}

class aluno {
	
	constructor(nome, comentarios, id){
		this.nome = nome;
		this.comentarios = comentarios;
		this.id = id;
	}
	
	printComentarios(){
		let s = '';
		
		this.comentarios.forEach((c) => {
			s = s + 'Comentário de ' + c.autor + ': ' + c.txt + '\n';
		})
		
		return s;
	}
}

function telaComentarios({ route, navigation }){
	
	const [alunos, setAlunos] = React.useState([]);
	const idTurma = React.useContext(IDContext);
	let width = 0.9 * Dimensions.get('window').width;
	const isFocused = useIsFocused();
	
	useEffect(() => {
		
		async function getComentarios(){
			
			arrAlunos = [];
			
			for(const [i, v] of route.params.nomes.entries()){
				
				let str = 'a' + (i+1);
				
				firebase
				.firestore()
				.collection('turmas')
				.doc(idTurma)
				.collection('alunos')
				.doc(str)
				.collection('comentarios')
				.get()
				.then((query) => {
					
					const list = [];
					
					query.forEach((doc) => {
						list.push(doc.data());
					})

					const a = new aluno(v, list, str);
					arrAlunos.push(a);
					
					if((i+1) === route.params.nomes.length){
						setAlunos(arrAlunos);
					}
				})
				
			}
		}
		
		getComentarios();
		
	}, [isFocused])
	
	return(
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					{alunos.map((a) => {
					
						return(
							<List.Section style={styles.listSection}>
								<List.Accordion title={a.nome}>
									<Text style={{}}>{a.printComentarios()}</Text>
									<TouchableOpacity style={styles.botaoAddComentario} onPress={() => navigation.navigate("EscreverComentário", {id: a.id, lastC: a.comentarios.length})}>
										<Text style={{}}>Adicionar novo comentário</Text>
									</TouchableOpacity>
								</List.Accordion>
							</List.Section>
						);
					})}
					<TouchableOpacity style={styles.butaoHomePuro} onPress={() => navigation.navigate("MainGerencTurmas")}>
						<Text style={styles.txtbotaohomePuro}>Voltar</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
}

function telaEscreverComentario({ route, navigation }){
	
	const [txt, setTxt] = React.useState('');
	const [nome, setNome] = React.useState('');
	let idAluno = route.params.id;
	let lastC = route.params.lastC + 1;
	let currentUserUID = firebase.auth().currentUser.uid;
	const idTurma = React.useContext(IDContext);
	
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
		
	});
	
	function press(){
		
		var idLast = String(lastC).padStart(3, '0')
		let strAtual = 'c' + idLast;
	
		firebase
		.firestore()
		.collection('turmas')
		.doc(idTurma)
		.collection('alunos')
		.doc(idAluno)
		.collection('comentarios')
		.doc(strAtual)
		.set({
			txt: txt,
			autor: nome,
		});
		
		alert('Comentário salvo com sucesso!');
		navigation.navigate('ComentáriosIndividuais');
	}
	
	return(
		<View style={styles.container}>
			<TextInput
				style={styles.inputBox}
				underlineColor='#766ec5'
				multiline={true}
				numberOfLines={6}
				onChangeText={(text) => setTxt(text)}
				value={txt}
			/>
			<TouchableOpacity style={styles.butaoHomePuro} onPress={() => press()}>
				<Text style={styles.txtbotaohomePuro}>Salvar Comentário</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.butaoHomePuro} onPress={() => navigation.navigate("ComentáriosIndividuais")}>
				<Text style={styles.txtbotaohomePuro}>Voltar</Text>
			</TouchableOpacity>
		</View>
	);
}

export default function stackGerenciarTurmas({navigation}){
	return(
		<Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="MainGerencTurmas">
			<Stack.Screen name={"MainGerencTurmas"} component={telaGerenciarTurmas} />
			<Stack.Screen name={"VisualizarTurma"} component={telaVisualizarTurma} />
			<Stack.Screen name={"ComentáriosIndividuais"} component={telaComentarios} />
			<Stack.Screen name={"EscreverComentário"} component={telaEscreverComentario} />
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
		textAlign: 'center',
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
	
	txtDropdown:{
		fontSize: 12,
		fontFamily: 'sans-serif',
	},
	
	txtDropdownBotao: {
		fontSize: 12,
	},
	
	listSection: {
		width: 0.9 * Dimensions.get('window').width, 
		marginBottom: 25, 
		backgroundColor: '#d9d9d9',
		padding: 5, 
		borderRadius: 5,
		tintColor: '#766ec5',
	},
	
	botaoAddComentario: {
		height: 50, 
		backgroundColor: '#69b00b', 
		alignItems: 'center', 
		width: 0.55 * Dimensions.get('window').width,
		borderRadius: 5,
		alignSelf: 'center',
		textAlign: 'center',
		justifyContent: 'center', 
		alignItems: 'center',
	},
	
	inputBox: { 
		margin: 25, 
		borderRadius: 5, 
		width: 0.7 * Dimensions.get('window').width, 
	},
 
});