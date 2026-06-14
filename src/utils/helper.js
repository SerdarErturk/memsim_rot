
import moment from 'moment-timezone';
import { Linking, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob'
function isFile(input) {
    if ('File' in window && input instanceof File)
        return true;
    else return false;
}

function isFloat(n) {
    if (n && n.toString().indexOf(".") != -1) {
        return Number(n) === n && n % 1 !== 0;
    }
    return false;
}
export const getGuidIdInHrefParams = () => {
    const url = new URL(window.location.href);
    if (url && url.searchParams && url.searchParams.get('guidId')) {
        return url.searchParams.get('guidId');
    }
    return null;
}
function isObject(val) {
    return val instanceof Object;
}
export const fileToByteArray = (file) => {
    return new Promise((resolve, reject) => {
        try {
            let reader = new FileReader();
            let fileByteArray = [];
            reader.readAsArrayBuffer(file);
            reader.onloadend = (evt) => {
                if (evt.target.readyState == FileReader.DONE) {
                    let arrayBuffer = evt.target.result,
                        array = new Uint8Array(arrayBuffer);
                    array.forEach(byte => {
                        fileByteArray.push(byte);
                    });
                }
                resolve(fileByteArray);
            }
        }
        catch (e) {
            reject(e);
        }
    })
}
export const convertModelToForm = (model, form, nestedProp) => {
    let formData = form ? form : new FormData();
    for (const property in model) {

        if (Array.isArray(model[property])) {
            model[property].map((x, i) => {
                if (isFile(x) || !isObject(x)) {
                    if (x) {
                        if (nestedProp) {
                            if (isFloat(x)) {
                                x = x.toString().replace(",", ".")
                            }
                            formData.append(nestedProp + "." + property, x);
                        } else {
                            if (isFloat(x)) {
                                x = x.toString().replace(",", ".")
                            }
                            formData.append(property, x);
                        }

                    }
                } else {
                    if (Array.isArray(x)) {
                        for (const p in x) {
                            if (x[p]) {
                                if (nestedProp) {
                                    if (isFloat(x[p])) {
                                        x[p] = x[p].toString().replace(",", ".")
                                    }
                                    formData.append(nestedProp + "." + property + "[" + i + "]." + p, x[p]);
                                } else {
                                    if (isFloat(x[p])) {
                                        x[p] = x[p].toString().replace(",", ".")
                                    }
                                    formData.append(property + "[" + i + "]." + p, x[p]);
                                }


                            }
                        }
                    } else {
                        for (const obj in x) {
                            if (x[obj] != undefined && x[obj] != null) {
                                if (nestedProp) {
                                    if (isFloat(x[obj])) {
                                        x[obj] = x[obj].toString().replace(",", ".")
                                    }
                                    formData.append(nestedProp + "." + property + "[" + i + "]." + obj, x[obj]);
                                } else {
                                    if (isFloat(x[obj])) {
                                        x[obj] = x[obj].toString().replace(",", ".")
                                    }
                                    if (moment.isMoment(x[obj])) {
                                        var date = moment(x[obj]).format("YYYY-MM-DD HH:mm:ss");
                                        formData.append(property + "[" + i + "]." + obj, date);
                                    } else {
                                        formData.append(property + "[" + i + "]." + obj, x[obj]);
                                    }
                                }

                            }

                        }
                    }


                }
            })

        } else {
            if (model[property] != undefined && model[property] != null) {
                if (moment.isMoment(model[property])) {
                    var date = moment(model[property]).format("YYYY-MM-DD HH:mm:ss");
                    formData.append(property, date);
                }
                else if (isFile(model[property]) || !isObject(model[property])) {
                    if (nestedProp) {
                        if (isFloat(model[property])) {
                            model[property] = model[property].toString().replace(",", ".")
                        }
                        formData.append(nestedProp + "." + property, model[property]);
                    } else {
                        if (isFloat(model[property]) && (model[property].includes && !model[property].includes("-"))) {
                            model[property] = model[property].toString().replace(",", ".")
                        }
                        formData.append(property, model[property]);
                    }
                }

                else if (isObject(model[property])) {
                    formData = convertModelToForm(model[property], formData, property);
                } else {
                    if (model[property] != undefined && model[property] != null) {
                        if (nestedProp) {
                            if (isFloat(model[property])) {
                                model[property] = model[property].toString().replace(",", ".")
                            }
                            formData.append(nestedProp + "." + property, model[property]);
                        } else {
                            if (isFloat(model[property])) {
                                model[property] = model[property].toString().replace(",", ".")
                            }
                            formData.append(property, model[property]);
                        }
                    }


                }

            }
        }
    }
    return formData;
}

export const findItemInArray = (id, array) => {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.key === id) {
            return element;
        }
        if (element.children) {
            const found = findItemInArray(id, element.children);
            if (found) {
                return found;
            }
        }
    }
}

