import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { Image, StyleSheet, useWindowDimensions,Platfrom } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeContext } from 'styled-components';
import { Button, Text, View } from './components/base';
import AboutScreen from './screens/AboutScreen';
import Activation from './screens/Activation';
import ActivationSuccess from './screens/ActivationSuccess';
import Analysis from './screens/Analysis/Analysis';
import Ranking from './screens/Analysis/Ranking';
import AwardQuestions from './screens/AwardQuestions';
import ComponenetTest from './screens/ComponenetTest';
import ContentScreen from './screens/ContentScreen';
import FinalyExam from './screens/FinalyExam';
import ForgotPasword from './screens/ForgotPasword';
import GameEnteringText from './screens/GameEnteringText';
import GameInfinity from './screens/GameInfinity';
import GameInfo from './screens/GameInfo';
import GameResultInfinity from './screens/GameResultInfinity';
import GameResultTiming from './screens/GameResultTiming';
import GameTiming from './screens/GameTiming';
import GameUpload from './screens/GameUpload';
import GameEnteringUrl from './screens/GameEnteringUrl';
import GameEnteringUrlAndUpload from './screens/GameEnteringUrlAndUpload';
import GeneralEvaluation from './screens/GeneralEvaluation';
import GeneralExam from './screens/GeneralExam';
import GeneralInfo from './screens/GeneralInfo';
import Notifications from './screens/Notifications';
import GameTimingErorPage from './screens/GameTimingErorPage';
import ResultGameUpload from './screens/ResultGameUpload';

// Screens
import HomeScreen from './screens/Home/HomeScreen';
import LastSolvedSubjectSelect from './screens/LastSolvedSubjectSelect';
import LeaderBoardMultitiplePerson from './screens/LeaderBoardMultitiplePerson';
import LeaderBoardOnePerson from './screens/LeaderBoardOnePerson';
import LeaderBoardThirdPerson from './screens/LeaderBoardThirdPerson';
import LessonSelect from './screens/LessonSelect';
import Login from './screens/Login';
import MostlyWrong from './screens/MostlyWrong/MostlyWrong';
import MostlyWrongList from './screens/MostlyWrong/MostlyWrongList';
import Question from './screens/Question';
import QuestionCheck from './screens/QuestionCheck';
import QuestionHelp from './screens/QuestionHelp';
import QuestionInfo from './screens/QuestionInfo';
import QuestionReportError from './screens/QuestionReportError';
import Quotations from './screens/Quotations';
import Register from './screens/Register';
import ResultExam from './screens/ResultExam';
import SettingsMain from './screens/SettingsMain';
import SettingsPassword from './screens/SettingsPassword';
import SettingsSolvedExam from './screens/SettingsSolvedExam';
import SettingsActivity from './screens/SettingsActivity';
import SettingsUser from './screens/SettingsUser';
import SoundSettings from './screens/SoundSettings';
import SplashScreen from './screens/SplashScreen';
import StarsQuestion from './screens/StarsQuestion';
import StarsQuestionList from './screens/StarsQuestionList';
import StudentExam from './screens/StudentExam';
import SubjectExam from './screens/SubjectExam';
import SubjectSelect from './screens/SubjectSelect';
import ThemeSettings from './screens/ThemeSettings';
import TimePage from './screens/TimePage';
import WinList from './screens/WinList';
import Search from './screens/Search';
import FirendsMain from './screens/Challange/FirendsMain';
import AddFriend from './screens/Challange/AddFriend';
import ChallangeRules from './screens/Challange/ChallangeRules';
import ChallangeMain from './screens/Challange/ChallangeMain';
import Friends from './screens/Challange/Friends';
import CreateChallange from './screens/Challange/CreateChallange';
import SelectFriendMain from './screens/Challange/SelectFriendMain';
import SelectFriend from './screens/Challange/SelectFriend';
import ChallangeGame from './screens/Challange/ChallangeGame';
import FinallyChallange from './screens/Challange/FinallyChallange';
import ResultExamChallange from './screens/Challange/ResultExamChallange';
import ChallangeCheck from './screens/Challange/ChallangeCheck';
import ChallangeResults from './screens/Challange/ChallangeResults';
import ChallangeGameResult from './screens/Challange/ChallangeGameResult';
import AnalysisMain from './screens/Analysis/AnalysisMain';

import { clearAll, getUser } from './services/storage-manager';
import { hp, wp } from './utils/dimension';
import { bold } from './utils/font_helper';
import { syncBackend } from './worker/staticworks';

