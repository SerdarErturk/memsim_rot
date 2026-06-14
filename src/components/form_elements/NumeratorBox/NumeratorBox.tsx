import * as React from 'react';

import NumeratorStore from './store/numeratorStore'
import { Input, Text } from 'components';
export interface INumeratorBoxProps {
  leftIcon?: any;
  numaratorType: any;
  autoCreate?: boolean;
  disabled?: boolean;
  size?: any;
  value: any;
  rigthIcon?: any;
  style?: any;
  label?: any;
  status?: any;
  placeholder?: any;
  accessoryLeft?: any;
  accessoryRight?: any;
  secureTextEntry?: boolean;
  onChange?: (text: string) => void;
}

export interface INumeratorBoxState {
  val: string | number | readonly string[] | undefined,
  baseVal: string | number | readonly string[] | undefined,
  visible: boolean,
  selectedRecord: string | null,
}


export class NumeratorBox extends React.Component<INumeratorBoxProps, INumeratorBoxState>  {

  private numeratorStore: NumeratorStore;
  private component: any;
  private emptyFunction: any;
  constructor(props: INumeratorBoxProps) {
    super(props);
    this.numeratorStore = new NumeratorStore();
    this.component = this.component || {}
    this.component.grid = {
      refresh: this.emptyFunction,
      extraParams: { numeratorTypeId: this.props.numaratorType }
    };
    this.state = {
      val: this.props.value || "" as any,
      baseVal: this.props.value || "",
      visible: false,
      selectedRecord: null,
    }
    if (props.autoCreate) {
      this.createNextNum()
    }
  }


  componentDidMount() {
    if (this.props.value) {
      this.setState({ val: this.props.value })
    }
  }

  componentDidUpdate(prevProps: any) {
    if (this.props.value && this.props.value !== this.state.val) {
      this.setState({ val: this.props.value })
    }

  }
  createNextNum = async () => {
    var model = { numeratorTypeId: this.props.numaratorType }
    var result = await this.numeratorStore.getNextNumber(model);
    this.setState({ val: result })
    if (this.props.onChange) {
      this.props.onChange(result)
    }
  }

  onChange = (text: any) => {
    if (this.props.onChange) {
      this.props.onChange(text)
    }
    this.setState({ val: text })


  }

  getNumber = async () => {
    const { selectedRecord } = this.state;
    if (selectedRecord) {
      if (!this.state.val) {
        var result = await this.numeratorStore.createNextNumber(selectedRecord);
        if (this.props.onChange) {
          this.props.onChange(result)
        }
        this.setState({ val: result, visible: false })
      }

    }

  }
  recreateNumber = async () => {
    const { selectedRecord } = this.state;
    if (selectedRecord) {
      var result = await this.numeratorStore.createNextNumber(selectedRecord);
      if (this.props.onChange) {
        this.props.onChange(result)
      }
      this.setState({ val: result, visible: false })
    }
  }
  render() {
    const { label, style, placeholder } = this.props;
    const { val } = this.state;
    return (<>

      <Input
        label={label}
        style={style}
        placeholder={placeholder}
        {...this.props}
        status={this.props.status}
        value={val}
        onChangeText={(text) => { this.onChange(text) }}
      />

    </>)


  }

}

