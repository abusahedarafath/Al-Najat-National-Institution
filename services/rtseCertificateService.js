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

        // The existing certificate system is now exclusively
        // for Section Rank 11+ Appreciation Certificates.
        //
        // Ranks 1–10 are handled by the new certificate system.
        // The guard here prevents direct/accidental use of the
        // old generator for those students.

        const sectionRank =
            Number(student.section_rank);

        if(sectionRank < 11){

            throw new Error(
                "The existing certificate system is only for Section Rank 11+ Appreciation Certificates."
            );

        }

        const type = "Appreciation";

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

    // =====================================
    // Ensure New Certificate - Rank 1–10
    // =====================================

    static async ensureNewCertificate(applicationId, host){

        const student =
            await RtseResult.getByApplication(applicationId);

        if(!student){

            throw new Error("Student result not found.");

        }

        const sectionRank =
            Number(student.section_rank);

        if(
            !Number.isFinite(sectionRank) ||
            sectionRank < 1 ||
            sectionRank > 10
        ){

            throw new Error(
                "The new certificate system is only for Section Rank 1–10."
            );

        }

        let type;

        if(sectionRank === 1){

            type = "Gold";

        }else if(sectionRank === 2){

            type = "Silver";

        }else if(sectionRank === 3){

            type = "Bronze";

        }else{

            type = "Merit";

        }

        const existing =
            await RtseCertificate.getByApplication(
                applicationId
            );

        const applicationYear =
            Number(student.application_year);

        if(!applicationYear){

            throw new Error(
                "RTSE application year is missing for this result."
            );

        }

        const year =
            String(applicationYear).slice(-2);

        const certificateNo =
            existing?.certificate_no ||
            `RTC${year}${String(applicationId).padStart(6,"0")}`;

        if(existing?.qr_code){

            return existing;

        }

        const qrCode =
            await generateCertificateQR(
                certificateNo,
                `${host}/rtse/verify/certificate/${certificateNo}`
            );

        if(existing){

            await RtseCertificate.updateQrCode(
                applicationId,
                qrCode
            );

            return {
                ...existing,
                qr_code:qrCode
            };

        }

        await RtseCertificate.generate({

            application_id:applicationId,

            certificate_no:certificateNo,

            certificate_type:type,

            issue_date:new Date(),

            qr_code:qrCode

        });

        return await RtseCertificate.getByApplication(
            applicationId
        );

    }

}

module.exports = RtseCertificateService;
