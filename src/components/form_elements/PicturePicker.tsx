import React from 'react';

import { StyleSheet, PermissionsAndroid, TouchableOpacity,FlatList, Image, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
import { FastImage, InputBox, Modal, Text, View } from 'components';
import { hp, wp } from 'utils/dimension';
import { generateUUID } from 'utils/utils';
import RNFetchBlob from 'rn-fetch-blob';
import moment from 'moment-timezone';
import { openPicker } from '@baronha/react-native-multiple-image-picker';
const { config, fs } = RNFetchBlob;
export interface IPicturePickerProps {
    onChange?: ((items: any, status?: any) => void),
    items: any[]
    mode?: "grid" | "list",
    disabled?: boolean,
    infoPhoto?: any
    infoPhotoName?: any
}
export class PicturePicker extends React.Component<IPicturePickerProps>  {

    constructor(props: any) {
        super(props);
        this.state.items = this.props.items || [];
        this.state.items.map(x => {
            if (x.id) {
                x.key = x.id;
            }
        })
    }

    componentDidMount(): void {
        this.state.selectedImageName = this.props.infoPhotoName
    }
    componentDidUpdate(): void {
        if (this.state.items != this.props.items && this.props.items) {
            var items = this.props.items;
            items.map(x => {
                if (x.id) {
                    x.key = x.id;
                }
            })
            this.setState({ items })
        }
        if (this.state.infoPhotoName != this.props.infoPhotoName) {
            this.state.infoPhotoName = this.props.infoPhotoName;
            this.setState({ selectedImageName: this.props.infoPhotoName })
        }
        if (this.props.infoPhotoName && !this.state.selectedImageName) {
            this.state.selectedImageName = this.props.infoPhotoName;
        }
    }
    state = {
        pictureList: [] as any,
        inspectItem: null as any,
        itemsList: [] as any,
        selectedPicture: null as any,
        takePictureModal: false,
        selectedImageName: this.props.infoPhotoName || "",
        infoPhotoName: this.props.infoPhotoName,
        items: this.props.items || [] as any
    }

    camera = async () => {
        let options = {
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            saveToPhotos: true
        } as any;
        if (Platform.OS === 'ios') {
              options={
                saveToPhotos: true,
                mediaType: 'mixed',
                includeExtra:true,
                presentationStyle: 'fullScreen',
              }
        };
        var permission = await this.givePermission();
        if (permission) {
            const result = await launchCamera(options);
            if (result.assets && result.assets[0]) [
                this.setState({ selectedPicture: result.assets[0] })
            ]
        }


    }

    givePermission = async () => {
        if(Platform.OS=="ios"){
            return true;
        }
        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) {

            return true;
        }
        return false;
    }

    imageLibrary = async () => {
        let options = {
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            doneTitle:"Tamam",
            cancelTitle:"İptal",
            selectMessage:"Seçiniz",
            emptyMessage:"aaa",
            mediaType:"image",
            messageTitleButton:"asdasd",
            usedCameraButton:false,
            maxSelectedAssets:10,
            usedPrefetch:false,
            isPreview:false
        } as any;
        const response = await openPicker(options);
        var images = [] as any;
        response.map((x:any) => {
            images.push({uri:`file://${x.realPath || x.path}`})
        })
        this.selectImageMultitiple(images);
     
    }

    deletePicture = async (item: any) => {
        this.state.items = this.state.items.filter(x => x.guidId != item.guidId)
        this.setState({})
        if (this.props.onChange) {
            this.props.onChange(this.state.items, true);
        }
    }
    givePermissionStorage = async () => {
        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) {

            return true;
        }
        return false;
    }

    download = async (item: any) => {
        var permission = await this.givePermissionStorage();
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

    inspect = async (item: any) => {
        this.setState({ inspectItem: item.info ?item.infoPic:item, takePictureModal: true })
    }
    renderItem = (data: any) => {
        var { item } = data;
        if (this.props.mode == "list") {
            return <View style={{}}>
                <TouchableOpacity onPress={() => { this.inspect(item) }} key={item.id + "_view"} style={{
                    height: wp(120),
                    width: wp(78),
                    borderColor: "#39464E50",
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderRadius: wp(5),
                }}>
                    <Text style={styles.itemname}>{item.name}</Text>
                    <FastImage
                        style={{ width: "100%", height: "75%" }}
                        source={{ uri: item.filePath ? item.filePath : item.image ? item.image.uri : item.file.uri }}
                        resizeMode={FastImage.resizeMode.cover}
                    >
                        <TouchableOpacity style={styles.deletepic} onPress={() => { this.deletePicture(item) }}>
                            <FastImage
                                style={{ width: wp(15), height: wp(15) }}
                                source={require('../../images/botas/delete.png')}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        </TouchableOpacity>

                        {
                            item.id != 0 ? <TouchableOpacity style={styles.download} onPress={() => { this.download(item) }}>
                                <FastImage
                                    style={{ width: wp(15), height: wp(15) }}
                                    source={require('../../images/botas/download.png')}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                            </TouchableOpacity> : null
                        }

                    </FastImage>

                </TouchableOpacity>
            </View>
        } else {
            return <View style={{ padding: wp(5), marginTop: hp(10), height: wp(200) }}>
                <TouchableOpacity onPress={() => { this.inspect(item) }} key={item.id + "_view"} style={{
                    height: wp(150),
                    width: wp(150),
                    borderColor: "#39464E50",
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderRadius: wp(5),
                }}>
                    <Text style={styles.itemname}>{item.name}</Text>
                    <FastImage
                        style={{ width: "100%", height: "75%" }}
                        source={{ uri: item.filePath ? item.filePath : item.image ? item.image.uri : item.file.uri }}
                        resizeMode={FastImage.resizeMode.cover}
                    >
                        <TouchableOpacity style={styles.deletepic} onPress={() => { this.deletePicture(item) }}>
                            <FastImage
                                style={{ width: wp(15), height: wp(15) }}
                                source={require('../../images/botas/delete.png')}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        </TouchableOpacity>
                        {
                            item.id != 0 ? <TouchableOpacity style={styles.download} onPress={() => { this.download(item) }}>
                                <FastImage
                                    style={{ width: wp(15), height: wp(15) }}
                                    source={require('../../images/botas/download.png')}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                            </TouchableOpacity> : null
                        }
                    </FastImage>

                </TouchableOpacity>
            </View>
        }

    }

    selectImage = () => {
        var pictureList = this.state.pictureList;

        var lst = this.state.itemsList;

        var uri = Platform.OS === 'android' ? this.state.selectedPicture.uri : this.state.selectedPicture.uri.replace('file://', '');

        var key = generateUUID();
        var file = {
            key: key,
            guidId: key,
            imageFile: {
                uri: uri,
                type: 'image/jpeg',
                name: this.state.selectedImageName + '.jpg',
            },
            customName: this.state.selectedImageName,
            filePath: uri,
            fileName: this.state.selectedImageName + '.jpg',
        }
        if (this.props.onChange) {
            this.props.onChange(file);
        }
        this.setState({ takePictureModal: false, pictureList, selectedPicture: null, selectedImageName: "", itemsList: lst })
    }
    selectImageMultitiple = (images:any) => {
        var pictureList = this.state.pictureList;

        var lst = this.state.itemsList;
        images.map((x:any)=>{
            var uri = Platform.OS === 'android' ? x.uri : x.uri.replace('file://', '');

            var key = generateUUID();
            var file = {
                key: key,
                guidId: key,
                imageFile: {
                    uri: uri,
                    type: 'image/jpeg',
                    name: this.state.selectedImageName + '.jpg',
                },
                customName: this.state.selectedImageName,
                filePath: uri,
                fileName: this.state.selectedImageName + '.jpg',
            };  
            if (this.props.onChange) {
                this.props.onChange(file);
            }
            lst.push(file)
        })
       
       
        this.setState({ takePictureModal: false, pictureList, selectedPicture: null, selectedImageName: "", itemsList: lst })
    }
    
    render() {
        const { takePictureModal, selectedPicture, selectedImageName, pictureList } = this.state;
        return (
            <View style={styles.btnParentSection}>
                {
                    this.props.disabled ?
                        null
                        : <>



                            <TouchableOpacity style={styles.takeapic} onPress={() => { this.setState({ takePictureModal: true }) }}>
                                <FastImage
                                    style={{ width: wp(40), height: wp(40) }}
                                    source={require('../../images/botas/take-photo.webp')}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                            </TouchableOpacity>

                            {
                                this.props.infoPhoto ?
                                    <TouchableOpacity style={styles.infopic} onPress={() => { this.inspect({ imageFile: {}, infoPic: this.props.infoPhoto,info:true }) }}>
                                        <FastImage
                                            style={{ width: wp(18), height: wp(18) }}
                                            source={require('../../images/botas/info.webp')}
                                            resizeMode={FastImage.resizeMode.contain}
                                        />
                                    </TouchableOpacity> : null
                            }
                            {
                                this.state.inspectItem ?
                                    <Modal type={"image"} selectedPicture={selectedPicture} description={selectedImageName}
                                        title=""
                                        onOk={() => { }}
                                        onCancel={() => { this.setState({ takePictureModal: false, inspectItem: null }) }}
                                        visible={takePictureModal}>
                                        <View flexNone style={{ alignItems: "center", height: "80%", width: "100%", paddingTop: hp(50) }}>
                                            <Text style={{ fontSize: hp(16), color: "#004F58", fontFamily: "Narin-Bold", textAlign: "center" }}>{this.state.inspectItem.name}</Text>

                                            <ReactNativeZoomableView
                                                style={{ width: wp(360), height: wp(360), marginTop: hp(20) }}
                                                maxZoom={30}
                                                minZoom={1}
                                                contentWidth={300}
                                                contentHeight={150}
                                                bindToBorders={true}
                                            >
                                                <Image
                                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                                    source={this.state.inspectItem && this.state.inspectItem.url ? { uri: this.state.inspectItem.url } : this.state.inspectItem.imageFile && this.state.inspectItem.imageFile.uri ? { uri: this.state.inspectItem.imageFile.uri } : this.state.inspectItem.infoPic &&this.state.inspectItem.infoPic.url?this.state.inspectItem.infoPic.url:this.state.inspectItem.infoPic}
                                                />
                                            </ReactNativeZoomableView>
                                        </View>
                                    </Modal> :
                                    <Modal infoPhoto={this.props.infoPhoto ? true : false} type={"image"} selectedPicture={selectedPicture}
                                     description={selectedImageName} title="" onOk={() => { this.selectImage() }} onCancel={() => { this.setState({ takePictureModal: false, selectedPicture: null }) }} visible={takePictureModal}>
                                        <View flexNone style={{ flexDirection: "row", height: "50%", width: "100%", paddingTop: hp(50) }}>

                                            {!selectedPicture ? <>
                                                <TouchableOpacity onPress={this.camera} style={styles.btnSection}  >

                                                    <FastImage
                                                        style={{ width: wp(50), height: wp(50) }}
                                                        source={require('../../images/botas/take-photo.webp')}
                                                        resizeMode={FastImage.resizeMode.contain}
                                                    />
                                                    <Text style={styles.btnText}>Fotoğraf Çek</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity onPress={this.imageLibrary} style={styles.btnSection}  >
                                                    <FastImage
                                                        style={{ width: wp(50), height: wp(50) }}
                                                        source={require('../../images/botas/selectgalery.webp')}
                                                        resizeMode={FastImage.resizeMode.contain}
                                                    />
                                                    <Text style={styles.btnText}>Galeriden Seç</Text>
                                                </TouchableOpacity>
                                            </>
                                                : <View key={selectedPicture ? selectedPicture.uri : null} style={styles.imageContainer}>
                                                    {
                                                        this.props.infoPhoto ? <InputBox label={"Resim Açıklaması"} disabled onChangeText={(text) => { this.setState({ selectedImageName: text }) }} value={this.props.infoPhotoName} />
                                                            : <InputBox label={"Resim Açıklaması"} onChangeText={(text) => { this.setState({ selectedImageName: text }) }} value={this.props.infoPhotoName} />
                                                    }


                                                    <FastImage
                                                        style={{ width: wp(350), height: wp(350), marginTop: hp(20) }}
                                                        source={{ uri: selectedPicture ? selectedPicture.uri : null }}
                                                        resizeMode={FastImage.resizeMode.contain}
                                                    />

                                                </View>}
                                        </View>

                                    </Modal>
                            }


                        </>
                }
                <View flexNone style={{ width: "100%", marginTop: wp(10) }}>
                    <FlatList
                        scrollEnabled
                        horizontal
                        data={[...this.state.items, ...pictureList]}
                        renderItem={this.renderItem}
                        keyExtractor={item => item.guidId}
                    />
                    <View flexNone style={{ flexDirection: "row", height: hp(30), justifyContent: "space-between" }}>
                        <Text style={{ alignSelf: "center" }}> Kayıt Sayısı : {[...this.state.items, ...pictureList].length}</Text>
                        {
                            [...this.state.items, ...pictureList].length > 2 ?
                                <FastImage
                                    style={{ width: wp(25), height: wp(25) }}
                                    source={require('../../images/botas/forward.png')}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                                : null
                        }
                    </View>

                </View>


            </View>

        );
    }
}

