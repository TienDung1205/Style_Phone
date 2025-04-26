module.exports.index = async (req, res) => {
    try {
        res.render("client/pages/about/index.pug", {
            pageTitle: "Giới thiệu",
        });
    } catch (error) {
        res.redirect("/");
    }
}