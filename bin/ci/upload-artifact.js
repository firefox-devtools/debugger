var s3 = require("s3");

console.log(Object.keys(process.env).join("  --  "))

var client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: process.env.ARTIFACTS_KEY,
    secretAccessKey: process.env.ARTIFACTS_SECRET
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  }
});

var params = {
  localFile: "./foo3.log",

  s3Params: {
    Bucket: "debugger.html",
    Key: "foo6.log",
    ACL: "public-read",
    // other options supported by putObject, except Body and ContentLength.
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  }
};

async function uploadFile(file) {

  const fileName = file.split("/").pop()
  const key = `mochitest/${fileName}`
  const url = `https://s3.amazonaws.com/debugger.html/${key}`
  return new Promise(resolve => {
    var uploader = client.uploadFile({
      localFile: file,

      s3Params: {
        Bucket: "debugger.html",
        Key: key,
        ACL: "public-read"
      }
    });

    uploader.on("error", function(err) {
      console.error("unable to upload ${file} ${key}:", err.stack);
    });

    // uploader.on("progress", function() {
    //   console.log(
    //     "progress",
    //     uploader.progressMd5Amount,
    //     uploader.progressAmount,
    //     uploader.progressTotal
    //   );
    // });

    uploader.on("end", function() {
      console.log(`Uploaded ${url}`);
      resolve(key);
    });
  })
}


async function uploadFiles(files) {
  for (file of files) {
    await uploadFile(file)
  }
}

const files = process.argv.slice(2)
uploadFiles(files)
