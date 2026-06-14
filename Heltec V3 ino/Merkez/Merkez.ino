/*
  Code Base from RadioLib: https://github.com/jgromes/RadioLib/tree/master/examples/SX126x

  For full API reference, see the GitHub Pages
  https://jgromes.github.io/RadioLib/
*/

#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <RadioLib.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define buzzer 19
#define LoRa_MOSI 10
#define LoRa_MISO 11
#define LoRa_SCK 9

#define LoRa_nss 8
#define LoRa_dio1 14
#define LoRa_nrst 12
#define LoRa_busy 13

volatile bool receivedFlag = false;
#if defined(ESP8266) || defined(ESP32)
  ICACHE_RAM_ATTR
#endif
void setFlag(void) {
  // we got a packet, set the flag;
  receivedFlag = true;
}

SX1262 radio = new Module(LoRa_nss, LoRa_dio1, LoRa_nrst, LoRa_busy);
//Bir BLE server oluşturalım
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
//bağlı bağlıdeğil tanımlamaları
bool deviceConnected = false;
bool oldDeviceConnected = false;
bool nodeMessageStarted = false;
String nodemessage = "";
String lastsend = "";

// UUID üretmek için aşağıdaki linki kullanın:
// https://www.uuidgenerator.net/

#define SERVICE_UUID "d564ac02-e906-4b14-88ad-ca841372a59f"
#define CHARACTERISTIC_UUID "fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc"

//client bağlanıp bağlanmadığını kontrol etmek için bir class yapısı tanımlıyoruz
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};
class MyCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    if (value.length() > 0) {
      nodeMessageStarted=true;
      String deneme="";
      nodemessage="";
      for (int i = 0; i < value.length(); i++){
          nodemessage=nodemessage+value[i];
          deneme=deneme+value[i];

      }
          Serial.println("ble message=>>" +nodemessage);
          Serial.println("ble message deneme=>>" +deneme);
          sendData(deneme);
         nodeMessageStarted=false;
    }
  }
    void onWrite(BLECharacteristic *pCharacteristic, esp_ble_gatts_cb_param_t* param) {
      Serial.println("Characteristic Write 1");
      onWrite(pCharacteristic);
    }
};

void setup() {
  Serial.begin(115200);
  SPI.begin(LoRa_SCK, LoRa_MISO, LoRa_MOSI, LoRa_nss);
  radio.setSpreadingFactor(10);
  radio.setPreambleLength(8);
  radio.setFrequency(433.5);
  radio.setBandwidth(125.0);
   radio.setCodingRate(5);
  radio.setCRC(true);

   radio.setPacketReceivedAction(setFlag);
  // initialize SX1262 with default settings
  Serial.print(F("[SX1262] Initializing ... "));
  int state = radio.begin();
  if (state == RADIOLIB_ERR_NONE) {
    Serial.println(F("success!"));
  } else {
    Serial.print(F("failed, code "));
    Serial.println(state);
    while (true)
      ;
  }
 BLEDevice::init("MEMSIM");

  // BLE Server'ı oluşturalım
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // BLE servisi oluşturalım
  BLEService* pService = pServer->createService(SERVICE_UUID);
  BLE2902* p2902Descriptor = new BLE2902();
  p2902Descriptor->setNotifications(true);
  // BLE karakteristiğini oluşturalım
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE);

  // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
  // BLE Descriptor'u oluşturalım (fonksiyonlar bunun altında çalışıyor)
  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->addDescriptor(p2902Descriptor);
  // Servisi başlatalım
  pService->start();

  // Yayın yapmayı başlatalım
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);  // değeri 0x00 olarak değiştirirseniz yayınlanmaz
  BLEDevice::startAdvertising();
  Serial.println("Bilgi aktarmak için bir istemcinin bağlanması bekleniyor...");
  
  sendData("CENTER");
}

void loop() {
//  sendData("CENTER");
//  delay(1000);
  // you can receive data as an Arduino String
  // NOTE: receive() is a blocking method!
  //       See example ReceiveInterrupt for details
  //       on non-blocking reception method.
 if (deviceConnected ) {
    //  displaySendReceive("Baglandi...");
  //   String  message= "test";
  //    Serial.println("blgiden=>>" + message);
  //    int str_len = message.length() + 1;  
  // char char_array[str_len];
  // message.toCharArray(char_array, str_len);
  // pCharacteristic->setValue(char_array);
  // pCharacteristic->notify();
  // delay(100);  // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
  }
   if(Serial.available()){
    String data=Serial.readString();
    sendData(data);
  }

  // disconnect olma durumlarında
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);                   // bluetooth katına biraz süre tanımak için
    pServer->startAdvertising();  // tekrar kendini yayınlamaya başlatalım
    oldDeviceConnected = deviceConnected;
  }
  // Tekrar Bağlanma durumunda
  if (deviceConnected && !oldDeviceConnected) {
    // değişkenleri güncelle
    oldDeviceConnected = deviceConnected;
  }

     readData();
   
}
void readData(){
 if(receivedFlag){
 receivedFlag=false;
  String message;
  int state = radio.readData(message);
    if (state == RADIOLIB_ERR_NONE )
    {
      Serial.println("Okunan=>>" + message);
      if(message.length()>2 && (message.indexOf("PZ")!=-1 ||message.indexOf("LZ")!=-1 )&& message.indexOf(lastsend)==-1){
      Serial.println("blgiden=>>" + message);
      int str_len = message.length() + 1;  
      char char_array[str_len];
      message.toCharArray(char_array, str_len);
      pCharacteristic->setValue(char_array);
      pCharacteristic->notify();
      delay(3);  // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
  
      }
    }
     delay(50);
 }
 
      
}
void sendData(String data) {
  data="*"+data;
  Serial.println("Giden=>>>"+data);
  lastsend=data;
  int state = radio.transmit(data);
  if (state == RADIOLIB_ERR_NONE) {
    nodemessage="";
    
  }
  
  receivedFlag=false;
  radio.finishTransmit();
  delay(100);
  radio.startReceive();
   receivedFlag=false;
}