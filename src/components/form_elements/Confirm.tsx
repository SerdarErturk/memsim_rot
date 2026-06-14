import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card, Layout, Modal, Text } from '@ui-kitten/components';
import { hp, wp } from 'utils/dimension';
import { View } from 'components';


export interface IConfirmProps {
    visible: boolean;
    onCancel: any;
    onOk: any;
    title?: any;
}

export class Confirm extends React.Component<IConfirmProps>  {

    // private scrollRef = React.createRef<HTMLDivElement>();
    constructor(props: IConfirmProps) {
        super(props);

    }
    state = {
        visible: this.props.visible || false
    }
    componentDidMount() {
    }
    componentDidUpdate(prevProps: any) {
        if (this.props.visible != this.state.visible) {
            this.setState({ visible: this.props.visible })
        }
    }

    onCancel = () => {

    }
    onOk = () => {

    }

    render() {
        const { visible } = this.state;
        return (

            <Modal visible={visible} style={styles.container}>
                <Card disabled={true} style={{height:hp(150)}}>
                    <Text>{this.props.title ? this.props.title : "Seçili Kaydı Silmek İstiyor musunuz?"}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <View style={{ flex: 1, padding: wp(10) }}>
                            <Button  style={{backgroundColor:"#E53030",borderWidth:0}} onPress={this.props.onCancel}>
                                HAYIR
                            </Button>
                        </View>
                        <View style={{ flex: 1, padding: wp(10) }}>
                            <Button style={{backgroundColor:"#004F58",borderWidth:0}} status="danger" onPress={this.props.onOk}>
                                EVET
                            </Button>
                        </View>
                    </View>
                </Card>
            </Modal>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        minHeight: 192,
        width: "100%",
        height: hp(800),
        padding: wp(10),
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        flexDirection: 'column',
        justifyContent: 'center',
        position: "absolute",
        top: 0
    },
});