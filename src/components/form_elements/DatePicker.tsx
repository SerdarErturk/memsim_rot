import React, { useState } from 'react';

import { Icon, Text } from '@ui-kitten/components';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FastImage, View } from 'components';
import { combineStringDateAndTime, getCurrentDateString, getCurrentTimeString } from '../../utils/helper'
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker"
import moment from 'moment-timezone';
export interface IDatePickerProps {

    label?: any,
    mask?: any,
    value?: any,
    accessoryRight?: any
    accessoryLeft?: any
    keyboardType?: any
    secureTextEntry?: any
    multiline?: any
    disabled?: any
    status?: any
    placeholder?: any
    field?: any,
    showtime?: boolean,
    closeDefault?: boolean,
    size?: 'small' | 'medium' | 'large',
    onChange: (date: Date) => void;
}


export const DatePicker = (props: IDatePickerProps) => {
    const [value, setValue] = useState(props.value || null);
    const [showDatepicker, setShowDatePicker] = useState(false);
    const [showTimepicker, setShowTimePicker] = useState(false);
    const [date, setDate] = useState(getCurrentDateString(props.value));
    const [time, setTime] = useState(getCurrentTimeString() || "");

    useFocusEffect(
        React.useCallback(() => {
            if (props.value != value) {
                if (props.value) {
                    onChangeTime(props.value,false)
                    onChangeDate(props.value,false)
                }else if (value) {
                    onChangeTime(value,true)
                    onChangeDate(value,true)
                }
            } else {
                if(!value && !props.closeDefault){
                    var val = combineStringDateAndTime(date, time) as any;
                    setValue(val);
                    props.onChange(val);
                }
              
            }
        }, [props.value]),
    )
    const onChangeTime = (selectedDate: any,setCombined?:any) => {
       const currentDate = selectedDate;
        var timeVal = getCurrentTimeString(currentDate) as any;
        setTime(timeVal);
        if (Platform.OS == "android") {
            setShowTimePicker(false);
        }
        if(setCombined==true){
            var val = combineStringDateAndTime(date, timeVal) as any;
            setValue(val);
            props.onChange(val);
        }
       


    };

    const onChangeDate = (date: any,setCombined?:any) => {
        const currentDate = date;
        setShowDatePicker(false);
        var dateVal = getCurrentDateString(currentDate) as any;
        setDate(dateVal);
        if(setCombined==true){
            var val = combineStringDateAndTime(dateVal, time) as any;
            setValue(val);
             props.onChange(val);
        }
   
    };
    return (<>

        <Text style={styles.label}> {props.label || ""} </Text>
        <View center style={{ flexDirection: "row" }} >

            <TouchableOpacity style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", backgroundColor: "#FFF", borderRadius: wp(10), height: hp(40), flex: 2 }}
                onPress={() => { setShowDatePicker(true) }}>

                <View center style={{ flex: 2 }}>
                    <Text style={styles.text} > {date}</Text>
                </View>
                <View center>
                    <Icon style={{
                        width: hp(25),
                        height: hp(25)
                    }}
                        fill='#8F9BB3'
                        name='calendar' />
                </View>
            </TouchableOpacity>
            {
                props.showtime ?
                    <TouchableOpacity style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", backgroundColor: "#FFF", marginLeft: wp(2), borderRadius: wp(10), height: hp(40), flex: 1 }}
                        onPress={() => { setShowTimePicker(true) }}>

                        <View center style={{ flex: 2 }}>
                            <Text style={styles.text} > {time}</Text>
                        </View>
                        <View center>
                            <Icon style={{
                                width: hp(25),
                                height: hp(25)
                            }}
                                fill='#8F9BB3'
                                name='clock' />
                        </View>
                    </TouchableOpacity> : null
            }
            <DateTimePickerModal
                locale="tr-Tr"
                isVisible={showDatepicker || showTimepicker}
                mode={showDatepicker ? "date" : "time"}
                timeZoneOffsetInMinutes={3 * 60}
                onConfirm={(date) => {
                    showDatepicker ?
                        onChangeDate(date,true) :
                        onChangeTime(date,true)
                    // console.log(date); 
                }}
                onCancel={() => { setShowDatePicker(false); setShowTimePicker(false) }}
            />
        </View>
    </>
    );
};
const styles = StyleSheet.create({
    input: {
        borderRadius: 8,
        backgroundColor: "#EDF0F7",
        paddingTop: hp(10),
        borderWidth: 1,
        borderColor: "transparent"

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
        fontFamily: "Narin-Medium",
        height: hp(55),
        marginTop: hp(3)

    },
    label: {
        marginBottom: hp(8),
        marginTop: hp(8),
        marginLeft: wp(-3),
        fontSize: hp(14),
        color: "#004F58",
        fontFamily: "Narin-Medium",
    },
    text: {
        fontSize: hp(17),
        color: "#39464E",
        fontFamily: "Narin-Medium",
    },
    timeContent: {
        width: "80%",
        height: hp(40),
        marginTop: hp(5),
        borderRadius: wp(5),
        backgroundColor: Platform.OS == "ios" ? "transparent" : "#F7F9FC",
        marginLeft: wp(4)
    },
    dateContent: {
        width: "100%",
        height: hp(40),
        marginTop: hp(5),
        borderRadius: wp(5),
        backgroundColor: Platform.OS == "ios" ? "transparent" : "#F7F9FC",
        flex: 2
    },
    iosdate: {
        color: "#fff",
    }
});