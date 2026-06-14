import { Button } from '@ui-kitten/components';
import { Text, View } from 'components';
import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
export interface IButtonProps {
    label: any
    disabled?: boolean
    labelstyle?: any
    style?: any
    image?: any
    onChangeText?: (text: string) => void;
    onPress: any
}
export const ButtonArea = (props: IButtonProps) => {


    return (
        <TouchableOpacity disabled={props.disabled} style={[styles.button, props.style]} onPress={props.onPress} >
            {props.image ? <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }} >
                {props.image}
                <Text style={[styles.txt, props.labelstyle]}> {props.label} </Text>

            </View>
                :
                <Text style={[styles.txt, props.labelstyle]}> {props.label} </Text>
            }
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    button: {
        borderRadius: hp(10),
        backgroundColor: "#004F58",
        borderColor: "transparent",
        height: wp(20),
        justifyContent: "center",
        alignItems: "center",
    },
    txt: {
        color: "#fff",
        fontSize: wp(8),
        fontFamily: "Narin-Bold",
        textAlign: "center"
    }
});