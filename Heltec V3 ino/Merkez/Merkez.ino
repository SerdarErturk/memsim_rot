/*
  Rotary Target Central / Terminal ESP
  BLE -> Central ESP -> LoRa bridge

  Important:
  - BLE messages can arrive fragmented.
  - This version buffers BLE chunks until '\n'.
  - Tablet must send every command with trailing '\n'.
  - Complete BLE message is forwarded to LoRa once.
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

// =========================
// PROTOCOL / TEST SETTINGS
// =========================

const bool ADD_LEGACY_STAR_PREFIX = false;
const bool CENTRAL_TEST_MODE = false;

const int CENTRAL_TEST_TYPE = 2;

const unsigned long TEST_INTERVAL_MS = 2000;
const int TEST_TARGET_NO = 1;
const int TEST_POSITIONS[] = { 1, 2, 3 };
const int TEST_POSITION_COUNT = sizeof(TEST_POSITIONS) / sizeof(TEST_POSITIONS[0]);

int testPositionIndex = 0;
int testScenarioCounter = 1;
unsigned long lastTestMs = 0;

const bool REPEAT_GO_FOR_TEST = true;
const int GO_REPEAT_COUNT = 3;
const int GO_REPEAT_DELAY_MS = 60;

// =========================
// BLE FRAGMENT BUFFER
// =========================
// Tablet messages must end with '\n'.
// Example: B;S001;R001;N020;D:11111111111111111111\n
String bleRxBuffer = "";
const int BLE_RX_BUFFER_MAX = 512;

// LoRa receive flag
volatile bool receivedFlag = false;

#if defined(ESP8266) || defined(ESP32)
ICACHE_RAM_ATTR
#endif
void setFlag(void) {
  receivedFlag = true;
}

SX1262 radio = new Module(LoRa_nss, LoRa_dio1, LoRa_nrst, LoRa_busy);

// BLE
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;

bool deviceConnected = false;
bool oldDeviceConnected = false;

String lastsend = "";

#define SERVICE_UUID "d564ac02-e906-4b14-88ad-ca841372a59f"
#define CHARACTERISTIC_UUID "fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc"

String pad3(int n) {
  if (n < 10) return "00" + String(n);
  if (n < 100) return "0" + String(n);
  return String(n);
}

String scenarioId(int scenarioNo) {
  return "S" + pad3(scenarioNo);
}

void sendData(String data);
void readData();
void setupLoRa();
void setupBle();
void runCentralTestMode();

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("BLE client connected.");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    bleRxBuffer = "";
    Serial.println("BLE client disconnected.");
  }
};

class MyCallbacks : public BLECharacteristicCallbacks {
  void processBleChunk(String incoming) {
    incoming.replace("\r", "");

    if (incoming.length() == 0) {
      return;
    }

    Serial.println("BLE chunk => " + incoming);

    bleRxBuffer += incoming;

    if (bleRxBuffer.length() > BLE_RX_BUFFER_MAX) {
      Serial.println("BLE buffer overflow, clearing.");
      bleRxBuffer = "";
      return;
    }

    int newlineIndex = bleRxBuffer.indexOf('\n');

    while (newlineIndex >= 0) {
      String completeMessage = bleRxBuffer.substring(0, newlineIndex);
      completeMessage.trim();

      bleRxBuffer = bleRxBuffer.substring(newlineIndex + 1);

      if (completeMessage.length() > 0) {
        Serial.println("BLE complete => " + completeMessage);
        sendData(completeMessage);
      }

      newlineIndex = bleRxBuffer.indexOf('\n');
    }
  }

  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();

    if (value.length() > 0) {
      String incoming = "";

      for (int i = 0; i < value.length(); i++) {
        incoming += value[i];
      }

      processBleChunk(incoming);
    }
  }

  void onWrite(BLECharacteristic* pCharacteristic, esp_ble_gatts_cb_param_t* param) {
    onWrite(pCharacteristic);
  }
};

void setupLoRa() {
  SPI.begin(LoRa_SCK, LoRa_MISO, LoRa_MOSI, LoRa_nss);

  radio.setSpreadingFactor(10);
  radio.setPreambleLength(8);
  radio.setFrequency(433.5);
  radio.setBandwidth(125.0);
  radio.setCodingRate(5);
  radio.setCRC(true);
  radio.setPacketReceivedAction(setFlag);

  Serial.print(F("[SX1262] Initializing ... "));

  int state = radio.begin();

  if (state == RADIOLIB_ERR_NONE) {
    Serial.println(F("success!"));
  } else {
    Serial.print(F("failed, code "));
    Serial.println(state);

    while (true) {
      delay(1000);
    }
  }

  receivedFlag = false;
  radio.startReceive();
}

void setupBle() {
  BLEDevice::init("MEMSIM");

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService* pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_WRITE |
      BLECharacteristic::PROPERTY_NOTIFY |
      BLECharacteristic::PROPERTY_INDICATE
  );

  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setCallbacks(new MyCallbacks());

  pService->start();

  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);

  BLEDevice::startAdvertising();

  Serial.println("BLE ready. Waiting for client...");
}

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(buzzer, OUTPUT);
  digitalWrite(buzzer, LOW);

  setupLoRa();
  setupBle();

  Serial.println("Central ready.");
  Serial.println("ADD_LEGACY_STAR_PREFIX: " + String(ADD_LEGACY_STAR_PREFIX ? "true" : "false"));
  Serial.println("CENTRAL_TEST_MODE: " + String(CENTRAL_TEST_MODE ? "true" : "false"));

  if (CENTRAL_TEST_MODE) {
    Serial.println("CENTRAL TEST MODE ACTIVE");
    Serial.println("Test type: " + String(CENTRAL_TEST_TYPE));
  }
}

void loop() {
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n');
    data.trim();

    if (data.length() > 0) {
      sendData(data);
    }
  }

  if (CENTRAL_TEST_MODE) {
    runCentralTestMode();
  }

  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }

  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  readData();
}

void readData() {
  if (!receivedFlag) return;

  receivedFlag = false;

  String message = "";
  int state = radio.readData(message);

  if (state == RADIOLIB_ERR_NONE) {
    message.trim();

    Serial.println("LoRa RX => " + message);

    if (deviceConnected && message.length() > 0 && message != lastsend) {
      pCharacteristic->setValue(message.c_str());
      pCharacteristic->notify();

      delay(3);
    }
  } else {
    Serial.print(F("RX failed, code "));
    Serial.println(state);
  }

  receivedFlag = false;
  radio.startReceive();
}

void sendData(String data) {
  data.trim();

  if (data.length() == 0) return;

  String packet = data;

  if (ADD_LEGACY_STAR_PREFIX && !packet.startsWith("*")) {
    packet = "*" + packet;
  }

  Serial.println("LoRa TX => " + packet);

  lastsend = packet;

  int state = radio.transmit(packet);

  if (state == RADIOLIB_ERR_NONE) {
    Serial.println(F("TX success"));
  } else if (state == RADIOLIB_ERR_PACKET_TOO_LONG) {
    Serial.println(F("TX too long"));
  } else if (state == RADIOLIB_ERR_TX_TIMEOUT) {
    Serial.println(F("TX timeout"));
  } else {
    Serial.print(F("TX failed, code "));
    Serial.println(state);
  }

  radio.finishTransmit();

  delay(100);

  receivedFlag = false;
  radio.startReceive();
}

void runCentralTestMode() {
  if (millis() - lastTestMs < TEST_INTERVAL_MS) return;

  lastTestMs = millis();

  int pos = TEST_POSITIONS[testPositionIndex];

  testPositionIndex++;

  if (testPositionIndex >= TEST_POSITION_COUNT) {
    testPositionIndex = 0;
  }

  if (CENTRAL_TEST_TYPE == 1) {
    String cmd = "M;H" + pad3(TEST_TARGET_NO) + ";P" + String(pos);

    sendData(cmd);

    return;
  }

  if (CENTRAL_TEST_TYPE == 2) {
    String sid = scenarioId(testScenarioCounter++);

    if (testScenarioCounter > 999) {
      testScenarioCounter = 1;
    }

    String bulk =
      "B;" +
      sid +
      ";R" +
      pad3(TEST_TARGET_NO) +
      ";N001;D:" +
      String(pos);

    sendData(bulk);

    delay(80);

    if (REPEAT_GO_FOR_TEST) {
      for (int i = 0; i < GO_REPEAT_COUNT; i++) {
        sendData("GO;" + sid);
        delay(GO_REPEAT_DELAY_MS);
      }
    } else {
      sendData("GO;" + sid);
    }

    return;
  }

  if (CENTRAL_TEST_TYPE == 3) {
    String sid = scenarioId(testScenarioCounter++);

    if (testScenarioCounter > 999) {
      testScenarioCounter = 1;
    }

    String d = "";

    if (pos == 1) d = "1231";
    if (pos == 2) d = "2312";
    if (pos == 3) d = "3123";

    String bulk = "B;" + sid + ";R001;N004;D:" + d;

    sendData(bulk);

    delay(80);

    if (REPEAT_GO_FOR_TEST) {
      for (int i = 0; i < GO_REPEAT_COUNT; i++) {
        sendData("GO;" + sid);
        delay(GO_REPEAT_DELAY_MS);
      }
    } else {
      sendData("GO;" + sid);
    }

    return;
  }
}