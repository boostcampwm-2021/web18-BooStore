import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';

const S3 = new AWS.S3({
    endpoint: endpoint,
    region: region,
    credentials: {
        accessKeyId : process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    }
});

const bucket_name = process.env.S3_BUCKET_NAME;

const upload = async () => {

    const object_name = __dirname+'/storage-test.txt';

    await S3.upload({
        Bucket: bucket_name,
        Key: 'storage-test.txt',
        ACL: 'public-read',
        // ACL을 지우면 전체공개가 되지 않습니다.
        Body: fs.createReadStream(object_name),
    }).promise();

};



export default upload;