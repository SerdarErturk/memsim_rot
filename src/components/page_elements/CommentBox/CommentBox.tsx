import React from 'react';
import { StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Text } from '@ui-kitten/components';
import { hp, wp } from 'utils/dimension';
import { LoadingLayer, View } from 'components';
import CommentStore from './commentStore/CommentStore';
import FastImage from 'react-native-fast-image';
import moment from 'moment-timezone';


export interface ICommentBoxProps {
    pk: string;
}

export class CommentBox extends React.Component<ICommentBoxProps>  {
    private commentStore: CommentStore
    private loadingLayer = React.createRef() as any;
    constructor(props: ICommentBoxProps) {
        super(props);
        this.commentStore = new CommentStore();
    }
    state = {
        commentData: [] as any,
        text: "" as any
    }
    componentDidMount() {
        this.loadComment();
    }
    componentDidUpdate(prevProps: any) {

    }

    loadComment = async () => {
        var commentData = await this.commentStore.getCommentData(this.props.pk);
        this.setState({ commentData })
    }
    sendComment = async (item: any) => {
        const { text } = this.state;
        if (text && text.trim() != "") {
            if (this.loadingLayer && this.loadingLayer.current) {
                this.loadingLayer.current.fadeIn()
            }
            var model = {
                explanation: text,
                sourceGuidId: this.props.pk
            } as any
            if (item) {
                model.parentItemId = item.id
            }
            await this.commentStore.addComment(model);
            this.setState({ text: "" });
            await this.loadComment();
            if (this.loadingLayer && this.loadingLayer.current) {
                this.loadingLayer.current.fadeOut()
            }
        }
    }

