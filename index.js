// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

/**
 * Don't hard-code your credentials!
 * Create an IAM role for your EC2 instance instead.
 * For development an IAM role is not required for Cloud9
 */

// Set your region
AWS.config.region = 'us-east-1';

var db = new AWS.DynamoDB();
db.listTables(function(err, data) {
   if (err) {
      console.log(err, err.stack);  // an error occurred
   }
   else {
      console.log(data.TableNames);        // successful response 
      downloadData();
   }
});

function downloadData(){
   // Get JSON file from S3
   var s3 = new AWS.S3();
   var params = {Bucket: 'YOUR_BUCKET_NAME', Key: 'YOUR_FOLDER_NAME/YOUR_JSON_FILE'};
   s3.getObject(params, function(error, data) {
      if (error) {
         console.log(error); // error is Response.error
      } else {
         var dataJSON = JSON.parse(data.Body);
         console.log(JSON.stringify(dataJSON));
         writeDynamoDB(dataJSON);
      }
   });
};

function writeDynamoDB(dataJSON){
   // Write items from object to DynamoDB
   var params = { RequestItems: dataJSON };
   db.batchWriteItem(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else console.log(data); // sucessful response
      queryDynamoDB();
   });
}

function queryDynamoDB(){
   // Query DynamoDB table using JSON data
      var params = {
         TableName: 'test-table', /* required */
         IndexName: 'ProductCategory-Price-index',
         KeyConditionExpression: 'ProductCategory = :c AND Price <= :p',
         ExpressionAttributeValues: {
            ':c': { "S": "Bike" },
            ':p': { "N": "300" }
         }
   }
   db.query(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else console.log(data.Items); // successful response
   });
}
