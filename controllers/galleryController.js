const Gallery = require("../models/Gallery");

// =====================================
// Gallery Home
// =====================================

exports.index = async (req, res) => {

    try {

        const albums = await Gallery.getActiveAlbums();

        res.render("gallery/index", {
            title: "Gallery",
            albums
        });

    } catch (err) {

        console.error(err);

        res.render("gallery/index", {
            title: "Gallery",
            albums: []
        });

    }

};

// =====================================
// Gallery Album
// =====================================

exports.show = async (req, res) => {

    try {

        const albumResult = await Gallery.getAlbumById(req.params.id);

        if (!albumResult || albumResult.length === 0) {
            return res.redirect("/gallery");
        }

        const images = await Gallery.getImages(req.params.id);

        res.render("gallery/show", {

            title: albumResult[0].title,

            album: albumResult[0],

            images

        });

    } catch (err) {

        console.error(err);

        res.redirect("/gallery");

    }

};
