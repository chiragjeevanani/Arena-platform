const { cloudinary, configureCloudinary } = require('../config/cloudinary');

function uploadImageBuffer(buffer) {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'arena-crm', resource_type: 'auto' },
      (err, result) => {
        if (err) return reject(err);
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
}

module.exports = { uploadImageBuffer };
