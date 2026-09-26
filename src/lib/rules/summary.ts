import type { Lang, RuleMatch } from "@/types";
import { formatDate, formatINR } from "@/lib/core/format";

export function rightsSummary(match: RuleMatch, lang: Lang): string {
  if (!match.claimable) {
    switch (lang) {
      case "hi":
        return "इस मामले पर कोई विशेष कानूनी नियम लागू नहीं होता है। हम कंपनी से आधिकारिक शिकायत नंबर और समाधान की तारीख मांगेंगे।";
      case "kn":
        return "ಈ ಪ್ರಕರಣಕ್ಕೆ ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಶಾಸನಬದ್ಧ ನಿಯಮ ಅನ್ವಯಿಸುವುದಿಲ್ಲ. ನಾವು ಕಂಪನಿಯಿಂದ ಅಧಿಕೃತ ದೂರು ಸಂಖ್ಯೆ ಮತ್ತು ಪರಿಹಾರದ ದಿನಾಂಕವನ್ನು ಕೇಳುತ್ತೇವೆ.";
      case "en":
      default:
        return "No specific statutory rule applies to this case. We will ask the company for an official complaint number and expected resolution date.";
    }
  }

  const due = match.deadline ? formatDate(match.deadline) : "";
  const totalStake = formatINR(match.totalAtStakePaise);
  const comp = formatINR(match.compensationPaise);

  if (match.ruleId === "R1") {
    if (match.daysLate > 0) {
      const daysText = `${match.daysLate} day${match.daysLate === 1 ? "" : "s"}`;
      switch (lang) {
        case "hi":
          return `आरबीआई नियमों के अनुसार, आपके विफल यूपीआई का पैसा ${due} (T+1) तक वापस आना चाहिए था। यह ${match.daysLate} दिन देर हो चुका है, इसलिए ${comp} मुआवजा बनता है और कुल दावा ${totalStake} का है।`;
        case "kn":
          return `ಆರ್‌ಬಿಐ ನಿಯಮಗಳ ಪ್ರಕಾರ, ವಿಫಲವಾದ ಯುಪಿಐ ಹಣವು ${due} (T+1) ಒಳಗೆ ಮರಳಬೇಕಿತ್ತು. ಇದು ${match.daysLate} ದಿನ ತಡವಾಗಿದ್ದು, ${comp} ಪರಿಹಾರ ಬಾಕಿ ಇದೆ ಮತ್ತು ಒಟ್ಟು ಮೊತ್ತ ${totalStake} ಆಗಿದೆ.`;
        case "en":
        default:
          return `Under RBI rules, your failed UPI debit was due by ${due} (T+1). It is ${daysText} late, so ${comp} compensation is owed, making ${totalStake} total at stake.`;
      }
    }
    switch (lang) {
      case "hi":
        return `आरबीआई नियमों के अनुसार, आपके विफल यूपीआई का पैसा ${due} (T+1) तक वापस आ जाना चाहिए। देरी होने पर प्रतिदिन ₹100 का मुआवजा मिलेगा।`;
      case "kn":
        return `ಆರ್‌ಬಿಐ ನಿಯಮಗಳ ಪ್ರಕಾರ, ನಿಮ್ಮ ವಿಫಲವಾದ ಯುಪಿಐ ಹಣವು ${due} (T+1) ಒಳಗೆ ಮರಳಬೇಕು. ತಡವಾದರೆ ದಿನಕ್ಕೆ ₹100 ರಂತೆ ಪರಿಹಾರ ಅನ್ವಯಿಸುತ್ತದೆ.`;
      case "en":
      default:
        return `Under RBI rules, your failed UPI debit must be reversed by ${due} (T+1). If delayed, statutory compensation of ₹100 per day will apply.`;
    }
  }

  if (match.ruleId === "R2") {
    if (match.daysLate > 0) {
      const daysText = `${match.daysLate} day${match.daysLate === 1 ? "" : "s"}`;
      switch (lang) {
        case "hi":
          return `ई-कॉमर्स नियम 2020 के तहत, आपके ${totalStake} के रिफंड का समाधान ${due} तक होना चाहिए था। यह ${match.daysLate} दिन overdue हो चुका है।`;
        case "kn":
          return `ಇ-ಕಾಮರ್ಸ್ ನಿಯಮಗಳು 2020 ರ ಅಡಿಯಲ್ಲಿ, ನಿಮ್ಮ ${totalStake} ಮರುಪಾವತಿಯನ್ನು ${due} ಒಳಗೆ ಪರಿಹರಿಸಬೇಕಿತ್ತು. ಇದು ${match.daysLate} ದಿನ ತಡವಾಗಿದೆ.`;
        case "en":
        default:
          return `Under the E-Commerce Rules 2020, your refund of ${totalStake} had to be resolved by ${due}. It is ${daysText} overdue.`;
      }
    }
    switch (lang) {
      case "hi":
        return `ई-कॉमर्स नियम 2020 के तहत, कंपनी को आपके ${totalStake} के रिफंड का समाधान ${due} तक करना होगा।`;
      case "kn":
        return `ಇ-ಕಾಮರ್ಸ್ ನಿಯಮಗಳು 2020 ರ ಅಡಿಯಲ್ಲಿ, ಕಂಪನಿಯು ನಿಮ್ಮ ${totalStake} ಮರುಪಾವತಿಯನ್ನು ${due} ಒಳಗೆ ಪರಿಹರಿಸಬೇಕು.`;
      case "en":
      default:
        return `Under the E-Commerce Rules 2020, the company must resolve your refund of ${totalStake} by ${due}.`;
    }
  }

  // Generic fallback for any other verified rule
  switch (lang) {
    case "hi":
      return `नियमों के तहत, आपके ${totalStake} के विवाद का समाधान ${due || "तय समय"} तक होना चाहिए।`;
    case "kn":
      return `ನಿಯಮಗಳ ಪ್ರಕಾರ, ನಿಮ್ಮ ${totalStake} ವಿವಾದವನ್ನು ${due || "ನಿಗದಿತ ಸಮಯ"} ಒಳಗೆ ಪರಿಹರಿಸಬೇಕು.`;
    case "en":
    default:
      return `Under statutory rules, your dispute of ${totalStake} was due by ${due || "the statutory deadline"}.`;
  }
}
