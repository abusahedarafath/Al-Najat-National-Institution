const HeroSlider = require("../models/HeroSlider");
const Notice = require("../models/Notice");
const News = require("../models/News");

exports.index = (req, res) => {

    HeroSlider.getActive((sliderErr, sliders) => {

        if (sliderErr) {
            console.error(sliderErr);
            sliders = [];
        }

        Notice.getLatest(5, (noticeErr, notices) => {

            if (noticeErr) {
                console.error(noticeErr);
                notices = [];
            }

            News.getLatest(5, (newsErr, news) => {

                if (newsErr) {
                    console.error(newsErr);
                    news = [];
                }

                res.render("home/index", {

                    title: "Home | Al-Najat National Institution",

                    sliders,

                    notices,

                    news

                });

            });

        });

    });

};
