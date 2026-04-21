const { uploadImageBuffer } = require('../services/cloudinaryUpload');

async function uploadArenaImage(req, res) {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'File is required (field name: file)' });
  }

  const result = await uploadImageBuffer(req.file.buffer);
  return res.json({
    url: result.url,
    publicId: result.publicId,
  });
}

module.exports = { uploadArenaImage };
