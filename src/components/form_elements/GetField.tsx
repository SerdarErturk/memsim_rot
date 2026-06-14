import { Card, Icon, Modal, Text } from '@ui-kitten/components';
import { AutoComplete, Button, CheckBox, DatePicker, FastImage, InputBox, RadioGroup, SelectBox, View } from 'components';
import React from 'react';
import { Keyboard, StyleSheet, TouchableOpacity,ScrollView } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { hp, wp } from 'utils/dimension';
import { openGps } from 'utils/helper';
import { generateUUID } from 'utils/utils';
import { validating } from 'utils/validate';
import { L } from '../../utils/utility';
import GetFieldStore from '../stores/getFieldStore';
import { ComponentType } from './ComponentType';

const CalendarIcon = (props: any) => (
    <Icon {...props} name='calendar' />
);
export interface IGetFieldProps {
    templateEnpoint?: string
    onChange?: ((value: any) => void),
    onCustomButtonPress?: ((field: any) => void),
    descriptor?: any,
    editMode?: any,
    values: any,
    disabled?: boolean,
    formGroup?: any,
    hiddenItems?: any[]
    disabledItems?: any[]
    model?: any[],
    accessoryLeft?: any,
    scrollClose?: boolean,
    extraParams?: any,
    customRequiredFields?: any,
    talveg?: any,
    workTeam?: any,
    onTalvegChange?: ((value: any) => void),
    talvegList?: any,
    workTeamDetailList?: any,
    openGps?: any,
    latitude?: any,
    longitude?: any,
    defaultToday?: any,
}


export class GetField extends React.Component<IGetFieldProps>  {
    private getFieldStore: GetFieldStore;
    private refsList: any;
    private component: any;
    private descriptor: any;
    private emptyFunction: any;
    constructor(props: IGetFieldProps) {
        super(props);
        this.getFieldStore = new GetFieldStore();
        this.component = this.component || {};
        this.descriptor = props.descriptor || {};
        this.descriptor.validate = this.validate.bind(this);
        this.component = this.component || {};
        this.refsList = {}
    }
    state = {
        template: {} as any,
        barcodeVisible: false,
        selectedField: null,
        values: this.props.values || {} as any,
        disabledItems: this.props.disabledItems || [] as any,
        validates: {} as any,
        customRequiredFields: this.props.customRequiredFields || [] as any,
        visible: false,
        talvegValue: "" as any,
        talvegList: this.props.talvegList || [] as any,
        workTeamDetailList: this.props.workTeamDetailList || [] as any,
    }
    componentDidMount() {
        this.state.values = this.props.values || {}
        // this.loadTemplate()
    }

