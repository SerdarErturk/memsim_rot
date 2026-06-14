
import { View } from 'components';
import React, { useState } from 'react';
import { Text } from 'react-native';
import { FastImage } from 'components';
import { hp, wp } from 'utils/dimension';
import { deviceInfo } from '../utils/utils';
import ErrorLogStore from './stores/errorLogStore'
export default class ErrorBoundary extends React.Component {
    errorLogStore;
    constructor(props) {
        super(props);
        this.state = { hasError: false };
        this.errorLogStore = new ErrorLogStore();
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service

        this.logError(error, errorInfo)
    }
    logError = async (error, errorInfo) => {

        var device = await deviceInfo();
        var model = {
            deviceInfo: JSON.stringify(device),
            error: error.toString() + "\n Detail" + errorInfo.componentStack.toString()
        }
        await this.errorLogStore.addErrorLog(model);
    }
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <View style={{ justifyContent: "center", alignItems: "center" }}>

                <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../images/error.webp')}
                    style={{ width: wp(200), height: wp(200) }}>

                </FastImage>
                <Text style={{ fontSize: wp(20), textAlign: "center" }}>
                    Sistemde bir hata oluştu. Hata kayıtlarınız ekibimize aktarılmıştır. En kısa sürede çözümü sağlanacaktır.

                </Text>
            </View>
        }

        return this.props.children;
    }
}