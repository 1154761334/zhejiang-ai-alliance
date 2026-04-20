export function maskSensitiveData(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (typeof data === "object") {
    const masked: any = {};

    const sensitiveFields = [
      "contact_phone",
      "contact_email",
      "contact_name",
      "internal_notes",
      "real_key_clients",
      "tech_maturity_score",
      "market_influence_score",
      "risk_level",
      "investigator",
    ];

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];

        if (sensitiveFields.includes(key) && value) {
          if (key === "contact_phone" && typeof value === "string") {
            masked[key] = value.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
          } else if (key === "contact_email" && typeof value === "string") {
            const atIndex = value.indexOf("@");
            if (atIndex > 0) {
              masked[key] = value.slice(0, 2) + "***" + value.slice(atIndex);
            } else {
              masked[key] = value;
            }
          } else {
            masked[key] = "[已脱敏]";
          }
        } else if (typeof value === "object" && value !== null) {
          masked[key] = maskSensitiveData(value);
        } else {
          masked[key] = value;
        }
      }
    }

    return masked;
  }

  return data;
}
