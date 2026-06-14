import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';

import FastImage from 'react-native-fast-image';


export interface IFastImageProps {
  source: any;
  style?: StyleProp<any>;
  resizeMode?: any;
  children?: any;
}


export class BerFastImage extends React.Component<IFastImageProps>  {

  // private scrollRef = React.createRef<HTMLDivElement>();
  constructor(props: IFastImageProps) {
    super(props);
  }
  static resizeMode = FastImage.resizeMode;
  render() {
    return (
      <FastImage resizeMode={FastImage.resizeMode.contain} {...this.props}>
      </FastImage>


    );
  }
}

