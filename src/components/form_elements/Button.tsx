import { FastImage, View } from 'components';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { wp } from 'utils/dimension';



export interface IBerButtonProps {
  children: any;
  image?: any;
  onPress?: any;
  style?: any;
  text?: any
}


export class BerButton extends React.Component<IBerButtonProps>  {

  // private scrollRef = React.createRef<HTMLDivElement>();
  constructor(props: IBerButtonProps) {
    super(props);
  }

  render() {
    return (
      <View style={{ width: "100%", height: "100%", flex: 1, padding: wp(4) }}>
        <TouchableOpacity {...this.props}  style={{ width: "100%", height: "100%", justifyContent: "center", alignContent: "center", alignItems: "center", flex: 1, borderWidth: 1,borderColor:"#F07C00", borderRadius: wp(20),backgroundColor:"white",...this.props.style }}>
          {this.props.children}
          {this.props.image ? <FastImage resizeMode={FastImage.resizeMode.contain} source={this.props.image} style={{ width: wp(100), height:  wp(100)}}>

          </FastImage> : null}
          {this.props.text ? <Text style={{ color: "#727272", fontSize: wp(15) }}> {this.props.text}</Text> : null}
        </TouchableOpacity>

      </View>
    );
  }
}

