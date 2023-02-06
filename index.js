const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const docClient = new AWS.DynamoDB.DocumentClient();

// eslint-disable-next-line
const { config } = require('/tmp/config');

exports.getAll = async (params) => {
  let result; let count = 0; let
    ExclusiveStartKey;
  do {
    // eslint-disable-next-line no-await-in-loop
    result = await docClient.query({
      TableName: params.TableName,
      Select: params.Select,
      ExclusiveStartKey,
      Limit: 1000,
      FilterExpression: params.FilterExpression,
      KeyConditionExpression: params.KeyConditionExpression,
      ExpressionAttributeValues: params.ExpressionAttributeValues,
    }).promise();
    ExclusiveStartKey = result.LastEvaluatedKey;
    count += result.Count;
  } while (result.LastEvaluatedKey);

  return count;
};

exports.getAllCounts = async (params) => {
  let result; let count = 0; let
    ExclusiveStartKey;
  do {
    // eslint-disable-next-line no-await-in-loop
    result = await docClient.query({
      TableName: params.TableName,
      Select: params.Select,
      ExclusiveStartKey,
      Limit: 1000,
      KeyConditionExpression: params.KeyConditionExpression,
      ExpressionAttributeValues: params.ExpressionAttributeValues,
    }).promise();
    ExclusiveStartKey = result.LastEvaluatedKey;
    count += result.Count;
  } while (result.LastEvaluatedKey);

  return count;
};

exports.callFirestore = async (sendData, time, allCounts) => {
    try {
      const {
        action_id: actionId, actionBy,
      } = sendData.Item;
      const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      let timeStamp = today.getTime();
      if (time === 'hour') {
        timeStamp = today.getTime() - (1000 * 60 * 60);
      } else if (time === 'day') {
        timeStamp = today.getTime() - (1000 * 60 * 60 * 24);
      } else if (time === 'week') {
        timeStamp = today.getTime() - (1000 * 60 * 60 * 24 * 7);
      } else if (time === 'month') {
        timeStamp = today.getTime() - (1000 * 60 * 60 * 24 * 30);
      }
      if (allCounts) {
        const paramsAll = {
          Select: 'COUNT',
          KeyConditionExpression: 'action_id = :a and cts > :b',
          ExpressionAttributeValues: {
            ':a': actionId,
            ':b': timeStamp,
          },
          TableName: config.dynamoDB.actionLogTable,
        };
        try {
          const dataDynamoAll = await this.getAllCounts(paramsAll);
          console.log(dataDynamoAll);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
  
      if (KeyConditionExpression) {
        const paramsStaff = {
          Select: 'COUNT',
          KeyConditionExpression: 'action_id = :a and cts > :b',
          FilterExpression: 'actionBy = :c',
          ExpressionAttributeValues: {
            ':a': actionId,
            ':b': timeStamp,
            ':c': actionBy,
          },
          TableName: config.dynamoDB.actionLogTable,
        };
        try {
          const dataDynamoStaff = await this.getAll(paramsStaff);
          console.log(dataDynamoStaff);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
      return {
        status: true,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error.message);
      return {
        status: false,
      };
    }
  };