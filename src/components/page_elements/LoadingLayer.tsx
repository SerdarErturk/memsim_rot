

import React, { useRef, useImperativeHandle, useState } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { Spinner } from '@ui-kitten/components';
import { wp } from '../../utils/dimension';


const LoadingLayer = (props: any, ref: any) => {

  const animComp = useRef(null) as any;

  const [visible, setVisible] = useState(false);
  useImperativeHandle(ref, () => ({
    fadeIn, fadeOut
  }));

  const fadeIn = () => {
    // if (animComp && animComp.current) {
    //   animComp.current.setNativeProps({ style: { zIndex: 20 } })
    //   Animated.timing(fadeAnim, {
    //     toValue: 1,
    //     duration: 500,
    //     useNativeDriver: true
    //   }).start();
    // }

    setVisible(true)
  };

  const fadeOut = () => {
    // if (animComp && animComp.current) {
    // setTimeout(() => {
    //   if (animComp && animComp.current) {
    //     animComp.current.setNativeProps({ style: { zIndex: -20 } })
    //   }
    //   },100)
    // Animated.timing(fadeAnim, {
    //   toValue: 0,
    //   duration: 100,
    //   useNativeDriver: true
    // }).start();

    setVisible(false)
    // }
  };
  // let visiblestyle =  {
  //     top: 0,
  //     bottom: 0,
  //     left: 0,
  //     right: 0
  // }
  return (
   visible ? <View ref={animComp} style={styles.container}>
   <View

        style={[
          styles.fadingContainer,
        ]}
      >

        <Spinner size={"giant"} status='warning' />
      </View> 

    </View>: null
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000000",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 20,
    right: 0
  },
  fadingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    padding: wp(100),
    zIndex: 1000000,
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    position: "absolute",
    justifyContent: "center",
    alignContent: "center",
  },

});
export default React.forwardRef(LoadingLayer)
