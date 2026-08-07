const ActivityLog = require("../models/activityLogModel");

module.exports = async function(req,module,action){

    if(!req.session.user) return;

    await ActivityLog.create({

        user_id:req.session.user.id,

        username:req.session.user.username,

        role:req.session.user.role,

        module,

        action,

        ip_address:req.ip

    });

};
