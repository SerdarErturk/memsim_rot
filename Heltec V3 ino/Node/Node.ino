/*
  Rotary Target Node - based on previous light/lazer node

  New requirements:
  - 1 node = 1 ESP = 1 servo motor
  - 1 piezo sensor only
  - No laser input
  - Servo signal uses one of the RGB pins by request: GREEN/GPIO5
  - Piezo input remains on PZ1/GPIO2
  - Existing LoRa pins are preserved
  - Existing EEPROM/BLE target number assignment is preserved, but EEPROM overwrite bug is fixed

  Position codes:
    0 = no movement
    1 = front / target faces player
    2 = side / vertical profile
    3 = back / target back faces player

  Bulk command example:
    B;S001;R001;N020;D:11111222223333300000;Cxx
    GO;S001

  Direct command examples:
    M;H002;P3
    M;ALL;P1
    H002P3
*/

#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <RadioLib.h>
#include <EEPROM.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ESP32Servo.h>

#define buzzer 19
#define LoRa_MOSI 10
#define LoRa_MISO 11
#define LoRa_SCK 9
#define LoRa_nss 8
#define LoRa_dio1 14
#define LoRa_nrst 12
#define LoRa_busy 13
#define EEPROM_SIZE 64

// Existing board pins
int kirmizi = 7;
int mavi = 6;
int yesil = 5;

// Pin assignment for rotary target version
// Request update:
// - Do NOT use PZ1 for servo. PZ1 remains the single piezo input.
// - Servo signal uses one of the old RGB pins. Since target light/RGB is not needed
//   in this version, GREEN/GPIO5 is repurposed as servo PWM signal.
// Old code: piezo1 = GPIO2, piezo2 = GPIO33, piezo3 = GPIO25.
const uint8_t servoPin = 5;   // old RGB GREEN pin / servo signal
const uint8_t piezoPin = 2;   // PZ1 connector / single piezo input

// This version does not use RGB light outputs, because one RGB pin is now servo.
const bool USE_STATUS_RGB_LEDS = false;

// Servo angles. Avoid exact 0/180 to prevent endpoint strain.
const int SERVO_FRONT = 10;
const int SERVO_SIDE  = 90;
const int SERVO_BACK  = 170;

// =========================
// SERVO TEST MODE
// =========================
// true  = LoRa/BLE is bypassed. Servo rotates every SERVO_TEST_INTERVAL_MS.
// false = normal node mode.
const bool SERVO_TEST_MODE = false;
const unsigned long SERVO_TEST_INTERVAL_MS = 2000;
const int SERVO_TEST_ANGLES[] = { SERVO_FRONT, SERVO_SIDE, SERVO_BACK };
const int SERVO_TEST_COUNT = sizeof(SERVO_TEST_ANGLES) / sizeof(SERVO_TEST_ANGLES[0]);
int servoTestIndex = 0;
unsigned long lastServoTestMs = 0;

// Piezo settings
int piezo_esik = 250;
int yeni_piezo = 0;
int eski_piezo = 0;
unsigned long lastHitMs = 0;
unsigned long hitCooldownMs = 120;
unsigned long lastServoMoveMs = 0;
unsigned long ignorePiezoAfterServoMs = 300;

// Target identity
const int DEFAULT_TARGET_NO = 1;
// true: this demo node always boots as H001 and updates EEPROM accordingly.
// false: target number is read from EEPROM/BLE as in the old system.
const bool FORCE_TARGET_NO_ON_BOOT = true;
int addr = 0;
int targetNo = DEFAULT_TARGET_NO;       // 1-100
String targetId = "";                  // e.g. H002
String targetNo3 = "";                 // e.g. 002
String deviceName = "";

// Scenario state
String msg = "";
String pendingScenarioId = "";
String lastStartedScenarioId = "";
int pendingPosition = 0;
int currentPosition = 1;
bool inGame = false;

// Optional response messages. Keep false for 100-node demos to avoid RF collisions.
const bool SEND_ACK = false;
const bool SEND_DONE = false;

