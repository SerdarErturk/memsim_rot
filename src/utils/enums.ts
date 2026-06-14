export enum Action {
    Delete = "delete",
    Update = "update",
    Get = "get",
    Custom = "custom",
    Copy = "copy",
};
export const AcceptFileList = {
    allFiles: '*',
    audio: '.3g2,.3gp,.aac,.adt,.adts,.aif,.aifc,.aiff,.asf,.au,.m3u,.m4a,.m4b,.mid,.midi,.mp2,.mp3,.mp4,.rmi,.snd,.wav,.wax,.wma',
    csv: '.csv',
    doc: '.doc',
    docx: '.docx',
    images: '.jpeg,.jpg,.png',
    pdf: '.pdf',
    plainText: '.txt',
    ppt: '.ppt',
    pptx: '.pptx',
    video: '.mp4',
    xls: '.xls',
    xlsx: '.xlsx',
    zip: '.zip,.gz',
    folder: 'folder',
}
export enum SensorType {
    GroupNumber = 1100,
    PIEZO = 1100001,
    LASER = 1100002,
}
export enum Status {
    GroupNumber = 1200,
    ACTIVE = 1200001,
    PASSIVE = 1200002,
}
export enum TargetType {
    GroupNumber = 1300,
    Hedef = 1300001,
    Rehine = 1300002,
    Doubletap = 1300003,
}

export enum TargetColors {
  
    Hedef = "#FA3F2A",
    Rehine = "#47B14D",
    Doubletap = "#3F4DB8",
}