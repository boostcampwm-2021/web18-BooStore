import * as AWS from 'aws-sdk';
import { ClientConfiguration } from 'aws-sdk/clients/acm';
import * as fs from 'fs';
import * as path from 'path';

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const access_key = process.env.ACCESS_KEY;
const secret_key = process.env.SECRET_KEY;

const S3 = new AWS.S3({
    endpoint: endpoint.toString(),
    region: region,
    credentials: {
        accessKeyId : '8IHLGS4BFhIO6mJlgXYy',
        secretAccessKey: 'EelivPFIRLIJsQyh31MfUePpF2FlMtKn3uq7IAlY',
    }
});

const bucket_name = 'sample-bucket';


const create_bucket = async () => {

    await S3.createBucket({
        Bucket: bucket_name,
        CreateBucketConfiguration: {}
    }).promise()

};

export default create_bucket;


/*const upload = async () => {

    let object_name = __dirname+'/storage-test.txt';

    // upload file
    await S3.putObject({
        Bucket: 'boostore-storage',
        Key: object_name,
        ACL: 'public-read',
        // ACL을 지우면 전체공개가 되지 않습니다.
        Body: fs.createReadStream(object_name),
    }).promise();

};



export default upload;*/