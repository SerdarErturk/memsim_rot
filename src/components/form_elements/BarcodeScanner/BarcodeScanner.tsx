'use strict';

import React from 'react';


import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { hp, wp } from 'utils/dimension';
export interface IBarcodeScannderProps {
  onRead: any;
}

export class BarcodeScanner extends React.Component<IBarcodeScannderProps> {

  constructor(props: IBarcodeScannderProps) {
    super(props);
  }
  componentDidMount(){
    // this.props.onRead("123456")
  }
  onSuccess = (e: any) => {
    this.props.onRead(e.data)

  };
  render() {
    return (
      <QRCodeScanner
        showMarker
        onRead={this.onSuccess}
        markerStyle={{ borderColor: "#F07C00", width: wp(300), height: hp(200), borderRadius: 5, borderWidth: 3 }}
        flashMode={RNCamera.Constants.FlashMode.auto}

      />
    );
  }
}

