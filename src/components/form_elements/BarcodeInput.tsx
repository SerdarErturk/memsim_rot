import React from 'react';

import { Icon, Input, Modal,Button } from '@ui-kitten/components';
import { FastImage, View, BarcodeScanner, Text  } from 'components';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { hp, wp } from 'utils/dimension';


export interface IBarcodeInputProps {
    leftIcon?: any;
    mode?: any;
    size?: any;
    value?: any;
    rigthIcon?: any;
    style?: any;
    label?: any;
    status?: any;
    placeholder?: any;
    accessoryLeft?: any;
    accessoryRight?: any;
    secureTextEntry?: boolean;
    multiline?: boolean;
    disabled?: boolean;
    onChangeText?: (text: string) => void;
}

export class BarcodeInput extends React.Component<IBarcodeInputProps>  {

    // private scrollRef = React.createRef<HTMLDivElement>();
    constructor(props: IBarcodeInputProps) {
        super(props);

    }
    state = {
        val: this.props.value || "",
        baseVal: this.props.value || "",
        barcodeVisible: false,
    }
    componentDidMount() {
        if (this.props.value) {
            this.setState({ val: this.props.value })
        }
    }
    componentDidUpdate(prevProps: any) {
        
    }
    checkAlpha = (str: any) => {
        if (!str) {
            return true;
        }
        var cc, i, len;
        for (i = 0, len = str.length; i < len; i++) {
            cc = str.charCodeAt(i);
            if (this.props.mode == "alpha") {
                if (!(cc > 64 && cc < 91) && !(cc > 96 && cc < 123)
                    && cc !== 32 //space
                    && cc !== 186 //ş
                    && cc !== 219 //ğ
                    && cc !== 220 //ç
                    && cc !== 221 //ü
                    && cc !== 191 //ö
                    && cc !== 222 //i
                    && cc !== 188 //,
                    && cc !== 189 //-
                    && cc !== 190 //. :
                    && cc !== 9 //. :
                    && cc !== 350 //. :
                    && cc !== 351 //. :
                    && cc !== 305 //. :
                    && cc !== 304 //. :
                    && cc !== 252 //. :
                    && cc !== 214 //. :
                    && cc !== 246 //. :
                    && cc !== 286 //. :
                    && cc !== 287 //. :
                    && cc !== 199 //. :
                    && cc !== 231 //. :
                ) {

                    return false;
                }
            }
            if (this.props.mode == "numeric") {
                if (!(cc > 47 && cc < 58)) { // numeric (0-9)
                    return false;
                }
            }

        }
        return true;
    };
    renderIcon = (icon: any) => {
        return <Icon name={icon} />
    }

    onChange = (value: any) => {
        this.state.val = value;
        if (this.props.mode) {
            var check = this.checkAlpha(value);
            if (check) {
                if (this.props.onChangeText) {
                    this.props.onChangeText(value)
                }
                this.setState({ val: value })
            }
        } else {

            if (this.props.onChangeText) {
                this.props.onChangeText(value)
            }
            this.setState({ val: value })

        }


    }
    render() {
        return <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 5 }}>
                <Input
                    style={{
                        height:wp(20),
                        borderColor: "#F07C00"
                    }}
                    status={"basic"}
                    textStyle={this.props.multiline ? { minHeight: 128 } : { minHeight: wp(18), height:wp(28), }}
                    accessoryRight={<Icon name="search" ></Icon>}
                    {...this.props}
                    value={this.state.val}
                    onChangeText={(text) => { this.onChange(text) }}
                />
            </View>

                <TouchableOpacity style={{ width: "100%", height: "100%", flex:1,padding:wp(5),  borderRadius: wp(2),justifyContent:"center",alignContent:"center" }}
                    onPress={() => { this.setState({ barcodeVisible: true }) }}
                >
                    <FastImage resizeMode={FastImage.resizeMode.contain} source={require('./images/barcode.webp')}
                        style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

                    </FastImage>
                </TouchableOpacity>

            <Modal visible={this.state.barcodeVisible}
                backdropStyle={styles.backdrop}
                onBackdropPress={() => this.setState({ barcodeVisible: false })}>
                <BarcodeScanner onRead={(data: any) => {
                    this.state.val = data;
                    this.setState({ barcodeVisible: false });
                    if (this.props.onChangeText) {
                        this.props.onChangeText(data)
                    }

                }} />

                <Button  onPress={() => { this.setState({ barcodeVisible: false }) }} >
<Text>
    Kapat
</Text>
                </Button>
            </Modal>
        </View>
    }
}

const styles = StyleSheet.create({

    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

});