const Drawer = createDrawerNavigator();
let userName = "";
async function loadName() {
  var user = await getUser();
  userName = user.fullName;
}
const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()
function TabNavigator() {
  const themeContext = useContext(ThemeContext);
  loadName();
  return (
    <Tab.Navigator

      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Image
              style={{ bottom: hp(5) }}
              source={require('./assets/images/light/mainpage/home.webp')
              } />
          }
          if (route.name === 'LessonSelect') {
            return <Image
              style={{ bottom: hp(5) }}
              source={require('./assets/images/light/mainpage/brain.webp')
              } />
          }
          if (route.name === 'Search') {
            return <Image
              style={{ bottom: hp(5) }}
              source={require('./assets/images/light/mainpage/search.webp')
              } />
          }
        },
      })}
      tabBarOptions={{
        style: {
          ...themeContext.tabBar,
          paddingTop: hp(20),
          paddingLeft: wp(25),
          paddingRight: wp(25),
          height: wp(50)
        }
      }}>
      <Tab.Screen name="Home" options={{ tabBarLabel: "", headerShown: false }} component={HomeScreens}
      />
      <Tab.Screen name="LessonSelect" options={{ tabBarLabel: "", headerShown: false }} component={LessonSelect} />

      <Tab.Screen name="Search" options={{ tabBarLabel: "", headerShown: false }} component={Search} />
    </Tab.Navigator>
  );
}
// Home Screens Stack
function HomeScreens() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen options={{ headerShown: false }} name="Content" component={ContentScreen} />
    </Stack.Navigator>
  )
}
const LogOut = async (navigation) => {
  await clearAll();
  navigation.closeDrawer();
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  })
}


