# Classembly

Aplicativo com o intuito de auxiliar o professor na preparação e durante o momento do conselho de classe.

## Resumo

CLASSEMBLY é um aplicativo móvel destinado para o órgão do colegiado de gestão, como pedagógico, coordenadores de curso e docentes. Tem por objetivo promover inovação e simplicidade no processo de avaliação qualitativa e quantitativa do desempenho educacional na instituição, levando em conta o desempenho individual do discente e do conjunto da turma, relacionando o desempenho às práticas pedagógicas do professor e as condições sociopolíticas. O planejamento deste aplicativo nasceu com a demanda de organização de uma forma inovadora dos conselhos de classe dentro do Instituto Federal de Santa Catarina - Câmpus Xanxerê, como uma forma de acelerar e potencializar as reuniões e os resultados desejados. Desse modo, o software vai auxiliar no desenvolvimento de práticas pedagógicas mais organizadas e palpáveis, que possibilitam uma melhor avaliação e desenvolvimento do estudante como aluno e cidadão. A plataforma é uma representante das Tecnologias da Informação e Comunicação (TICs), que vem para auxiliar na modernização das escolas, facilitando a tarefa administrativa e burocrática, pela agilidade na troca de informações.  

**Palavras-Chave:** Conselho de classe. Gestão escolar. Aplicativo móvel. 

## Abstract

CLASSEMBLY is a mobile application intended for the collegiate body of management, such as pedagogical, course coordinators and teachers. It aims to promote innovation and simplicity in the process of qualitative and quantitative evaluation of educational performance in the institution, taking into account the individual performance of the student and the group as a whole, relating performance to the pedagogical practices of the teacher and socio-political conditions. The planning of this application was born with the demand for organization of an innovative form of class councils within the Federal Institute of Santa Catarina - Câmpus Xanxerê, as a way to accelerate and enhance the meetings and the desired results. In this way, the software will assist in the development of more organized and tangible pedagogical practices, which enable a better evaluation and development of the student as a student and citizen. The platform is a representative of Information and Communication Technologies (ICTs), which comes to assist in the modernization of schools, facilitating the administrative and bureaucratic task, due to the agility in the exchange of information.  


**Keywords:** Class Council. School Management. Mobile App.

# Instalação

##### Clone o repositório:
```
git clone https://github.com/ornnacio/Classembly
cd Classembly
```

#### Instale o expo e as dependências do aplicativo:
```
npm install -g expo-cli
npm install --force
```

#### Crie um banco de dados no firebase e ative o firestore e a identificação com email/senha.

#### Na pasta firebase, substitua as informações do arquivo firebase.js pelas informações do seu banco de dados:
```javascript
export var firebaseConfig = {
   apiKey: "SUAS CONFIGURAÇÕES",
   authDomain: "SUAS CONFIGURAÇÕES",
   databaseURL: "SUAS CONFIGURAÇÕES",
   projectId: "SUAS CONFIGURAÇÕES",
   storageBucket: "SUAS CONFIGURAÇÕES",
   messagingSenderId: "SUAS CONFIGURAÇÕES",
   appId: "SUAS CONFIGURAÇÕES"
};
```

#### Inicie o aplicativo:
```
expo start
```

Abra o aplicativo utilizando o app Expo Go, disponível na Play Store para dispositivos Android e App Store para iOS.
