import React from 'react';
import { ImageBackground } from 'react-native'



export interface IBackgroundImageProps {
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center',
  source: any,
  style?:any,
  children: any;
}


export class BackgroundImage extends React.Component<IBackgroundImageProps>  {

  // private scrollRef = React.createRef<HTMLDivElement>();
  constructor(props: IBackgroundImageProps) {
    super(props);
  }

  render() {
    return (
      <ImageBackground resizeMode="cover" {...this.props} style={{width: '100%', height: '100%',flex:1,...this.props.style}} >
        {this.props.children}
      </ImageBackground>


    );
  }
}

