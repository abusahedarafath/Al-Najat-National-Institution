const HeroSlider = require("../models/HeroSlider");

exports.index = (req, res) => {
    HeroSlider.getActive((err, sliders) => {

        if (err) {
            console.error(err);

            return res.render("home/index", {
                title: "Home | Al-Najat National Institution",
                sliders: []
            });
        }

        res.render("home/index", {
            title: "Home | Al-Najat National Institution",
            sliders: sliders
        });

    });
};
