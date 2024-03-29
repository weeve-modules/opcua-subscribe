const {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
  ClientSubscription,
  TimestampsToReturn,
  ClientMonitoredItem,
  UserTokenType,
} = require('node-opcua')

const fetch = require('node-fetch')
const {
  MAX_RETRY,
  REQUESTED_PUBLISHING_INTERVAL,
  REQUESTED_LIFETIME_COUNT,
  REQUESTED_MAX_KEEPALIVE_COUNT,
  MAX_NOTIFICATIONS_PER_PUBLISH,
  PRIORITY,
  NODE_ID,
  VARIABLE_LIST,
  SAMPLING_INTERVAL,
  QUEUE_SIZE,
  DISCARD_OLDEST,
  EGRESS_URLS,
  MODULE_NAME,
  OPC_UA_SERVER,
  OPC_UA_USERNAME,
  OPC_UA_PASSWORD,
} = require('./config')

const connectionStrategy = {
  maxRetry: MAX_RETRY,
}

const options = {
  /* Replacing all non-alphanumeric characters with empty string. */

  applicationName: MODULE_NAME.replace(/[^a-zA-Z0-9]/g, ''),
  connectionStrategy: connectionStrategy,
  securityMode: MessageSecurityMode.None,
  securityPolicy: SecurityPolicy.None,
  endpointMustExist: false,
}

const opcuaSubscribe = async () => {
  try {
    const client = OPCUAClient.create(options)
    await client.connect(OPC_UA_SERVER)
    // we might need to specify encryptionAlgorithm and policyId as well in future, also for certificate authentication we need storage of certificates in order to use it
    /*
      for example:
      let userIdentity = {
          type: UserTokenType.Certificate,
          certificateData: fs.readFileSync('./user-certificates/file.pem'),
          privateKey: fs.readFileSync('./user-certificates/key.pem','utf8')
      }
    */
    const userIdentity = { type: UserTokenType.UserName, userName: OPC_UA_USERNAME, password: OPC_UA_PASSWORD }
    const session =
      OPC_UA_USERNAME && OPC_UA_PASSWORD ? await client.createSession(userIdentity) : await client.createSession()

    const subscription = ClientSubscription.create(session, {
      requestedPublishingInterval: REQUESTED_PUBLISHING_INTERVAL,
      requestedLifetimeCount: REQUESTED_LIFETIME_COUNT,
      requestedMaxKeepAliveCount: REQUESTED_MAX_KEEPALIVE_COUNT,
      maxNotificationsPerPublish: MAX_NOTIFICATIONS_PER_PUBLISH,
      publishingEnabled: true,
      priority: PRIORITY,
    })
    subscription
      .on('started', function () {
        console.log(`subscription started => subscriptionId: ${subscription.subscriptionId}`)
      })
      .on('keepalive', function () {
        console.log('keepalive')
      })
      .on('terminated', function () {
        console.log('terminated')
      })
    const vars = VARIABLE_LIST.split(',')

    for (let i = 0; i < vars.length; i++) {
      if (vars[i] !== '') monitorVariable(subscription, vars[i])
    }
    // await session.close()
  } catch (e) {
    console.log(`Failed to create session with OPC UA server ${OPC_UA_SERVER}, error:  ${e}`)
  }
}
/* const timeout = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
} */

const monitorVariable = async (subscription, variableName) => {
  // install monitored item
  console.log(`Monitoring ns=${NODE_ID};s=${variableName}`)

  const itemToMonitor = {
    nodeId: `ns=${NODE_ID};s=${variableName}`,
    attributeId: AttributeIds.Value,
  }
  const parameters = {
    samplingInterval: SAMPLING_INTERVAL,
    discardOldest: DISCARD_OLDEST,
    queueSize: QUEUE_SIZE,
  }
  const monitoredItem = ClientMonitoredItem.create(subscription, itemToMonitor, parameters, TimestampsToReturn.Both)
  monitoredItem.on('changed', async dataValue => {
    await send(variableName, dataValue)
  })
}

const send = async (name, value) => {
  if (EGRESS_URLS) {
    const eUrls = EGRESS_URLS.replace(/ /g, '')
    const urls = eUrls.split(',')
    urls.forEach(async url => {
      if (url) {
        try {
          const callRes = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              timestamp: Date.now(),
              value,
              name,
            }),
          })
          if (!callRes.ok) {
            console.error(`Error passing response data to ${url}, status: ${callRes.status}`)
          }
        } catch (e) {
          console.error(`Error making request to: ${url}, error: ${e.message}`)
        }
      }
    })
  } else {
    console.error('EGRESS_URLS is not provided.')
  }
}

opcuaSubscribe()