// BLE
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
unsigned long millisSendOk = 0;

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// LoRa
volatile bool receivedFlag = false;
SX1262 radio = new Module(LoRa_nss, LoRa_dio1, LoRa_nrst, LoRa_busy);
Servo targetServo;

#if defined(ESP8266) || defined(ESP32)
ICACHE_RAM_ATTR
#endif
void setFlag(void) {
  receivedFlag = true;
}

String pad3(int n) {
  if (n < 10) return "00" + String(n);
  if (n < 100) return "0" + String(n);
  return String(n);
}

String getField(String data, char separator, int index) {
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }
  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}

void updateTargetStrings() {
  targetNo3 = pad3(targetNo);
  targetId = "H" + targetNo3;
}

void saveTargetNo(int number) {
  if (number < 0) number = 0;
  if (number > 250) number = 250;
  EEPROM.write(addr, number);
  EEPROM.commit();
  targetNo = number;
  updateTargetStrings();
  Serial.println("Saved targetNo: " + String(targetNo));
}

void loadTargetNo() {
  if (FORCE_TARGET_NO_ON_BOOT) {
    saveTargetNo(DEFAULT_TARGET_NO);
    Serial.println("Target forced: " + targetId);
    return;
  }

  int saved = EEPROM.read(addr);
  if (saved == 255 || saved < 0 || saved > 250) {
    saveTargetNo(DEFAULT_TARGET_NO);
  } else {
    targetNo = saved;
    updateTargetStrings();
  }
  Serial.println("Target: " + targetId);
}

int angleForPosition(int pos) {
  switch (pos) {
    case 1: return SERVO_FRONT;
    case 2: return SERVO_SIDE;
    case 3: return SERVO_BACK;
    default: return SERVO_FRONT;
  }
}

void moveToPosition(int pos) {
  if (pos < 1 || pos > 3) return;

  int angle = angleForPosition(pos);
  Serial.println("Move " + targetId + " to P" + String(pos) + " angle=" + String(angle));

  targetServo.write(angle);
  currentPosition = pos;
  lastServoMoveMs = millis();
}

void sendData(String data) {
  if (data.length() == 0) return;

  int state = radio.transmit(data);
  if (state == RADIOLIB_ERR_NONE) {
    Serial.println("Giden ==> " + data);
  } else {
    Serial.print(F("TX failed, code "));
    Serial.println(state);
  }
  delay(30);
  radio.startReceive();
}

void sendHit() {
  // Include target ID, because bulk scenarios can activate multiple targets.
  // Example: PZ;H002
  sendData("PZ;" + targetId);
}

void prepareScenario(String scenarioId, int pos) {
  if (pos < 1 || pos > 3) {
    pendingScenarioId = "";
    pendingPosition = 0;
    return;
  }

  pendingScenarioId = scenarioId;
  pendingPosition = pos;
  Serial.println("Prepared " + targetId + " " + scenarioId + " P" + String(pos));

  if (SEND_ACK) {
    delay(random(20, 250));
    sendData("ACK;" + scenarioId + ";" + targetId);
  }
}

void startScenario(String scenarioId) {
  if (pendingScenarioId == scenarioId && pendingPosition >= 1 && pendingPosition <= 3) {
    // GO can be repeated for reliability; start only once per scenario ID.
    if (lastStartedScenarioId != scenarioId) {
      lastStartedScenarioId = scenarioId;
      moveToPosition(pendingPosition);

      if (SEND_DONE) {
        delay(random(20, 300));
        sendData("DONE;" + scenarioId + ";" + targetId + ";P" + String(pendingPosition));
      }
    }
  }
}

bool isForMe(String target) {
  target.trim();
  if (target == "ALL") return true;
  if (target == targetId) return true;
  // Also accept H2 style for small manual tests.
  if (target == "H" + String(targetNo)) return true;
  return false;
}

