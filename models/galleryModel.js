const db = require("../config/database");

exports.updateImageCaption = (imageId, caption) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE gallery_images SET caption = ? WHERE id = ?";

    db.query(sql, [caption, imageId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
