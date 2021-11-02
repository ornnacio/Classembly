import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import firebase from 'firebase';
import 'firebase/firestore';
import { DataTable, List, TextInput, FAB, IconButton } from 'react-native-paper';
import ModalDropdown from 'react-native-modal-dropdown';
import AwesomeAlert from 'react-native-awesome-alerts';
import { IDContext } from "./context.js";

import visualizarTurmas from "./assets/visualizarTurmas.png";
import cadastrarEstatisticas from "./assets/cadastrarEstatisticas.png";
import downArrow from "./assets/down-arrow.png";

const Stack = createStackNavigator();

let arrNome = [], arrComp = [], arrModo = [], arrAlunos = [];

function telaGerenciarTurmas({route, navigation}){
	
	return(
		<View style={styles.container}>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("VisualizarTurma")}>
				<Image style={styles.iconBotao} source={visualizarTurmas}/>
				<Text style={styles.txtbotaohome}>Visualizar e Editar Parecer da Turma</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.butaoHome} onPress={() => navigation.navigate("ComentáriosIndividuais")}>
				<Image style={styles.iconBotao} source={cadastrarEstatisticas} />
				<Text style={styles.txtbotaohome}>Visualizar e Cadastrar Comentários Individuais</Text>
			</TouchableOpacity>
		</View>
	);
}

function telaVisualizarTurma({navigation}){
	
	const [alunos, setAlunos] = React.useState([]);
	const [prontoAlunos, setProntoAlunos] = React.useState(false);
	const [showAlert, setShowAlert] = React.useState(false);
	const idTurma = React.useContext(IDContext);
	let c = -1;
	
	useEffect(() => {
		
		async function getUserInfo(){
			
			if(!prontoAlunos){

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
					setProntoAlunos(true);
				})
			}
		}
		
		
		getUserInfo();
		
	}, [])
	
	async function press(){
		
		var erro = false;
		
		for(var i = 0; i < alunos.length; i++){
			
			let str = 'a' + String((i + 1)).padStart(2, '0');
			
			try{
				firebase
				.firestore()
				.collection('turmas')
				.doc(idTurma)
				.collection('alunos')
				.doc(str)
				.update({
					nome: arrNome[i],
					comp: arrComp[i],
					aprendizado: arrModo[i],
				});
			}catch(e){
				alert(e.message);
				erro = true;
			}
		}
		
		if(!erro){
			setShowAlert(true);
		}
		
	}
	
	return(
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<DataTable style={{ width: Dimensions.get('window').width}}>
						<DataTable.Row>
							<DataTable.Title>Nome do aluno</DataTable.Title>
							<DataTable.Title>Comportamento</DataTable.Title>
							<DataTable.Title>Modo de aprendizado</DataTable.Title>
						</DataTable.Row>
						{!prontoAlunos &&
							<ActivityIndicator size='large' color="#766ec5" style={{marginVertical: 10}}/>
						}
						{prontoAlunos && alunos.map((a, index) => {
							
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
								<DataTable.Row key={index}>
									<DataTable.Cell>{arrNome[count]}</DataTable.Cell>
									<DataTable.Cell style={{justifyContent: 'center'}}>
										<ModalDropdown 
											options={['Participativo', 'Não Participativo']}
											defaultIndex={indexC}
											defaultValue={a.comp}
											onSelect={(idx, value) => {arrComp[count] = value}}
											textStyle={styles.txtDropdownBotao}
											dropdownTextStyle={styles.txtDropdown}
											dropdownStyle={{
												height: 70
											}}
											renderRightComponent={() => {
												return(
													<View>
														<Image style={{width: 10, height: 10, marginLeft: 2}} source={downArrow}/>
													</View>
												);
											}}
										/>
									</DataTable.Cell>
									<DataTable.Cell style={{justifyContent: 'center'}}>
										<ModalDropdown 
											options={['Auditivo', 'Cinestésico', 'Visual']}
											defaultIndex={indexA}
											defaultValue={a.aprendizado}
											onSelect={(idx, value) => {arrModo[count] = value}}
											textStyle={styles.txtDropdownBotao}
											dropdownTextStyle={styles.txtDropdown}
											dropdownStyle={{
												height: 105
											}}
											renderRightComponent={() => {
												return(
													<View>
														<Image style={{width: 10, height: 10, marginLeft: 2}} source={downArrow}/>
													</View>
												);
											}}
										/>
									</DataTable.Cell>
								</DataTable.Row>
							);
						})}
					</DataTable>
					<AwesomeAlert
						show={showAlert}
						showProgress={false}
						message="Alterações salvas com sucesso!"
						closeOnTouchOutside={true}
						closeOnHardwareBackPress={true}
						showCancelButton={false}
						showConfirmButton={true}
						confirmText="OK"
						confirmButtonColor="green"
						onConfirmPressed={() => {setShowAlert(false)}}
					/>
				</View>
			</ScrollView>
			<FAB
				style={styles.fab}
				icon="content-save"
				color="white"
				onPress={() => press()}
			/>
		</View>
	);
}

