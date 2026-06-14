import React from "react";

import { Select, SelectItem } from '@ui-kitten/components';
import SelectboxModel from "../SelectBox/model/SelectboxModel";
import SelectboxStore from "../SelectBox/store/selectboxStore";
import { Radio, RadioGroup as RadioComponent } from '@ui-kitten/components';


import { StyleSheet } from "react-native";
import { hp, wp } from "utils/dimension";
import { Text, View } from "components";
// import { clearAndInsert, getSelectboxDataList } from "localdb/selectboxdata_repository";
import NetworkUtils from "utils/networkUtills";
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
export class RadioGroup extends React.Component<ISelectBoxProps> {
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
    items: this.props.items || [],
    templateEndpoint: "",
    newRecordVisible: false,
    selectListVisible: false,
    selectListValue: {} as any,
    modalTitle: "" as any
  }
  componentDidUpdate() {
    if (this.state.baseValue !== this.props.value) {
      this.setState({ baseValue: this.props.value, value: this.props.value })
      this.findValue(null, this.props.value)
    }
    if (this.state.items !== this.props.items) {
      this.setState({ items: this.props.items })
      this.findValue(null, this.props.value)
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

      var endPointSqlLite = descriptor.endpoint;
      if (descriptor.groupNumber) {
        endPointSqlLite = endPointSqlLite + "?groupNumber=" + descriptor.groupNumber
      }
      endPointSqlLite = endPointSqlLite.toLowerCase();
      var internetConnection = await NetworkUtils.isNetworkAvailable();
      var result = [] as any;
      if (internetConnection) {
        result = await this._selectBoxStore.loadData(descriptor.endpoint, { cascadeList: descriptor.cascadeList })

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

      var val;
      if (result && result.length == 1 && !this.props.infilter) {
        val = result[0].value;
        this.setState({ value: val })
        this.props.onChange(val, result[0].title);
        this.findValue(result as any, val)
      }


      if (this.props.excludeValues) {
        this.props.excludeValues.map(x => {
          if (result.find((t: any) => t.value == x)) {
            result = result.filter((t: any) => t.value != x);
          }
        })
      }

      this.setState({ data: result });

      this.findValue(result as any)
      var value = val || this.state.value;
      if (result[value] && result[value].value) {
        this.props.onChange(result[value].value, result[value].title);
      }

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
  findValue = (data?: any, val?: any) => {
    let items = data || this.state.data || [] as any;
    var value = val || this.state.value

    if (items.length > 0) {
      var index = items.findIndex((t: any) => t.value == value);
      this.setState({ value: index });
      return items.findIndex((t: any) => t.value == value).title
    }
    return ""
  }

  render() {
    const { } = this.props;
    let items = this.state.data || [] as any;



    return <View>
      <Text style={styles.label}> {this.props.label || ""} </Text>
      <RadioComponent

        style={{ justifyContent: "center", alignItems: "center", flexDirection: "row" }}
        selectedIndex={this.state.value}
        onChange={(index: any) => {
          this.setState({ value: index })
          this.props.callBackItem ? this.props.onChange(items[index].value, items[index].title) : this.props.onChange(items[index].value, items[index].title)
        }
        }>
        {
          items.map((x: any) =>
            <Radio key={this.props.key_val + x.value + ''}
              disabled={this.props.disabled}
            >
              {x.title?.toString()}
            </Radio>
          )
        }
      </RadioComponent>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radio: {
    margin: 2,
    fontSize: hp(14),
    minHeight: hp(40),
    color: "#39464E",
    fontFamily: "Narin-Bold",
  },
  label: {
    fontSize: hp(14),
    color: "#004F58",
    marginBottom: hp(8),
    fontFamily: "Narin-Medium"
  }
});
{/* <Select
style={{ width: width ? width : "100%", minWidth: minwidth ? minwidth : 0 }}

ref={r => this.ref = r}
disabled={this.props.disabled}
value={Array.isArray(this.state.value) ? this.state.value.map(x => x?.toString()) : this.state.value?.toString()}
>
{items}
</Select> */}