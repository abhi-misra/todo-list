//publisher.js 

require('dotenv').config();
const args = process.argv;
const mqtt = require('mqtt');

//the client id is used by the MQTT broker to keep track of clients and and their state
const clientId = 'mqttjs_' + Math.random().toString(8).substr(2, 4);

const client = mqtt.connect(process.env.MQTT_HOST, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 1000,
}) ;

const topicName = '/add_ABHISHEK' 

client.on("connect",function(connack){   
   console.log("client connected", connack); 
    // on client connection publish messages to the topic on the server/broker
    const name = args[2];
    const description = args[3];
    const payload = {"name": name, "description": description};
    client.publish(topicName, JSON.stringify(payload), {qos: 1, retain: false}, (PacketCallback, err) => { 

      if(err) { 
          console.log(err, 'MQTT publish packet') 
      } 
  }) 

  //assuming messages comes in every 3 seconds to our server and we need to publish or process these messages 
  setInterval(() => console.log("Message published"), 3000); 
}) 


client.on("error", function(err) { 
    console.log("Error: " + err) 
    if(err.code == "ENOTFOUND") { 
        console.log("Network error, make sure you have an active internet connection") 
    } 
}) 

client.on("close", function() { 
    console.log("Connection closed by client") 
}) 

client.on("reconnect", function() { 
    console.log("Client trying a reconnection") 
}) 

client.on("offline", function() { 
    console.log("Client is currently offline") 
})  