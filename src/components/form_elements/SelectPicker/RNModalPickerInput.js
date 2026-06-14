/* eslint-disable react/prop-types */
import { Text } from 'components';
import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Image,
  TextInput,
  Animated,
  Easing,
  View,
} from 'react-native';
import { hp, wp } from "utils/dimension";

class FloatingLabel extends PureComponent {
  constructor(props) {
    super(props);
    const style =
      this.props.value || this.props.placeholder ? dirtyStyle : cleanStyle;
    this.state = {
      text: this.props.value,
      dirty: this.props.value || this.props.placeholder,
      // labelStyle: {
      //   fontSize: new Animated.Value(style.fontSize),
      //   top: new Animated.Value(style.top),
      // },
    };
  }
componentDidUpdate(){
  if ( this.props.value !== 'undefined' && this.props.value !== this.state.text) {
    this.setState({text: this.props.value, dirty: !!this.props.value});
    this.animate(!!this.props.value);
  }
}

  //   componentDidUpdate(props) {
  //     if (typeof props.value !== 'undefined' && props.value !== this.state.text) {
  //       this.setState({ text: props.value, dirty: !!props.value });
  //       this.animate(!!props.value);
  //     }
  //   }

  animate = (dirty) => {
    // const nextStyle = dirty ? dirtyStyle : cleanStyle;
    // const {labelStyle} = this.state;
    // const anims = Object.keys(nextStyle).map((prop) => {
    //   return Animated.timing(
    //     labelStyle[prop],
    //     {
    //       toValue: nextStyle[prop],
    //       duration: 200,
    //       useNativeDriver: false,
    //     },
    //     Easing.ease,
    //   );
    // });
    // Animated.parallel(anims).start();
  };

  onFocus = () => {
    this.animate(true);
    this.setState({dirty: true});
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  onBlur = () => {
    if (!this.state.text) {
      this.animate(false);
      this.setState({dirty: false});
    }
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  };

  onChangeText = (text) => {
    this.setState({text});
    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  };

  updateText = (event) => {
    const {text} = event.nativeEvent;
    this.setState({text});
    if (this.props.onEndEditing) {
      this.props.onEndEditing(event);
    }
  };

  renderLabel() {
    return (
      <Text
        style={[this.state.labelStyle, styles.label]}>
        {this.props.labelText}
      </Text>
    );
  }

  render() {
    const {
      container,
      placeholder,
      onChangeText,
      value,
      keyboardType,
      secureTextEntry,
      returnKeyType,
      isSelection,
      autoFocus,
      onSubmitEditing,
      TextInputStyle,
      editable,
      pointerEvents,
      maxLength,
      blurOnSubmit,
      autoCapitalize,
      onTouchStart,
      textAlignVertical,
      multiline,
      numberOfLines,
      dropDownIcon,
      dropDownIconStyle,
      style,
      labelText,
      labelStyle,
      placeholderTextColor,
      onSubmit,
      ref,
      disabled
    } = this.props;
    return (
      <View style={[styles.container, container]}>
        <Text
        style={[this.state.labelStyle, styles.label]}>
        {this.props.labelText}
      </Text>
        <TextInput
          {...this.props}
          onBlur={this.onBlur}
          onChangeText={this.onChangeText}
          onEndEditing={this.updateText}
          onFocus={this.onFocus}
          placeholderTextColor={placeholderTextColor}
          placeholder={placeholder}
          value={value}
          keyboardType={keyboardType}
          blurOnSubmit={blurOnSubmit}
          secureTextEntry={secureTextEntry}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          numberOfLines={numberOfLines}
          selection={isSelection ? {start: 0, end: 0} : undefined}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmit}
          ref={ref}
          editable={editable}
          pointerEvents={pointerEvents}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onTouchStart={onTouchStart}
          textAlignVertical={textAlignVertical}
          multiline={multiline}
          style={[styles.input, style]}
        />{
          value || disabled?null:<Image
          style={{ width: 15,
            height: 15, left: wp(-28), top: hp(1)}}
          resizeMode="contain"
          source={require('../../../images/botas/down.webp')}
        />
        }
    
        
     
      </View>
    );
  }
}

const labelStyleObj = {
  position: 'absolute',
  fontSize: hp(14),
  color: "#004F58",
  fontFamily: "Narin-Medium",
  left:wp(-2),
  top:hp(-25)
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '99%',
    height:hp(45),
    alignItems: 'center',
    // backgroundColor: 'red',
    flexDirection: 'row',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    backgroundColor: 'black',
    justifyContent: 'center',
    width: '100%',
    color: 'black',
    fontSize: 20,
    paddingLeft: 10,
    marginTop: 20,
  },
  label: labelStyleObj,
});

const cleanStyle = {
 
};

const dirtyStyle = {

};

export default FloatingLabel;