export const findParentItemInArray = (id, array) => {
    let parent;
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.children) {
            const deneme = element.children.find(x => x.id === id);
            if (deneme) {
                parent = deneme;
            }
            else {
                findParentItemInArray(id, element.children, element);;
            }
        }
    }
    return parent;
}

export const findParent = (id, array) => {
    let parent;
    let found = false;
    function findParentItemInArray(id, array) {
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element.children) {
                const item = element.children.find(x => x.id === id);
                if (item) {
                    parent = element;
                    found = true;
                    break;
                }
                else if (!found) {
                    findParentItemInArray(id, element.children);
                }
            }
        }
    }
    findParentItemInArray(id, array);
    return parent
}
export const deleteItemInArray = (id, data) => {
    const arr = [];
    if (Array.isArray(data)) {
        data.map(item => {
            if (item.key !== id) {
                if (item.children) {
                    item.children = deleteItemInArray(id, item.children)
                }
                arr.push(item)
            }
        })
        return arr;
    }
}
export const sumFromArray = (propertyName, array) => {
    let sum = 0;
    if (array) {
        array.forEach(item => {
            sum += parseFloat(item[propertyName]) ?? 0;
        });
    }

    return sum;
};
export const currencyString = (value, currency, localize) => {
    //    var val= (value).toLocaleString(localize, {
    //         style: 'currency',
    //         currency:currency,
    //       }); 
    //     return val;

    return value ? value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.') : 0
};

export const lastWordInText = (words) => {
    const n = words.split(" ");
    return n[n.length - 1];
}

export const convertArrayToObject = (array, attribute, value) => {
    const object = {};
    array.map(x => {
        if (Array.isArray(value)) {
            let string = "";
            value.map(y => {
                string += (x[y] ? x[y] : "")
            }
            )
            object[x[attribute]] = string;
        }
        else {
            object[x[attribute]] = x[value] ? x[value] : ""
        }

    });
    return object;
}
export const convertCascadeFieldToObject = (array, attribute, value) => {
    const object = {};
    if (Array.isArray(array)) {
        array.map(x => {
            object[x.field] = x.value;

        });
    }
    return object;
}
export const convertNestedToArr = (arr, value) => {
    var value = value || [];
    arr.map(x => {
        if (x.children && x.children.length > 0) {
            convertNestedToArr(x.children, value)
        } else {
            value.push(x)
        }
    })

    return value;
}

export const base64ToArrayBuffer = (base64) => {
    var strBlob;
    if (base64.indexOf("application") !== -1) {
        strBlob = base64.split(',')[1];
    } else {
        strBlob = base64
    }
    const binaryString = window.atob(strBlob);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export const getBase64 = (file, cb) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        cb(reader.result)
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}


export const previewFile = (base64) => {
    const byteArray = base64ToArrayBuffer(base64)
    const newBlob = new Blob([byteArray], { type: "application/pdf" });
    const file = window.URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = file;
    link.target = "_blank_";
    link.click();
}
export const downloadExcel = (file, pageInfo) => {

    var anchor_href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
    var fileResult = anchor_href + file
    var byteArray = base64ToArrayBuffer(fileResult);
    var a = window.document.createElement('a');

    a.href = window.URL.createObjectURL(new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));

    // Append anchor to body.
    document.body.appendChild(a)
    a.click();


    // Remove anchor from body
    document.body.removeChild(a)
}


export const findRoute = (pathname, route) => {
    for (let index = 0; index < route.length; index++) {
        const element = route[index];
        if (element.path === pathname) {
            return element;
        }
        if (element.children) {
            const found = findRoute(pathname, element.children);
            if (found) {
                return found;
            }
        }
    }
}



