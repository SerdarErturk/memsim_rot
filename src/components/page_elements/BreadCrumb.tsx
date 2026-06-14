import { Text, View } from 'components';
import * as React from 'react';

import { StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { hp, wp } from 'utils/dimension';
import { useNavigation } from '@react-navigation/native';
export interface IBreadCrumbProps {
    pageName: string
}
export const BreadCrumb = (props: IBreadCrumbProps) => {
    const navigation = useNavigation();
    const goBack = () => {
        if(navigation.canGoBack()){
            navigation.goBack();
        }
    
    }
    return (

        <View flexNone style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#39464E50", padding: hp(10), }}>
            <View>
                <TouchableOpacity onPress={goBack}  >
                    <FastImage
                        style={{ width: hp(30), height: hp(30) }}
                        source={require('../../images/botas/back-icon.webp')}
                        resizeMode={FastImage.resizeMode.contain}
                    />

                </TouchableOpacity>

            </View>
            <View center style={{ flex: 3 }}>
                <Text style={styles.name}> {props.pageName}</Text>
            </View>
            <View>

            </View>
        </View>
    );
};
const styles = StyleSheet.create({


    name: {
        color: "#39464E",
        fontSize: wp(11),
        fontFamily: "Narin-Medium"

    }
});