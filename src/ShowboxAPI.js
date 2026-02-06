import CryptoJS from 'crypto-js';
import { customAlphabet } from 'nanoid';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const CONFIG = {
    BASE_URL: 'https://mbpapi.shegu.net/api/api_client/index/',
    APP_KEY: 'moviebox',
    APP_ID: 'com.tdo.showbox',
    IV: 'wEiphTn!',
    KEY: '123d6cedf626dy54233aa1w6',
    DEFAULTS: {
        CHILD_MODE: process.env.CHILD_MODE || '0',
        APP_VERSION: '11.5',
        LANG: 'en',
        PLATFORM: 'android',
        CHANNEL: 'Website',
        APPID: '27',
        VERSION: '129',
        MEDIUM: 'Website',
    },
};

const nanoid = customAlphabet('0123456789abcdef', 32);

class ShowboxAPI {
    constructor() {
        this.baseUrl = CONFIG.BASE_URL;
    }

    encrypt(data) {
        return CryptoJS.TripleDES.encrypt(
            data,
            CryptoJS.enc.Utf8.parse(CONFIG.KEY),
            { iv: CryptoJS.enc.Utf8.parse(CONFIG.IV) }
        ).toString();
    }

    generateVerify(encryptedData) {
        return CryptoJS.MD5(
            CryptoJS.MD5(CONFIG.APP_KEY).toString() + CONFIG.KEY + encryptedData
        ).toString();
    }

    getExpiryTimestamp() {
        return Math.floor(Date.now() / 1000 + 60 * 60 * 12);
    }

    async request(module, params = {}) {
        const requestData = {
            ...CONFIG.DEFAULTS,
            expired_date: this.getExpiryTimestamp(),
            module,
            ...params,
        };

        const encryptedData = this.encrypt(JSON.stringify(requestData));
        const body = JSON.stringify({
            app_key: CryptoJS.MD5(CONFIG.APP_KEY).toString(),
            verify: this.generateVerify(encryptedData),
            encrypt_data: encryptedData,
        });

        const formData = new URLSearchParams({
            data: Buffer.from(body).toString('base64'),
            appid: CONFIG.DEFAULTS.APPID,
            platform: CONFIG.DEFAULTS.PLATFORM,
            version: CONFIG.DEFAULTS.VERSION,
            medium: CONFIG.DEFAULTS.MEDIUM,
        });

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Platform': CONFIG.DEFAULTS.PLATFORM,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'okhttp/3.2.0',
            },
            body: `${formData.toString()}&token${nanoid()}`,
        });

        return response.json();
    }

    async search(title, type = 'all', page = 1, pagelimit = 20) {
        return this.request('Search5', { page, type, keyword: title, pagelimit }).then(data => {
            return data.data;
        });
    }

    async getMovieDetails(movieId) {
        return this.request('Movie_detail', { mid: movieId }).then(data => {
            return data.data;
        });
    }

    async getShowDetails(showId) {
        return this.request('TV_detail_v2', { tid: showId }).then(data => {
            return data.data;
        });
    }

    async getFebBoxId(id, type) {
        const targetUrl = `https://www.showbox.media/index/share_link?id=${id}&type=${type}`;
        const bypassUrl = `http://localhost:8000/html?url=${encodeURIComponent(targetUrl)}`;
        
        console.log(`\n🔄 Bypassing Cloudflare for: ${targetUrl}`);
        
        try {
            const response = await fetch(bypassUrl);
            if (!response.ok) {
                throw new Error(`Bypass server error: ${response.statusText}`);
            }
            
            let rawText = await response.text();
            
            try {
                // Check if the response is wrapped in HTML (Firefox plaintext view)
                if (rawText.trim().startsWith('<html') || rawText.trim().startsWith('<!DOCTYPE html>')) {
                    console.log("Received HTML wrapped response, attempting to extract JSON...");
                    // Try to find JSON inside <pre> tags or just the body text
                    const preMatch = rawText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
                    if (preMatch && preMatch[1]) {
                        rawText = preMatch[1];
                    } else {
                        // Fallback: try to strip tags
                        rawText = rawText.replace(/<[^>]*>/g, '');
                    }
                    // Decode HTML entities if needed (e.g. &quot; -> ")
                    // For now, let's assume it's simple JSON
                }

                const data = JSON.parse(rawText);
                if (data && data.data && data.data.link) {
                    const link = data.data.link;
                    console.log(`✅ Successfully retrieved link: ${link}`);
                    return link.split('/').pop();
                } else {
                    console.error("Invalid data structure received:", data);
                    return null;
                }
            } catch (e) {
                console.error("Failed to parse response from bypass server. Response might not be JSON:", rawText.substring(0, 200) + "...");
                return null;
            }

        } catch (error) {
            console.error("Error during automated bypass:", error);
            return null;
        }
    }

    async getAutocomplete(keyword , pagelimit = 5) {
        return this.request('Autocomplate2', { keyword, pagelimit: pagelimit }).then(data => {
            return data.data;
        });
    }
}

export default ShowboxAPI;