function DrawerContent({ navigation }) {
  const [name, setName] = useState("");
  const themeContext = useContext(ThemeContext);
  return (
    <View flex={1} style={{ backgroundColor: themeContext.colors.generalBackground, borderLeftColor: "#CCCCCC", borderLeftWidth: 1,marginTop:Platform.OS!="android"?hp(15):0 }}>

      <LinearGradient flex={1} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
        colors={["#4A6185", "#022B57"]} >
        <View flex={1} flexDirection="row" style={{ borderBottomColor: "#CCCCCC", borderBottomWidth: 1 }}>
          <View flex={4} style={{ justifyContent: "center", alignContent: "center" }}>
            <Text style={styles.drawerName}> {userName} </Text>
          </View>
          <View flex={1} style={{ justifyContent: "center", alignContent: "center" }}>
            <Button
              onPress={() => navigation.closeDrawer()}
            >
              <Image resizeMode="contain" source={require('./assets/images/light/drawer/black-menu_icon.webp')} style={styles.image}>
              </Image>
            </Button>
          </View>
        </View>

      </LinearGradient>
      <View flex={8} style={{ paddingTop: hp(10) }}>
        <View flex={1} flexDirection="row" >
          <View flex={1} style={{ justifyContent: "center", alignContent: "center", paddingLeft: wp(20) }}>

            <FastImage resizeMode={FastImage.resizeMode.contain} style={{ width: wp(25), height: wp(25) }}
              source={require('./assets/images/light/mainpage/logo-mini.webp')}>
            </FastImage>
          </View>
          <View flex={5} style={{ justifyContent: "center", alignContent: "center" }}>
            <Button style={{ justifyContent: "flex-start", alignContent: "flex-start" }}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate("AboutScreen")
              }}>
              <Text style={{ ...styles.drawerMenu, color: themeContext.drawer.textColor }}> Hakkında </Text>
            </Button>
          </View>
        </View>
        <View flex={1} flexDirection="row" >
          <View flex={1} style={{ justifyContent: "center", alignContent: "center", paddingLeft: wp(20) }}>

            <FastImage resizeMode={FastImage.resizeMode.contain} style={{ width: wp(25), height: wp(25) }}
              source={require('./assets/images/light/drawer/ranking.webp')}>
            </FastImage>
          </View>
          <View flex={5} style={{ justifyContent: "center", alignContent: "center" }}>
            <Button style={{ justifyContent: "flex-start", alignContent: "flex-start" }}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate("Ranking")
              }}>
              <Text style={{ ...styles.drawerMenu, color: themeContext.drawer.textColor }}> Derece </Text>
            </Button>
          </View>
        </View>
        <View flex={1} flexDirection="row" >
          <View flex={1} style={{ justifyContent: "center", alignContent: "center", paddingLeft: wp(20) }}>

            <FastImage resizeMode={FastImage.resizeMode.contain} style={{ width: wp(25), height: wp(25) }}
              source={require('./assets/images/light/drawer/analysis.webp')}>
            </FastImage>
          </View>
          <View flex={5} style={{ justifyContent: "center", alignContent: "center" }}>
            <Button style={{ justifyContent: "flex-start", alignContent: "flex-start" }}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate("Analysis")
              }}>
              <Text style={{ ...styles.drawerMenu, color: themeContext.drawer.textColor }}> Analiz</Text>
            </Button>
          </View>
        </View>
        <View flex={1} flexDirection="row" >
          <View flex={1} style={{ justifyContent: "center", alignContent: "center", paddingLeft: wp(20) }}>
            <FastImage resizeMode={FastImage.resizeMode.contain} style={{ width: wp(25), height: wp(25) }}
              source={require('./assets/images/light/drawer/support.webp')}>
            </FastImage>
          </View>
          <View flex={5} style={{ justifyContent: "center", alignContent: "center" }}>
            <Button style={{ justifyContent: "flex-start", alignContent: "flex-start" }}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate("FirendsMain")
              }}>
              <Text style={{ ...styles.drawerMenu, color: themeContext.drawer.textColor }}> Arkadaşlarım </Text>
            </Button>
          </View>
        </View>
        <View flex={1} flexDirection="row" >
          <View flex={1} style={{ justifyContent: "center", alignContent: "center", paddingLeft: wp(20) }}>
            <FastImage resizeMode={FastImage.resizeMode.contain} style={{ width: wp(25), height: wp(25) }}
              source={require('./assets/images/light/drawer/settings.webp')}>
            </FastImage>
          </View>
          <View flex={5} style={{ justifyContent: "center", alignContent: "center" }}>
            <Button style={{ justifyContent: "flex-start", alignContent: "flex-start" }}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate("SettingsMain")
              }}>
              <Text style={{ ...styles.drawerMenu, color: themeContext.drawer.textColor }}> Ayarlar </Text>
            </Button>
          </View>
        </View>
        <View flex={1} flexDirection="row" >
          <View flex={1} style={{ justifyContent: "center", alignContent: "center", paddingLeft: wp(20) }}>

            <FastImage resizeMode={FastImage.resizeMode.contain} style={{ width: wp(25), height: wp(25) }}
              source={require('./assets/images/light/drawer/logout.webp')}>
            </FastImage>

          </View>
          <View flex={5} style={{ justifyContent: "center", alignContent: "center" }}>
            <Button style={{ justifyContent: "flex-start", alignContent: "flex-start" }}
              onPress={() => {
                LogOut(navigation);
              }}>
              <Text style={{ ...styles.drawerMenu, color: themeContext.drawer.textColor }}> Çıkış </Text>
            </Button>
          </View>
        </View>
        <View flex={6} flexDirection="row"  >

        </View>
        <View flexDirection="row" style={{ position: "absolute", bottom: 0 }} >

          <Image resizeMode="contain" style={{ position: "absolute", bottom: 0, height: wp(250), left: 0, width: wp(80) }} source={require('./assets/images/light/drawer/men-lean.webp')} >
          </Image>


          <Image resizeMode="contain" style={{ position: "absolute", bottom: 0, height: wp(250), width: wp(80), left: wp(145) }} source={require('./assets/images/light/drawer/girl-lean.webp')} >
          </Image>

        </View>
      </View>

    </View>

  );
}
function Root() {
  // const verticalAnimation = {
  //   gestureDirection: 'vertical',
  //   cardStyleInterpolator: ({ current, layouts }) => {
  //     return {
  //       cardStyle: {
  //         transform: [
  //           {
  //             translateY: current.progress.interpolate({
  //               inputRange: [0, 1],
  //               outputRange: [layouts.screen.height, 0],
  //             }),
  //           },
  //         ],
  //       },
  //     };
  //   },
  // };
  const horizontalAnimation = {
    headerShown: false,
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  };
  return <Stack.Navigator initialRouteName="Splash">
    <Stack.Screen name="Splash" component={SplashScreen} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SubjectSelect" component={SubjectSelect} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SubjectExam" component={SubjectExam} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GeneralExam" component={GeneralExam} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GeneralEvaluation" component={GeneralEvaluation} options={{
      ...horizontalAnimation
    }} />

    <Stack.Screen name="StarsQuestion" component={StarsQuestion} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="StarsQuestionList" component={StarsQuestionList} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="MostlyWrong" component={MostlyWrong} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="MostlyWrongList" component={MostlyWrongList} options={{
      ...horizontalAnimation
    }} />

    <Stack.Screen name="Login" component={Login} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="Activation" component={Activation} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ActivationSuccess" component={ActivationSuccess} options={{
      ...horizontalAnimation
    }} />

    <Stack.Screen name="Register" component={Register} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ForgotPasword" component={ForgotPasword} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="FinalyExam" component={FinalyExam} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ResultExam" component={ResultExam} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="StudentExam" component={StudentExam} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="QuestionInfo" component={QuestionInfo} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="QuestionHelp" component={QuestionHelp} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="TimePage" component={TimePage} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="LastSolvedSubjectSelect" component={LastSolvedSubjectSelect} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="Quotations" component={Quotations} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GeneralInfo" component={GeneralInfo} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ThemeSettings" component={ThemeSettings} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SoundSettings" component={SoundSettings} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SettingsUser" component={SettingsUser} options={{
      ...horizontalAnimation
    }} />

    <Stack.Screen name="WinList" component={WinList} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SettingsPassword" component={SettingsPassword} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SettingsSolvedExam" component={SettingsSolvedExam} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GameInfo" component={GameInfo} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GameUpload" component={GameUpload} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GameEnteringUrl" component={GameEnteringUrl} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GameEnteringUrlAndUpload" component={GameEnteringUrlAndUpload} options={{
      ...horizontalAnimation
    }} />

    <Stack.Screen name="GameEnteringText" component={GameEnteringText} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GameTiming" component={GameTiming} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="LeaderBoardOnePerson" component={LeaderBoardOnePerson} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="LeaderBoardThirdPerson" component={LeaderBoardThirdPerson} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="LeaderBoardMultitiplePerson" component={LeaderBoardMultitiplePerson} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GameResultTiming" component={GameResultTiming} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GameInfinity" component={GameInfinity} options={{
      ...horizontalAnimation
    }} />

    <Stack.Screen name="GameResultInfinity" component={GameResultInfinity} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="QuestionReportError" component={QuestionReportError} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ChallangeRules" component={ChallangeRules} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ChallangeMain" component={ChallangeMain} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="AddFriend" component={AddFriend} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="Friends" component={Friends} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="CreateChallange" component={CreateChallange} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SelectFriendMain" component={SelectFriendMain} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SelectFriend" component={SelectFriend} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ChallangeGame" component={ChallangeGame} options={{
      ...horizontalAnimation
    }} />

    <Stack.Screen name="FinallyChallange" component={FinallyChallange} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ResultExamChallange" component={ResultExamChallange} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ChallangeCheck" component={ChallangeCheck} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ChallangeResults" component={ChallangeResults} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ChallangeGameResult" component={ChallangeGameResult} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="Notifications" component={Notifications} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="AnalysisMain" component={AnalysisMain} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="SettingsActivity" component={SettingsActivity} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="GameTimingErorPage" component={GameTimingErorPage} options={{
      ...horizontalAnimation
    }} />
    <Stack.Screen name="ResultGameUpload" component={ResultGameUpload} options={{
      ...horizontalAnimation
    }} />

    <Stack.Screen options={{ ...horizontalAnimation }} name="Home" component={TabNavigator} />
    <Stack.Screen options={{ ...horizontalAnimation }} name="Question" component={Question} />
    <Stack.Screen options={{ ...horizontalAnimation }} name="QuestionCheck" component={QuestionCheck} />
  </Stack.Navigator>
}
// Main Navigator
function Navigator() {
  const dimensions = useWindowDimensions();
  return (
    <NavigationContainer
      onStateChange={(state) => syncBackend()}>
      <Drawer.Navigator drawerStyle={{ width: '60%' }}
        overlayColor="transparent" drawerType={dimensions.width >= 768 ? 'permanent' : 'front'} drawerContent={(props) => <DrawerContent {...props} />} drawerPosition="right" initialRouteName="Root">
        <Drawer.Screen name="Root" component={Root} />
        <Drawer.Screen name="AboutScreen" component={AboutScreen} />
        <Drawer.Screen name="Ranking" component={Ranking} />
        <Drawer.Screen name="Analysis" component={Analysis} />
        <Drawer.Screen name="FirendsMain" component={FirendsMain} />
        <Drawer.Screen name="AwardQuestions" component={AwardQuestions} />
        <Drawer.Screen name="SettingsMain" component={SettingsMain} />

      </Drawer.Navigator>
    </NavigationContainer>
  )
}

export default Navigator
const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  drawerName: {
    paddingLeft: wp(30),
    fontSize: wp(14),
    color: "#D4D4D4",
    ...bold
  },
  drawerMenu: {
    fontSize: wp(14),
    ...bold
  }

});