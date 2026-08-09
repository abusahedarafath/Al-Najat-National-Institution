const ArspMember = require("../models/ArspMember");
const ArspAccount = require("../models/ArspAccount");
const generateQRCode = require("../utils/qrGenerator");

class ArspRegistrationService {

    static async register(data, req) {


      // =====================================
// Prevent Duplicate Registration
// =====================================

const existing =
    await ArspMember.findDuplicate(

        data.mobile,

        data.email,

        data.identity_number

    );

if (existing) {

    throw new Error(
        "You are already registered with these details. Please login or contact ARSP."
    );

}





        // Generate Member ID
        const memberId =
            await ArspAccount.generateMemberId();

        // Generate Registration Number
        const registrationNo =
            "ARSP-REG-" +
            new Date().getFullYear() +
            "-" +
            memberId.replace("ARSP", "");


        // Save Member
        const result = await ArspMember.create({

            member_id: memberId,

            registration_no: registrationNo,

            full_name: data.full_name,

            father_name: data.father_name,

            mother_name: data.mother_name,

            gender: data.gender,

            dob: data.dob,

            blood_group: data.blood_group,

            occupation: data.occupation,

            nationality: data.nationality,

            identity_type: data.identity_type,

            identity_number: data.identity_number,

            identity_front:
                req.files?.identity_front?.[0]?.filename || "",

            identity_back:
                req.files?.identity_back?.[0]?.filename || "",

            mobile: data.mobile,

            email: data.email,

            address: data.address,

            district: data.district,

            state: data.state,

            pincode: data.pincode,
photo:
                req.files?.photo?.[0]?.filename || "",

            joining_date: data.joining_date,

            status: "Active",

           registration_source:
    data.registration_source ||
    "Self",

            approval_status:
                data.approval_status ||
                "Pending"

        });

        await ArspAccount.create(

    result.insertId,

    memberId,

    data.mobile

);

        // Generate QR Code
        const verifyURL =
            `${req.protocol}://${req.get("host")}/arsp/verify/${memberId}`;

        const qrFile =
            await generateQRCode(
                memberId,
                verifyURL
            );

        await ArspMember.updateQRCode(
            result.insertId,
            qrFile
        );

        // Fetch Complete Member
        const member =
            await ArspMember.getById(
                result.insertId
            );

        return {

            member,

            memberId,

            registrationNo,

            loginUrl:
                `${req.protocol}://${req.get("host")}/arsp/login`

        };

    }

}

module.exports = ArspRegistrationService;
