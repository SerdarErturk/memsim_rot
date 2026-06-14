import { L } from '../utils/utility'
export const router: any = [
    {
        path: 'login',
        title: L("login"),
        component: require('../pages/Login').default,
    },
    {
        path: 'home',
        title: L("home"),
        component: require('../pages/Home').default
    },
    {
        path: 'connection',
        title: L("connection"),
        component: require('../pages/Connection').default
    },
    {
        path: 'settings',
        title: L("settings"),
        component: require('../pages/Settings').default
    }
    ,
    {
        path: 'targets',
        title: L("targets"),
        component: require('../pages/Targets').default
    },
    {
        path: 'newtarget',
        title: L("NewTarget"),
        component: require('../pages/NewTarget').default
    },
    {
        path: 'sensors',
        title: L("sensors"),
        component: require('../pages/Sensors').default
    }, 
    {
        path: 'language',
        title: L("language"),
        component: require('../pages/LanguageSetting').default
    }
    ,
    {
        path: 'games',
        title: L("games"),
        component: require('../pages/Games').default
    },
    {
        path: 'scenarios',
        title: L("scenarios"),
        component: require('../pages/Scenarios').default
    },
    {
        path: 'addscenario',
        title: L("addscenario"),
        component: require('../pages/AddScenario').default
    },
    {
        path: 'playscenario',
        title: L("playscenario"),
        component: require('../pages/PlayScenario').default
    }
    ,
    {
        path: 'scoreSetting',
        title: L("scoreSetting"),
        component: require('../pages/ScoreSetting').default
    }
    ,
    {
        path: 'logs',
        title: L("logs"),
        component: require('../pages/Logs').default
    },
    {
        path: 'fastplay',
        title: L("fastplay"),
        component: require('../pages/FastPlay').default
    },
    {
        path: 'shottimesetting',
        title: L("shottimesetting"),
        component: require('../pages/ShotTimeSetting').default
    }
    ,
    {
        path: 'systemsettting',
        title: L("systemsettting"),
        component: require('../pages/SystemSettting').default
    }
];

