import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { FAB, Card, Title, Paragraph, IconButton, TextInput } from 'react-native-paper';
import AwesomeAlert from 'react-native-awesome-alerts';
import firebase from 'firebase';
import 'firebase/firestore';
import { IDContext } from "./context.js";
import PieChart from 'react-native-pie-chart';
import { Pages } from 'react-native-pages';

import alunosPrioridade from "./assets/alunosPrioridade.png";
import estatIndividuais from "./assets/estatIndividuais.png";
import estatComparadas from "./assets/estatComparadas.png";

const Stack = createStackNavigator();
var refresh = false;

function telaVisualizarEstat({ navigation }) {

	return (
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

function telaEstudantesPrio({ route, navigation }) {

	const [alunos, setAlunos] = React.useState([]);
	const [alunosId, setAlunosId] = React.useState([]);
	const [alunosDisp, setAlunosDisp] = React.useState([]);
	const [alunosDispId, setAlunosDispId] = React.useState([]);
	const [prontoAlunos, setProntoAlunos] = React.useState(false);
	const [showAlert, setShowAlert] = React.useState(false);
	let vazio = true;
	const isFocused = useIsFocused();
	const idTurma = React.useContext(IDContext);

	useEffect(() => {

		async function getAlunos() {

			if (!prontoAlunos) {

				let doc = await firebase
					.firestore()
					.collection('turmas')
					.doc(idTurma)
					.collection('alunos')
					.onSnapshot((query) => {

						const list = [], listId = [], listDisp = [], listDispId = [];

						query.forEach((doc) => {

							list.push(doc.data());
							listId.push(doc.id);

							if (!doc.data().prio) {
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

	function deletar(id) {

		let erro = false;

		try {
			firebase
				.firestore()
				.collection('turmas')
				.doc(idTurma)
				.collection('alunos')
				.doc(id)
				.update({
					prio: false,
					motivo_prio: null
				});
		} catch (e) {
			alert(e.message);
			erro = true;
		}

		!erro ? setShowAlert(true) : setShowAlert(false);
	}

	function confirm() {
		setShowAlert(false);
	}

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					{!prontoAlunos &&
						<ActivityIndicator size='large' color="#766ec5" />
					}
					{prontoAlunos && alunos.map((a, index) => {

						if (a.prio) {

							vazio = false;

							return (
								<Card style={styles.cardPrio} key={index}>
									<Card.Content>
										<View style={styles.headerCard}>
											<Title>{a.nome}</Title>
											<View style={{ flexDirection: "row" }}>
												<IconButton icon="pencil" color="#534d8a" size={25} onPress={() => navigation.navigate("EscreverMotivo", { id: alunosId[index], txtOriginal: a.motivo_prio })}></IconButton>
												<IconButton icon="delete" color="#534d8a" size={25} onPress={() => deletar(alunosId[index])}></IconButton>
											</View>
										</View>
										<Paragraph>{a.motivo_prio}</Paragraph>
									</Card.Content>
								</Card>
							);
						}
					})}
					{(prontoAlunos && vazio) &&
						<Text style={styles.txtAviso}>Nenhum aluno com prioridade de discussão</Text>
					}
				</View>
			</ScrollView>
			<FAB
				style={styles.fab}
				icon="plus"
				color="white"
				onPress={() => navigation.navigate("AddEstudantePrio", { alunos: alunosDisp, ids: alunosDispId })}
			/>
			<AwesomeAlert
				show={showAlert}
				showProgress={false}
				message="Aluno removido com sucesso!"
				closeOnTouchOutside={false}
				closeOnHardwareBackPress={false}
				showCancelButton={false}
				showConfirmButton={true}
				confirmText="Voltar"
				confirmButtonColor="green"
				onConfirmPressed={() => confirm()}
			/>
		</View>
	);
}

function adicionarEstudantePrio({ route, navigation }) {

	let alunos = route.params.alunos, ids = route.params.ids;

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.containerScroll}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					{alunos.map((a, index) => {

						return (
							<Card style={styles.cardPrio} key={index}>
								<Card.Content>
									<View style={styles.headerCard}>
										<Title>{a.nome}</Title>
										<IconButton icon="plus" color="#534d8a" size={25} onPress={() => navigation.navigate("EscreverMotivo", { id: ids[index], txtOriginal: '' })}></IconButton>
									</View>
								</Card.Content>
							</Card>
						);
					})}
					{(alunos.length == 0) &&
						<Text style={styles.txtAviso}>Todos os alunos já foram adicionados</Text>
					}
				</View>
			</ScrollView>
		</View>
	);
}

function escreverMotivo({ route, navigation }) {

	const [txt, setTxt] = React.useState(route.params.txtOriginal);
	const [showAlert, setShowAlert] = React.useState(false);
	const idTurma = React.useContext(IDContext);

	function press() {

		let erro = false;

		try {
			firebase
				.firestore()
				.collection('turmas')
				.doc(idTurma)
				.collection('alunos')
				.doc(route.params.id)
				.update({
					prio: true,
					motivo_prio: txt
				});
		} catch (e) {
			alert(e.message);
			erro = true;
		}

		!erro ? setShowAlert(true) : setShowAlert(false);
	}

	function confirm() {

		setTxt('');
		setShowAlert(false);
		navigation.navigate('EstudantesPrio');
	}

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.inputBox}
				underlineColor='#766ec5'
				multiline={true}
				numberOfLines={6}
				onChangeText={(text) => setTxt(text)}
				value={txt}
			/>
			<TouchableOpacity style={styles.butaoHomePuro} onPress={press}>
				<Text style={styles.txtbotaohomePuro}>Salvar</Text>
			</TouchableOpacity>
			<AwesomeAlert
				show={showAlert}
				showProgress={false}
				message="Motivo salvo com sucesso!"
				closeOnTouchOutside={false}
				closeOnHardwareBackPress={false}
				showCancelButton={false}
				showConfirmButton={true}
				confirmText="Voltar"
				confirmButtonColor="green"
				onConfirmPressed={() => confirm()}
			/>
		</View>
	);
}

function telaEstatIndividuais({ navigation }) {

	const [prontoAlunos, setProntoAlunos] = React.useState(false);
	const [alunos, setAlunos] = React.useState([]);
	const [dataAprendizado, setDataAprendizado] = React.useState([1, 1, 1]);
	const [dataComportamento, setDataComportamento] = React.useState([1, 1]);
	const idTurma = React.useContext(IDContext);
	const sliceColor1 = ['#918bd1','#ada8dc','#c8c5e8'];
	const sliceColor2 = ['#918bd1','#ada8dc'];

	useEffect(() => {

		async function getAlunos() {

			if (!prontoAlunos) {

				let doc = await firebase
					.firestore()
					.collection('turmas')
					.doc(idTurma)
					.collection('alunos')
					.onSnapshot((query) => {

						const list = [], contadores1 = [0, 0, 0], contadores2 = [0, 0];

						query.forEach((doc) => {
							list.push(doc.data());

							if(doc.data().aprendizado == 'Auditivo'){
								contadores1[0] += 1;
							}else if(doc.data().aprendizado == 'Cinestésico'){
								contadores1[1] += 1;
							}else{
								contadores1[2] += 1;
							}

							doc.data().comp == 'Participativo' ? contadores2[0]++ : contadores2[1]++;
						})

						setAlunos(list);
						setDataAprendizado(contadores1);
						setDataComportamento(contadores2);
						setProntoAlunos(true);
					});
			}
		}

		getAlunos();
	});


	let GraficoAprendizado = () => {

		return(
			<View style={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
				<Title style={{marginVertical: 10}}>Modo de aprendizado</Title>
				<PieChart
					widthAndHeight={0.8 * Dimensions.get('window').width}
					series={dataAprendizado}
					sliceColor={sliceColor1}
				/>
				<View style={{justifyContent: 'center', textAlign: 'center', alignItems: 'center'}}>
					<Text>Auditivo: <Text style={{color: '#918bd1'}}>{dataAprendizado[0] + ' ' + (dataAprendizado[0] != 1 ? 'alunos' : 'aluno')}</Text></Text>
					<Text>Cinestésico: <Text style={{color: '#ada8dc'}}>{dataAprendizado[1] + ' ' + (dataAprendizado[1] != 1 ? 'alunos' : 'aluno')}</Text></Text>
					<Text>Visual: <Text style={{color: '#c8c5e8'}}>{dataAprendizado[2] + ' ' + (dataAprendizado[2] != 1 ? 'alunos' : 'aluno')}</Text></Text>
				</View>
			</View>
		);
	}

	let GraficoComportamento = () => {

		return(
			<View style={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
				<Title style={{marginVertical: 10}}>Comportamento</Title>
				<PieChart
					widthAndHeight={0.8 * Dimensions.get('window').width}
					series={dataComportamento}
					sliceColor={sliceColor2}
				/>
				<View style={{justifyContent: 'center', textAlign: 'center', alignItems: 'center'}}>
					<Text>Participativo: <Text style={{color: '#918bd1'}}>{dataComportamento[0] + ' ' + (dataComportamento[0] != 1 ? 'alunos' : 'aluno')}</Text></Text>
					<Text>Não Participativo: <Text style={{color: '#ada8dc'}}>{dataComportamento[1] + ' ' + (dataComportamento[1] != 1 ? 'alunos' : 'aluno')}</Text></Text>
				</View>
			</View>
		);
	}

	let GraficoNotas = () => {

		return(
			<View style={{
				flex: 1,
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
			}}>
  				<Text>aqui ta foda</Text>
			</View>
		);
	}

	return( 
		<>
		{prontoAlunos && <Pages indicatorColor={'black'}>
			<GraficoAprendizado />
			<GraficoComportamento />
			<GraficoNotas />
		</Pages>}
		{!prontoAlunos &&
			<ActivityIndicator size='large' color='#766ec5'/>
		}
		</>
	);
}

function telaEstatComparadas({ navigation }) {
	return (
		<View style={styles.container}>
			<Text>placeholder 3</Text>
		</View>
	);
}

export default function stackVisualizarEstat({ navigation }) {
	return (
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#766ec5' }, headerTintColor: '#f4f9fc' }} initialRouteName="MainVisualizarEstat">
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
				name={"EscreverMotivo"}
				component={escreverMotivo}
				options={{
					title: 'Escrever motivo da prioridade'
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

	txtAviso: {
		fontSize: 18,
		color: '#1f1f1f'
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

	inputBox: {
		margin: 25,
		borderRadius: 5,
		width: 0.7 * Dimensions.get('window').width,
	},

});