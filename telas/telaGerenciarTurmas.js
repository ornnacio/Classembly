import 'react-native-gesture-handler'; //esse import tem q ta no topo
import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import firebase from 'firebase';
import 'firebase/firestore';
import { DataTable } from 'react-native-paper';
import ModalDropdown from 'react-native-modal-dropdown';

import { IDContext } from "./context.js";

import visualizarTurmas from "./assets/visualizarTurmas.png";
import cadastrarEstatisticas from "./assets/cadastrarEstatisticas.png";

const Stack = createStackNavigator();

let arrNome = [], arrComp = [], arrModo = [];

function telaGerenciarTurmas({route, navigation}){
	
	return(
		<View style={styles.container}>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("VisualizarTurma")}>
				<Image style={styles.iconBotao} source={visualizarTurmas}/>
				<Text style={styles.txtbotaohome}>Visualizar e Editar Parecer da Turma</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.butaoHome}>
				<Image style={styles.iconBotao} source={cadastrarEstatisticas} />
				<Text style={styles.txtbotaohome}>Visualizar e Cadstrar Comentários Individuais</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaVisualizarTurma({navigation}){
	
	const[alunos, setAlunos] = React.useState([]);
	const a = React.useContext(IDContext);
	let c = -1;
	
	useEffect(() => {
		
		async function getUserInfo(){
			
			let doc = await firebase
			.firestore()
			.collection('turmas')
			.doc(a)
			.collection('alunos')
			.onSnapshot((query) => {
				
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
			
			firebase
			.firestore()
			.collection('turmas')
			.doc(a)
			.collection('alunos')
			.doc(str)
			.set({
				nome: arrNome[i],
				comp: arrComp[i],
				aprendizado: arrModo[i],
			});
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

export default function stackGerenciarTurmas({navigation}){
	return(
		<Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="MainGerencTurmas">
			<Stack.Screen name={"MainGerencTurmas"} component={telaGerenciarTurmas} />
			<Stack.Screen name={"VisualizarTurma"} component={telaVisualizarTurma} />
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
		fontSize: 14,
		fontFamily: 'sans-serif',
	},
	
	txtDropdownBotao: {
		fontSize: 14,
	},
 
});