    componentDidUpdate() {
      
        if (JSON.stringify(this.props.values) != JSON.stringify(this.state.values)) {
            this.setState({ values: this.props.values });
            // this.checkSelectCascadeAll({ ...this.state.template.defaultValues, ...this.props.values })
        }
        if (JSON.stringify(this.props.disabledItems) != JSON.stringify(this.state.disabledItems)) {

            this.setState({ disabledItems: this.props.disabledItems });
        }
        if (JSON.stringify(this.props.customRequiredFields) != JSON.stringify(this.state.customRequiredFields)) {

            this.setState({ customRequiredFields: this.props.customRequiredFields });
        }
        if (JSON.stringify(this.props.talvegList) != JSON.stringify(this.state.talvegList)) {
            this.setState({ talvegList: this.props.talvegList });
        }
        if (JSON.stringify(this.props.workTeamDetailList) != JSON.stringify(this.state.workTeamDetailList)) {
            this.setState({ workTeamDetailList: this.props.workTeamDetailList });
        }
    }
    validate = () => {
        const validates = [] as any;
        var model = this.props.model || []
        model.map((x: any) => {
            delete validates[x.field]
        })
        if (this.props.hiddenItems) {
            this.props.hiddenItems.map(x => {
                var findItem = model.find((t: any) => t.field == x);
                if (findItem) {
                    model = model.filter((t: any) => t.field != x)
                }
            })
        }

        model.filter((t: any) => t.validations.length > 0).map((x: any) => {

            let result = {
                hasError: false,
                updateState: false,
                focusOn: null,
                message: ""
            };
            const val = this.findValue(x.field);
            result = validating(x.field, val, x.validations);
            if (result.hasError && !result.focusOn) {
                validates[`${x.field}_validateStatus`] = "danger"
                validates[`${x.field}_helpText`] = L(result.message)
            }
            else {
                delete validates[`${x.field}_validateStatus`]
                delete validates[`${x.field}_helpText`]
            }
        })
        if (this.state.customRequiredFields?.length) {
            let result = {
                hasError: false,
                updateState: false,
                focusOn: null,
                message: ""
            };
            var validateRule = [{
                "type": "required",
                "message": "general.required",
                "parameters": {
                    "ErrorMessage": "general.required",
                    "AllowEmptyStrings": "False",
                    "RequiresValidationContext": "False",
                    "ErrorMessageResourceName": null,
                    "ErrorMessageResourceType": null,
                    "TypeId": "System.ComponentModel.DataAnnotations.RequiredAttribute"
                }
            }]
            this.state.customRequiredFields.map((x: any) => {
                if (model.find(t => t.field == x)) {
                    const val = this.findValue(x);
                    result = validating(x, val, validateRule)
                    if (result.hasError && !result.focusOn) {
                        validates[`${x}_validateStatus`] = "danger"
                        validates[`${x}_helpText`] = L(result.message)
                    } else {
                        delete validates[`${x}_validateStatus`]
                        delete validates[`${x}_helpText`]
                    }
                }

            })

        }

        this.setState({ validates })
        if (Object.keys(validates).length > 0) {
            showMessage({
                message: "Lütfen Zorunlu Alanları Doldurun.",
                backgroundColor: "#FF7A7A",
                type: "danger",
                position: "top",
                duration: 6000
            });
            return false;
        }
        return true

    }
    findValue = (field: string) => {
        return this.state.values[field];
    }
    // loadTemplate = async () => {
    //     if (this.props.templateEnpoint) {
    //         var result = await this.getFieldStore.loadTemplate(this.props.templateEnpoint);
    //         var model = this.props.model as any;
    //         if (this.props.formGroup) {
    //             if (Array.isArray(this.props.formGroup)) {
    //                 model.map((x: any,i:any) => {
    //                     if (!this.props.formGroup.includes(x.formGroup)) {
    //                         x.edit=false;
    //                        x.mobilVisible=false;
    //                     }
    //                 })
    //                 // info=result.gridData.info;
    //             } else {
    //                 model = model.filter((x: any) => x.formGroup == this.props.formGroup)
    //             }

    //             // result.gridData.info = [...info]
    //             this.state.template = model;
    //         } else {
    //             this.state.template = model;
    //         }

    //         this.state.values = { ...this.props.values, ...result.defaultValues }
    //         if (result.defaultValues) {
    //             this.props.onChange({ ...result.defaultValues })
    //         }
    //         this.setState({ template: result })
    //         this.checkSelectCascadeAll(this.state.values)

    //     }
    // }

