import 'react-native-gesture-handler'; //esse import tem q ta no topo
import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button } from 'react-native';
import firebase from 'firebase';
import "firebase/firestore";
import { db } from "../firebase/firebase.js";
import logo from "./assets/logo.png";
import { login } from "../firebase/firebaseMethods.js";

export default function telaLogin({ navigation }){
	
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	
	function press(){
		if (email === '' || senha === '') {
			Alert.alert('Email ou senha inválidos.');
		}
		
		login(email, senha);
		setEmail('');
		setSenha('');
		navigation.navigate("Loading");
	}
	
	return(
		<View style={styles.container}>
			<Image style={styles.logo1} source={logo} />
			<TextInput style={styles.txtinput} placeholder='Email Institucional' placeholderTextColor='#d9d9d9' onChangeText={setEmail} value={email}/>
			<TextInput style={styles.txtinput} placeholder='Senha' placeholderTextColor='#d9d9d9' secureTextEntry = {true} onChangeText={setSenha} value={senha}/>
			<TouchableOpacity style={styles.butao} onPress={press}>
				<Text style={styles.txtbotao}> Entrar </Text>
			</TouchableOpacity>
			
			<View style={styles.rodape}>
				<TouchableOpacity style={styles.txtclicavel} onPress={() => navigation.navigate("Cadastro")}>
					<Text style={styles.txtbotaoTransparente}> Não tem uma conta? </Text>
				</TouchableOpacity>
			</View>
			<StatusBar style="auto" />
		</View>
	);
}

export const styles = StyleSheet.create({
	
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#766ec5',
		alignItems: 'center',
		justifyContent: 'center',
	},
 
	rodape: {
		flex: 0.15,
		backgroundColor: '#766ec5',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},

	logo1: {
		height: 88.8,
		width: 328.8,
		marginBottom: 100,
	},
  
	txtbotao: {
		fontSize: 18,
		color: '#1f1f1f',
	},
  
	txtbotaoTransparente: {
		fontSize: 18,
		color: '#ffffff',
	},
  
	txtbotaohome: {
		flex: 0.8,
		fontSize: 20,
		color: '#1f1f1f',
		textAlign: 'center',
	},
  
	txtinput: {
		width: 200,
		height: 40,
		color: '#d9d9d9',
		borderColor: '#d9d9d9',
		borderBottomWidth: 2,
		marginBottom: 20,
	},	
  
	butao: {
		backgroundColor: '#ffffff',
		borderRadius: 5,
		padding: 5,
		marginTop: 30,
		marginBottom: 50,
	},
  
	txtclicavel: {
		backgroundColor: '#766ec5',
		padding: 5,
	},
 
});