    replyItems = (item: any) => {
        this.state.commentData.map((x: any) => {
            x.reply = false
        })
        var findData = this.state.commentData.find((t: any) => t.id == item.id);
        if (findData) {
            findData.reply = true;
        }
        this.setState({ commentData: [...this.state.commentData], text: "" })
    }
    showReplies = (item: any) => {
        var findData = this.state.commentData.find((t: any) => t.id == item.id);
        if (findData) {
            findData.showReplies = !findData.showReplies;
        }
        this.setState({ commentData: [...this.state.commentData], text: "" })
    }
    renderItem = (data: any) => {
        var { item } = data;
        const { text } = this.state;
        return <View style={{
            padding: wp(10), marginTop: hp(5),
            backgroundColor: "#FFF",
            borderRadius: wp(5)
        }}>
            <View flexNone key={item.id + "_view"} style={{
                width: "100%",
                borderRadius: wp(35),
            }}>

                <View style={{ flex: 3, flexDirection: "row" }}>
                    <View center style={{}}>
                        {item.replies && item.replies.length > 0 ? <TouchableOpacity style={{ borderWidth: 1 }} onPress={() => { this.showReplies(item) }} >
                            <Text>
                                +{item.replies.length}
                            </Text>
                        </TouchableOpacity> : null}

                    </View>
                    <View style={{ flex: 8 }}>
                        <View center style={{ flexDirection: "row" }}>
                            <View center style={{ justifyContent: "flex-start", flexDirection: "row" }}>

                                <FastImage source={{ uri: item.avatarUrl }}
                                    style={{
                                        width: wp(25), height: wp(25),
                                        backgroundColor: "white", borderRadius: wp(50), borderWidth: 1
                                    }}>
                                </FastImage>
                                <Text style={styles.username}>{item.fullName} </Text>
                                <Text style={styles.date}> {moment(item.commentDate).format("DD.MM.YYYY HH:mm")} </Text>

                            </View>
                            <View style={{ justifyContent: "flex-end", alignItems: "flex-end" }}>
                                <TouchableOpacity onPress={() => {
                                    this.replyItems(item)
                                }}>


                                    <Text style={styles.username}>
                                        Cevapla   <FastImage resizeMode={FastImage.resizeMode.contain} source={require('../../../images/reply.webp')}
                                            style={{ width: wp(12), height: wp(12), backgroundColor: "white" }}>

                                        </FastImage>

                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                        <View>
                            <View style={{ justifyContent: "flex-start", alignItems: "flex-start", paddingTop: hp(10) }}>

                                <Text style={styles.message}> {item.text} </Text>


                            </View>
                        </View>
                    </View>



                </View>
                {item.reply ? <View flexNone style={{ flexDirection: "row", height: hp(80), backgroundColor: "#FFF", padding: wp(10), borderRadius: wp(10) }}>

                    <View style={{ flex: 6 }}>
                        <TextInput
                            editable
                            multiline
                            numberOfLines={4}
                            maxLength={40}
                            placeholder="Yorum Ekle"
                            onChangeText={text => {
                                this.setState({ text })
                            }}
                            value={text}
                            style={styles.input}
                        >

                        </TextInput>
                    </View>
                    <View center style={{ paddingLeft: 1, paddingRight: 1 }}>
                        <TouchableOpacity style={{ justifyContent: "center", alignItems: "center" }} onPress={() => {
                            this.sendComment(item)
                        }}>
                            <Text style={styles.sendText}> Gönder</Text>
                        </TouchableOpacity>
                    </View>
                </View> : null}
                {item.showReplies ?
                    item.replies.map((x: any) =>
                        <View key={x.guidId} style={{ paddingLeft: wp(70), marginTop: hp(10) }}>
                            <View center style={{ flexDirection: "row" }}>
                                <View center style={{ justifyContent: "flex-start", flexDirection: "row" }}>

                                    <FastImage source={{ uri: x.avatarUrl }}
                                        style={{
                                            width: wp(25), height: wp(25),
                                            backgroundColor: "white", borderRadius: wp(50), borderWidth: 1
                                        }}>
                                    </FastImage>
                                    <Text style={styles.username}>{item.fullName} </Text>
                                    <Text style={styles.date}> {moment(x.commentDate).format("DD.MM.YYYY HH:mm")} </Text>

                                </View>

                            </View>
                            <View>
                                <View style={{ justifyContent: "flex-start", alignItems: "flex-start", paddingTop: hp(10) }}>

                                    <Text style={styles.message}> {x.text} </Text>


                                </View>
                            </View>
                        </View>)

                    : null}
            </View>
        </View>

    }
    render() {
        const { commentData, text } = this.state;
        return (
            <>
                <LoadingLayer ref={this.loadingLayer}></LoadingLayer>
                <View >
                    <View  style={{paddingBottom:hp(10)}}>


                        <FlatList
                            data={commentData}
                            numColumns={1}
                            renderItem={this.renderItem}
                            keyExtractor={item => item.id}
                        />
                    </View>
                    <View flexNone style={{ flexDirection: "row", height: hp(80), backgroundColor: "#FFF", padding: wp(10), borderRadius: wp(10) }}>

                        <View style={{ flex: 6 }}>
                            <TextInput
                                editable
                                multiline
                                numberOfLines={4}
                                maxLength={40}
                                placeholder="Yorum Ekle"
                                onChangeText={text => {
                                    this.setState({ text })
                                }}
                                value={text}
                                style={styles.input}
                            >

                            </TextInput>
                        </View>
                        <View center style={{ paddingLeft: 1, paddingRight: 1 }}>
                            <TouchableOpacity style={{ justifyContent: "center", alignItems: "center" }} onPress={this.sendComment}>
                                <Text style={styles.sendText}> Gönder</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </>
        );
    }
}

const styles = StyleSheet.create({
    username: {
        color: "#39464E",
        fontSize: hp(12),
        fontFamily: "Narin-Bold",
        marginLeft: wp(4)
    },
    date: {
        color: "#39464E",
        fontSize: hp(12),
        fontFamily: "Narin-Medium"
    },
    message: {
        color: "#00000060",
        fontSize: hp(12),
        fontFamily: "Narin-Medium",
        textAlign: "left"
    },
    input: {
        color: "#00000060",
        fontSize: hp(12),
        fontFamily: "Narin-Medium",
        borderWidth: 1,
        borderColor: "#00000060",
        borderRadius: wp(10)
    },
    sendText: {
        fontSize: hp(14),
        fontFamily: "Narin-Bold",
        textDecorationLine: "underline"
    }
});