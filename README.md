# OPCUASubscribe

|                |                                                                                       |
| -------------- | ------------------------------------------------------------------------------------- |
| Name           | OPC UA Subscribe                                                                      |
| Version        | v1.0.0                                                                                |
| Dockerhub Link | [weevenetwork/opcua-subscribe](https://hub.docker.com/r/weevenetwork/opcua-subscribe) |
| Authors        | Mesud Pasic                                                                           |

- [OPCUASubscribe](#OPCUASubscribe)
  - [Description](#description)
  - [Features](#features)
  - [Environment Variables](#environment-variables)
    - [Module Specific](#module-specific)
    - [Set by the weeve Agent on the edge-node](#set-by-the-weeve-agent-on-the-edge-node)
  - [Dependencies](#dependencies)

## Description

OPC UA Subscribe connects to OPC UA Server and listens for incoming data messages and forwards the payload to next module.

## Environment Variables

| Environment Variables | type | Description |
| --- | --- | --- |
| OPC_UA_SERVER | string | OPC UA Server endpoint |
| INITIAL_DELAY | integer | Initial delay for connection |
| MAX_RETRY | integer | Max retry for connection |
| REQUESTED_PUBLISHING_INTERVAL | integer | Subscription parameter requestedPublishingInterval |
| REQUESTED_LIFETIME_COUNT | integer | Subscription parameter requestedLifetimeCount |
| REQUESTED_MAX_KEEPALIVE_COUNT | integer | Subscription parameter requestedMaxKeepAliveCount |
| MAX_NOTIFICATIONS_PER_PUBLISH | integer | Subscription parameter maxNotificationsPerPublish |
| PRIORITY | integer | Subscription parameter priority |
| NODE_ID | string | Node ID to connect to |
| VARIABLE_LIST | string | Comma separated list of variables to read |
| SAMPLING_INTERVAL | integer | MonitoringParametersOptions parameter samplingInterval |
| QUEUE_SIZE | integer | MonitoringParametersOptions parameter queueSize |
| DISCARD_OLDEST | boolean | true/false to discard oldest, MonitoringParametersOptions parameter discardOldest |
| REQUIRES_AUTHENTICATION | string | Yes/No if connection needs authentication |
| OPC_UA_USERNAME | string | Username if authentication is required |
| OPC_UA_PASSWORD | string | Password if authentication is required |

### Module Specific

### Set by the weeve Agent on the edge-node

| Environment Variables | type   | Description               |
| --------------------- | ------ | ------------------------- |
| MODULE_NAME           | string | Name of the module        |
| INGRESS_HOST          | string | Host where app is running |
| INGRESS_PORT          | string | Port where app is running |

## Dependencies

```js
"dependencies": {
    "express": "^4.17.3",
    "express-winston": "^4.2.0",
    "node-fetch": "^2.6.1",
    "node-opcua": "^2.71.0"
}
```
