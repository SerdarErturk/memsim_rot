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
import { wp } from 'utils/dimension';
import { hasLocationPermission } from 'utils/utility';

export interface IMapProps {

}
const customStyle = [
    {
        elementType: 'geometry',
        stylers: [
            {
                color: '#242f3e',
            },
        ],
    },
    {
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#746855',
            },
        ],
    },
    {
        elementType: 'labels.text.stroke',
        stylers: [
            {
                color: '#242f3e',
            },
        ],
    },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#d59563',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#d59563',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
            {
                color: '#263c3f',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#6b9a76',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
            {
                color: '#3D505F',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#212a37',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#9ca5b3',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
            {
                color: '#746855',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#35913E',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#f3d19c',
            },
        ],
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [
            {
                color: '#2f3948',
            },
        ],
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#d59563',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
            {
                color: '#17263c',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#515c6d',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [
            {
                color: '#17263c',
            },
        ],
    },
];
export const Map = (props: IMapProps) => {
    const map: LegacyRef<MapView> = useRef(null);
    const navigation = useNavigation();
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    });
    const [currentMarkerLocation, setCurrentLocation] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    });
    useFocusEffect(
        React.useCallback(() => {
            currentLocation();
        }, []),
    )
 
    const currentLocation = async () => {
        const hasPermission = await hasLocationPermission();
        if (!hasPermission) {
            return;
        }
        Geolocation.getCurrentPosition(
            (position) => {
                setRegion({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                });
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                })
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }
    const watchPosition = async () => {
        const hasPermission = await hasLocationPermission();
        if (!hasPermission) {
            return;
        }
        try {
            const watchId = Geolocation.watchPosition(
                (position) => {





                },
                (error) => {
                    Alert.alert(`Code ${error.code}`, error.message);
                    console.log(error);
                },
                {
                    interval: 500,
                    distanceFilter: 0,
                    forceRequestLocation: true,
                    enableHighAccuracy: true
                },
            );

        } catch (error) {
            Alert.alert('WatchPosition Error', JSON.stringify(error));
        }
    };


    return (
        <View style={styles.container}>
            <MapView
                //    provider={PROVIDER_GOOGLE}
                ref={map}
                userInterfaceStyle={'dark'}
                customMapStyle={customStyle}
                style={styles.map}
                initialRegion={region}
                region={region}
                onRegionChangeComplete={(region) => { setRegion(region) }}

            >
                <Marker.Animated
                    title="main-marker"
                    key="main-marker"
                    coordinate={currentMarkerLocation}
                >
                    <FastImage resizeMode={FastImage.resizeMode.contain} source={mainMarker} style={{ width: wp(80), height: wp(80) }}>

                    </FastImage>
                </Marker.Animated>
            </MapView>
        </View>
    );
};

let { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 2,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,

        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0
    },
});