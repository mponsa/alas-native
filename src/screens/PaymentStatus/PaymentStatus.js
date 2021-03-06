import React, { useContext } from 'react'
import { useDispatch } from 'react-redux'
import { Text, View, Image, TouchableOpacity } from 'react-native'
import styles from './styles';
import { AuthContext } from '../../utils/authContext'
import {getUserMainScreen, getUserInvestmentScreen} from '../../api/api'
import { refreshmain, refreshinvestment } from '../../redux/alasApp'


export default function PaymentStatus({route, navigation}) {
    const { data } = route.params
    const { response } = route.params
    const { user } = useContext(AuthContext)
    const distpatch = useDispatch()

    const refreshMainScreen = data => distpatch(refreshmain(data))

    const refreshInvestmentScreen = data => distpatch(refreshinvestment(data))

    async function onGoBackPress(){
        getUserMainScreen(user.token).then(
            response => {
                refreshMainScreen(response)
            }
        );

        getUserInvestmentScreen(user.token).then(
            response => {
                refreshInvestmentScreen(response)
            }
        );

        if(data.withdraw){
            if(data.withdraw.flow === 'invest')  navigation.navigate('Investment');
        }

        navigation.navigate('Home')
    }

    const onTryAgainPress = () => {
        navigation.navigate('Ingresar Monto')
    }

    const transformDAI = (daiAmount) =>{
        let dai = daiAmount
        return dai.toFixed(3)
    }

    const Icon = ({status}) => {
        if(status == 200){
            return(
                <Image style={styles.statusIcon} source={require('../../../assets/action-success.png')}></Image>
            )
        }

        return(
            <Image style={styles.statusIcon} source={require('../../../assets/action-notsuccess.png')}></Image>
        )
    }

    const Wording = ({status}) => {
        if(status == 200){
            if(data.qrData){
                return(
                <>
                    <Text style={styles.mainWording}>¡Listo! Pagaste a {data.qrData.shop}:</Text>
                    <Text style={styles.mainWording}>{user.userHome.userLC + ' $' + data.amountLC}</Text>
                    <Text style={styles.secondaryWording}>Se debitaron {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta</Text>
                </>
                )
            }
            if(data.investData){
                return(
                <>
                    <Text style={styles.mainWording}>¡Listo! Tu dinero ya está generando intereses.</Text>
                    <Text style={styles.mainWording}>{user.userHome.userLC + ' $' + data.amountLC}</Text>
                    <Text style={styles.secondaryWording}>Se debitaron {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta principal.</Text>
                </>
                )
            }
            if(data.sendData){
                return(
                <>
                    <Text style={styles.mainWording}>¡Listo! Enviaste a {data.sendData.address}:</Text>
                    <Text style={styles.mainWording}>{user.userHome.userLC + ' $' + data.amountLC}</Text>
                    <Text style={styles.secondaryWording}>Se debitaron {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta principal.</Text>
                </>
                )
            }
            if(data.withdraw && data.withdraw.flow === 'investment'){
                return(
                    <>
                        <Text style={styles.mainWording}>¡Listo! Retiraste de {data.withdraw.payload.provider}:</Text>
                        <Text style={styles.mainWording}>{user.userHome.userLC + ' $' + data.amountLC}</Text>
                        <Text style={styles.secondaryWording}>Se debitaron {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta de inversiones.</Text>
                    </>
                    )
            }
            if(data.withdraw && data.withdraw.flow === 'account'){
                return(
                    <>
                        <Text style={styles.mainWording}>¡Listo! Retiraste:</Text>
                        <Text style={styles.mainWording}>{user.userHome.userLC + ' $' + data.amountLC}</Text>
                        <Text style={styles.secondaryWording}>Se debitaron {'DAI ' + transformDai(data.amountDAI)} de tu cuenta principal.</Text>
                    </>
                    )
            }
        }
        if(data.qrData) return( <Text style={styles.mainWording}>¡Uups! No pudimos procesar tu pago!</Text> )
        if(data.investData) return( <Text style={styles.mainWording}>¡Uups! No pudimos procesar tu inversión!</Text> )
    }

    const Action = ({status}) => {
        if(status == 200){
            return(
            <TouchableOpacity
                style={styles.button}
                onPress={onGoBackPress}>
                <Text style={styles.buttonTitle}>Volver</Text>
            </TouchableOpacity>
            )
        }
        return(
            <TouchableOpacity
                onPress={onTryAgainPress}>
                <Text style={styles.secondaryWordingUnderline}>Intenta nuevamente.</Text>
            </TouchableOpacity>
            )
    }



    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <Icon status={response.code}></Icon>
                <Wording status={response.code}></Wording>
            </View>
            <View style={styles.footer}>
                <Action status={response.code}></Action>
            </View>
        </View>
    )
}