    getField = () => {
        var field = this.props.model || []
        if (this.props.hiddenItems) {
            this.props.hiddenItems.map(x => {
                var findItem = field.find((t: any) => t.field == x);
                if (findItem) {
                    field = field.filter((t: any) => t.field != x)
                }
            })
        }
        // if (this.state.disabledItems) {
        //     this.state.disabledItems.map((x:any) => {
        //         var findItem = field.find((t: any) => t.field == x);
        //         if (findItem) {
        //             findItem.disabled = true
        //         }
        //     })
        // }
        const form = [] as any;
        field.filter(t => t.edit).map((x: any) => {
            if (x.type == ComponentType.Input || x.type == ComponentType.TextArea) {
                form.push(
                    this.createTextBox(x)
                )
            }
            else if (x.type == ComponentType.Select) {
                form.push(
                    this.createSelectBox(x)
                )
            }
            else if (x.type == ComponentType.InputNumber) {
                form.push(
                    this.createNumber(x)
                )
            }

            else if (x.type == ComponentType.AutoComplete) {
                form.push(
                    this.createAutoComplate(x)
                )
            }
            else if (x.type == ComponentType.Option) {
                form.push(
                    this.createOption(x)
                )
            }
            else if (x.type == ComponentType.Checkbox) {
                form.push(
                    this.createCheckBox(x)
                )
            }
            else if (x.type == ComponentType.Date || x.type == ComponentType.DatePicker) {
                form.push(
                    this.createDateBox(x)
                )
            }


        }

        )
        return form
    }
    nextInputFocus = (field: any) => {
        if (this.refsList[field] && this.props.model) {
            var componentList = this.props.model?.filter(t => t.edit).filter(t =>
                t.type == ComponentType.Input || t.type == ComponentType.TextArea ||
                t.type == ComponentType.InputNumber);
            var currentIndex = componentList.findIndex(t => t.field == field);
            var nextInput = componentList[currentIndex + 1];
            if (nextInput && nextInput.field) {
                var ref = this.refsList[nextInput.field];

                if (ref && ref.current && ref.current.focus) {
                    ref.current.focus();
                } else {
                    Keyboard.dismiss();
                }

            } else {
                Keyboard.dismiss();
            }

        }
    }
    createTextBox = (item: any) => {
        const { validates } = this.state;
        var disabled = this.props.disabled || item.disabled;
        var val = this.state.values[item.field] || "";
        this.refsList[item.field] = this.refsList[item.field] || React.createRef();
        var accessoryLeft = this.props.accessoryLeft && this.props.accessoryLeft[item.field] || null
        if (item.mobileType) {
            return <View key={item.field + "_masterview"} style={{ flexDirection: "row", marginTop: 10, justifyContent: "center", alignContent: "center", }}>
                <View key={item.field + "_firstchildview"} style={{ flex: 5 }}>
                    <InputBox
                        secureTextEntry={item.secureText}
                        label={L(item.text)}
                        disabled={disabled}
                        size="small"
                        returnKeyType="done"
                        onSubmitEditing={() => { this.nextInputFocus(item.field) }}
                        onCustomButtonPress={() => { if (this.props.onCustomButtonPress) { this.props.onCustomButtonPress(item.field) } }}
                        mask={item.mask}
                        accessoryLeft={accessoryLeft ? <FastImage
                            style={{ width: hp(10), height: hp(10), left: hp(10), top: 0 }}
                            source={accessoryLeft}
                            resizeMode={FastImage.resizeMode.contain}
                        /> : null}
                        refProp={this.refsList[item.field]}
                        keyboardType={item.keyboardType}
                        field={item.field + "_input"}
                        value={val}
                        status={validates[`${item.field}_validateStatus`]}
                        onChangeText={(text) => { this.onChange(item.field, text) }}
                        placeholder={L(item.text)}
                        multiline={item.type == ComponentType.TextArea}
                    />
                    {this.alertText(item.field)}
                </View>
                <View key={item.field + "_secondchildview"} style={{ flex: 1, justifyContent: "center", alignContent: "center", paddingTop: wp(30) }}>
                    <TouchableOpacity key={item.field + "_btn"} style={{ width: "100%", height: "50%", flex: 1, borderRadius: wp(2) }}
                        onPress={() => { this.setState({ barcodeVisible: true, selectedField: item.field }) }}
                    >
                        <FastImage source={require('./images/barcode.webp')}
                            style={{ width: wp(37), height: wp(37), backgroundColor: "white" }}>

                        </FastImage>
                    </TouchableOpacity>
                </View>

            </View>
        } else {
            return <View style={{ marginTop: 10 }} key={item.field + "_masterview"} >
                <InputBox
                    label={L(item.text)}
                    field={item.field + "_input"}
                    disabled={disabled}
                    size="small"
                    returnKeyType="done"
                    secureTextEntry={item.secureText}
                    onSubmitEditing={() => { this.nextInputFocus(item.field) }}
                    value={val}
                    refProp={this.refsList[item.field]}
                    onCustomButtonPress={() => { if (this.props.onCustomButtonPress) { this.props.onCustomButtonPress(item.field) } }}
                    mask={item.mask}
                    accessoryLeft={accessoryLeft ? <FastImage
                        style={{ width: hp(22), height: hp(22), left: hp(13), top: hp(40), position: "absolute" }}
                        source={accessoryLeft}
                        resizeMode={FastImage.resizeMode.contain}
                    /> : null}
                    keyboardType={item.keyboardType}
                    status={validates[`${item.field}_validateStatus`]}
                    multiline={item.type == ComponentType.TextArea}
                    placeholder={L(item.text)}
                    onChangeText={(text) => { this.onChange(item.field, text) }}
                />
                {this.alertText(item.field)}
            </View>
        }

    }
    createNumber = (item: any) => {
        const { validates } = this.state;
        var disabled = this.props.disabled || item.disabled;
        var val = this.state.values[item.field] || ""
        this.refsList[item.field] = this.refsList[item.field] || React.createRef()
        var accessoryLeft = this.props.accessoryLeft && this.props.accessoryLeft[item.field] || null
        if (item.mobileType) {
            return <View key={item.field + "_masterview"} style={{ flexDirection: "row", marginTop: 10, justifyContent: "center", alignContent: "center", }}>
                <View key={item.field + "_firstchildview"} style={{ flex: 5 }}>
                    <InputBox
                        showButton={item.showButton}
                        secureTextEntry={item.secureText}
                        label={L(item.text)}
                        disabled={disabled}
                        size="small"
                        returnKeyType="done"
                        onSubmitEditing={() => { this.nextInputFocus(item.field) }}
                        onCustomButtonPress={() => { if (this.props.onCustomButtonPress) { this.props.onCustomButtonPress(item.field) } }}
                        mask={item.mask}
                        accessoryLeft={accessoryLeft ? <FastImage
                            style={{ width: hp(10), height: hp(10), left: hp(10), top: 0 }}
                            source={accessoryLeft}
                            resizeMode={FastImage.resizeMode.contain}
                        /> : null}
                        keyboardType={item.mode}
                        refProp={this.refsList[item.field]}
                        field={item.field + "_input"}
                        value={val}
                        status={validates[`${item.field}_validateStatus`]}
                        onChangeText={(text) => { this.onChange(item.field, text) }}
                        placeholder={L(item.text)}
                        multiline={item.type == ComponentType.TextArea}
                    />
                    {this.alertText(item.field)}
                </View>
                <View key={item.field + "_secondchildview"} style={{ flex: 1, justifyContent: "center", alignContent: "center", paddingTop: wp(30) }}>
                    <TouchableOpacity key={item.field + "_btn"} style={{ width: "100%", height: "50%", flex: 1, borderRadius: wp(2) }}
                        onPress={() => { this.setState({ barcodeVisible: true, selectedField: item.field }) }}
                    >
                        <FastImage source={require('./images/barcode.webp')}
                            style={{ width: wp(37), height: wp(37), backgroundColor: "white" }}>

                        </FastImage>
                    </TouchableOpacity>
                </View>

            </View>
        } else {
            return <View style={{ marginTop: 10 }} key={item.field + "_masterview"} >
                <InputBox
                    label={L(item.text)}
                    field={item.field + "_input"}
                    disabled={disabled}
                    keyboardType={item.mode}
                    size="small"
                    returnKeyType="done"
                    refProp={this.refsList[item.field]}
                    onSubmitEditing={() => { this.nextInputFocus(item.field) }}
                    onCustomButtonPress={() => { if (this.props.onCustomButtonPress) { this.props.onCustomButtonPress(item.field) } }}
                    showButton={item.showButton}
                    secureTextEntry={item.secureText}
                    value={val}
                    mask={item.mask}
                    accessoryLeft={accessoryLeft ? <FastImage
                        style={{ width: hp(22), height: hp(22), left: hp(13), top: hp(40), position: "absolute" }}
                        source={accessoryLeft}
                        resizeMode={FastImage.resizeMode.contain}
                    /> : null}
                    status={validates[`${item.field}_validateStatus`]}
                    multiline={item.type == ComponentType.TextArea}
                    placeholder={L(item.text)}
                    onChangeText={(text) => { this.onChange(item.field, text) }}
                />
                {this.alertText(item.field)}
            </View>
        }

    }
    // createNumerator = (item: any) => {
    //     const { validates } = this.state;
    //     var val = this.state.values[item.field] || ""
    //     var disabled = this.props.disabled || item.disabled;
    //     if (item.mobileType) {
    //         return <View style={{ flexDirection: "row", marginTop: 10, height: hp(80), justifyContent: "center", alignContent: "center", }}>
    //             <View style={{ flex: 5 }}>
    //                 <NumeratorBox
    //                     autoCreate={!this.props.editMode}
    //                     status={validates[`${item.field}_validateStatus`]}
    //                     numaratorType={item.numaratorType}
    //                     label={L(item.text)}
    //                     key={item.field}
    //                     value={val}
    //                     disabled={disabled}
    //                     style={styles.input}
    //                     onChange={(text) => { this.onChange(item.field, text) }}
    //                     placeholder={L(item.text)}
    //                 />
    //                 {this.alertText(item.field)}
    //             </View>
    //             <View style={{ flex: 1, justifyContent: "center", alignContent: "center", paddingTop: wp(30) }}>
    //                 <TouchableOpacity style={{ width: "100%", height: "100%", flex: 1, borderRadius: wp(2) }}
    //                     onPress={() => { 