const styles = StyleSheet.create({
    btnParentSection: {
        alignItems: 'flex-start',
    },
    btnSection: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        marginBottom: 10,
        borderColor: "#39464E50",
        borderWidth: 1,
        borderStyle: "dashed",
        flex: 1,
        margin: 10
    },
    btnText: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 14,
        fontWeight: 'bold'
    },
    itemname: {
        fontSize: hp(16),
        color: "#004F58",
        fontFamily: "Narin-Medium",
        textAlign: "center"
    },
    takeapic: {
        backgroundColor: "#FFF",
        height: wp(40),
        width: "100%",
        borderRadius: 5,
        borderColor: "#39464E50",
        borderWidth: 1,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center"
    }
    ,
    deletepic: {
        backgroundColor: "#fff",
        height: wp(20),
        width: wp(20),
        borderColor: "#39464E50",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 3

    },
    inspect: {
        backgroundColor: "#fff",
        height: wp(20),
        width: wp(20),
        borderColor: "#39464E50",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: wp(25),
        left: 0,
        zIndex: 3

    },
    download: {
        backgroundColor: "#fff",
        height: wp(20),
        width: wp(20),
        borderColor: "#39464E50",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 3
    },
    imageContainer: {
        alignItems: 'center',
    },
    image: {
        width: wp(280),
        height: 200,
    },
    infopic: {
        height: wp(40),
        width: wp(40),
        borderRadius: 5,
        borderColor: "#39464E50",
        justifyContent: "center",
        alignItems: "flex-end",
        position: "absolute",
        top: 0,
        right: wp(45)
    }, container: {
        backgroundColor: 'black',
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
    },
});