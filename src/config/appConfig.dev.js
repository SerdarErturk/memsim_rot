export const appConfig = {
    DEV_MODE: false, // flag to fetch mock or real fetch
    // api: {
    //     // endPoint: 'http://78.135.107.209:8806'
    //   
    //     // endPoint: 'https://10.0.2.2:44327'
    // },
    // projectName:"BerTech", 
    api: {
      endPoint: 'http://78.135.107.107:8801'
        //Emulator
       //endPoint: 'http://10.0.2.2:57899'

        //Real Device
       //endPoint: 'http://192.168.1.28:7801'

        
    },
    version:"0.0.1",
    projectName:"BerTech", 
    reactAppBaseUrl: 'http://78.135.107.209:8809/'
};

export default appConfig;