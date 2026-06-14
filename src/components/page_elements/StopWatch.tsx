import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import formatTime from 'minutes-seconds-milliseconds';
import { wp } from 'utils/dimension';

export class StopWatch extends Component<any, any> {
    private interval: any;
    constructor(props: any) {
        super(props);

        this.state = {
            timeElapsed: null,
            running: false,
            startTime: null,
            laps: []
        };
        this.props.timer.start = this.handleStart.bind(this);
        this.props.timer.stop = this.handleStop.bind(this);
        this.props.timer.clear = this.clear.bind(this);
    }
    clear = () => {
        this.setState({ timeElapsed: 0 })
    }
    handleStart() {


        this.setState({ startTime: new Date() });

        this.interval = setInterval(() => {
            this.setState({
                timeElapsed: new Date() - this.state.startTime,
                running: true
            });

        }, 30);
    }

    handleStop() {

        if (this.props.onFinish) {
            this.props.onFinish(this.state.timeElapsed)
        }

        clearInterval(this.interval);
        this.setState({ running: false });
        return;
    }




    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.timerWrapper}>
                        <Text style={styles.timer}>
                            {formatTime(this.state.timeElapsed)}
                        </Text>
                    </View>

                </View>


            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        alignItems: 'stretch'
    },
    header: {
        flex: 1
    },
    footer: {
        flex: 1
    },
    timerWrapper: {
        flex: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    timer: {
        fontSize: wp(20),
        color:"black"
    },
    buttonWrapper: {
        flex: 3,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 20
    },
    button: {
        borderWidth: 2,
        height: 100,
        width: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    startButton: {
        borderColor: '#00CC00'
    },
    stopButton: {
        borderColor: '#CC0000'
    },
    lap: {
        justifyContent: 'space-around',
        flexDirection: 'row'
    },
    lapText: {
        fontSize: 30
    }
});

export default StopWatch;