const fs = require("fs");
const path = require("path");

const Gallery = require("../models/Gallery");

exports.index = async (req, res) => {
    try {
        const albums = await Gallery.getAllAlbums();

        res.render("admin/gallery/index", {
            pageTitle: "Gallery",
            albums
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to load gallery.");
        res.redirect("/admin/dashboard");
    }
};

exports.createPage = (req, res) => {
    res.render("admin/gallery/create", {
        pageTitle: "Create Album"
    });
};


exports.store = async (req, res) => {
    try {
        await Gallery.createAlbum({
            title: req.body.title,
            description: req.body.description,
            cover_image: req.file ? req.file.filename : "",
            status: req.body.status
        });

        req.flash("success", "Album created successfully.");
        res.redirect("/admin/gallery");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to create album.");
        res.redirect("/admin/gallery/create");
    }
};

exports.editPage = async (req, res) => {
    try {
        const result = await Gallery.getAlbumById(req.params.id);

        if (!result.length) {
            req.flash("error", "Album not found.");
            return res.redirect("/admin/gallery");
        }

        res.render("admin/gallery/edit", {
            pageTitle: "Edit Album",
            album: result[0]
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to load album.");
        res.redirect("/admin/gallery");
    }
};

exports.update = async (req, res) => {
    try {
        const result = await Gallery.getAlbumById(req.params.id);

        if (!result.length) {
            req.flash("error", "Album not found.");
            return res.redirect("/admin/gallery");
        }

        const album = result[0];

        await Gallery.updateAlbum(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            cover_image: req.file ? req.file.filename : album.cover_image,
            status: req.body.status
        });

        req.flash("success", "Album updated successfully.");
        res.redirect("/admin/gallery");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update album.");
        res.redirect("/admin/gallery");
    }
};

exports.delete = async (req, res) => {
    try {
        await Gallery.deleteAlbum(req.params.id);

        req.flash("success", "Album deleted successfully.");
        res.redirect("/admin/gallery");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete album.");
        res.redirect("/admin/gallery");
    }
};






exports.imagesPage = async (req, res) => {
    try {
        const albumResult = await Gallery.getAlbumById(req.params.id);

        if (!albumResult.length) {
            req.flash("error", "Album not found.");
            return res.redirect("/admin/gallery");
        }

        const images = await Gallery.getImages(req.params.id);

        res.render("admin/gallery/images", {
            pageTitle: "Gallery Images",
            album: albumResult[0],
            images
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to load images.");
        res.redirect("/admin/gallery");
    }
};

exports.uploadImages = async (req, res) => {
    try {
        const albumId = req.params.id;

        if (!req.files || req.files.length === 0) {
            req.flash("error", "Please select at least one image.");
            return res.redirect(`/admin/gallery/${albumId}/images`);
        }

        for (const file of req.files) {
            await Gallery.addImage({
                album_id: albumId,
                image: file.filename,
                caption: ""
            });
        }

        req.flash("success", "Images uploaded successfully.");
        res.redirect(`/admin/gallery/${albumId}/images`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to upload images.");
        res.redirect(`/admin/gallery/${req.params.id}/images`);
    }
};






exports.deleteImage = async (req, res) => {
    try {
        const imageResult = await Gallery.getImageById(req.params.imageId);

        if (!imageResult.length) {
            req.flash("error", "Image not found.");
            return res.redirect("back");
        }

        const image = imageResult[0];

        const imagePath = path.join(
            __dirname,
            "../public/uploads/gallery",
            image.image
        );

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Gallery.deleteImage(req.params.imageId);

        req.flash("success", "Image deleted successfully.");
        res.redirect(`/admin/gallery/${image.album_id}/images`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete image.");
        res.redirect("back");
    }
};

exports.updateImageCaption = async (req, res) => {
    try {
        await Gallery.updateImageCaption(
            req.params.imageId,
            req.body.caption
        );

        req.flash("success", "Caption updated successfully.");
        res.redirect(`/admin/gallery/${req.params.albumId}/images`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update caption.");
        res.redirect(`/admin/gallery/${req.params.albumId}/images`);
    }
};
