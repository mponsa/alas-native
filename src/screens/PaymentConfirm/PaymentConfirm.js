import React, { useContext, useState } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { AuthContext } from '../../utils/authContext'
import styles from './styles';
import { makeTransaction } from '../../api/api';
import { ActivityIndicator } from 'react-native';



export default function PaymentConfirm({route, navigation}) {
    const {user} = useContext(AuthContext)
    const [loading, setLoading] = useState(false)

    const { data } = route.params

    async function onContinuePress(){
        setLoading(true)
        let transaction = formatTransactionData(data)
        let response = await makeTransaction(user.token, transaction)
        setLoading(false)
        navigation.navigate('Estado', {
                data,
                response
        })
        
    }

    const LoadingIcon = () => {
        return (<ActivityIndicator style={{color:'#999999'}} size="small" animating={true} />)
    };
    
    const getTransactionType = (data) => {
        if(data.qrData) return 'payment'
        if(data.investData) return 'investment'
        if(data.sendData) return 'money-sent'
        if(data.withdraw && data.withdraw.flow === 'investment') return 'withdraw-from-investment'
        if(data.withdraw && data.withdraw.flow === 'account') return 'withdraw'
    }

    const getExtraData = (data) => {
        if(data.qrData) return {to: data.qrData.shop.toUpperCase()}
        if(data.investData) return {protocol: data.investData.payload.provider}
        if(data.sendData) return {to: data.sendData.address, link: 'https://etherscan.io'}
        
        if(data.withdraw){
            if(data.withdraw.flow === 'investment') return {protocol: data.withdraw.payload.provider}
            if(data.withdraw.flow === 'account') return 'withdraw'
        }
    }

    const formatTransactionData = (data) => {
        let transaction = {}
        transaction.type = getTransactionType(data)
        transaction.amountLC = data.amountLC
        transaction.amountDAI = data.amountDAI
        transaction.userLC = 'ARS'
        transaction.extra = getExtraData(data)
            
        return transaction
    }

    const transformDAI = (daiAmount) =>{
        let dai = daiAmount
        return dai.toFixed(3)
    }

    const Wording = () => {
        if(data.qrData){
            return(
                <View style={styles.textContainer}>
                    <Text style={styles.mainText}> Vas a pagar: </Text>
                    <Text style={styles.mainAmount}>{user.userHome.userLC + ' $' + data.amountLC} a {data.qrData.shop.toUpperCase()}</Text>
                    <Text style={styles.secondaryAmount}>Se debitaran {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta</Text>
                </View>
            )
        }
        if(data.investData){
            return(
                <View style={styles.textContainer}>
                    <Text style={styles.mainText}> Vas a invertir: </Text>
                    <Text style={styles.mainAmount}>{user.userHome.userLC + ' $' + data.amountLC} en {data.investData.payload.provider}</Text>
                    <Text style={styles.secondaryAmount}>Se debitaran {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta principal y los podras ver en Inversiones</Text>
                </View>
            )
        }
        if(data.sendData){
            return(
                <View style={styles.textContainer}>
                    <Text style={styles.mainText}> Vas a enviar: </Text>
                    <Text style={styles.mainAmount}>{user.userHome.userLC + ' $' + data.amountLC}</Text>
                    <Text style={styles.secondaryAmount}>Se debitaran {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta principal.</Text>
                </View>
            )
        }
        if(data.withdraw && data.withdraw.flow === 'investment'){
            return(
                <View style={styles.textContainer}>
                    <Text style={styles.mainText}> Vas a retirar: </Text>
                    <Text style={styles.mainAmount}>{user.userHome.userLC + ' $' + data.amountLC} de tus inversiones</Text>
                    <Text style={styles.secondaryAmount}>Se debitaran {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta de inversiones.</Text>
                </View>
            )
        }
        if(data.withdraw && data.withdraw.flow === 'account'){
            return(
                <View style={styles.textContainer}>
                    <Text style={styles.mainText}> Vas a retirar: </Text>
                    <Text style={styles.mainAmount}>{user.userHome.userLC + ' $' + data.amountLC} de tu cuenta principal</Text>
                    <Text style={styles.secondaryAmount}>Se debitaran {'DAI ' + transformDAI(data.amountDAI)} de tu cuenta y recibiras el monto en tu cuenta bancaria..</Text>
                </View>
            )
        }
    }


    return (
        <View style={styles.container}>
            <Wording/>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                            style={styles.button}
                            onPress={onContinuePress}>
                            {loading ? <LoadingIcon/> : <Text style={styles.buttonTitle}>Continuar</Text>}
                </TouchableOpacity>
            </View>
        </View>
    )
}