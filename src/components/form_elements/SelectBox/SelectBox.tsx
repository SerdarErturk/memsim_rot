import React from "react";

import { Select, SelectItem } from '@ui-kitten/components';
import SelectboxModel from "./model/SelectboxModel";
import SelectboxStore from "./store/selectboxStore";
import { Autocomplete, AutocompleteItem, Icon } from '@ui-kitten/components';
import { StyleSheet, TouchableOpacity } from "react-native";
import { hp, wp } from "utils/dimension";
import { Text, View } from "components";
// import { clearAndInsert, getSelectboxDataList, insertSelectboxData } from "localdb/selectboxdata_repository";
import NetworkUtils from "utils/networkUtills";
import FastImage from "react-native-fast-image";
import RNModalPicker from "../SelectPicker/RNModalPicker";

export interface ISelectBoxProps {
  descriptor?: any,
  key_val: any,
  label: any;
  groupNumber?: number,
  ref?: any,
  excludeValues?: any[],
  value?: string | string | undefined,
  mode?: "multiple" | "tags" | undefined
  items?: SelectboxModel[],
  width?: string | undefined,
  minwidth?: string | undefined,
  templateEndPoint?: string,
  cascade?: boolean,
  disabled?: boolean,
  callBackItem?: boolean,
  infilter?: boolean,
  status?: any,
  placeholder?: any,
  size?: 'small' | 'medium' | 'large',
  showAction?: any[],
  rowSelectionType?: "multitiple" | "single",
  onDropdownVisibleChange?: (() => void),
  optionLoaded?: ((items: any[]) => void),
  onChange: ((selectedItem: string, title: any) => void),
  onMultitipleSelect?: ((records: any[]) => void),
}
export class SelectBox extends React.Component<ISelectBoxProps> {
  private descriptor;
  private _selectBoxStore = new SelectboxStore();
  private ref: any;
  constructor(props: any) {
    super(props);
    this.descriptor = props.descriptor || {};
    this.descriptor.refresh = this.refresh.bind(this);
    this.descriptor.clear = this.clear.bind(this);
    this.descriptor.groupNumber = props.groupNumber || props.descriptor.groupNumber;
    this.descriptor.endpoint = this.descriptor.groupNumber ? "DomainType/GetDropDown" : this.descriptor.endpoint
  }
  state = {
    data: [] as any,
    value: this.props.value ? this.props.value : undefined as any,
    title: "" as any,
    baseValue: this.props.value,
    disabled: this.props.disabled,
    items: this.props.items || [],
    allItems: this.props.items || [],
    templateEndpoint: "",
    newRecordVisible: false,
    selectListVisible: false,
    selectListValue: {} as any,
    modalTitle: "" as any,
    selectedText: '' as any,
    defaultValue: true as any,
    select: '' as any,

  }
  componentDidUpdate() {
    if (this.state.baseValue !== this.props.value) {
      this.setState({ baseValue: this.props.value, value: this.props.value, selectedText: "" })
      if (!this.props.value) {
        this.state.title = ""
      } else {
        this.findValue(null, this.props.value)
      }
    }
    if (this.state.items !== this.props.items) {
      this.setState({ items: this.props.items })
      this.findValue(null, this.props.value)
    }
    if (this.state.disabled !== this.props.disabled) {
      this.setState({ disabled: this.props.disabled })
    }
  }

  componentDidMount() {
    this.state.baseValue = this.props.value;
    this.refresh();
  }

