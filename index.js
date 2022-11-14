require('dotenv').config();
require("./mongoose");

const mqtt = require("mqtt");

const Task = require("./collection/backend_tasks_abhishek");


const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const client = mqtt.connect(
  process.env.MQTT_HOST,
  {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 1000,
  }
);
const Redis = require("ioredis");
const ioRedisClient = new Redis(process.env.REDIS_URL);

const topicName = "/add_ABHISHEK";
const express = require("express");


// connect to same client and subscribe to same topic name
client.on("connect", () => {
  client.subscribe(topicName, (err, granted) => {
    if (err) {
      console.log("error while connecting to client and subscribing to topic name",err);
    }
    console.log("connected with client",granted);
  });
});


client.on("message", async (topic, message, packet) => {
  console.log("message recieved>>>>>>",packet.payload.toString());
  const todoList = JSON.parse(packet.payload.toString());
  console.log(todoList);
  if (topic === topicName) {
    //redis logic
    let topicsAdded = await ioRedisClient.get("BACKEND_TASK_abhishek51");
    console.log("received from cache>>>>>", topicsAdded);
    let topicsAddedJSON = JSON.parse(topicsAdded);

    if (!topicsAddedJSON) {
      topicsAddedJSON = [];
    }

    if (topicsAddedJSON.length > 50) {
      try {
      await Task.insertMany(topicsAddedJSON);
      } catch(e){
        console.log(e);
      }
      topicsAddedJSON = [];
      
    }
    topicsAddedJSON.push(todoList);
    await ioRedisClient.set(
      "BACKEND_TASK_abhishek51",
      JSON.stringify(topicsAddedJSON)
    );
    console.log("message inserted in redis!!!!", topicsAddedJSON);

  }
});
client.on("packetsend", (packet) => {
  console.log(packet, "packet2");
});

const app = express();

app.get("/fetchAllTasks", async (req, res) => {
  try {
    let taskList = await Task.find();
    console.log("taskList", taskList);
    const cachedTasks = await ioRedisClient.get("BACKEND_TASK_abhishek51");
    console.log("cachedTasks", cachedTasks);
    if(cachedTasks) {
    taskList = [...taskList, ...JSON.parse(cachedTasks)];
    }
    return res.status(200).send(taskList);
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      msg: "Something went wrong!",
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server is up", process.env.PORT);
});
