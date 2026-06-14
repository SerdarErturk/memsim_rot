import React, { LegacyRef, useRef, useState } from 'react';

import { Dimensions, Linking, PermissionsAndroid, Platform, StyleSheet, ToastAndroid } from 'react-native';

import { View } from 'components';
import MapView, { MAP_TYPES, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import appConfig from 'config/appConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import mainMarker from '../../images/main-marker.webp';
import FastImage from 'react-native-fast-image';
import { hp, wp } from 'utils/dimension';
import { hasLocationPermission } from 'utils/utility';
export interface IMapProps {
    onChange?: ((value: any) => void),
}
export class MapModal extends React.Component<IMapProps>  {
    private map = null;

    constructor(props: any) {
        super(props)
    }

    componentDidMount(): void {
        this.currentLocation();
    }
    state = {
        region: {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
        } as any,
        marker: {
            latitude: 37.78825,
            longitude: -122.4324,
        } as any
    }

    currentLocation = async () => {
        const hasPermission = await hasLocationPermission();
        if (!hasPermission) {
            return;
        }
        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    region: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    }
                });
                this.setState({marker: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }})

            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }
    render() {
        return (
            <View style={styles.container}>
                <MapView
                    //    provider={PROVIDER_GOOGLE}
                    ref={this.map}
                    userInterfaceStyle={'dark'}
                    style={styles.map}
                    initialRegion={this.state.region}
                    region={this.state.region}
                    onPress={(e) => {
                        if (e.nativeEvent.coordinate) {
                            this.setState({marker:e.nativeEvent.coordinate})
                        }
                        if(this.props.onChange){
                            this.props.onChange(e.nativeEvent.coordinate)
                        }
                    }}
                    onRegionChangeComplete={(region) => { this.setState(region) }}

                >
                    <Marker.Animated
                        title=""
                        key="main-marker"
                        coordinate={this.state.marker}
                    >
                        <FastImage resizeMode={FastImage.resizeMode.contain} source={mainMarker} style={{ width: wp(80), height: wp(80) }}>

                        </FastImage>
                    </Marker.Animated>
                </MapView>
            </View>

        );
    }
}

let { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 2,
        borderRadius: 10
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        width: width - wp(20),
        height: height - hp(10),

        position: 'absolute', top: hp(20), right: 0, bottom: 0, left: 0
    },
});