    //                         this.state.selectedField=item.field;
    //                         this.setState({ barcodeVisible: true  }) }}
    //                 >
    //                     <FastImage source={require('./images/barcode.webp')}
    //                         style={{ width: wp(37), height: wp(37), backgroundColor: "white" }}>

    //                     </FastImage>
    //                 </TouchableOpacity>
    //             </View>


    //         </View>
    //     } else {
    //         return <View>
    //             <NumeratorBox
    //                 autoCreate
    //                 numaratorType={item.numaratorType}
    //                 label={L(item.text)}
    //                 disabled={disabled}
    //                 status={validates[`${item.field}_validateStatus`]}
    //                 key={item.field}
    //                 value={val}
    //                 style={styles.input}
    //                 onChange={(text) => { this.onChange(item.field, text) }}
    //                 placeholder={L(item.text)}
    //             />
    //             {this.alertText(item.field)}
    //         </View>
    //     }

    // }
    createSelectBox = (item: any) => {
        var field = item.field;
        const { validates } = this.state;
        var val = this.state.values[item.field] || item.defaultValue || "";

        if (!this.state.values[item.field] && item.defaultValue) {
            this.state.values[item.field] = item.defaultValue;
            this.checkSelectCascade(item.field, item.defaultValue);
        }
        this.component[field] = this.component[field] || {
            metamodel: [],
            refresh: this.emptyFunction,
            clear: this.emptyFunction,
            endpoint: item.endPoint
        };
        if (this.props.extraParams && this.props.extraParams[field]) {
            this.component[field].extraParams = this.props.extraParams[field];
        }

        var disabled = item.disabled || this.props.disabledItems?.find(x => field == x) != null;
        return <View key={item.field + "_masterview"} style={{ marginTop: 10 }}>
            <SelectBox
                label={L(item.text)}
                key_val={item.field}
                placeholder={L(item.text)}
                descriptor={this.component[field]}
                callBackItem
                disabled={disabled}
                value={val}
                size="small"
                status={validates[`${item.field}_validateStatus`]}
                cascade={item.cascadeField ? true : false}
                groupNumber={item.groupNumber}
                optionLoaded={(datas) => { this.component[field].data = datas }}
                onChange={(value, title) => {
                    this.state.values[item.field] = value;
                    if (item.textField) {
                        this.onChangeMultitiple(item.field, {
                            [item.field]: value,
                            [item.textField]: title,
                        });
                    } else {

                        this.onChange(item.field, value);
                    }
                    this.checkSelectCascade(item.field, value, true)
                }}
            />
            {this.alertText(item.field)}
        </View>
    }
    createOption = (item: any) => {
        var field = item.field;
        const { validates } = this.state;
        var val = this.state.values[item.field] || item.defaultValue || "";
        if (!this.state.values[item.field] && item.defaultValue) {
            this.state.values[item.field] = item.defaultValue;

            this.checkSelectCascade(item.field, item.defaultValue);
        }
        this.component[field] = this.component[field] || {
            metamodel: [],
            refresh: this.emptyFunction,
            clear: this.emptyFunction,
            endpoint: item.endPoint
        };
        var disabled = item.disabled || this.props.disabledItems?.find(x => field == x) != null;
        return <View key={item.field + "_masterview"} style={{ marginTop: 10 }}>
            <RadioGroup
                label={L(item.text)}
                key_val={item.field}
                placeholder={L(item.text)}
                descriptor={this.component[field]}
                callBackItem
                disabled={disabled}
                value={val}
                size="small"
                status={validates[`${item.field}_validateStatus`]}
                cascade={item.cascadeField ? true : false}
                groupNumber={item.groupNumber}
                optionLoaded={(datas) => { this.component[field].data = datas }}
                onChange={(value, title) => {
                    this.state.values[item.field] = value;
                    if (item.textField) {
                        this.onChangeMultitiple(item.field, {
                            [item.field]: value,
                            [item.textField]: title,
                        });
                    } else {

                        this.onChange(item.field, value);
                    }
                    this.checkSelectCascade(item.field, value, true)
                }}
            />
            {this.alertText(item.field)}
        </View>
    }

