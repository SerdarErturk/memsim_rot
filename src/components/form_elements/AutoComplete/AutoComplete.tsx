import React from "react";
// import AutoCompleteModel from "./model/AutoCompleteModel";
import AutoCompleteStore from "./store/autoCompleteStore";
import { Icon } from '@ui-kitten/components';
import { StyleSheet, TouchableWithoutFeedback } from "react-native";
import { View } from "components";
import { hp, wp } from "utils/dimension";
import NetworkUtils from "utils/networkUtills";
import RNModalPicker from "../SelectPicker/RNModalPicker";

export interface IAutoCompleteProps {
  descriptor?: any,
  key_val: any,
  label: any,
  value?: string | string[] | undefined,
  textField?: string | string[] | undefined,
  mode?: "multiple" | undefined,
  items?: any[],
  disabled?: boolean,
  placeholder?: any,
  onChange: ((selectedItems: any, title?: string, option?: any) => void),
  onDataBound?: ((items: any[]) => void),
  onBlur?: (() => void),
  showAction?: any,
  templateEndPoint?: string,
  templateHiddenItems?: any[],
  templateDefaultValues?: any,
  excludeValues?: any[],
  infilter?: boolean,
  onDropdownVisibleChange?: (() => void),
  onMultitipleSelect?: ((records: any[]) => void),
  rowSelectionType?: "multitiple" | "single",
  field?: any
  status?: any,
  size?: 'small' | 'medium' | 'large',
}
export class AutoComplete extends React.Component<IAutoCompleteProps> {
  private timer: any;
  private descriptor;
  private _autoCompleteStore = new AutoCompleteStore();
  private ref: any;
  constructor(props: any) {
    super(props);
    this.descriptor = props.descriptor || {};
    this.descriptor.refresh = this.refresh.bind(this);
    this.descriptor.clear = this.clear.bind(this);
  }
  state = {
    data: [] as any,
    selectedItem: this.props.value && Array.isArray(this.props.value) ? this.props.value.map(x =>
      x = x?.toString()
    ) : [] as any,
    value: this.props.value ? Array.isArray(this.props.value) ? this.props.value.map(x =>
      x = x?.toString()
    ) : [] as any : this.props.value?.toString(),
    baseValue: this.props.value + '',
    items: this.props.items || [],
    templateEndPoint: this.props.templateEndPoint || "",
    newRecordVisible: false,
    selectListVisible: false,
    selectListValue: {} as any,
    modalTitle: "" as any,
    textField: null as any,
    title: "" as any,
    selectedText: '' as any,
    defaultValue: true  as any,
    select: ''  as any,
  }
  componentDidUpdate() {
    if ( JSON.stringify(this.state.baseValue) != JSON.stringify(this.props.value)) {
      var value = this.props.value;
      if(!value){
       this.setState({ title: "",baseValue: value})
      }else{
        if (Array.isArray(this.props.value)) {

          this.setState({ baseValue: value, value: value })
        } else {
          this.setState({ baseValue: value, value: value })
          this.state.value = this.props.value;
          this.handleSearch("   ", value)
          this.findValue(null, this.state.value )
        }
        if (this.state.baseValue) {
          this.handleSearch("   ", value)
        }
      }
    }
    if (this.state.items !== this.props.items) {
      this.setState({ items: this.props.items })

    }

    // if (this.props.textField && this.props.textField != this.state.textField) {
    //   this.state.textField = this.props.textField;
    //   this.setState({ baseValue: this.props.textField, value: this.state.textField })
    // }

  }

  componentDidMount() {
    this.refresh();
  }
  clear = () => {
    this.setState({ data: [] })
  }
  refresh() {
    if (this.props.value) {
      this.handleSearch("   ", this.props.value)
    } else {
      this.handleSearch("   ")
    }
  }
  // handleKeyDown = (event) => {
  //   const { value } = event.target;
  //   if (!value && value == "") {
  //     if (event.key == "Backspace" || event.key == "ArrowRight" || event.key == "ArrowLeft")
  //       return true;
  //     var cc = (event.which) ? event.which : event.keyCode;
  //     if (cc == 13 || cc == 9) {
  //       // if (this.props.onApplyRequest)
  //       //     this.props.onApplyRequest();
  //     }
  //   }
  //   return true;
  // }

  handleSearch = (query: any, initialList?: any) => {
   
  

    if (!initialList && query && query.length < 2 && query.length != 0) {
      return;
    }
    if(!initialList){
      this.setState({ value: null, title: query });
    }
    if (this.timer) {
      clearInterval(this.timer)
    }
    var that = this;
    if (initialList && !Array.isArray(initialList)) {
      initialList = [initialList]
    }
    this.timer = setTimeout(function () {
      var model = {
        query,
        initialList: initialList ? initialList : null,
        extraParams: that.descriptor.extraParams || {},
        cascadeList: that.descriptor.cascadeList || []
      };
      if (that.descriptor.cascadeList && that.descriptor.cascadeList.find((t: any) => !t.value && t.value != undefined)) {
        return;
      }
      that.search(model)

    }, 100);


  };

