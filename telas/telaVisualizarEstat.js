import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { FAB, Card, Title, Paragraph, IconButton, TextInput, Portal, Dialog } from 'react-native-paper';
import firebase from 'firebase';
import 'firebase/firestore';
import { IDContext } from "./context.js";
import PieChart from 'react-native-pie-chart';
import { Pages } from 'react-native-pages';
import { VictoryBar, VictoryChart, VictoryLabel } from "victory-native";

import alunosPrioridade from "./assets/alunosPrioridade.png";
import estatIndividuais from "./assets/estatIndividuais.png";
import estatComparadas from "./assets/estatComparadas.png";

const Stack = createStackNavigator();

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
	const [visibleDialog1, setVisibleDialog1] = React.useState(false);
	const [visibleDialog2, setVisibleDialog2] = React.useState(false);
	
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

		Alert.alert(
			"Remover esse aluno?",
			null,
			[
			  	{
					text: "Não",
					onPress: () => {
						
					},
			 	},
			 	{ 
					text: "Sim", 
					onPress: () => {

						setVisibleDialog1(true);

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
						}

						setVisibleDialog1(false);
						setVisibleDialog2(true);

					} 
				}
			]
		);
	}

	function confirm() {
		setVisibleDialog2(false);
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
											<View style={{ flex: 0.7 }}>
												<Title>{a.nome}</Title>
											</View>
											<View style={{ flex: 0.3, flexDirection: "row" }}>
												<IconButton icon="pencil" color="#534d8a" size={25} onPress={() => navigation.navigate("EscreverMotivo", { id: alunosId[index], txtOriginal: a.motivo_prio, nome: a.nome })}></IconButton>
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
					<View style={{
						alignItems: 'center',
						justifyContent: 'center',
						width: 0.9 * Dimensions.get('window').width,
						height: 0.3 * Dimensions.get('window').height,
						borderWidth: 1,
						borderColor: '#766ec5',
						borderRadius: 15,
						padding: 15
					}}>
						<Text style={{color: '#766ec5', fontSize: 22, textAlign: 'center'}}>Nenhum aluno com prioridade de discussão</Text>
					</View>
					}
				</View>
			</ScrollView>
			<FAB
				style={styles.fab}
				icon="plus"
				color="white"
				onPress={() => navigation.navigate("AddEstudantePrio", { alunos: alunosDisp, ids: alunosDispId })}
			/>
			<Portal>
				<Dialog visible={visibleDialog1} dismissable={false}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#766ec5"/>
						<Paragraph>Removendo aluno...</Paragraph>
					</Dialog.Content>
				</Dialog>
				<Dialog visible={visibleDialog2} dismissable={true} onDismiss={() => confirm()}>
					<Dialog.Content>
						<Paragraph>Aluno removido com sucesso!</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
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
										<View style={{ flex: 0.85 }}>
											<Title>{a.nome}</Title>
										</View>
										<View style={{ flex: 0.15 }}>
											<IconButton icon="plus" color="#534d8a" size={25} onPress={() => navigation.navigate("EscreverMotivo", { id: ids[index], txtOriginal: '', nome: a.nome })}></IconButton>
										</View>
									</View>
								</Card.Content>
							</Card>
						);
					})}
					{(alunos.length == 0) &&
						<View style={{
							alignItems: 'center',
							justifyContent: 'center',
							width: 0.9 * Dimensions.get('window').width,
							height: 0.3 * Dimensions.get('window').height,
							borderWidth: 1,
							borderColor: '#766ec5',
							borderRadius: 15,
							padding: 15
						}}>
							<Text style={{color: '#766ec5', fontSize: 22, textAlign: 'center'}}>Todos os alunos já foram adicionados</Text>
						</View>
					}
				</View>
			</ScrollView>
		</View>
	);
}