  refresh = async (setValue?: string) => {
    const { descriptor } = this
    if (descriptor.data) {
      this.setState({ data: [...descriptor.data] });
      if (this.props.optionLoaded) {
        this.props.optionLoaded(descriptor.data);
      }
      return;
    }
    if (this.state.items && this.state.items.length > 0) {
      this.setState({ items: this.state.items });
      if (this.props.optionLoaded) {
        this.props.optionLoaded(this.state.items);
      }
      return;
    }


    if (descriptor.endpoint) {
      if (setValue) {
        this.setState({ value: null })
      }
      if (this.props.cascade && (typeof (descriptor.cascadeList) === "undefined" || descriptor.cascadeList === null || descriptor.cascadeList.length == 0 || descriptor.cascadeList.find((x: any) => !x.value))) {
        return;
      }
      else if (!this.props.cascade) {
        descriptor.cascadeList = [];
      }
      if (descriptor.groupNumber) {
        descriptor.cascadeList = [{ field: "groupNumber", value: descriptor.groupNumber }];
      }

      descriptor.cascadeList = descriptor.cascadeList.filter((x: any) => x.value);
      var internetConnection = await NetworkUtils.isNetworkAvailable();
      var endPointSqlLite = descriptor.endpoint;
      if (descriptor.groupNumber) {
        endPointSqlLite = endPointSqlLite + "?groupNumber=" + descriptor.groupNumber
      }
      endPointSqlLite = endPointSqlLite.toLowerCase();
      var result = [] as any;
      if (internetConnection) {
        result = await this._selectBoxStore.loadData(descriptor.endpoint, { cascadeList: descriptor.cascadeList, extraParams: descriptor.extraParams })
        var sqlLiteDta = result.map(function (x: any) {
          return {
            endpoint: endPointSqlLite,
            value: x.value,
            title: x.title,
            other: JSON.stringify(x.other)
          }

        });

        // clearAndInsert(sqlLiteDta, endPointSqlLite)



      } else {
        // result = await getSelectboxDataList(endPointSqlLite)
      }

      // if (result && result.length == 1 && !this.props.infilter) {
      //   var val = result[0].value;
      //   this.setState({ value: val })

      //   this.props.onChange(val, result[0].title);
      //   this.findValue(result as any, val)
      // }


      if (this.props.excludeValues) {
        this.props.excludeValues.map(x => {
          if (result.find((t: any) => t.value == x)) {
            result = result.filter((t: any) => t.value != x);
          }
        })
      }
      this.setState({ data: result, allItems: result });
      var title = this.findValue(result as any)
      // var value = val || this.state.value;
      var value = this.state.value;
      this.state.baseValue = value;
      if (this.props.optionLoaded) {
        this.props.optionLoaded(result);
      }
    }
  }

  clear() {
    this.setState({ data: [], items: [], title: "" });

  }



  createOption = (items: any[]) => {
    const optionList = [] as any;
    if (items && items.length > 0) {

      items.map(({ }) => {
        optionList.push()
      })
    }
    return optionList;
  }
  handleSearch = (query: any, initialList?: any) => {
    this.setState({ value: null, title: query });
    var items = this.state.allItems.filter(t => t.title.indexOf(query) != -1)
    this.setState({ data: items })

  };
  findValue = (data?: any, val?: any) => {
    let items = data || this.state.allItems || [] as any;
    var value = val || this.state.value
    var title = this.state.title;
    if (items.length > 0) {

      title = items.find((t: any) => t.value == value)?.title;
    }

    this.setState({ title: title })
    return title
  }
  selectedValue(index: any, item: any) {
    if (item) {
      this.setState({ selectedText: item.title || this.state.title });
      this.props.onChange(item.value, item.title);
    } else {
      this.setState({ selectedText: "", title: "" });
      this.props.onChange("", "");
    }
  }
  renderClearIcon = (props: any) => {
    if (this.props.disabled) {
      return null
    }
    return <TouchableOpacity onPress={() => {
      this.handleSearch("")
    }} style={{ position: "absolute", right: wp(5), width: hp(20), height: hp(20) }}>
      <FastImage
        style={{ width: wp(10), height: wp(10) }}
        source={require('../../../images/botas/cross.webp')}
        resizeMode={FastImage.resizeMode.contain}
      />

    </TouchableOpacity>
  }
  render() {
    return <View style={{}}>
      <RNModalPicker
        data={this.state.data}
        pickerTitle={this.props.label}
        labelText={this.props.label}
        showSearchBar={true}
        status={this.props.status}
        showPickerTitle={true}
        disablePicker={this.props.disabled}
        selectedText={this.state.selectedText || this.state.title}
        // placeHolderText={this.state.placeHolderText}
        //dropDownIcon={require('../assets/pin.png')}
        selectedValue={(index: any, item: any) => this.selectedValue(index, item)}
      />
    </View>
  }
}


{/* <Select
style={{ width: width ? width : "100%", minWidth: minwidth ? minwidth : 0 }}

ref={r => this.ref = r}
disabled={this.props.disabled}
value={Array.isArray(this.state.value) ? this.state.value.map(x => x?.toString()) : this.state.value?.toString()}
>
{items}
</Select> */}