void processBulk(String packet) {
  // Format: B;S001;R001;N020;D:11111222223333300000;Cxx
  String scenarioId = getField(packet, ';', 1);
  String rField = getField(packet, ';', 2);
  String nField = getField(packet, ';', 3);
  String dField = getField(packet, ';', 4);

  if (!scenarioId.startsWith("S") || !rField.startsWith("R") || !nField.startsWith("N") || !dField.startsWith("D:")) {
    Serial.println("Invalid bulk packet");
    return;
  }

  int startNo = rField.substring(1).toInt();
  int count = nField.substring(1).toInt();
  String data = dField.substring(2);

  if (targetNo < startNo || targetNo >= startNo + count) {
    return;
  }

  int index = targetNo - startNo;
  if (index < 0 || index >= data.length()) {
    return;
  }

  char posChar = data.charAt(index);
  if (posChar == '0') {
    pendingScenarioId = "";
    pendingPosition = 0;
    Serial.println("Bulk: no movement for " + targetId);
    return;
  }

  if (posChar >= '1' && posChar <= '3') {
    prepareScenario(scenarioId, posChar - '0');
  }
}

void processDirectMove(String packet) {
  // Format: M;H002;P3 or M;ALL;P1
  String target = getField(packet, ';', 1);
  String pField = getField(packet, ';', 2);
  if (!pField.startsWith("P")) return;

  int pos = pField.substring(1).toInt();
  if (isForMe(target)) {
    moveToPosition(pos);
  }
}

void processShortMove(String packet) {
  // Format: H002P3 or H2P3 or ALLP1
  int pIndex = packet.indexOf('P');
  if (pIndex < 0) return;

  String target = packet.substring(0, pIndex);
  int pos = packet.substring(pIndex + 1).toInt();

  if (isForMe(target)) {
    moveToPosition(pos);
  }
}

void processMessage(String packet) {
  packet.trim();
  if (packet.length() == 0) return;

  Serial.println("Gelen ==> " + packet);

  if (packet == "restart") {
    ESP.restart();
  }

  if (packet == "cls") {
    esp_deep_sleep_start();
  }

  if (packet == "start") {
    inGame = true;
    BLEDevice::stopAdvertising();
    Serial.println("BLE kapalı, game mode açık");
    return;
  }

  if (packet == "stp" || packet == "STOP" || packet == "STOP;ALL") {
    pendingScenarioId = "";
    pendingPosition = 0;
    digitalWrite(buzzer, LOW);
    return;
  }

  if (packet.startsWith("B;")) {
    processBulk(packet);
    return;
  }

  if (packet.startsWith("GO;")) {
    String scenarioId = getField(packet, ';', 1);
    startScenario(scenarioId);
    return;
  }

  if (packet.startsWith("M;")) {
    processDirectMove(packet);
    return;
  }

  if (packet.indexOf('P') >= 0) {
    processShortMove(packet);
    return;
  }
}

void readData() {
  if (!receivedFlag) return;

  receivedFlag = false;
  msg = "";

  int state = radio.readData(msg);
  if (state == RADIOLIB_ERR_NONE) {
    processMessage(msg);
  } else {
    Serial.print(F("RX failed, code "));
    Serial.println(state);
  }

  radio.startReceive();
}

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
      String incoming = "";
      for (int i = 0; i < value.length(); i++) {
        incoming += value[i];
      }

      int newTargetNo = incoming.toInt();
      saveTargetNo(newTargetNo);

      String returnText = "OK;" + targetId;
      pCharacteristic->setValue(returnText.c_str());
      pCharacteristic->notify();
      millisSendOk = millis() + 2500;
    }
  }

  void onWrite(BLECharacteristic* pCharacteristic, esp_ble_gatts_cb_param_t* param) {
    onWrite(pCharacteristic);
  }
};


void servoTestLoop() {
  if (millis() - lastServoTestMs >= SERVO_TEST_INTERVAL_MS) {
    int angle = SERVO_TEST_ANGLES[servoTestIndex];
    Serial.println("SERVO TEST angle=" + String(angle));
    targetServo.write(angle);

    servoTestIndex++;
    if (servoTestIndex >= SERVO_TEST_COUNT) {
      servoTestIndex = 0;
    }

    lastServoTestMs = millis();
  }
}

