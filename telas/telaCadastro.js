import 'react-native-gesture-handler'; //esse import tem q ta no topo
import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button, SafeAreaView } from 'react-native';
import firebase from 'firebase';
import "firebase/firestore";
import { db } from "../firebase/firebase.js";
import logo from "./assets/logo.png";
import { cadastro } from "../firebase/firebaseMethods.js";

export default function telaCadastro({ navigation }){
	
	const [email, setEmail] = React.useState('');
	const [senha, setSenha] = React.useState('');
	const [confSenha, setConfSenha] = React.useState('');
	
	const emptyState = () => {
		setEmail('');
		setSenha('');
		setConfSenha('');
	};
	
	function press() {
	
		if(email === '' || senha === '' || confSenha === ''){
			alert("Email ou senha inválidos");
		}else if(senha !== confSenha){
			alert("As senhas diferem");
		}else{
			cadastro(email, senha);
			navigation.navigate("Login");
			emptyState();
		}
	}	
	
	return(
		<View style={styles.container}>
			<Image style={styles.logo2} source={logo} />
			<TextInput style={styles.txtinput} placeholder='Email Institucional' placeholderTextColor='#d9d9d9' onChangeText={setEmail} value={email}/>
			<TextInput style={styles.txtinput} placeholder='Senha' placeholderTextColor='#d9d9d9' secureTextEntry = {false} onChangeText={setSenha} value={senha}/>
			<TextInput style={styles.txtinput} placeholder='Confirmar senha' placeholderTextColor='#d9d9d9' secureTextEntry = {false} onChangeText={setConfSenha} value={confSenha}/>
			<TouchableOpacity style={styles.butao} onPress={press}>
				<Text style={styles.txtbotao}>Cadastrar</Text>
			</TouchableOpacity>
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
  
	logo2: {
		height: 88.8,
		width: 328.8,
		marginBottom: 50,
	},
  
	txt: {
		fontSize: 25,
		color: '#1f1f1f',
	},
  
	txtbotao: {
		fontSize: 18,
		color: '#1f1f1f',
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