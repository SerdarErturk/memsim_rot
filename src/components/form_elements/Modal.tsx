import { Modal } from '@ui-kitten/components';
import { Text, View } from 'components';
import React from 'react';
import { StyleSheet, StyleProp, TouchableOpacity, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import { showMessage } from 'react-native-flash-message';
import { hp, wp } from 'utils/dimension';

export interface IModalProps {
  style?: StyleProp<any>;
  visible: boolean;
  children?: any;
  description?: any;
  title: any,
  selectedPicture?: any,
  type?: any,
  onOk: (() => void),
  onCancel: (() => void),
  inspect?:boolean;
  infoPhoto?:boolean;
}


export class BerModal extends React.Component<IModalProps>  {

  // private scrollRef = React.createRef<HTMLDivElement>();
  constructor(props: IModalProps) {
    super(props);
  }
  state = {
    title: this.props.title || false,
    visible: this.props.visible || false
  }
  validate = () => {
    if ((!this.props.description || this.props.description == "") && this.props.type=="image"&&!this.props.infoPhoto) {
      this.setState({title:"Lütfen Resim Açıklaması Giriniz."})
      return false
    } else {
      this.setState({title:this.props.title||""})
      return true
    }
  }
  componentDidUpdate(prevProps: any) {
    if (this.props.visible != this.state.visible) {
        this.setState({ visible: this.props.visible })
    }
  }
  render() {
    return (
     <Modal visible={this.state.visible} style={styles.container}>
        <View flexNone style={{ paddingTop: 30, flexDirection: "row" }} >
          <View center>
          <TouchableOpacity onPress={() => {
              if(this.props.type=="image"){
                this.state.title=""
              }
                this.props.onCancel()
            }} >
              <FastImage
                style={{ width: hp(45), height: hp(45) }}
                source={require('../../images/botas/cancel.webp')}
                resizeMode={FastImage.resizeMode.contain}
              />

            </TouchableOpacity>
         
        </View>
        
          <View center>
            <Text style={styles.title}>
              {this.state.title}
            </Text>
          </View>
          <View center>
          {
          this.props.type=="image"&&!this.props.selectedPicture?null:
          <TouchableOpacity onPress={() => {
            if (this.validate()) {
              this.props.onOk()
            }
          }}  >
            <FastImage
              style={{ width: hp(45), height: hp(45) }}
              source={require('../../images/botas/ok.webp')}
              resizeMode={FastImage.resizeMode.contain}
            />

          </TouchableOpacity>
          
        } 
          </View>
        </View>
        <View >
          {this.props.children}
        </View>

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
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    justifyContent: 'center',
    position: "absolute",
    top: 0
  },
  title: {
    
    fontSize: hp(20),
    fontFamily: "Narin-Bold",
    textAlign: "center"
  }
});
