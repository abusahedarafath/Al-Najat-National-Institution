const RtseResult = require("../models/RtseResult");
const RtseCertificate = require("../models/RtseCertificate");
const generateCertificateQR = require("../utils/certificateQrGenerator");

class RtseCertificateService {

    static async generate(applicationId, host){

        const student =
            await RtseResult.getByApplication(applicationId);

        if(!student){

            throw new Error("Student result not found.");

        }

        const exists =
            await RtseCertificate.exists(applicationId);

        if(exists){

            return false;

        }

        let type = "Participation";

        if(student.overall_rank === 1){

            type = "Gold";

        }else if(student.overall_rank === 2){

            type = "Silver";

        }else if(student.overall_rank === 3){

            type = "Bronze";

        }else if(student.section_rank <= 10){

            type = "Merit";

        }

        const applicationYear =
            Number(student.application_year);

        if(!applicationYear){
            throw new Error(
                "RTSE application year is missing for this result."
            );
        }

        const year =
            String(applicationYear).slice(-2);

        const serial =
            String(applicationId).padStart(6,"0");

        const certificateNo =
            `RTC${year}${serial}`;

        const qrCode =
            await generateCertificateQR(

                certificateNo,

                `${host}/rtse/verify/certificate/${certificateNo}`

            );

        await RtseCertificate.generate({

            application_id:applicationId,

            certificate_no:certificateNo,

            certificate_type:type,

            issue_date:new Date(),

            qr_code:qrCode

        });

        return true;

    }

}

module.exports = RtseCertificateService;
