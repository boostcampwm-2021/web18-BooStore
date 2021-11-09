import S3 from '../../model/object-storage';
import * as fs from 'fs';

const bucket_name = process.env.S3_BUCKET_NAME;

export const upload = async () => {

    const object_name = __dirname+'/storage-test.txt';

    await S3.upload({
        Bucket: bucket_name,
        Key: 'storage-test.txt',
        ACL: 'public-read',
        // ACL을 지우면 전체공개가 되지 않습니다.
        Body: fs.createReadStream(object_name),
    }).promise();
};
