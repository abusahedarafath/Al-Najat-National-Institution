const RtseAdmitDownload =
  require("../models/RtseAdmitDownload");

exports.historyPage = async (req, res) => {
  try {
    const page =
      Number.parseInt(req.query.page, 10) || 1;

    const search =
      String(req.query.search || "").trim();

    const dateFrom =
      String(req.query.date_from || "").trim();

    const dateTo =
      String(req.query.date_to || "").trim();

    const result =
      await RtseAdmitDownload.getAdminHistory({
        page,
        limit: 25,
        search,
        dateFrom,
        dateTo
      });

    const stats =
      await RtseAdmitDownload.getAdminStats();

    return res.render(
      "admin/rtse/admit-download-history",
      {
        title:
          "RTSE Admit Card Download History",
        history: result.rows,
        pagination: result,
        stats,
        filters: {
          search,
          dateFrom,
          dateTo
        }
      }
    );
  } catch (error) {
    console.error(
      "RTSE admit download history error:",
      error
    );

    return res.status(500).send(
      "Unable to load RTSE admit card download history."
    );
  }
};
