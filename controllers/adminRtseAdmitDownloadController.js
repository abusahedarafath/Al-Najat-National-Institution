const RtseAdmitDownload =
  require("../models/RtseAdmitDownload");
const ArspAdmitDownload =
  require("../models/ArspAdmitDownload");

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

    // Isolated ARSP member admit-card download history.
    // Existing RTSE/Google history remains unchanged.
    const arspHistory =
      await ArspAdmitDownload.getAll();

    const arspStats = {
      total: arspHistory.length
    };

    return res.render(
      "admin/rtse/admit-download-history",
      {
        title:
          "RTSE Admit Card Download History",
        history: result.rows,
        pagination: result,
        stats,
        arspHistory,
        arspStats,
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


// =====================================================
// ARSP MEMBER — ADMIT CARD DOWNLOAD HISTORY
// Separate page with live all-field search.
// Existing RTSE history remains unchanged.
// =====================================================

exports.arspHistoryPage = async (req, res) => {
  try {
    const search =
      String(req.query.search || "").trim();

    const arspHistory =
      await ArspAdmitDownload.searchAll(search);

    return res.render(
      "admin/rtse/arsp-admit-download-history",
      {
        title:
          "ARSP Member Admit Card Download History",

        arspHistory,

        arspStats: {
          total: arspHistory.length
        },

        search
      }
    );
  } catch (error) {
    console.error(
      "ARSP admit download history page error:",
      error
    );

    return res.status(500).send(
      "Unable to load ARSP admit card download history."
    );
  }
};
