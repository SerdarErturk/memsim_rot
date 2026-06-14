import * as React from 'react';

import { StyleSheet, ScrollView, ViewStyle,StyleProp } from 'react-native';
import { hp, wp } from 'utils/dimension';
export interface IViewProps {
    style?: StyleProp<ViewStyle> ,
    children: any,
    horizontal?:any
}
export const ScrollViewArea = (props: IViewProps) => {
    
    let style = styles.view;

    return (
        <ScrollView style={[style, props.style] }
        >
            {props.children}
        </ScrollView>
    );
};
const styles = StyleSheet.create({

    view: {
        padding: wp(4)

    }
});