import React from 'react';
import { Text } from 'react-native';



export interface IBerTextProps {
    children?: any;
    style?: any;
    numberOfLines?: any;
    adjustsFontSizeToFit?:any
}


export class BerText extends React.Component<IBerTextProps>  {

    // private scrollRef = React.createRef<HTMLDivElement>();
    constructor(props: IBerTextProps) {
        super(props);
    }

    render() {
        return (
            <Text {...this.props} >
                {this.props.children}
            </Text>

        );
    }
}

