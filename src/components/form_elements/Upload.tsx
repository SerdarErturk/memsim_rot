import React, { useEffect, useState,useRef } from 'react';
import { Text, TouchableOpacity,FlatList} from 'react-native';
import FastImage from 'react-native-fast-image';
import { hp, wp } from 'utils/dimension';
import { generateUUID} from 'utils/utils';
import DocumentPicker from 'react-native-document-picker'
import { useFocusEffect } from '@react-navigation/native';
import { ScrollList, View } from 'components';
import { PermissionsAndroid } from 'react-native';
import moment from 'moment-timezone';
import RNFetchBlob from 'rn-fetch-blob';
const { config, fs } = RNFetchBlob;



export interface IUploadProps {
    children?: any;
    style?: any;
    adjustsFontSizeToFit?: any
    list?: any;
    onChange: (item: any,status:any) => void;
}


export const Upload = (props: IUploadProps) => {
  const flatList = useRef(null);
  const [list, setList] = useState([] as any)
        useEffect(() => {
            if (props.list != list) {
                setList(props.list)
            }
          }, []);
    const handleDocumentSelection = async () => {
            const response = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
            }) as any;
            let item =response[0]
            item.guidId=generateUUID();
            props.onChange(item,"add")
    };
    const download = async (item: any) => {
        var permission = await givePermissionStorage();
        if (permission) { 
        let PictureDir = fs.dirs.PictureDir;
        let options = {
            fileCache: true,
            addAndroidDownloads: {
                //Related to the Android only
                useDownloadManager: true,
                notification: true,
                path:
                    PictureDir +
                    '/image_' + moment(),
                description: 'Image',
            },
        };
        config(options)
            .fetch('GET', item.filePath)
            .then(res => {
                //Showing alert after successful downloading
                console.log('res -> ', JSON.stringify(res));
            });
        }
    }

    const givePermissionStorage = async () => {
        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        const status2 = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        if (status === PermissionsAndroid.RESULTS.GRANTED && status2 === PermissionsAndroid.RESULTS.GRANTED) {

            return true;
        }
        return false;
    }
    const documentRender = (data: any) => {
        const { item } = data;
        return  <View flexNone style={{ backgroundColor: "#d3d3d3", borderRadius: wp(8), padding: hp(6), margin: wp(2), flexDirection: "row", height: hp(55) }}>
        <Text style={{flex:1}}>{item.documentFile?.name||item.name}</Text>
        {
              item.id ? <TouchableOpacity style={{justifyContent:"center",marginRight:wp(12)}} onPress={() => { download(item) }}>
                                <FastImage
                                    style={{ width: wp(25), height: wp(25) }}
                                    source={require('../../images/botas/download.png')}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                            </TouchableOpacity> : null
                        }
        <TouchableOpacity style={{justifyContent:"center"}} onPress={() => { 
        props.onChange(item,"delete");
      }}>
            <FastImage
                style={{ width: hp(25), height: hp(25) }}
                source={require('../../images/botas/delete.png')}
                resizeMode={FastImage.resizeMode.contain}
            />
        </TouchableOpacity>
    </View>
      };
    return (<>

        <TouchableOpacity style={{
            width: wp(150), height: hp(30),borderWidth:wp(1),marginBottom:hp(2),marginLeft:hp(2),
            zIndex: 10, borderRadius: wp(10), alignItems: "center",
            justifyContent: "center",
            flexDirection: "row"
        }} onPress={() => { handleDocumentSelection() }}>
            <Text style={{ color: "#39464E", fontSize: hp(18), fontFamily: "Narin-Bold" }}>
                Döküman Ekle
            </Text>
            <FastImage
                style={{ width: hp(18), height: hp(18), marginLeft: wp(6) }}
                source={require('../../images/botas/add.webp')}
                resizeMode={FastImage.resizeMode.contain}
            />

        </TouchableOpacity>
        {
            props.list?.length > 0 ?
            <FlatList
            style={props.style?props.style:{maxHeight:"70%",marginTop:hp(4)}}
            data={props.list}
            numColumns={1}
            renderItem={documentRender}
            keyExtractor={(item:any)=> item.guidId}
        />

         
                : null
            //    props.list.map((x:any)=>{
            // <TouchableOpacity style={{
            //     width: hp(90), height: hp(70),backgroundColor:"pink",
            //     zIndex: 10, borderRadius: wp(10), alignItems: "center",
            //      justifyContent: "center",
            //      flexDirection:"row"
            //   }} onPress={() => { handleDocumentSelection() }}>
            //      <Text style={{  color: "#39464E",fontSize: hp(18),fontFamily: "Narin-Bold"}}>
            //      {x.name}
            //     </Text>

            //   </TouchableOpacity>
            //    }) :null
        }

    </>
    );
}


