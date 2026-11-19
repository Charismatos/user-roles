export class CookieHelper {
    /**
     * Retrieves a cookie value by name from `document.cookie`.
     *
     * @param {string} name
     * @returns {string | null}
     */
    static get(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const token = parts.pop()?.split(";").shift();
            return token !== undefined ? token : null;
        }
        return null;
    }

    /**
     * Builds standard JSON headers including the Laravel `X-XSRF-TOKEN`.
     *
     * @param {boolean} [includeContentType=true]
     * @returns {Record<string, string>}
     */
    static jsonHeaders(includeContentType = true) {
        /** @type {Record<string, string>} */
        const headers = {
            Accept: "application/json",
            "X-XSRF-TOKEN": CookieHelper.get("XSRF-TOKEN") || "",
        };
        if (includeContentType) {
            headers["Content-Type"] = "application/json";
        }
        return headers;
    }
}
