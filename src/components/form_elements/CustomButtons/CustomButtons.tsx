import { Button, Icon } from '@ui-kitten/components';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FastImage, Text, View } from 'components';
import React from 'react';
import { hp, wp } from 'utils/dimension';



export interface ICustomButtonsProps {
  onAddClick?: any
  onStartClick?: any
  onCompleteClick?: any
  onCancelClick?: any
  onPlanClick?: any
  onBackClick?: any
  onSaveClick?: any
  onCloseApproveClick?: any
  onApproveClick?: any
  onRouteClick?: any
  onApproveRepairClick?: any
  onCloseClick?: any
  onApproveRouteClick?: any
  onSendBackClick?: any
  onBtc?: any
  onKhi?: any
  onEnvironment?: any
  onNextClick?: any,
  onGoClick?: any
}


export class CustomButtons extends React.Component<ICustomButtonsProps>  {
  // private scrollRef = React.createRef<HTMLDivElement>();
  constructor(props: ICustomButtonsProps) {
    super(props);
  }

  render() {
    return (
      <View style={{
        height: hp(70), padding: wp(2), paddingTop: hp(6), flexDirection: "row",
        backgroundColor: "#fff", position: "absolute", bottom: 0, width: "100%",
        justifyContent: "space-around",
        alignItems: "center",
        paddingLeft: wp(15),
        paddingRight: wp(15)
      }}>
        {this.props.onBackClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onBackClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/close.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Vazgeç</Text>
          </TouchableOpacity>

          : null}
        {this.props.onAddClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onAddClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/add.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Ekle</Text>
          </TouchableOpacity>

          : null}
        {this.props.onStartClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onStartClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/play.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Başlat</Text>
          </TouchableOpacity>


          : null}
              {this.props.onPlanClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onPlanClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/edit.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Planla</Text>
          </TouchableOpacity>


          : null}
        {this.props.onCompleteClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onCompleteClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/check.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Tamamla</Text>
          </TouchableOpacity>


          : null}
        {this.props.onCancelClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onCancelClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/close.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>İptal Et</Text>
          </TouchableOpacity>
          : null}
        {this.props.onSaveClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onSaveClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/save.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Kaydet</Text>
          </TouchableOpacity>
          : null}


{this.props.onCloseClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onCloseClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/ok.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Kapat</Text>
          </TouchableOpacity>
          : null}

        {this.props.onCloseApproveClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onCloseApproveClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/save.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Kapat ve Onaya Gönder</Text>
          </TouchableOpacity>
          : null}

        {this.props.onNextClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onNextClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/save.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Değerlendirme Ekranına Git</Text>
          </TouchableOpacity>
          : null}

        {this.props.onApproveRouteClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onApproveRouteClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/save.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Onayla ve Onaya Gönder</Text>
          </TouchableOpacity>
          : null}

        {this.props.onBtc ?
          <TouchableOpacity style={styles.button} onPress={this.props.onBtc} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/finding.webp')}
              style={{ width: wp(40), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Btc Scope</Text>
          </TouchableOpacity>
          : null}

        {this.props.onKhi ?
          <TouchableOpacity style={styles.button} onPress={this.props.onKhi} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/finding.webp')}
              style={{ width: wp(40), height: wp(40), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>KHI Birimine Yönlendir</Text>
          </TouchableOpacity>
          : null}
        {this.props.onEnvironment ?
          <TouchableOpacity style={styles.button} onPress={this.props.onEnvironment} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/finding.webp')}
              style={{ width: wp(40), height: wp(40), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Çevre Birimine Yönlendir</Text>
          </TouchableOpacity>
          : null}
    {this.props.onApproveRepairClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onApproveRepairClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/finding.webp')}
              style={{ width: wp(40), height: wp(40), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Onayla ve Tamir Bakıma Yönlendir</Text>
          </TouchableOpacity>
          : null}
 {this.props.onGoClick ?
          <TouchableOpacity style={styles.button} onPress={this.props.onGoClick} >
            <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/botas/play.webp')}
              style={{ width: wp(36), height: wp(36), backgroundColor: "white" }}>

            </FastImage>
            <Text style={styles.text}>Devam Et</Text>
          </TouchableOpacity>

          : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center"
  }, view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }, text: {
    color: "#39464E",
    fontSize: hp(14),
    fontFamily: "Narin-Bold",
    textAlign: "center"
  }
});