export const createGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const resizeImage = (settings) => {
    const file = settings.file;
    const maxSize = settings.maxSize;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');
    const dataURItoBlob = (dataURI) => {
        const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
            atob(dataURI.split(',')[1]) :
            unescape(dataURI.split(',')[1]);
        const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const max = bytes.length;
        const ia = new Uint8Array(max);
        for (var i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i);
        return new Blob([ia], { type: mime });
    };
    const resize = () => {
        let width = image.width;
        let height = image.height;

        if (width > height) {
            if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/jpeg');
        return dataURItoBlob(dataUrl);
    };

    return new Promise((ok, no) => {
        if (!file.type.match(/image.*/)) {
            no(new Error("Not an image"));
            return;
        }

        reader.onload = (readerEvent) => {
            image.onload = () => ok(resize());
            image.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    })


};

export const getCurrentTimeString = (date) => {
    let today = date ? moment(date).utc(true) :moment().utc(true);
    var hour = today.hour();
    if (date) {
        // hour = hour + 1
    }
    let hours = (hour < 10 ? '0' : '') + hour;
    let minutes = (today.minutes() < 10 ? '0' : '') + today.minutes();
    // let seconds = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
    // return hours + ':' + minutes + ':' + seconds;
    return (hours) + ':' + minutes;
}

export const getCurrentDateString = (date) => {
    let dateval = date ? moment(date).utc(true) : moment().utc(true);
 var val= dateval.format("DD.MM.YYYY").toString();//format: d-m-y;
 return val;
}

export const combineDateAndTime = (date, time) => {
    if (date) {
        const year = date.split(".")[2];
        const month = ("0" + (date.split(".")[1])).slice(-2);
        const day = ("0" + date.split(".")[0]).slice(-2);
        const dateString = "" + year + "-" + month + "-" + day;

        if (time) {
            const mins = ("0" + time.split(":")[1]).slice(-2);
            const hours = ("0" + time.split(":")[0]).slice(-2);
            const timeString = hours + ":" + mins + ":00";
            const datec = dateString + "T" + timeString;
            return new Date(datec);
        }
        const datec = dateString;
        return new Date(datec);
    } return null
}

export const combineStringDateAndTime = (date, time) => {
    if (date) {
        const year = date.split(".")[2];
        const month = ("0" + (date.split(".")[1])).slice(-2);
        const day = ("0" + date.split(".")[0]).slice(-2);
        const dateString = "" + year + "-" + month + "-" + day;

        if (time) {
            const mins = ("0" + time.split(":")[1]).slice(-2);
            const hours = ("0" + time.split(":")[0]).slice(-2);
            const timeString = hours + ":" + mins + ":00";
            const datec = dateString + "T" + timeString;
            return datec;
        }
        const datec = dateString;
        return  moment(datec);
    } return null
}

export const fillList = (item) => {
    return <TouchableOpacity onPress={() => { selectEvidence(item.guidId) }} key={item.id + "_master"} style={{ padding: wp(5) }}>
        <View flexNone key={item.id + "_child"} style={[styles.planMain, styles.shadow]}>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Bulgu Durumu </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.statusName} </Text>
                </View>
            </View>

            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Bulgu Kodu </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.code} </Text>
                </View>
            </View>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Bulgu Hangi İşte Bulundu </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.findJobName} </Text>
                </View>
            </View>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Devriye Kod/Ad </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.patrolPlanningName} </Text>
                </View>
            </View>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Dere Ölçüm Kod/Ad </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.riverMeasurementName} </Text>
                </View>
            </View>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Bulgu Tarihi/Saati </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {moment(item.date).utc(true).format("DD.MM.YYYY HH:MM")} </Text>
                </View>
            </View>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Bulgu Tipi </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.typeName} </Text>
                </View>
            </View>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> DOC Değeri </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.doc} </Text>
                </View>
            </View>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Boru Hattına En Yakın Mesafe </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.distanceToPipeline} </Text>
                </View>
            </View>
            <View style={styles.valueContainer}>
                <View style={{ justifyContent: "center", alignItems: "flex-start" }}>
                    <Text style={styles.title}> Boru Hattına Açığa Çıkmış mı? </Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text style={styles.value}> {item.pipelineExposedName} </Text>
                </View>
            </View>
            <View flexNone style={styles.buttonContainer}>
                <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                    <View style={[styles.priority, item.priorityId == Priority.Low ? { backgroundColor: "#1D9AD6" } :
                        item.priorityId == Priority.Medium ? { backgroundColor: "#FFD602" } : { backgroundColor: "#E53030" }]}>
                        <Text style={styles.priorityName}> {item.priorityName} </Text>
                    </View>
                    <View style={{ justifyContent: "center", alignItems: "flex-end" }} >
                        <TouchableOpacity onPress={() => { deleteConfirm(item) }}>
                            <FastImage source={require('../images/botas/deleted.webp')}
                                style={{ width: wp(37), height: wp(37), backgroundColor: "white" }}>

                            </FastImage>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    </TouchableOpacity>

}

export const openGps = (lat, lng) => {
    const location = `${lat},${lng}`
    let url = Platform.select({
        ios: `maps:${location}`,
        android: `geo:${location}?center=${location}&q=${location}&z=16`,
    });
    Linking.openURL(url);
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  export  function shuffleArr (array){
    const newArr = array.slice()
    for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
    }
    return newArr
}