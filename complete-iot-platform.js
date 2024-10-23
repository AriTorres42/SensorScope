// AWS IoT Core Setup and Configuration
// File: aws-iot-setup.js
const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const iotData = new AWS.IotData({ endpoint: process.env.AWS_IOT_ENDPOINT });

// 1. Create a Thing Type
const createThingType = async () => {
  const params = {
    thingTypeName: 'SmartSensor',
    thingTypeProperties: {
      searchableAttributes: ['location', 'deviceModel'],
      thingTypeDescription: 'Smart IoT sensor for environmental monitoring'
    }
  };
  
  try {
    await iot.createThingType(params).promise();
    console.log('Thing Type created successfully');
  } catch (error) {
    console.error('Error creating thing type:', error);
  }
};

// 2. Create and Register a Thing
const createThing = async (thingName, attributes) => {
  const params = {
    thingName,
    thingTypeName: 'SmartSensor',
    attributePayload: {
      attributes,
      merge: true
    }
  };
  
  try {
    await iot.createThing(params).promise();
    console.log(`Thing ${thingName} created successfully`);
    
    // Generate certificates for the thing
    const certificates = await iot.createKeysAndCertificate({
      setAsActive: true
    }).promise();
    
    // Attach policy to certificate
    await iot.attachPolicy({
      policyName: 'SmartSensorPolicy',
      target: certificates.certificateArn
    }).promise();
    
    // Attach certificate to thing
    await iot.attachThingPrincipal({
      thingName,
      principal: certificates.certificateArn
    }).promise();
    
    return certificates;
  } catch (error) {
    console.error('Error creating thing:', error);
    throw error;
  }
};

// 3. Create IoT Policy
const createIoTPolicy = async () => {
  const policyDocument = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'iot:Connect',
          'iot:Publish',
          'iot:Subscribe',
          'iot:Receive'
        ],
        Resource: [
          `arn:aws:iot:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:topic/devices/*`,
          `arn:aws:iot:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:client/\${iot:ClientId}`
        ]
      }
    ]
  };
  
  const params = {
    policyName: 'SmartSensorPolicy',
    policyDocument: JSON.stringify(policyDocument)
  };
  
  try {
    await iot.createPolicy(params).promise();
    console.log('Policy created successfully');
  } catch (error) {
    console.error('Error creating policy:', error);
  }
};

// Lambda Function for Data Processing
// File: lambda-handler.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});

exports.handler = async (event) => {
  const deviceData = JSON.parse(event.body);
  
  // Store data in DynamoDB
  await storeDeviceData(deviceData);
  
  // Process alerts
  const alerts = processAlerts(deviceData);
  if (alerts.length > 0) {
    await storeAlerts(alerts);
    await notifySubscribers(alerts);
  }
  
  // Broadcast to WebSocket clients
  await broadcastUpdate(deviceData);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Data processed successfully' })
  };
};

// Store device data in DynamoDB
const storeDeviceData = async (data) => {
  const params = {
    TableName: 'DeviceData',
    Item: {
      deviceId: data.deviceId,
      timestamp: Date.now(),
      ...data
    }
  };
  
  await dynamoDB.put(params).promise();
};

// Process alerts based on thresholds
const processAlerts = (data) => {
  const alerts = [];
  
  if (data.temperature > 30) {
    alerts.push({
      type: 'HIGH_TEMPERATURE',
      deviceId: data.deviceId,
      value: data.temperature,
      timestamp: Date.now()
    });
  }
  
  if (data.humidity > 80) {
    alerts.push({
      type: 'HIGH_HUMIDITY',
      deviceId: data.deviceId,
      value: data.humidity,
      timestamp: Date.now()
    });
  }
  
  if (data.batteryLevel < 20) {
    alerts.push({
      type: 'LOW_BATTERY',
      deviceId: data.deviceId,
      value: data.batteryLevel,
      timestamp: Date.now()
    });
  }
  
  return alerts;
};
