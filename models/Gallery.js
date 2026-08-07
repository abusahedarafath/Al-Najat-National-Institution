const db = require("../config/database");

class Gallery {

    // ==========================
    // Albums
    // ==========================

    static async getAllAlbums() {
        const [rows] = await db.query(
            "SELECT * FROM gallery_albums ORDER BY id DESC"
        );
        return rows;
    }

    static async getActiveAlbums() {
        const [rows] = await db.query(
            "SELECT * FROM gallery_albums WHERE status='Active' ORDER BY id DESC"
        );
        return rows;
    }

    static async getAlbumById(id) {
        const [rows] = await db.query(
            "SELECT * FROM gallery_albums WHERE id=?",
            [id]
        );
        return rows;
    }

    static async createAlbum(data) {
        await db.query(
            `INSERT INTO gallery_albums
            (title, description, cover_image, status)
            VALUES (?, ?, ?, ?)`,
            [
                data.title,
                data.description,
                data.cover_image,
                data.status
            ]
        );
    }

    static async updateAlbum(id, data) {
        await db.query(
            `UPDATE gallery_albums
             SET title=?,
                 description=?,
                 cover_image=?,
                 status=?
             WHERE id=?`,
            [
                data.title,
                data.description,
                data.cover_image,
                data.status,
                id
            ]
        );
    }

    static async deleteAlbum(id) {
        await db.query(
            "DELETE FROM gallery_albums WHERE id=?",
            [id]
        );
    }



    // ==========================
    // Images
    // ==========================

    static async getImages(albumId) {
        const [rows] = await db.query(
            "SELECT * FROM gallery_images WHERE album_id=? ORDER BY id DESC",
            [albumId]
        );
        return rows;
    }

    static async getImageById(id) {
        const [rows] = await db.query(
            "SELECT * FROM gallery_images WHERE id=?",
            [id]
        );
        return rows;
    }

    static async addImage(data) {
        await db.query(
            `INSERT INTO gallery_images
            (album_id, image, caption)
            VALUES (?, ?, ?)`,
            [
                data.album_id,
                data.image,
                data.caption
            ]
        );
    }

    static async updateImageCaption(id, caption) {
        await db.query(
            "UPDATE gallery_images SET caption=? WHERE id=?",
            [caption, id]
        );
    }

    static async deleteImage(id) {
        await db.query(
            "DELETE FROM gallery_images WHERE id=?",
            [id]
        );
    }


}

module.exports = Gallery;