    createCheckBox = (item: any) => {
        var field = item.field;
        var val = this.state.values[item.field] || item.defaultValue || "";
        if (!this.state.values[item.field] && item.defaultValue) {
            this.state.values[item.field] = item.defaultValue;
            this.onChange(item.field, item.defaultValue);
            this.checkSelectCascade(item.field, item.defaultValue);
        }

        this.component[field] = this.component[field] || {
            metamodel: [],
            refresh: this.emptyFunction,
            clear: this.emptyFunction,
            endpoint: item.endPoint
        };
        var disabled = this.props.disabled || item.disabled;
        return <View key={item.field + "_masterview"} style={{ marginTop: 2 }}>
            <CheckBox
                disabled={disabled}
                label={L(item.text)}
                value={val}
                onChange={(value) => {
                    if (value) {
                        this.onChange(item.field, value);
                    }
                }}

            />
            {this.alertText(item.field)}
        </View>
    }
    createAutoComplate = (item: any) => {
        const { validates } = this.state;
        var field = item.field;
        var val = this.state.values[item.field] || ""
        this.component[field] = this.component[field] || {
            metamodel: [],
            refresh: this.emptyFunction,
            clear: this.emptyFunction,
            endpoint: item.endPoint
        };
        var textField = "";
        // if (this.state.values) {
        //     textField = this.state.values[fieldProps.textField];
        // }
        var disabled = item.disabled || this.props.disabledItems?.find(x => field == x) != null;
        return <View key={item.field + "_masterview"} style={{ marginTop: 10 }}>
            <AutoComplete
                label={L(item.text)}
                placeholder={L(item.text)}
                descriptor={this.component[field]}
                key_val={item.field}
                size="small"
                disabled={disabled}
                textField={textField}
                status={validates[`${item.field}_validateStatus`]}
                value={val}
                onChange={(value, title, option) => {

                    this.onChange(item.field, value);
                    this.checkSelectCascade(item.field, value, true)
                }}
            />
            {this.alertText(item.field)}
        </View>
    }
    createDateBox = (item: any) => {
        const { validates } = this.state;
        var disabled = this.props.disabled || item.disabled;
        var val = this.state.values[item.field] || null

        var closeDefault = false
        if(item.defaultToday==false){
            closeDefault=true
        }
        return <DatePicker
            label={L(item.text)}
            key={item.field}
            disabled={disabled}
            value={val}
            closeDefault={closeDefault}
            showtime={item.showTime}
            size="small"
            onChange={(date) => {

                this.onChange(item.field, date);

            }}
            status={validates[`${item.field}_validateStatus`]}
            placeholder='Pick Date'
            accessoryRight={CalendarIcon}
        />
    }

