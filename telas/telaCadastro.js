import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Dimensions } from 'react-native';
import "firebase/firestore";
import logo from "./assets/logo.png";
import { cadastro } from "../firebase/firebaseMethods.js";

export default function telaCadastro({ navigation }){
	
	const [email, setEmail] = React.useState('');
	const [nome, setNome] = React.useState('');
	const [senha, setSenha] = React.useState('');
	const [confSenha, setConfSenha] = React.useState('');
	
	const emptyState = () => {
		setEmail('');
		setNome('');
		setSenha('');
		setConfSenha('');
	};
	
	function press() {
	
		if(email === '' || senha === '' || confSenha === ''){
			alert("Email ou senha inválidos");
		}else if(senha !== confSenha){
			alert("As senhas diferem");
		}else{
			cadastro(email, senha, nome);
			navigation.navigate("Login");
			emptyState();
		}
		
	}	
	
	return(
		<View style={styles.container}>
			<View style={{flex: 0.25, justifyContent: 'center', alignItems: 'center'}}>
				<Image style={styles.logo2} source={logo} />
			</View>
			<View style={{flex: 0.75, justifyContent: 'center', alignItems: 'center'}}>
				<TextInput style={styles.txtinput} placeholder='Email Institucional' placeholderTextColor='#d9d9d9' onChangeText={setEmail} value={email}/>
				<TextInput style={styles.txtinput} placeholder='Nome completo' placeholderTextColor='#d9d9d9' onChangeText={setNome} value={nome}/>
				<TextInput style={styles.txtinput} placeholder='Senha' placeholderTextColor='#d9d9d9' secureTextEntry = {true} onChangeText={setSenha} value={senha}/>
				<TextInput style={styles.txtinput} placeholder='Confirmar senha' placeholderTextColor='#d9d9d9' secureTextEntry = {true} onChangeText={setConfSenha} value={confSenha}/>
				<TouchableOpacity style={nome === '' || email === '' || senha === '' || confSenha === '' ? styles.butaoInativo : styles.butao} onPress={press}>
					<Text style={nome === '' || email === '' || senha === '' || confSenha === '' ? styles.txtbotaoInativo : styles.txtbotao}>Cadastrar</Text>
				</TouchableOpacity>
			</View>
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
		width: 0.9 * Dimensions.get('window').width,
		height: undefined,
		aspectRatio: 3.702,
	},
  
	txt: {
		fontSize: 25,
		color: '#1f1f1f',
	},
  
	txtbotao: {
		fontSize: 18,
		color: '#766ec5',
	},

	txtbotaoInativo: {
		fontSize: 18,
		color: '#e6e6e6',
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
		width: 0.3 * Dimensions.get('window').width,
		justifyContent: 'center',
		alignItems: 'center',
	},

	butaoInativo: {
		backgroundColor: '#bbb7e2',
		borderRadius: 5,
		padding: 5,
		marginTop: 30,
		marginBottom: 50,
		width: 0.3 * Dimensions.get('window').width,
		justifyContent: 'center',
		alignItems: 'center',
	},
  
	txtclicavel: {
		backgroundColor: '#766ec5',
		padding: 5,
	},
 
});