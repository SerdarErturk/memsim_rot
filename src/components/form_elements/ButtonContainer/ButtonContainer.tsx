import { Button, Icon } from '@ui-kitten/components';
import { BarcodeInput, View } from 'components';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';



export interface IButtonContainerProps {

  image?: any;
  onNextClick?: any;
  onBackClick?: any;
  onSave?: any
  text?: any,
  search?: any;
  add?: any;
}


export class ButtonContainer extends React.Component<IButtonContainerProps>  {
  private timer: any;
  // private scrollRef = React.createRef<HTMLDivElement>();
  constructor(props: IButtonContainerProps) {
    super(props);
  }
  search = (text: any) => {
    if (this.timer) {
      clearInterval(this.timer)
    }
    var that = this;
    this.timer = setTimeout(function () {
      that.props.search(text)
    }, 1000);

  }
  render() {
    return (
      <View style={{ height: hp(50), padding: wp(4), flexDirection: "row" }}>

        {this.props.onBackClick ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }}>
          <Button  style={{ width: wp(15) }} accessoryLeft={<Icon name='arrow-ios-back-outline' />} onPress={this.props.onBackClick} />
        </View> : null}

        {this.props.search ?
          <View style={{ flex: 1 }}>
            <BarcodeInput onChangeText={(text) => { this.search(text) }} />
          </View> : null}

        {this.props.onSave ? <Button accessoryLeft={<Icon name='save' />} onPress={this.props.onSave} /> : null}

        {this.props.onNextClick ?
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} >
            <Button style={{ width: wp(15) }} accessoryLeft={<Icon name='arrow-ios-forward-outline' />} onPress={this.props.onNextClick} />
          </View>
          : null}
        {this.props.add ? <Button style={{ backgroundColor: "#F07C00", borderWidth: 0, height: wp(40) }} accessoryLeft={<Icon name='plus-circle-outline' />} onPress={this.props.add} /> : null}


      </View>
    );
  }
}