    alertText = (field: any) => {
        // if (this.state.validates[`${field}_helpText`]) {
        //     return <View key={field + "_alert"} style={{ height: hp(20) }}>
        //         <Text style={styles.alertText} > {this.state.validates[`${field}_helpText`]} </Text>
        //     </View>
        // }
        return null
    }
    onChange = (field: any, value: any) => {
        this.state.values[field] = value;
        if (this.state.validates[`${field}_helpText`]) {
            delete this.state.validates[`${field}_helpText`];
            delete this.state.validates[`${field}_validateStatus`];
            this.setState({ validates: this.state.validates })
        }

        if (this.props.onChange) {
            this.props.onChange({ [field]: value })
        }
        // this.setState({ values: this.state.values })
    }
    onChangeMultitiple = (field: any, values: any) => {
        this.state.values[field] = values[field];
        if (this.state.validates[`${field}_helpText`]) {
            delete this.state.validates[`${field}_helpText`];
            delete this.state.validates[`${field}_validateStatus`];
            this.setState({ validates: this.state.validates })
        }

        if (this.props.onChange) {
            this.props.onChange({ ...values })
        }
    }
    checkSelectCascade = (field: any, value: any, clear?: boolean) => {
        var data = this.state.template.gridData?.info || []
        const model = JSON.parse(JSON.stringify(data));
        var cascadeList = model.filter((x: any) => x.cascadeField == field);

        cascadeList.map((x: any) => {
            if (x.cascadeField && x.cascadeField.toLowerCase() == field.toLowerCase()) {
                this.component[x.field] = this.component[x.field] || {
                    metamodel: [],
                    refresh: this.emptyFunction,
                    clear: this.emptyFunction,
                    endpoint: x.endPoint
                }
                delete this.component[x.field].data;
                if (this.component[x.field]) {

                    this.component[x.field].cascade = true;
                    if (value != null && value != "") {
                        this.component[x.field].cascadeList = [{ field: x.cascadeFieldName || x.cascadeField, value: value }];

                        if (this.component[x.field].refresh) {
                            this.component[x.field].refresh(clear);
                        }

                    } else {

                        this.component[x.field].cascadeList = [],
                            this.component[x.field].clear();
                        this.setState({ [x.field]: "" });
                    }

                    if (clear) {
                        this.clearCascadeSelect(x.field);
                        this.setState({ [x.field]: "" });
                    }
                }
            }
        })
    }
    checkSelectCascadeAll = (values: any) => {
        var data = this.state.template.gridData?.info || []
        const model = JSON.parse(JSON.stringify(data));
        var cascadeList = model.filter((x: any) => x.cascadeField);

        cascadeList.map((x: any) => {
            if (x.cascadeField) {

                this.component[x.field] = this.component[x.field] || {
                    metamodel: [],
                    refresh: this.emptyFunction,
                    clear: this.emptyFunction,
                    endpoint: x.endPoint
                }
                delete this.component[x.field].data;
                if (this.component[x.field]) {

                    this.component[x.field].cascade = true;
                    if (values[x.cascadeField]) {

                        this.component[x.field].cascadeList = [{ field: x.cascadeFieldName || x.cascadeField, value: values[x.cascadeField] }];
                    }
                    if (this.component[x.field].refresh) {
                        this.component[x.field].refresh();
                    }

                }
            }
        })
    }
    clearCascadeSelect = (field: any) => {
        var model = this.state.template.gridData?.info || []
        model.filter((x: any) => x.cascadeField).map((x: any) => {
            if (field && x.cascadeField && x.cascadeField.toLowerCase() == field.toLowerCase()) {
                const that = this;
                this.setState({ [x.field]: "" });
                x.value = "";
                this.component[x.field].clear();
                this.state.values[x.field] = "";
                this.clearCascadeSelect(x.field)
            }
        });
    }
    documentRender = (item: any) => {

        return <View flexNone key={"documentRender" + item.guidId} style={{ backgroundColor: "#d3d3d3", borderRadius: wp(8), padding: hp(6), margin: wp(2), flexDirection: "row", justifyContent: "space-between", height: hp(35) }}>
            <Text>{item.no}.Ölçüm / {item.doc}</Text>
            <TouchableOpacity onPress={() => {
                let list = this.state.talvegList.filter((x: any) => x.guidId != item.guidId)
                let sayac = 1
                list.map((x: any) => { x.no = sayac; sayac++ })
                this.setState({ talvegList: list })
                if (this.props.onTalvegChange) {
                    this.props.onTalvegChange(list)
                }
            }}>
                <FastImage
                    style={{ width: hp(20), height: hp(20), marginLeft: wp(4) }}
                    source={require('../../images/botas/delete.png')}
                    resizeMode={FastImage.resizeMode.contain}
                />
            </TouchableOpacity>
        </View>
    };
    workTeamRender = (item: any) => {
        return <View flexNone key={"workTeamRender" + item.guidId} style={{ backgroundColor: "#d3d3d3", borderRadius: wp(8), padding: hp(6), margin: wp(2), flexDirection: "row", justifyContent: "space-between", height: hp(35) }}>
            <Text>{item.employeeName}</Text>
            <CheckBox style={{ paddingTop: 0 }} label={""} value={item.isParticipant} onChange={(value) => {
                item.isParticipant = value
                this.state.workTeamDetailList.map((x: any) => {
                    if (x.guidId == item.guidId) {
                        x.isParticipant = value;
                    }
                })
                if (this.props.onTalvegChange) {
                    this.props.onTalvegChange(this.state.workTeamDetailList)
                }
            }}></CheckBox>
        </View>
    };

