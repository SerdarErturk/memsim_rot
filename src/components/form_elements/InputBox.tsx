import React, { useEffect, useState } from 'react';

import { Icon, Input, Text } from '@ui-kitten/components';
import { StyleSheet, } from 'react-native';
import { MaskedTextInput } from "react-native-mask-text";
import { TouchableWithoutFeedback } from '@ui-kitten/components/devsupport';
import { hp, wp } from 'utils/dimension';
import { View } from 'components';
export interface IInputProps {
    label: any,
    mask?: any,
    value: any,
    accessoryRight?: any
    accessoryLeft?: any
    keyboardType?: any
    secureTextEntry?: any
    multiline?: any
    disabled?: any
    status?: any
    placeholder?: any
    field?: any,
    size?: 'small' | 'medium' | 'large',
    showButton?: any,
    refProp?: any,
    returnKeyType?: any,
    onChangeText: (text: string) => void;
    onCustomButtonPress?: () => void;
    onSubmitEditing?: () => void;
}
export const InputBox = (props: IInputProps) => {
    const [value, setValue] = useState(props.value?props.value+'':'');
    var btnPress = props.onCustomButtonPress;
    useEffect(() => {
        setValue(props.value?props.value+'':"")
    }, [props.value]);


    const [secureTextEntry, setSecureTextEntry] = React.useState(props.secureTextEntry);
    const renderIcon = (props: any) => (
        <TouchableWithoutFeedback onPress={(toggleSecureEntry)}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} fill='#004F58' />
        </TouchableWithoutFeedback>
    );

    const renderButtonIcon = (props: any) => (
        <TouchableWithoutFeedback onPress={() => {
            if (btnPress) {
                btnPress();
            }

        }}>
            <Icon {...props} name="map-outline" fill='#004F58' />
        </TouchableWithoutFeedback>
    );


    const onSubmitEditing = (e: any) => {
        if (props.onSubmitEditing) {
            props.onSubmitEditing()
        }
    }
    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };
    return (
        props.mask ?
            <>
                <Text style={styles.label}> {props.label || ""} </Text>

                <MaskedTextInput
                    value={value}
                    key={props.field}
                    ref={props.refProp}
                    mask={props.mask}
                    returnKeyType={props.returnKeyType}
                    inputAccessoryView={props.accessoryLeft}
                    keyboardType={props.keyboardType == "numeric" || props.keyboardType == "decimal" ? "numeric" : "default"}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={props.returnKeyType ? false : true}
                    onChangeText={(text, rawText: any) => {
                        setValue(rawText)
                        props.onChangeText(rawText)
                    }}
                    style={props.status == "danger" ? { ...styles.input, ...styles.mask, ...styles.danger } : { ...styles.input, ...styles.mask }}
                />
            </> :
            <Input
                key={props.field}
                keyboardType={props.keyboardType == "numeric" || props.keyboardType == "decimal" ? "numeric" : "default"}
                value={value || ""}
                ref={props.refProp}
                returnKeyType={props.returnKeyType}
                 disabled={props.disabled ? true : false}
                multiline={props.multiline}
                size={props.size ? props.size : 'medium'}
                onSubmitEditing={onSubmitEditing}
                 blurOnSubmit={props.returnKeyType ? false : true}
                accessoryRight={props.secureTextEntry ? renderIcon : props.showButton ? renderButtonIcon : props.accessoryRight}
                accessoryLeft={
                    props.accessoryLeft ? <View flexNone center style={{ width: wp(150), height: wp(150), backgroundColor: "red" }}>
                        <View center style={{
                            backgroundColor: "#004F58", position: "absolute",
                            top: -wp(17),
                            bottom: -wp(17), left: -wp(22),
                            width: wp(45),
                            borderTopLeftRadius: 10,
                            borderBottomLeftRadius: 10,

                        }} >
                            {props.accessoryLeft}
                        </View>
                    </View> : undefined


                }
                secureTextEntry={secureTextEntry}
                style={props.disabled ? [styles.input, styles.bordered, { backgroundColor: "#00000040" }] : [styles.input, !props.accessoryLeft && props.status != "danger" ? styles.bordered : {}, props.size == "small" ? { paddingTop: 0 } : {}]}
                 label={evaProps => <Text {...evaProps} style={styles.label}>{props.label}</Text>}
                 textStyle={[styles.text, props.multiline ? { minHeight: 64 } : {}]}
                // status={props.status}
                onChangeText={(text: any) => {
                    var regexp = /^\d+\.\d{0,2}$/;
                    if (props.keyboardType == "numeric") {
                        text = text.replace(",", "");
                        text = text.replace(".", "");
                        var regValidate = regexp.test(text);
                        if (!regValidate) {
                            text = text.replace(",", "").replace(".", "")
                        }
                    } else if (props.keyboardType == "decimal") {
                        text = text.replace(",", ".")
                        var regValidate = regexp.test(text);
                        if (!regValidate) {
                            text = text.replace(",", "").replace(".", "")
                        }
                    }

                    setValue(text)
                    props.onChangeText(text)
                }}
            />
    );
};
const styles = StyleSheet.create({
    input: {
        borderRadius: 8,
        backgroundColor: "#EDF0F7",
        paddingTop: hp(4),
        borderWidth: 1,

    },
    bordered: {
        borderColor: "#39464E50"
    },
    danger: {
        borderColor: '#FF3D71',
        borderWidth: 1,
    },
    mask: {
        paddingLeft: 20,
        fontSize: hp(14),
        fontFamily: "DIN-Regular",
        height: hp(55),
        marginTop: hp(3)

    },
    label: {
        fontSize: wp(5),
        color: "#004F58",
        marginBottom: hp(4),
        fontFamily: "Narin-Medium"
    },
    text: {
        fontSize: wp(6),
        minHeight: hp(20),
        color: "#39464E",
        fontFamily: "Narin-Bold",
    }
});