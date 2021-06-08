import 'react-native-gesture-handler'; //esse import tem q ta no topo
import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

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
	return(
		<View style={styles.container}>
			<Text>placeholder 1</Text>
			<TouchableOpacity style={styles.butaoHomePuro} onPress={() => navigation.navigate("MainVisualizarEstat")}>
				<Text style={styles.txtbotaohomePuro}>Voltar</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaEstatIndividuais({navigation}){
	return(
		<View style={styles.container}>
			<Text>placeholder 2</Text>
			<TouchableOpacity style={styles.butaoHomePuro} onPress={() => navigation.navigate("MainVisualizarEstat")}>
				<Text style={styles.txtbotaohomePuro}>Voltar</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaEstatComparadas({navigation}){
	return(
		<View style={styles.container}>
			<Text>placeholder 3</Text>
			<TouchableOpacity style={styles.butaoHomePuro} onPress={() => navigation.navigate("MainVisualizarEstat")}>
				<Text style={styles.txtbotaohomePuro}>Voltar</Text>
			</TouchableOpacity>
		</View>
	);
}

export default function stackVisualizarEstat({navigation}){
	return(
		<Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="MainVisualizarEstat">
			<Stack.Screen name={"MainVisualizarEstat"} component={telaVisualizarEstat} />
			<Stack.Screen name={"EstudantesPrio"} component={telaEstudantesPrio} />
			<Stack.Screen name={"EstatIndividuais"} component={telaEstatIndividuais} />
			<Stack.Screen name={"EstatComparadas"} component={telaEstatComparadas} />
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
 
});