class aluno {
	
	constructor(nome, comentarios, id){
		this.nome = nome;
		this.comentarios = comentarios;
		this.id = id;
	}
}

function telaComentarios({ route, navigation }){
	
	const [alunos, setAlunos] = React.useState([]);
	const [prontoAlunos, setProntoAlunos] = React.useState(false);
	const [nome, setNome] = useState('');
	const [prontoEmail, setProntoEmail] = useState(false);
	const [dummy, setDummy] = useState(0);
	let currentUserUID = firebase.auth().currentUser.uid;
	const idTurma = React.useContext(IDContext);
	let width = 0.9 * Dimensions.get('window').width;
	const isFocused = useIsFocused();
	
	useEffect(() => {

		async function getUserInfo(){
			
			if(!prontoEmail){
			
				let doc = await firebase
				.firestore()
				.collection('users')
				.doc(currentUserUID)
				.get();

				if (doc.exists){
					let dataObj = doc.data();
					setNome(dataObj.nome);
					setProntoEmail(true);
				}
			}
		}

		getUserInfo();
		
		async function getComentarios(){

			arrAlunos = [];
			
			firebase.firestore()
				.collection('turmas')
				.doc(idTurma)
				.collection('alunos')
				.onSnapshot((query) => {

					var arrIds = [], arrNomes = [];

					query.forEach((a) => {
						arrIds.push(a.data().id_aluno);
						arrNomes.push(a.data().nome)
					})

					arrIds.forEach((item, index) => {

						firebase.firestore()
							.collection('alunos')
							.doc(item)
							.collection('comentarios')
							.onSnapshot((query) => {

								var arrComments = [];

								query.forEach((c) => {

									let obj = {
										id: c.id,
										autor: c.data().autor,
										txt: c.data().txt
									}

									arrComments.push(obj);
								})

								let a = new aluno(arrNomes[index], arrComments, item);
								arrAlunos.push(a);

								if(arrAlunos.length === arrIds.length){
									setAlunos(arrAlunos);
									setProntoAlunos(true);
								}
								
							})
					})
					
				})
				
		}
		
		getComentarios();
		
	}, [isFocused, dummy]);

	function deleteComentario(idC, idA){

		firebase.firestore()
			.collection('alunos')
			.doc(idA)
			.collection('comentarios')
			.doc(idC)
			.delete()
			.then(() => {
				setDummy(dummy + 1);
			})
	}

	return(
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					{!prontoAlunos &&
						<ActivityIndicator size='large' color="#766ec5" />
					}
					{prontoAlunos && alunos.map((a, index) => {

						return(
							<List.Section style={styles.listSection} key={index}>
								<List.Accordion title={a.nome} style={{backgroundColor: '#d9d9d9'}}>
									{a.comentarios.map(c => {
										return(
											<View style={{
												flexDirection: 'row',
												justifyContent: 'space-between',
												alignItems: 'center',
											}}>
												<View style={{flex: 0.8}}>
													<Text style={{
														fontSize: 16,
													}}>
														<Text style={{fontWeight: 'bold'}}>{c.autor}:</Text> {c.txt}
													</Text>
												</View>
												{c.autor === nome && <View style={{flex: 0.2, flexDirection: 'row', paddingRight: 10}}>
													<IconButton icon="pencil" color="#534d8a" size={18} onPress={() => navigation.navigate("EditarComentário", {id: c.id, idAluno: a.id, txt: c.txt})}></IconButton>
													<IconButton icon="delete" color="#534d8a" size={18} onPress={() => deleteComentario(c.id, a.id)}></IconButton>
												</View>}
											</View>
										)
									})}
									<TouchableOpacity style={styles.botaoAddComentario} onPress={() => navigation.navigate("EscreverComentário", {id: a.id, lastC: a.comentarios[a.comentarios.length - 1].id})}>
										<Text style={{ color: '#f4f9fc' }}>Adicionar novo comentário</Text>
									</TouchableOpacity>
								</List.Accordion>
							</List.Section>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
}

function telaEscreverComentario({ route, navigation }){
	
	const [txt, setTxt] = React.useState('');
	const [nome, setNome] = React.useState('');
	const [prontoNome, setProntoNome] = React.useState(false);
	const [showAlert, setShowAlert] = React.useState(false);
	
	let idAluno = route.params.id;
	let lastC = parseInt(route.params.lastC.split('c')[1]) + 1;
	let currentUserUID = firebase.auth().currentUser.uid;
	const idTurma = React.useContext(IDContext);
	
	useEffect(() => {
		
		async function getUserInfo(){
			
			if(!prontoNome){
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
		}
		
		getUserInfo();
		
	}, []);
	
	function press(){
		
		var idLast = String(lastC).padStart(3, '0')
		let strAtual = 'c' + idLast;
	
		firebase
		.firestore()
		.collection('alunos')
		.doc(idAluno)
		.collection('comentarios')
		.doc(strAtual)
		.set({
			txt: txt,
			autor: nome,
		});
		
		setShowAlert(true);
		
	}
	
	function confirm(){
		setShowAlert(false);
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
				placeholder="Digite o comentário..."
			/>
			<FAB
				style={styles.fab}
				icon="content-save"
				color="white"
				onPress={() => press()}
			/>
		</View>
	);
}

function telaEditarComentario({ route, navigation }){

	const [txt, setTxt] = React.useState(route.params.txt);

	function press(){

		firebase
		.firestore()
		.collection('alunos')
		.doc(route.params.idAluno)
		.collection('comentarios')
		.doc(route.params.id)
		.update({
			txt: txt,
		});
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
				placeholder="Digite o comentário..."
			/>
			<FAB
				style={styles.fab}
				icon="content-save"
				color="white"
				onPress={() => press()}
			/>
		</View>
	);
}

export default function stackGerenciarTurmas({navigation}){
	
	return(
		<Stack.Navigator initialRouteName="MainGerencTurmas" screenOptions={{headerStyle: {backgroundColor: '#766ec5'}, headerTintColor: '#f4f9fc'}}>
			<Stack.Screen 
				name={"MainGerencTurmas"} 
				component={telaGerenciarTurmas} 
				options={{
					title: 'Gerenciar turmas',
					headerLeft: null
				}} 
			/>
			<Stack.Screen 
				name={"VisualizarTurma"} 
				component={telaVisualizarTurma} 
				options={{
					title: 'Visualizar turma'
				}}
			/>
			<Stack.Screen 
				name={"ComentáriosIndividuais"}
				component={telaComentarios}
				options={{
					title: 'Ver comentários'
				}} 
			/>
			<Stack.Screen 
				name={"EscreverComentário"}
				component={telaEscreverComentario} 
				options={{
					title: 'Escrever comentário'
				}} 
			/>
			<Stack.Screen 
				name={"EditarComentário"}
				component={telaEditarComentario} 
				options={{
					title: 'Editar comentário'
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
	
	butaoHomePuroFinal: {
		backgroundColor: '#766ec5',
		padding: 5,
		borderRadius: 5,
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
		backgroundColor: '#766ec5', 
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
	
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: '#766ec5',
	},
 
});
