import React from 'react';

import { StyleSheet, PermissionsAndroid, TouchableOpacity, Image, FlatList, TextInput } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { FastImage, InputBox, Modal, Text, View } from 'components';
import { hp, wp } from 'utils/dimension';
import { generateUUID } from 'utils/utils';

export interface ICommentBoxProps {
    onChange?: ((items: any) => void),
    items: any[]
}
export class CommentBox extends React.Component<ICommentBoxProps>  {


    constructor(props: any) {
        super(props);
        this.state.items = this.props.items || [];
    }

    componentDidMount(): void {

    }
    componentDidUpdate(): void {
        if (this.state.items != this.props.items && this.props.items) {
            this.state.items = this.props.items
            this.setState({})
        }
    }
    state = {
        commentList: [] as any,
        itemsList: [] as any,
        selectedPicture: null as any,
        takeCommentModal: false,
        newComment: "",
        items: this.props.items || [] as any
    }

    deleteComment = async (id:any) => {
        var commentList = this.state.commentList.filter((x:any)=>x.id!=id)
        this.setState({commentList:commentList})
    }
    
    renderItem = (data: any) => {
        var { item } = data;
        return <View style={{ padding: wp(5), marginTop: hp(5),backgroundColor:"white"}}>
            <View flexNone key={item.id + "_view"} style={{
                height: wp(130),
                padding:wp(6),
                width: "100%",
                borderColor: "#39464E50",
                borderRadius: wp(35),
            }}>
                <View style={{flex:1}}>
                    <Text style={styles.header}>{"BAba"}</Text>
                </View>
                <View style={{flex:3 }}>
                    <TextInput multiline={true} style={{ flex:1,backgroundColor: "#f3f3f3", paddingLeft:hp(12) }}>{item.description}</TextInput>
                    {
                        item.new?  <TouchableOpacity style={styles.delete} onPress={()=> this.deleteComment(item.id)}>
                        <FastImage
                            style={{ width: wp(20), height: wp(20) }}
                            source={require('../../images/botas/deleted.webp')}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </TouchableOpacity>:null
                    }
               
                </View>
            </View>
        </View>

    }

    addNewComment = () => {
        var commentList = this.state.commentList;
        commentList.push({
            id: generateUUID(),
            description: this.state.newComment,
            new:true
        })
        this.setState({ takeCommentModal: false, commentList, selectedPicture: null, newComment: "" })
    }
    render() {
        const { takeCommentModal, selectedPicture, newComment, commentList } = this.state;
        return (
            <View style={styles.btnParentSection}>
                <View flexNone style={{ width: "100%",marginTop:hp(45)}}>
                    <FlatList
                        data={[...this.state.items, ...commentList]}
                        numColumns={1}
                        renderItem={this.renderItem}
                        keyExtractor={item => item.id}
                    />

                </View>
                <TouchableOpacity style={styles.takeacomment} onPress={() => { this.setState({ takeCommentModal: true }) }}>
                    <FastImage
                        style={{ width: wp(20), height: wp(20) }}
                        source={require('../../images/botas/take-photo.webp')}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                </TouchableOpacity>
                <Modal title="" onOk={() => { this.addNewComment() }} onCancel={() => { this.setState({ takeCommentModal: false }) }} visible={takeCommentModal}>
                    <View flexNone style={{ flexDirection: "row", height: "50%", width: "100%", paddingTop: hp(50) }}>
                          <View>
                                <InputBox label={"Açıklama"} multiline
                                onChangeText={(text) => { this.setState({ newComment: text }) }} 
                                value={newComment} />
                            </View>
                    </View>

                </Modal>

            </View>

        );
    }
}

const styles = StyleSheet.create({
    btnParentSection: {
        alignItems: 'flex-start',
        marginTop: 10,
        backgroundColor: "white"
    },
    takeacomment: {
        backgroundColor: "#FFF",
        height: wp(40),
        width: wp(40),
        borderRadius: 5,
        borderColor: "#39464E50",
        borderWidth: 1,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        right: 0
    },
    header:{
        flex:1,
        fontSize:hp(20),
        paddingLeft:hp(12),
        color: "#fff",
        fontFamily: "Narin-Bold",
        backgroundColor: "#39464E"
    },
    delete: {
        height: wp(40),
        width: wp(40),
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        right: 0
    }
});