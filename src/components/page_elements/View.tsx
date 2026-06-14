import * as React from 'react';

import { StyleSheet, View, ViewStyle,StyleProp } from 'react-native';
export interface IViewProps {
    style?: StyleProp<ViewStyle> ,
    children: any,
    center?: any,
    rowDirection?: any,
    flexNone?: boolean,
}
export const ViewArea = (props: IViewProps) => {

    let style = styles.view;
    if (props.center) {
        style = styles.viewcenter;
    }
    if(props.flexNone){
        style = {} as any;
    }

    return (
        <View style={[style, props.rowDirection ? styles.directionRow : {}, props.style]}
        >
            {props.children}
        </View>
    );
};
const styles = StyleSheet.create({
    viewcenter: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"

    },
    view: {
        flex: 1,

    },
    directionRow: {
        flexDirection: "row",
        
    }
});