    render() {
        const { barcodeVisible } = this.state;
        {
            this.props.scrollClose ? <View style={{ flex: 1 }}>
                {this.getField()}
            </View>
                : <ScrollView style={{ flex: 1 }}>
                    {this.getField()}
                </ScrollView>

        }
        return (

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}>
                {this.getField()}
                {/* <Modal visible={barcodeVisible}
                    backdropStyle={styles.backdrop}
                    onBackdropPress={() => this.setState({ barcodeVisible: false })}>
                    <BarcodeScanner onRead={(data: any) => {
                        if (this.state.selectedField) {
                            this.state.values[this.state.selectedField] = data;
                            this.setState({ barcodeVisible: false, selectedField: null })
                            this.onChange(this.state.selectedField,data)
                        } else {
                            this.setState({ barcodeVisible: false, selectedField: null })
                        }
                    }} />


                </Modal> */}
                {this.props.talveg ?
                    <View style={{ marginTop: hp(10) }}>
                        <TouchableOpacity style={{
                            width: wp(180), height: hp(30), borderWidth: wp(1), marginBottom: hp(8), marginLeft: hp(2),
                            zIndex: 10, borderRadius: wp(10), alignItems: "center", backgroundColor: "#EDF0F7",
                            justifyContent: "center",
                            flexDirection: "row"
                        }} onPress={() => { this.setState({ visible: true }) }}>
                            <Text style={{ color: "#39464E", fontSize: hp(18), fontFamily: "Narin-Bold" }}>
                                Talveg Ölçümü Gir
                            </Text>
                            <FastImage
                                style={{ width: hp(18), height: hp(18), marginLeft: wp(6) }}
                                source={require('../../images/botas/add.webp')}
                                resizeMode={FastImage.resizeMode.contain}
                            />

                        </TouchableOpacity>
                        { this.state.talvegList?this.state.talvegList.map((x: any) => this.documentRender(x)):null}

                        <Modal
                            visible={this.state.visible}
                            backdropStyle={styles.backdrop}
                            onBackdropPress={() => { this.setState({ visible: false }) }}>
                            <Card disabled={true}>
                                <InputBox
                                    value={this.state.talvegValue}
                                    label="Ölçüm Değeri"
                                    onChangeText={(text: any) => { this.setState({ talvegValue: text }) }}
                                />
                                <TouchableOpacity style={{ alignItems: "center", borderRadius: hp(4), marginTop: hp(14), borderWidth: hp(1) }} onPress={() => {

                                    if (this.state.talvegValue != "" && this.state.talvegValue) {
                                        this.state.talvegList = this.state.talvegList || []
                                        this.state.talvegList?.push({ no: this.state.talvegList?.length + 1, doc: this.state.talvegValue, guidId: generateUUID() })
                                        this.setState({ visible: false, talvegValue: "" })
                                        if (this.props.onTalvegChange) {
                                            this.props.onTalvegChange(this.state.talvegList)
                                        }
                                    } else {
                                        alert("Lütfen Bir Ölçüm Değeri Giriniz.")
                                    }
                                }}>
                                    <Text>Kaydet</Text>
                                </TouchableOpacity>
                            </Card>
                        </Modal>
                    </View>
                    :
                    null}

                {this.props.workTeam && this.state.workTeamDetailList?.length > 0 ?
                    <View style={{ marginTop: hp(10) }}>
                        <Text style={{ fontSize: hp(16), paddingLeft: hp(6), paddingBottom: hp(2) }}>Ekip Üyeleri</Text>
                        {/* <FlatList
                            data={this.state.workTeamDetailList}
                            numColumns={1}
                            renderItem={this.workTeamRender}
                            keyExtractor={(item: any) => item.guidId}
                        /> */}
                        {this.state.workTeamDetailList.map((x: any) => this.workTeamRender(x))}
                    </View>
                    :
                    null}
                {
                    this.props.openGps ? <Button label="Yol Tarifi Al" style={{ marginTop: wp(6), padding: wp(4) }} onPress={() => {
                        openGps(this.props.latitude, this.props.longitude)
                    }}></Button> : null
                }
            </ScrollView>


        );
    }
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        margin: 10,
    },
    rowContainer: {

    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertText: {
        color: 'darkred',
        paddingLeft: wp(7),
    },
    controlContainer: {
        borderRadius: 4,
        margin: 2,
        padding: 6,
        backgroundColor: '#3366FF',
    },
});