void setupBle() {
  if (targetNo == 0) {
    deviceName = "Memsim Target-Empty";
  } else {
    deviceName = "Memsim Target-" + String(targetNo);
  }

  BLEDevice::init(deviceName.c_str());
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService* pService = pServer->createService(SERVICE_UUID);
  BLE2902* p2902Descriptor = new BLE2902();
  p2902Descriptor->setNotifications(true);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE
  );

  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->addDescriptor(p2902Descriptor);

  pService->start();

  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();
}

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(piezoPin, INPUT);
  pinMode(buzzer, OUTPUT);
  if (USE_STATUS_RGB_LEDS) {
    pinMode(kirmizi, OUTPUT);
    pinMode(mavi, OUTPUT);
    pinMode(yesil, OUTPUT);
    digitalWrite(kirmizi, HIGH);
    digitalWrite(mavi, HIGH);
    digitalWrite(yesil, HIGH);
  }

  digitalWrite(buzzer, LOW);

  targetServo.setPeriodHertz(50);
  targetServo.attach(servoPin, 500, 2500);
  targetServo.write(SERVO_TEST_ANGLES[0]);
  currentPosition = 1;
  lastServoMoveMs = millis();

  if (SERVO_TEST_MODE) {
    Serial.println("SERVO TEST MODE ACTIVE");
    Serial.println("LoRa/BLE bypassed. Set SERVO_TEST_MODE=false for normal node mode.");
    Serial.println("Servo pin=old RGB GREEN/GPIO" + String(servoPin));
    return;
  }

  SPI.begin(LoRa_SCK, LoRa_MISO, LoRa_MOSI, LoRa_nss);
  radio.setSpreadingFactor(10);
  radio.setPreambleLength(8);
  radio.setFrequency(433.5);
  radio.setBandwidth(125.0);
  radio.setCodingRate(5);
  radio.setCRC(true);

  Serial.print(F("[SX1262] Initializing ... "));
  int state = radio.begin();
  if (state == RADIOLIB_ERR_NONE) {
    Serial.println(F("success!"));
  } else {
    Serial.print(F("failed, code "));
    Serial.println(state);
    while (true) { delay(1000); }
  }

  radio.setPacketReceivedAction(setFlag);

  if (!EEPROM.begin(EEPROM_SIZE)) {
    Serial.println("failed to initialise EEPROM");
    while (true) { delay(1000); }
  }

  loadTargetNo();
  setupBle();

  // Optional boot indicator. Disabled by default because RGB pins are not used in this version.
  if (USE_STATUS_RGB_LEDS) {
    digitalWrite(kirmizi, LOW); delay(200); digitalWrite(kirmizi, HIGH);
    digitalWrite(mavi, LOW); delay(200); digitalWrite(mavi, HIGH);
    digitalWrite(yesil, LOW); delay(200); digitalWrite(yesil, HIGH);
  }

  // Announce node online
  sendData("HELLO;" + targetId);

  radio.startReceive();
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_14, 1);
}

void loop() {
  if (SERVO_TEST_MODE) {
    servoTestLoop();
    return;
  }

  readData();

  yeni_piezo = analogRead(piezoPin);

  bool piezoSpike = yeni_piezo > (eski_piezo + piezo_esik);
  bool afterServoSafe = millis() - lastServoMoveMs > ignorePiezoAfterServoMs;
  bool hitCooldownSafe = millis() - lastHitMs > hitCooldownMs;

  if (piezoSpike && afterServoSafe && hitCooldownSafe) {
    Serial.println("PZ;" + targetId);
    sendHit();
    lastHitMs = millis();
    delay(70);
  }

  eski_piezo = yeni_piezo;

  if (!inGame) {
    if (deviceConnected) {
      if (millisSendOk != 0 && millis() > millisSendOk) {
        ESP.restart();
      }
      if (USE_STATUS_RGB_LEDS) {
        digitalWrite(yesil, LOW);
        digitalWrite(kirmizi, HIGH);
      }
    } else if (targetNo == 0) {
      if (USE_STATUS_RGB_LEDS) {
        digitalWrite(yesil, HIGH);
        digitalWrite(kirmizi, LOW);
      }
    } else {
      if (USE_STATUS_RGB_LEDS) {
        digitalWrite(yesil, HIGH);
        digitalWrite(kirmizi, HIGH);
      }
    }
  }

  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}
