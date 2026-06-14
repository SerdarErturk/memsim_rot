import React, { useState } from 'react';

import { CheckBox, Text } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { hp } from 'utils/dimension';
export interface ICheckBoxProps {
    label: any,
    value: any,
    disabled?:boolean,
    style?:any,
  onChange: ((value: any) => void),
}
export const CheckBoxArea = (props: ICheckBoxProps) => {
    const [value, setValue] = useState(props.value);
    return (
        <CheckBox 
        disabled={props.disabled} 
        style={props.style?props.style:styles.checkbox} 
        checked={value} 
        onChange={(checked) => { setValue(checked);props.onChange(checked) }}>
            {evaProps => <Text {...evaProps} style={styles.label} >{props.label}</Text>}
        </CheckBox>
    );
};
const styles = StyleSheet.create({
    checkbox: {
        borderRadius: 500,
        paddingTop: hp(10)

    },
    label: {
        fontSize: hp(14),
        color: "#004F58",
        marginLeft:hp(6),
        fontFamily: "Narin-Medium"
      },
});