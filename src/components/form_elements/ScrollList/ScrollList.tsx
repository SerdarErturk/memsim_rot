

import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import LoadingLayer from "../../page_elements/LoadingLayer";
import ScrollListStore from "./store/scrollListStore";
import { Text } from "components";
import { wp } from "utils/dimension";
import NetworkUtils from "utils/networkUtills";
import Repository from '../../../localdb/repository';
function ScrollList(props: any, ref: any) {
  const loadingLayer = useRef(null) as any
  const scroolListStore = new ScrollListStore();
  const [loading, setLoading] = useState(false);
  const [emptyContent, setEmptyContent] = useState(false);
  const [pageIndex, setPageIndex] = useState(props.pageIndex);
  const [items, setItems] = useState(props.items || []);
  const [filter, setQueryFilter] = useState(props.filter || []);
  const [maxCount, setMaxCount] = useState(1000);
  const flatList = useRef(null);
  let componentMounted = true; // (3) component is mounted
  useEffect(() => {
    if (componentMounted) { // (5) is component still mounted?
      if (props.databound) {
        firstLoading();
      }
    }
    return () => { // This code runs when component is unmounted
      componentMounted = false; // (4) set it to false if we leave the page
    }
  }, [])


  useImperativeHandle(ref, () => ({
    refresh, setFilter, handleLoadMore, firstLoading
  }));

  const setFilter = (filter?: any) => {
    setQueryFilter(filter)
    handleLoadMore(filter)
  }
  const handleLoadMore = async (functionFilter?: any) => {

    if (loading) {
      return;
    }
    if (!functionFilter) {

      if (items.length >= maxCount) {
        return;
      }
    }
    setLoading(true);
    var model = {
      pageSize: props.pageSize || 10,
      pageIndex: functionFilter ? 1 : pageIndex,
      filter: functionFilter ? functionFilter : filter || [],
      extraParams: props.extraParams || {}
    };
    if (props.onlyOffline) {
      return;
    }
    var result = await scroolListStore.loadData(props.endpoint, model)

    if (functionFilter) {
      setItems(result.listDto)
      if (props.onGetCount) {
        props.onGetCount(result.totalCount, pageIndex)
      }
      setMaxCount(1000)
      setPageIndex(2)
    } else {
      let newItem = items;
      newItem = [...newItem, ...result.listDto]
      setItems(newItem)
      if (props.onGetCount) {
        props.onGetCount(result.totalCount, pageIndex + 1)
      }
      setMaxCount(result.totalCount)
      setPageIndex(pageIndex + 1)
    }

    setLoading(false)

  }
  const refresh = (data: any) => {
    setItems(data)
  }
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color={props.loadingColor ? props.loadingColor : "white"} />
      </View>
    );
  }

  const firstLoading = async (extraParams?: any) => {

    if (props.showLoading) {
      if (loadingLayer.current) {

        loadingLayer.current.fadeIn();
      }
    }
    setEmptyContent(false);
    var result = {} as any

    if (props.sqlLiteTable) {
      var service = new Repository()
      let lst = await service.select(props.sqlLiteTable, null, null) as any;
      lst = lst.filter(t => t.gunTypeId == props.endpoint)
      lst.sort((a: any, b: any) => (a.dbId < b.dbId) && a.dbId != null && b.dbId != null ? 1 : -1)
      result = {
        listDto: lst,
        totalCount: lst.length
      }
    }



    if (result.listDto.length == 0) {
      setEmptyContent(true)
    }
    setItems(result.listDto)
    if (props.onGetCount) {
      props.onGetCount(result.totalCount, 2)
    }
    setMaxCount(result.totalCount)
    setPageIndex(2)
    if (loadingLayer.current) {
      loadingLayer.current.fadeOut();
    }
  }




  return (
    <View ref={flatList} >
      <LoadingLayer backgorundColor="transparent" ref={loadingLayer} > </LoadingLayer>
      {emptyContent ?
        <View style={{ height: "100%", width: "100%", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: wp(20), fontWeigth: "bold", color: "black" }}> Herhangi Bir Kayıt Bulunamadı</Text>
          {/* <FastImage source={require('../../../assets/images/nodata.webp')} style={{ width: wp(200), height: wp(200) }}>

          </FastImage> */}
        </View>
        :
        <FlatList
          scrollEnabled={props.scrollEnabled}
          style={{ ...props.style, zIndex: 1 }}
          numColumns={props.numColumns || 1}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
          // refreshControl={
          //   <RefreshControl
          //     refreshing={isRefreshing}
          //     onRefresh={onRefresh}
          //   />
          // }
          initialNumToRender={10}
          data={items}
          keyExtractor={item => item.guidId.toString()}
          renderItem={props.renderItem}
          ListFooterComponent={renderFooter}
          onEndReached={({ distanceFromEnd }) => {
            if (props.onlyOffline) {
              return;
            }
            if (distanceFromEnd < 0) return;
            if (props.endpoint) {
              handleLoadMore();

            }
          }}
        />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});

export default React.forwardRef(ScrollList)