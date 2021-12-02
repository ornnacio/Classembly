import { StatusBar } from 'expo-status-bar';
import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button, Dimensions } from 'react-native';
import "firebase/firestore";
import logo from "./assets/logo.png";
import { login } from "../firebase/firebaseMethods.js";

export default function telaLogin({ navigation }){
	
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	
	function press(){
		if (email === '' || senha === '') {
			Alert.alert('Email ou senha inválidos.');
		}else{
			login(email, senha);
			setEmail('');
			setSenha('');
			navigation.navigate("Loading");
		}
	}
	
	return(
		<View style={styles.container}>
			<View style={{flex: 0.25, justifyContent: 'center', alignItems: 'center'}}>
				<Image style={styles.logo1} source={logo} />
			</View>
			<View style={{flex: 0.75, justifyContent: 'center', alignItems: 'center'}}>
				<View style={{flex: 0.8, justifyContent: 'center', alignItems: 'center'}}>
					<TextInput style={styles.txtinput} placeholder='Email Institucional' placeholderTextColor='#d9d9d9' onChangeText={setEmail} value={email}/>
					<TextInput style={styles.txtinput} placeholder='Senha' placeholderTextColor='#d9d9d9' secureTextEntry = {true} onChangeText={setSenha} value={senha}/>
					<TouchableOpacity style={email === '' || senha === '' ? styles.butaoInativo : styles.butao} onPress={press} disabled={email === ''}>
						<Text style={email === '' || senha === '' ? styles.txtbotaoInativo : styles.txtbotao}>Entrar</Text>
					</TouchableOpacity>
				</View>
				<View style={{flex: 0.2, justifyContent: 'center', alignItems: 'center'}}>
					<View style={styles.rodape}>
						<TouchableOpacity style={styles.txtclicavel} onPress={() => navigation.navigate("Cadastro")}>
							<Text style={styles.txtbotaoTransparente}>Não tem uma conta? Registre-se</Text>
						</TouchableOpacity>
					</View>
				</View>
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
 
	rodape: {
		backgroundColor: '#766ec5',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},

	logo1: {
		width: 0.9 * Dimensions.get('window').width,
		height: undefined,
		aspectRatio: 3.702,
	},
  
	txtbotao: {
		fontSize: 18,
		color: '#766ec5',
	},

	txtbotaoInativo: {
		fontSize: 18,
		color: '#e6e6e6',
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
		width: 0.6 * Dimensions.get('window').width,
		height: 40,
		color: '#d9d9d9',
		borderColor: '#d9d9d9',
		borderBottomWidth: 2,
		marginBottom: 10,
	},	
  
	butao: {
		backgroundColor: '#ffffff',
		borderRadius: 5,
		padding: 5,
		marginTop: 30,
		marginBottom: 15,
		width: 0.3 * Dimensions.get('window').width,
		justifyContent: 'center',
		alignItems: 'center',
	}, 

	butaoInativo: {
		backgroundColor: '#bbb7e2',
		borderRadius: 5,
		padding: 5,
		marginTop: 30,
		marginBottom: 15,
		width: 0.3 * Dimensions.get('window').width,
		justifyContent: 'center',
		alignItems: 'center',
	},
  
	txtclicavel: {
		backgroundColor: '#766ec5',
		padding: 5,
	},
 
});