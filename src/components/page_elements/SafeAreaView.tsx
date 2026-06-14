import { Button, FastImage } from 'components';
import * as React from 'react';

import { StyleSheet, SafeAreaView } from 'react-native';
import { hp } from 'utils/dimension';
import { useNavigation } from '@react-navigation/native';
export interface ITextProps {
    style?: any,
    hideBack?: any,
    backMode?: "dark" | "light",
    children: any,
}
export const SafeAreaViewArea = (props: ITextProps) => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={[styles.container, props.style]}
        >

            {props.children}
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#022041',
        flex: 1
    },

});