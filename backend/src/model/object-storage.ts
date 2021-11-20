import * as AWS from 'aws-sdk';

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';

const S3 = new AWS.S3({
	endpoint: endpoint,
	region: region,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY,
		secretAccessKey: process.env.S3_SECRET_KEY,
	},
});

export default S3;
