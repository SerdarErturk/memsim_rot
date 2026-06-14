import AsyncStorage from "@react-native-async-storage/async-storage";
const LOCALIZE = '@localize'
const TOKEN = '@token'
const INTERNET = '@internet'
const PP = '@pp'
const COMPANY = '@company'
const USER = '@user'
const USERID = '@userid'
const PERMISSION = '@permission'
const WORKTEAMID = '@workteamid'
const LOGINMODEL = '@login'
const CONNECTIONMANUEL = '@connectionmanuel'
const BLDEVICE = '@bldevice'

export const setLocalize = async (value) => {
    await storeData(LOCALIZE, value);
}
export const getLocalize = async () => {
    return await getData(LOCALIZE);
}
export const setToken = async (value) => {
    await storeData(TOKEN, value);
}
export const getToken = async () => {
    return await getData(TOKEN);

}
export const setLoginModel = async (value) => {
    await storeData(LOGINMODEL, JSON.stringify(value));
}
export const getLoginModel = async () => {
    var data = await getData(LOGINMODEL);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

export const setInternetConnection = async (value) => {
    await storeData(INTERNET, value);
}
export const getInternetConnection = async () => {
    return await getData(INTERNET);

}
export const setConnectionManuel = async (value) => {
    await storeData(CONNECTIONMANUEL, value);
}
export const getConnectionManuel = async () => {
    return await getData(CONNECTIONMANUEL);

}
export const setProfilPicture = async (value) => {
    await storeData(PP, value);
}

export const setCompany = async (value) => {
    await storeData(COMPANY, value);
}
export const setUser = async (value) => {
    await storeData(USER, JSON.stringify(value));
}
export const getUser = async () => {
    var data = await getData(USER);
    if (data) {
        return JSON.parse(data);
    }
    return null;

}
export const setUserId = async (value) => {
    await storeData(USERID, value);
}
export const getUserId = async () => {
    return await getData(USERID);
}

export const setBlDevice = async (value) => {
    await storeData(BLDEVICE, JSON.stringify(value));
}
export const getBlDevice = async () => {
    var data = await getData(BLDEVICE);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

export const setPermission = async (value) => {
    await storeData(PERMISSION, JSON.stringify(value));
}
export const getPermission = async () => {
    return await getData(PERMISSION);
}

export const setWorkTeamId = async (value) => {

    await storeData(WORKTEAMID, JSON.stringify(value));
}
export const getWorkTeamId = async () => {
    let work = await getData(WORKTEAMID);
    if (!work) {
        return null;
    }
    return JSON.parse(await getData(WORKTEAMID));

}
const storeData = async (key, value) => {
    try {
        if (value) {
            await AsyncStorage.setItem(key, value)
        } else {
            await clearData(key)
        }

    } catch (e) {
        console.error("Set Store Error Key:" + key)
    }
}

const storeObject = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(USER_INFO_KEY, jsonValue)
        return value;
    } catch (e) {
        // saving error
        console.error("Set Store Error Key:" + key)
    }
}

const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key)

        if (value !== null) {
            return value;
        }
    } catch (e) {
    }
}

const clearData = async (key) => {
    try {
        await AsyncStorage.removeItem(key)
    } catch (e) {
    }
}