function escreverMotivo({ route, navigation }) {

	const [txt, setTxt] = React.useState(route.params.txtOriginal);
	const [visibleDialog1, setVisibleDialog1] = React.useState(false);
	const [visibleDialog2, setVisibleDialog2] = React.useState(false);
	const idTurma = React.useContext(IDContext);

	function press() {

		setVisibleDialog1(true);

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
		}

		setVisibleDialog1(false);
		setVisibleDialog2(true);
	}

	function confirm() {
		setTxt('');
		setVisibleDialog2(false);
		navigation.navigate('EstudantesPrio');
	}

	return (
		<View style={styles.container}>
			<View style={{
				flex: 0.3,
				alignItems: 'center',
				justifyContent: 'center',
				width: Dimensions.get('window').width,
				borderWidth: 1,
				borderColor: '#766ec5',
				borderBottomLeftRadius: 15,
				borderBottomRightRadius: 15,
			}}>
				<Text style={{fontSize: 22, textAlign: 'center', color: '#766ec5'}}>Escrever motivo da prioridade de {route.params.nome}</Text>
			</View>
			<View style={{flex: 0.7}}>
				<TextInput
					style={styles.inputBox}
					underlineColor='#766ec5'
					multiline={true}
					numberOfLines={6}
					onChangeText={(text) => setTxt(text)}
					value={txt}
					placeholder="Digite o motivo da prioridade..."
				/>
			</View>
			<FAB
				style={styles.fab}
				icon="content-save"
				color="white"
				onPress={() => press()}
			/>
			<Portal>
				<Dialog visible={visibleDialog1} dismissable={false}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#766ec5"/>
						<Paragraph>Salvando motivo...</Paragraph>
					</Dialog.Content>
				</Dialog>
				<Dialog visible={visibleDialog2} dismissable={true} onDismiss={() => confirm()}>
					<Dialog.Content>
						<Paragraph>Motivo salvo com sucesso!</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function telaEstatIndividuais({ navigation }) {

	const [prontoAlunos, setProntoAlunos] = React.useState(false);
	const [alunos, setAlunos] = React.useState([]);
	const [dataAprendizado, setDataAprendizado] = React.useState([1, 1, 1]);
	const [dataComportamento, setDataComportamento] = React.useState([1, 1]);
	const [av1, setAv1] = useState([]);
	const [av2, setAv2] = useState([]);
	const [av3, setAv3] = useState([]);
	const [av4, setAv4] = useState([]);
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

						const list = [], contadores1 = [0, 0, 0], contadores2 = [0, 0], 
							tempAv1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							tempAv2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							tempAv3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							tempAv4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

						query.forEach((doc) => {

							list.push(doc.data());

							if(doc.data().aprendizado == 'Auditivo'){
								contadores1[0] += 1;
							}else if(doc.data().aprendizado == 'Cinestésico'){
								contadores1[1] += 1;
							}else{
								contadores1[2] += 1;
							}

							tempAv1[parseInt(doc.data().n1)] += 1;
							tempAv2[parseInt(doc.data().n2)] += 1;
							tempAv3[parseInt(doc.data().n3)] += 1;
							tempAv4[parseInt(doc.data().n4)] += 1;

							doc.data().comp == 'Participativo' ? contadores2[0]++ : contadores2[1]++;
						})

						var data1 = [
							{ nota: 1, qntd: tempAv1[0] },
							{ nota: 2, qntd: tempAv1[1] },
							{ nota: 3, qntd: tempAv1[2] },
							{ nota: 4, qntd: tempAv1[3] },
							{ nota: 5, qntd: tempAv1[4] },
							{ nota: 6, qntd: tempAv1[5] },
							{ nota: 7, qntd: tempAv1[6] },
							{ nota: 8, qntd: tempAv1[7] },
							{ nota: 9, qntd: tempAv1[8] },
							{ nota: 10, qntd: tempAv1[9] },
							{ nota: 11, qntd: tempAv1[10] },
						];

						var data2 = [
							{ nota: 1, qntd: tempAv2[0] },
							{ nota: 2, qntd: tempAv2[1] },
							{ nota: 3, qntd: tempAv2[2] },
							{ nota: 4, qntd: tempAv2[3] },
							{ nota: 5, qntd: tempAv2[4] },
							{ nota: 6, qntd: tempAv2[5] },
							{ nota: 7, qntd: tempAv2[6] },
							{ nota: 8, qntd: tempAv2[7] },
							{ nota: 9, qntd: tempAv2[8] },
							{ nota: 10, qntd: tempAv2[9] },
							{ nota: 11, qntd: tempAv2[10] },
						];

						var data3 = [
							{ nota: 1, qntd: tempAv3[0] },
							{ nota: 2, qntd: tempAv3[1] },
							{ nota: 3, qntd: tempAv3[2] },
							{ nota: 4, qntd: tempAv3[3] },
							{ nota: 5, qntd: tempAv3[4] },
							{ nota: 6, qntd: tempAv3[5] },
							{ nota: 7, qntd: tempAv3[6] },
							{ nota: 8, qntd: tempAv3[7] },
							{ nota: 9, qntd: tempAv3[8] },
							{ nota: 10, qntd: tempAv3[9] },
							{ nota: 11, qntd: tempAv3[10] },
						];

						var data4 = [
							{ nota: 1, qntd: tempAv4[0] },
							{ nota: 2, qntd: tempAv4[1] },
							{ nota: 3, qntd: tempAv4[2] },
							{ nota: 4, qntd: tempAv4[3] },
							{ nota: 5, qntd: tempAv4[4] },
							{ nota: 6, qntd: tempAv4[5] },
							{ nota: 7, qntd: tempAv4[6] },
							{ nota: 8, qntd: tempAv4[7] },
							{ nota: 9, qntd: tempAv4[8] },
							{ nota: 10, qntd: tempAv4[9] },
							{ nota: 11, qntd: tempAv4[10] },
						];

						setAv1(data1);
						setAv2(data2);
						setAv3(data3);
						setAv4(data4);
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
			<View style={styles.container}>
				<View style={{
					flex: 0.2,
					alignItems: 'center',
					justifyContent: 'center',
					width: Dimensions.get('window').width,
					borderWidth: 1,
					borderColor: '#766ec5',
					borderBottomLeftRadius: 15,
					borderBottomRightRadius: 15,
				}}>
					<Title style={{
						color: '#766ec5'
					}}>MODO DE APRENDIZADO</Title>
				</View>
				<View style={{
					flex: 0.8,
					padding: 10
				}}>
					<View style={{
						flex: 0.7,
						justifyContent: 'center',  
						alignItems: 'center',
					}}>
						<PieChart
							widthAndHeight={0.6 * Dimensions.get('window').width}
							series={dataAprendizado}
							sliceColor={sliceColor1}
						/>
					</View>
					<View style={{
						flex: 0.3,
						justifyContent: 'center', 
						textAlign: 'center', 
						alignItems: 'center', 
						borderColor: '#766ec5',
						borderWidth: 1,
						borderRadius: 5,
					}}>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<View style={{
								height: 15,
								width: 15,
								borderRadius: 1000,
								backgroundColor: '#918bd1',
								marginRight: 5
							}} /><Text style={{fontSize: 18}}>Auditivo: {dataAprendizado[0] + ' ' + (dataAprendizado[0] != 1 ? 'alunos' : 'aluno')}</Text>
						</View>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<View style={{
								height: 15,
								width: 15,
								borderRadius: 1000,
								backgroundColor: '#ada8dc',
								marginRight: 5
							}} /><Text style={{fontSize: 18}}>Cinestésico: {dataAprendizado[1] + ' ' + (dataAprendizado[1] != 1 ? 'alunos' : 'aluno')}</Text>
						</View>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<View style={{
								height: 15,
								width: 15,
								borderRadius: 1000,
								backgroundColor: '#c8c5e8',
								marginRight: 5
							}} /><Text style={{fontSize: 18}}>Visual: {dataAprendizado[2] + ' ' + (dataAprendizado[2] != 1 ? 'alunos' : 'aluno')}</Text>
						</View>
					</View>
				</View>
			</View>
		);
	}

	let GraficoComportamento = () => {

		return(
			<View style={styles.container}>
				<View style={{
					flex: 0.2,
					alignItems: 'center',
					justifyContent: 'center',
					width: Dimensions.get('window').width,
					borderWidth: 1,
					borderColor: '#766ec5',
					borderBottomLeftRadius: 15,
					borderBottomRightRadius: 15,
				}}>
					<Title style={{
						color: '#766ec5'
					}}>COMPORTAMENTO</Title>
				</View>
				<View style={{
					flex: 0.8,
					padding: 10
				}}>
					<View style={{
						flex: 0.7,
						justifyContent: 'center',  
						alignItems: 'center',
					}}>
						<PieChart
							widthAndHeight={0.6 * Dimensions.get('window').width}
							series={dataComportamento}
							sliceColor={sliceColor2}
						/>
					</View>
					<View style={{
						flex: 0.3,
						justifyContent: 'center', 
						textAlign: 'center', 
						alignItems: 'center', 
						borderColor: '#766ec5',
						borderWidth: 1,
						borderRadius: 5,
						padding: 5
					}}>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<View style={{
								height: 15,
								width: 15,
								borderRadius: 1000,
								backgroundColor: '#918bd1',
								marginRight: 5
							}} /><Text style={{fontSize: 18}}>Participativo: {dataComportamento[0] + ' ' + (dataComportamento[0] != 1 ? 'alunos' : 'aluno')}</Text>
						</View>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<View style={{
								height: 15,
								width: 15,
								borderRadius: 1000,
								backgroundColor: '#ada8dc',
								marginRight: 5
							}} /><Text style={{fontSize: 18}}>Não Participativo: {dataComportamento[1] + ' ' + (dataComportamento[1] != 1 ? 'alunos' : 'aluno')}</Text>
						</View>
					</View>
				</View>
			</View>
		);
	}

	let GraficoNotas = () => {

		function TelaAv1() {

			return(

				<View style={styles.container}>
					<View style={{
						flex: 0.2,
						alignItems: 'center',
						justifyContent: 'center',
						width: Dimensions.get('window').width,
						borderWidth: 1,
						borderColor: '#766ec5',
						borderBottomLeftRadius: 15,
						borderBottomRightRadius: 15,
					}}>
						<Title style={{
							color: '#766ec5'
						}}>AVALIAÇÃO 1</Title>
					</View>
					<View style={{flex: 0.8}}>
						<VictoryChart 
							width={Dimensions.get('window').width - 5}
						>
							<VictoryBar 
								data={av1} 
								x="nota" y="qntd" 
								style={{ data: {fill: '#766ec5'} }} 
								alignment="start"
								barRatio={1.05}
								categories={{ x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}}
								labels={({ datum }) => datum.qntd}
								labelComponent={<VictoryLabel dx={10} />}
							/>
						</VictoryChart>
					</View>
				</View>
			);
		}

		function TelaAv2() {

			return(
				
				<View style={styles.container}>
					<View style={{
						flex: 0.2,
						alignItems: 'center',
						justifyContent: 'center',
						width: Dimensions.get('window').width,
						borderWidth: 1,
						borderColor: '#766ec5',
						borderBottomLeftRadius: 15,
						borderBottomRightRadius: 15,
					}}>
						<Title style={{
							color: '#766ec5'
						}}>AVALIAÇÃO 2</Title>
					</View>
					<View style={{flex: 0.8}}>
						<VictoryChart 
							width={Dimensions.get('window').width - 5}
						>
							<VictoryBar 
								data={av2} 
								x="nota" y="qntd" 
								style={{ data: {fill: '#766ec5'} }} 
								alignment="start"
								barRatio={1.05}
								categories={{ x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}}
								labels={({ datum }) => datum.qntd}
								labelComponent={<VictoryLabel dx={10} />}
							/>
						</VictoryChart>
					</View>
				</View>
			);
		}

		function TelaAv3() {

			return(
				
				<View style={styles.container}>
					<View style={{
						flex: 0.2,
						alignItems: 'center',
						justifyContent: 'center',
						width: Dimensions.get('window').width,
						borderWidth: 1,
						borderColor: '#766ec5',
						borderBottomLeftRadius: 15,
						borderBottomRightRadius: 15,
					}}>
						<Title style={{
							color: '#766ec5'
						}}>AVALIAÇÃO 3</Title>
					</View>
					<View style={{flex: 0.8}}>
						<VictoryChart 
							width={Dimensions.get('window').width - 5}
						>
							<VictoryBar 
								data={av3} 
								x="nota" y="qntd" 
								style={{ data: {fill: '#766ec5'} }} 
								alignment="start"
								barRatio={1.05}
								categories={{ x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}}
								labels={({ datum }) => datum.qntd}
								labelComponent={<VictoryLabel dx={10} />}
							/>
						</VictoryChart>
					</View>
				</View>
			);
		}

		function TelaAv4() {

			return(
				
				<View style={styles.container}>
					<View style={{
						flex: 0.2,
						alignItems: 'center',
						justifyContent: 'center',
						width: Dimensions.get('window').width,
						borderWidth: 1,
						borderColor: '#766ec5',
						borderBottomLeftRadius: 15,
						borderBottomRightRadius: 15,
					}}>
						<Title style={{
							color: '#766ec5'
						}}>AVALIAÇÃO 4</Title>
					</View>
					<View style={{flex: 0.8}}>
						<VictoryChart 
							width={Dimensions.get('window').width - 5}
						>
							<VictoryBar 
								data={av4} 
								x="nota" y="qntd" 
								style={{ data: {fill: '#766ec5'} }} 
								alignment="start"
								barRatio={1.05}
								categories={{ x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}}
								labels={({ datum }) => datum.qntd}
								labelComponent={<VictoryLabel dx={10} />}
							/>
						</VictoryChart>
					</View>
				</View>
			);
		}

		return(
			<Pages horizontal={false} indicatorPosition={'right'} indicatorColor="#766ec5">
				<TelaAv1 />
				<TelaAv2 />
				<TelaAv3 />
				<TelaAv4 />
			</Pages>
		);
	}

	return( 
		<>
		{prontoAlunos && <Pages indicatorColor={'#766ec5'}>
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

	let GraficoAprendizado = () => {

		const [prontoEmail, setProntoEmail] = useState(false);
		const [prontoTurmas, setProntoTurmas] = useState(false);
		const [prontoIds, setProntoIds] = useState(false);
		const [email, setEmail] = useState('')
		const [ids, setIds] = useState([]);
		const [nomes, setNomes] = useState([]);
		const [turmas, setTurmas] = useState([]);
		const sliceColor1 = ['#918bd1','#ada8dc','#c8c5e8'];
		const sliceColor2 = ['#918bd1','#ada8dc'];
	
		let currentUserUID = firebase.auth().currentUser.uid;
	
		useEffect(() => {
	
			async function getEmail(){
	
				if(!prontoEmail){
					let doc = await firebase
					.firestore()
					.collection('users')
					.doc(currentUserUID)
					.get();
	
					if (doc.exists){
						setEmail(doc.data().email);
						setProntoEmail(true);
					}
				}
			}
	
			async function getIds(){
	
				if(!prontoIds){
					firebase.firestore()
						.collection('turmas')
						.get()
						.then((query) => {
							let listIds = [], listNomes = [];
							
							query.forEach((doc) => {
								if (doc.data().professor === email) {
									listIds.push(doc.id);
									listNomes.push(doc.data().nome);
								}
							});
	
							setIds(listIds);
							setNomes(listNomes);
							setProntoIds(true);
						})
				}
			}
	
			async function getTurmas(){
	
				if(!prontoTurmas){
	
					let listAprend = [];
	
					ids.forEach(async(i, index) => {
	
						let doc = await firebase.firestore()
							.collection('turmas')
							.doc(i)
							.collection('alunos')
							.get()
							.then((query) => {
	
								let counts = [0, 0, 0];
	
								query.forEach((a) => {
									switch(a.data().aprendizado){
										case "Auditivo":
											counts[0] += 1;
											break;
										case "Cinestésico":
											counts[1] += 1;
											break;
										case "Visual":
											counts[2] += 1;
											break;
									}
								})
	
								listAprend.push(counts);
							});
	
						if(!(listAprend.length < turmas.length)){
							setTurmas(listAprend);
							setProntoTurmas(true);
						}
					})
				}
			}
	
			getEmail().then(getIds()).then(getTurmas());
		})
	
		return (
			<View style={styles.container}>
				<View style={{
					flex: 0.2,
					alignItems: 'center',
					justifyContent: 'center',
					width: Dimensions.get('window').width,
					borderWidth: 1,
					borderColor: '#766ec5',
					borderBottomLeftRadius: 15,
					borderBottomRightRadius: 15,
				}}>
					<Title style={{
						color: '#766ec5'
					}}>MODO DE APRENDIZADO</Title>
				</View>
				<View style={{flex: 0.8}}>
					<ScrollView contentContainerStyle={styles.containerScroll}>
						{!prontoTurmas &&
							<ActivityIndicator size='large' color="#766ec5" />
						}
						{prontoTurmas && turmas.map((t, index) => {
							
							return(<>
								<Title style={{marginVertical: 10, color: '#766ec5'}}>{nomes[index]}</Title>
								<PieChart
									widthAndHeight={0.6 * Dimensions.get('window').width}
									series={t}
									sliceColor={sliceColor1}
									style={{marginBottom: 30}}
								/>
								<View style={{
									justifyContent: 'center', 
									textAlign: 'center', 
									alignItems: 'center', 
									borderColor: '#766ec5',
									borderWidth: 1,
									borderRadius: 5,
									padding: 5,
									marginBottom: 15
								}}>
									<View style={{flexDirection: 'row', alignItems: 'center'}}>
										<View style={{
											height: 15,
											width: 15,
											borderRadius: 1000,
											backgroundColor: '#918bd1',
											marginRight: 5
										}} /><Text style={{fontSize: 18}}>Auditivo: {t[0] + ' ' + (t[0] != 1 ? 'alunos' : 'aluno')}</Text>
									</View>
									<View style={{flexDirection: 'row', alignItems: 'center'}}>
										<View style={{
											height: 15,
											width: 15,
											borderRadius: 1000,
											backgroundColor: '#ada8dc',
											marginRight: 5
										}} /><Text style={{fontSize: 18}}>Cinestésico: {t[1] + ' ' + (t[1] != 1 ? 'alunos' : 'aluno')}</Text>
									</View>
									<View style={{flexDirection: 'row', alignItems: 'center'}}>
										<View style={{
											height: 15,
											width: 15,
											borderRadius: 1000,
											backgroundColor: '#c8c5e8',
											marginRight: 5
										}} /><Text style={{fontSize: 18}}>Visual: {t[2] + ' ' + (t[2] != 1 ? 'alunos' : 'aluno')}</Text>
									</View>
								</View>
							</>);
						})}
					</ScrollView>
				</View>
			</View>
		);
	}

	let GraficoComportamento = () => {

		const [prontoEmail, setProntoEmail] = useState(false);
		const [prontoTurmas, setProntoTurmas] = useState(false);
		const [prontoIds, setProntoIds] = useState(false);
		const [email, setEmail] = useState('')
		const [ids, setIds] = useState([]);
		const [nomes, setNomes] = useState([]);
		const [turmas, setTurmas] = useState([]);
		const sliceColor1 = ['#918bd1','#ada8dc','#c8c5e8'];
		const sliceColor2 = ['#918bd1','#ada8dc'];
	
		let currentUserUID = firebase.auth().currentUser.uid;
	
		useEffect(() => {
	
			async function getEmail(){
	
				if(!prontoEmail){
					let doc = await firebase
					.firestore()
					.collection('users')
					.doc(currentUserUID)
					.get();
	
					if (doc.exists){
						setEmail(doc.data().email);
						setProntoEmail(true);
					}
				}
			}
	
			async function getIds(){
	
				if(!prontoIds){
					firebase.firestore()
						.collection('turmas')
						.get()
						.then((query) => {
							let listIds = [], listNomes = [];
							
							query.forEach((doc) => {
								if (doc.data().professor === email) {
									listIds.push(doc.id);
									listNomes.push(doc.data().nome);
								}
							});
	
							setIds(listIds);
							setNomes(listNomes);
							setProntoIds(true);
						})
				}
			}
	
			async function getTurmas(){
	
				if(!prontoTurmas){
	
					let listComp = [];
	
					ids.forEach(async(i, index) => {
	
						let doc = await firebase.firestore()
							.collection('turmas')
							.doc(i)
							.collection('alunos')
							.get()
							.then((query) => {
	
								let counts = [0, 0];
	
								query.forEach((a) => {
									switch(a.data().comp){
										case "Participativo":
											counts[0] += 1;
											break;
										case "Não Participativo":
											counts[1] += 1;
											break;
									}
								})
	
								listComp.push(counts);
							});
	
						if(!(listComp.length < turmas.length)){
							setTurmas(listComp);
							setProntoTurmas(true);
						}
					})
				}
			}
	
			getEmail().then(getIds()).then(getTurmas());
		})
	
		return (
			<View style={styles.container}>
				<View style={{
					flex: 0.2,
					alignItems: 'center',
					justifyContent: 'center',
					width: Dimensions.get('window').width,
					borderWidth: 1,
					borderColor: '#766ec5',
					borderBottomLeftRadius: 15,
					borderBottomRightRadius: 15,
				}}>
					<Title style={{
						color: '#766ec5'
					}}>COMPORTAMENTO</Title>
				</View>
				<View style={{flex: 0.8}}>
					<ScrollView contentContainerStyle={styles.containerScroll}>
						{!prontoTurmas &&
							<ActivityIndicator size='large' color="#766ec5" />
						}
						{prontoTurmas && turmas.map((t, index) => {
							
							return(<>
								<Title style={{marginVertical: 10, color: '#766ec5'}}>{nomes[index]}</Title>
								<PieChart
									widthAndHeight={0.6 * Dimensions.get('window').width}
									series={t}
									sliceColor={sliceColor2}
									style={{marginBottom: 30}}
								/>
								<View style={{
									justifyContent: 'center', 
									textAlign: 'center', 
									alignItems: 'center', 
									borderColor: '#766ec5',
									borderWidth: 1,
									borderRadius: 5,
									padding: 5,
									marginBottom: 15
								}}>
									<View style={{flexDirection: 'row', alignItems: 'center'}}>
										<View style={{
											height: 15,
											width: 15,
											borderRadius: 1000,
											backgroundColor: '#918bd1',
											marginRight: 5
										}} /><Text style={{fontSize: 18}}>Participativo: {t[0] + ' ' + (t[0] != 1 ? 'alunos' : 'aluno')}</Text>
									</View>
									<View style={{flexDirection: 'row', alignItems: 'center'}}>
										<View style={{
											height: 15,
											width: 15,
											borderRadius: 1000,
											backgroundColor: '#ada8dc',
											marginRight: 5
										}} /><Text style={{fontSize: 18}}>Não Participativo: {t[1] + ' ' + (t[1] != 1 ? 'alunos' : 'aluno')}</Text>
									</View>
								</View>
							</>);
						})}
					</ScrollView>
				</View>
			</View>
		);
	}

	let GraficoNotas1 = () => {

		const [prontoEmail, setProntoEmail] = useState(false);
		const [prontoTurmas, setProntoTurmas] = useState(false);
		const [prontoIds, setProntoIds] = useState(false);
		const [email, setEmail] = useState('')
		const [ids, setIds] = useState([]);
		const [nomes, setNomes] = useState([]);
		const [turmas, setTurmas] = useState([]);
	
		let currentUserUID = firebase.auth().currentUser.uid;
	
		useEffect(() => {
	
			async function getEmail(){
	
				if(!prontoEmail){
					let doc = await firebase
					.firestore()
					.collection('users')
					.doc(currentUserUID)
					.get();
	
					if (doc.exists){
						setEmail(doc.data().email);
						setProntoEmail(true);
					}
				}
			}
	
			async function getIds(){
	
				if(!prontoIds){
					firebase.firestore()
						.collection('turmas')
						.get()
						.then((query) => {
							let listIds = [], listNomes = [];
							
							query.forEach((doc) => {
								if (doc.data().professor === email) {
									listIds.push(doc.id);
									listNomes.push(doc.data().nome);
								}
							});
	
							setIds(listIds);
							setNomes(listNomes);
							setProntoIds(true);
						})
				}
			}
	
			async function getTurmas(){
	
				if(!prontoTurmas){

					let listNotas = [];
	
					ids.forEach(async(i, index) => {
	
						let doc = await firebase.firestore()
							.collection('turmas')
							.doc(i)
							.collection('alunos')
							.get()
							.then((query) => {
	
								let tempAv1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
								query.forEach((doc) => {
									tempAv1[parseInt(doc.data().n1)] += 1;
								})

								var data1 = [
									{ nota: 1, qntd: tempAv1[0] },
									{ nota: 2, qntd: tempAv1[1] },
									{ nota: 3, qntd: tempAv1[2] },
									{ nota: 4, qntd: tempAv1[3] },
									{ nota: 5, qntd: tempAv1[4] },
									{ nota: 6, qntd: tempAv1[5] },
									{ nota: 7, qntd: tempAv1[6] },
									{ nota: 8, qntd: tempAv1[7] },
									{ nota: 9, qntd: tempAv1[8] },
									{ nota: 10, qntd: tempAv1[9] },
									{ nota: 11, qntd: tempAv1[10] },
								];
								
								listNotas.push(data1);
							});
	
						if(!(listNotas.length < turmas.length)){
							setTurmas(listNotas);
							setProntoTurmas(true);
						}
					})
				}
			}
	
			getEmail().then(getIds()).then(getTurmas());
		})

		return(
			<View style={styles.container}>
				<View style={{
					flex: 0.2,
					alignItems: 'center',
					justifyContent: 'center',
					width: Dimensions.get('window').width,
					borderWidth: 1,
					borderColor: '#766ec5',
					borderBottomLeftRadius: 15,
					borderBottomRightRadius: 15,
				}}>
					<Title style={{
						color: '#766ec5'
					}}>NOTAS DA AVALIAÇÃO 1</Title>
				</View>
				<View style={{flex: 0.8}}>
					<ScrollView contentContainerStyle={styles.containerScroll}>
						{!prontoTurmas &&
							<ActivityIndicator size='large' color="#766ec5" />
						}
						{prontoTurmas && turmas.map((t, index) => {
							
							return(<>
								<Title style={{color: '#766ec5', marginVertical: 15}}>{nomes[index]}</Title>
								<VictoryChart 
									width={Dimensions.get('window').width - 5}
								>
									<VictoryBar 
										data={t} 
										x="nota" y="qntd" 
										style={{ data: {fill: '#766ec5'} }} 
										alignment="start"
										barRatio={1.05}
										categories={{ x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}}
										labels={({ datum }) => datum.qntd}
										labelComponent={<VictoryLabel dx={10} />}
									/>
								</VictoryChart>
							</>);
						})}
					</ScrollView>
				</View>
			</View>
		);
	}

	let GraficoNotas2 = () => {

		const [prontoEmail, setProntoEmail] = useState(false);
		const [prontoTurmas, setProntoTurmas] = useState(false);
		const [prontoIds, setProntoIds] = useState(false);
		const [email, setEmail] = useState('')
		const [ids, setIds] = useState([]);
		const [nomes, setNomes] = useState([]);
		const [turmas, setTurmas] = useState([]);
	
		let currentUserUID = firebase.auth().currentUser.uid;
	
		useEffect(() => {
	
			async function getEmail(){
	
				if(!prontoEmail){
					let doc = await firebase
					.firestore()
					.collection('users')
					.doc(currentUserUID)
					.get();
	
					if (doc.exists){
						setEmail(doc.data().email);
						setProntoEmail(true);
					}
				}
			}
	
			async function getIds(){
	
				if(!prontoIds){
					firebase.firestore()
						.collection('turmas')
						.get()
						.then((query) => {
							let listIds = [], listNomes = [];
							
							query.forEach((doc) => {
								if (doc.data().professor === email) {
									listIds.push(doc.id);
									listNomes.push(doc.data().nome);
								}
							});
	
							setIds(listIds);
							setNomes(listNomes);
							setProntoIds(true);
						})
				}
			}
	
			async function getTurmas(){
	
				if(!prontoTurmas){

					let listNotas = [];
	
					ids.forEach(async(i, index) => {
	
						let doc = await firebase.firestore()
							.collection('turmas')
							.doc(i)
							.collection('alunos')
							.get()
							.then((query) => {
	
								let tempAv1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
								query.forEach((doc) => {
									tempAv1[parseInt(doc.data().n2)] += 1;
								})

								var data1 = [
									{ nota: 1, qntd: tempAv1[0] },
									{ nota: 2, qntd: tempAv1[1] },
									{ nota: 3, qntd: tempAv1[2] },
									{ nota: 4, qntd: tempAv1[3] },
									{ nota: 5, qntd: tempAv1[4] },
									{ nota: 6, qntd: tempAv1[5] },
									{ nota: 7, qntd: tempAv1[6] },
									{ nota: 8, qntd: tempAv1[7] },
									{ nota: 9, qntd: tempAv1[8] },
									{ nota: 10, qntd: tempAv1[9] },
									{ nota: 11, qntd: tempAv1[10] },
								];
								
								listNotas.push(data1);
							});
	
						if(!(listNotas.length < turmas.length)){
							setTurmas(listNotas);
							setProntoTurmas(true);
						}
					})
				}
			}
	
			getEmail().then(getIds()).then(getTurmas());
		})

		return(
			<View style={styles.container}>
				<View style={{
					flex: 0.2,
					alignItems: 'center',
					justifyContent: 'center',
					width: Dimensions.get('window').width,
					borderWidth: 1,
					borderColor: '#766ec5',
					borderBottomLeftRadius: 15,
					borderBottomRightRadius: 15,
				}}>
					<Title style={{
						color: '#766ec5'
					}}>NOTAS DA AVALIAÇÃO 2</Title>
				</View>
				<View style={{flex: 0.8}}>
					<ScrollView contentContainerStyle={styles.containerScroll}>
						{!prontoTurmas &&
							<ActivityIndicator size='large' color="#766ec5" />
						}
						{prontoTurmas && turmas.map((t, index) => {
							
							return(<>
								<Title style={{color: '#766ec5', marginVertical: 15}}>{nomes[index]}</Title>
								<VictoryChart 
									width={Dimensions.get('window').width - 5}
								>
									<VictoryBar 
										data={t} 
										x="nota" y="qntd" 
										style={{ data: {fill: '#766ec5'} }} 
										alignment="start"
										barRatio={1.05}
										categories={{ x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}}
										labels={({ datum }) => datum.qntd}
										labelComponent={<VictoryLabel dx={10} />}
									/>
								</VictoryChart>
							</>);
						})}
					</ScrollView>
				</View>
			</View>
		);
	}

	let GraficoNotas3 = () => {

		const [prontoEmail, setProntoEmail] = useState(false);
		const [prontoTurmas, setProntoTurmas] = useState(false);
		const [prontoIds, setProntoIds] = useState(false);
		const [email, setEmail] = useState('')
		const [ids, setIds] = useState([]);
		const [nomes, setNomes] = useState([]);
		const [turmas, setTurmas] = useState([]);
	
		let currentUserUID = firebase.auth().currentUser.uid;
	
		useEffect(() => {
	
			async function getEmail(){
	
				if(!prontoEmail){
					let doc = await firebase
					.firestore()
					.collection('users')
					.doc(currentUserUID)
					.get();
	
					if (doc.exists){
						setEmail(doc.data().email);
						setProntoEmail(true);
					}
				}
			}
	
			async function getIds(){
	
				if(!prontoIds){
					firebase.firestore()
						.collection('turmas')
						.get()
						.then((query) => {
							let listIds = [], listNomes = [];
							
							query.forEach((doc) => {
								if (doc.data().professor === email) {
									listIds.push(doc.id);
									listNomes.push(doc.data().nome);
								}
							});
	
							setIds(listIds);
							setNomes(listNomes);
							setProntoIds(true);
						})
				}
			}
	
			async function getTurmas(){
	
				if(!prontoTurmas){

					let listNotas = [];
	
					ids.forEach(async(i, index) => {
	
						let doc = await firebase.firestore()
							.collection('turmas')
							.doc(i)
							.collection('alunos')
							.get()
							.then((query) => {
	
								let tempAv1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
								query.forEach((doc) => {
									tempAv1[parseInt(doc.data().n3)] += 1;
								})

								var data1 = [
									{ nota: 1, qntd: tempAv1[0] },
									{ nota: 2, qntd: tempAv1[1] },
									{ nota: 3, qntd: tempAv1[2] },
									{ nota: 4, qntd: tempAv1[3] },
									{ nota: 5, qntd: tempAv1[4] },
									{ nota: 6, qntd: tempAv1[5] },
									{ nota: 7, qntd: tempAv1[6] },
									{ nota: 8, qntd: tempAv1[7] },
									{ nota: 9, qntd: tempAv1[8] },
									{ nota: 10, qntd: tempAv1[9] },
									{ nota: 11, qntd: tempAv1[10] },
								];
								
								listNotas.push(data1);
							});
	
						if(!(listNotas.length < turmas.length)){
							setTurmas(listNotas);
							setProntoTurmas(true);
						}
					})
				}
			}
	
			getEmail().then(getIds()).then(getTurmas());
		})

		return(
			<View style={styles.container}>
				<View style={{
					flex: 0.2,
					alignItems: 'center',
					justifyContent: 'center',
					width: Dimensions.get('window').width,
					borderWidth: 1,
					borderColor: '#766ec5',
					borderBottomLeftRadius: 15,
					borderBottomRightRadius: 15,
				}}>
					<Title style={{
						color: '#766ec5'
					}}>NOTAS DA AVALIAÇÃO 3</Title>
				</View>
				<View style={{flex: 0.8}}>
					<ScrollView contentContainerStyle={styles.containerScroll}>
						{!prontoTurmas &&
							<ActivityIndicator size='large' color="#766ec5" />
						}
						{prontoTurmas && turmas.map((t, index) => {
							
							return(<>
								<Title style={{color: '#766ec5', marginVertical: 15}}>{nomes[index]}</Title>
								<VictoryChart 
									width={Dimensions.get('window').width - 5}
								>
									<VictoryBar 
										data={t} 
										x="nota" y="qntd" 
										style={{ data: {fill: '#766ec5'} }} 
										alignment="start"
										barRatio={1.05}
										categories={{ x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}}
										labels={({ datum }) => datum.qntd}
										labelComponent={<VictoryLabel dx={10} />}
									/>
								</VictoryChart>
							</>);
						})}
					</ScrollView>
				</View>
			</View>
		);
	}

	let GraficoNotas4 = () => {

		const [prontoEmail, setProntoEmail] = useState(false);
		const [prontoTurmas, setProntoTurmas] = useState(false);
		const [prontoIds, setProntoIds] = useState(false);
		const [email, setEmail] = useState('')
		const [ids, setIds] = useState([]);
		const [nomes, setNomes] = useState([]);
		const [turmas, setTurmas] = useState([]);
	
		let currentUserUID = firebase.auth().currentUser.uid;
	
		useEffect(() => {
	
			async function getEmail(){
	
				if(!prontoEmail){
					let doc = await firebase
					.firestore()
					.collection('users')
					.doc(currentUserUID)
					.get();
	
					if (doc.exists){
						setEmail(doc.data().email);
						setProntoEmail(true);
					}
				}
			}
	
			async function getIds(){
	
				if(!prontoIds){
					firebase.firestore()
						.collection('turmas')
						.get()
						.then((query) => {
							let listIds = [], listNomes = [];
							
							query.forEach((doc) => {
								if (doc.data().professor === email) {
									listIds.push(doc.id);
									listNomes.push(doc.data().nome);
								}
							});
	
							setIds(listIds);
							setNomes(listNomes);
							setProntoIds(true);
						})
				}
			}
	
			async function getTurmas(){
	
				if(!prontoTurmas){

					let listNotas = [];
	
					ids.forEach(async(i, index) => {
	
						let doc = await firebase.firestore()
							.collection('turmas')
							.doc(i)
							.collection('alunos')
							.get()
							.then((query) => {
	
								let tempAv1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
								query.forEach((doc) => {
									tempAv1[parseInt(doc.data().n4)] += 1;
								})

								var data1 = [
									{ nota: 1, qntd: tempAv1[0] },
									{ nota: 2, qntd: tempAv1[1] },
									{ nota: 3, qntd: tempAv1[2] },
									{ nota: 4, qntd: tempAv1[3] },
									{ nota: 5, qntd: tempAv1[4] },
									{ nota: 6, qntd: tempAv1[5] },
									{ nota: 7, qntd: tempAv1[6] },
									{ nota: 8, qntd: tempAv1[7] },
									{ nota: 9, qntd: tempAv1[8] },
									{ nota: 10, qntd: tempAv1[9] },
									{ nota: 11, qntd: tempAv1[10] },
								];
								
								listNotas.push(data1);
							});
	
						if(!(listNotas.length < turmas.length)){
							setTurmas(listNotas);
							setProntoTurmas(true);
						}
					})
				}
			}
	
			getEmail().then(getIds()).then(getTurmas());
		})

		return(
			<View style={styles.container}>
				<View style={{
					flex: 0.2,
					alignItems: 'center',
					justifyContent: 'center',
					width: Dimensions.get('window').width,
					borderWidth: 1,
					borderColor: '#766ec5',
					borderBottomLeftRadius: 15,
					borderBottomRightRadius: 15,
				}}>
					<Title style={{
						color: '#766ec5'
					}}>NOTAS DA AVALIAÇÃO 4</Title>
				</View>
				<View style={{flex: 0.8}}>
					<ScrollView contentContainerStyle={styles.containerScroll}>
						{!prontoTurmas &&
							<ActivityIndicator size='large' color="#766ec5" />
						}
						{prontoTurmas && turmas.map((t, index) => {
							
							return(<>
								<Title style={{color: '#766ec5', marginVertical: 15}}>{nomes[index]}</Title>
								<VictoryChart 
									width={Dimensions.get('window').width - 5}
								>
									<VictoryBar 
										data={t} 
										x="nota" y="qntd" 
										style={{ data: {fill: '#766ec5'} }} 
										alignment="start"
										barRatio={1.05}
										categories={{ x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}}
										labels={({ datum }) => datum.qntd}
										labelComponent={<VictoryLabel dx={10} />}
									/>
								</VictoryChart>
							</>);
						})}
					</ScrollView>
				</View>
			</View>
		);
	}

	return(
		<Pages indicatorColor={'#766ec5'}>
			<GraficoAprendizado />
			<GraficoComportamento />
			<GraficoNotas1 />
			<GraficoNotas2 />
			<GraficoNotas3 />
			<GraficoNotas4 />
		</Pages>
	);
}

export default function stackVisualizarEstat({ navigation }) {
	return (
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#766ec5' }, headerTintColor: '#f4f9fc' }} initialRouteName="MainVisualizarEstat">
			<Stack.Screen
				name={"MainVisualizarEstat"}
				component={telaVisualizarEstat}
				options={{
					title: 'Visualizar estatísticas',
					headerLeft: null
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