  search = async (model: any) => {
    const { selectedItem } = this.state;
    const { descriptor } = this
    var internetConnection = await NetworkUtils.isNetworkAvailable();
if(!internetConnection){
  return;
}
    var result = await this._autoCompleteStore.search(descriptor.endpoint, model) as any;
    if (model.initialList) {
      var selectedList = [] as any
      selectedItem.map((x: any) => {
        var item = result.find((y: any) => y.value == x);
        if (item) {
          selectedList.push(item);
        };
      })
      if (this.props.onDataBound) {
        this.props.onDataBound(result);
      }

      this.setState({ selectedItem: selectedList })
      model.query = "  ";
      delete model.initialList;
      var otherData = await this._autoCompleteStore.search(descriptor.endpoint, model);
      otherData.map((x:any) => {
        if (!result.find((t: any) => t.value == x.value)) {
          result.push(x)
        }
      })
    }
    if (this.props.excludeValues) {
      this.props.excludeValues.map(x => {
        if (result.find((t: any) => t.value == x) && !selectedItem.find((t: any) => t.value == x)) {
          result = result.filter((t: any) => t.value != x)
        }
      })
    }
    this.createData(result, selectedList || selectedItem)

  }







  handleChange = async (value: any, title: any) => {
    var changedValue = value;
    const { selectedItem } = this.state;
    if (Array.isArray(value)) {

      changedValue = [...value];
      changedValue.map((x: any, i: any) => {
        var item = this.state.data.find((y: any) => y.value == x);
        if (item) {
          changedValue[i] = item.value;
          selectedItem.push(item);
        };
      })

      changedValue.map((x: any) => {
        var item = selectedItem.find((y: any) => y.value == x);
        if (!item) {
          var finded = this.state.data.find((y: any) => y.value == x);
          if (finded) {
            selectedItem.push(finded)
          }

        }
      })
    }



    this.setState({ value: changedValue, selectedItem: selectedItem })

    this.createData(this.state.data, selectedItem)
    if (this.props.onChange) {
      this.props.onChange(changedValue, title);
    }
  }
  createNewRecord = async (endpoint: string) => {

    this.setState({ templateEndpoint: endpoint, newRecordVisible: true })
  }

  selectInList = async (endpoint: string) => {
    this.setState({ templateEndpoint: endpoint, selectListVisible: true })
  }
  createData = (data: any, selected?: any) => {
    var mergedData = [...data];
    if (selected) {
      selected.map((x: any) => {
        var find = mergedData.find(y => y.value == x.value);
        if (!find) {
          mergedData.push(x);
        }
      })

    }
    this.setState({ data: mergedData.filter(x => x.value != "0") });
    this.forceUpdate();
    this.findValue(mergedData.filter(x => x.value != "0"));
  }
  findValue = (data?: any, value?: any) => {
  
    let items = data || this.state.data || [] as any;
    if (this.props.value != this.state.value) {
      this.state.value = this.props.value;
    }
    var val = value || this.state.value;
    this.setState({ title: items.find((t: any) => t.value == val)?.title || this.state.title })
  }
  selectedValue(index:any, item:any) {
    if(item){
      this.setState({selectedText: item.title || this.state.title});
      this.props.onChange(item.value, item.title);
    }else{
      this.setState({selectedText: "",title:""});
      this.props.onChange("", "");
    }
  }
  renderClearIcon = (props: any) => {
   if(this.props.disabled) {
    return <View style={{ height: hp(40) }}>

    </View>
   }
    return this.state.title && this.state.title.replace(/ /g,'') != "" && this.state.title.length > 0 ? <TouchableWithoutFeedback onPress={() => {
      this.setState({ value: null, title: null })
      this.props.onChange([], this.state.data, false)

    }} style={{ height: hp(100) }}>
      <Icon {...props} style={{ ...props.style, height: hp(40) }} name={'close-outline'} />
    </TouchableWithoutFeedback> : <View style={{ height: hp(40) }}>

    </View>
  };
  render() {
    let items = this.state.data || [] as any;

    return  <View style={{}}><RNModalPicker
    data={this.state.data}
    pickerTitle={this.props.label}
    labelText={this.props.label}
    showSearchBar={true}
    showPickerTitle={true}
    disablePicker={this.props.disabled}
    selectedText={this.state.selectedText || this.state.title}
    // placeHolderText={this.state.placeHolderText}
    //dropDownIcon={require('../assets/pin.png')}
    selectedValue={(index:any, item:any) => this.selectedValue(index, item)}
  />
  </View>
  }
}
const styles = StyleSheet.create({
  input: {
    borderRadius: wp(8),
    paddingTop: hp(10),
    fontSize: hp(14),
    color: "#39464E",
    fontFamily: "Narin-Bold",
  },
  label: {
    fontSize: hp(14),
    color: "#004F58",
    marginBottom: hp(8),
    fontFamily: "Narin-Medium"
  },
  disabledLabel: {
    fontSize: hp(14),
    color: "#39464E50",
    marginBottom: hp(8),
    fontFamily: "Narin-Medium"
  },
  text: {
    fontSize: hp(14),
    height: hp(20),
    color: "#39464E",
    fontFamily: "Narin-Bold",
  },
  placeholder: {
    fontSize: hp(14),
    color: "#39464E50",
    fontFamily: "Narin-Bold",
  }
});