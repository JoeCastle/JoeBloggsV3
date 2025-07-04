import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM doesn't have __dirname natively
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to update the "APP_VERSION_DATE" value in .env.local
const updateEnvLocalVersionDate = async () => {
    try {
        const envLocalPath = path.join(__dirname, '.env.local');
        const envLocalContent = await fs.readFile(envLocalPath, 'utf-8');

        const pattern = /^APP_VERSION_DATE=(.*)$/m;
        const updatedEnvLocalContent = envLocalContent.replace(pattern, `NEXT_PUBLIC_APP_VERSION_DATE=${Date.now()}`);

        // Local
        await fs.writeFile(envLocalPath, updatedEnvLocalContent, 'utf-8');
        console.log('Updated .env.local NEXT_PUBLIC_APP_VERSION_DATE');

        // env
        const envPath = path.join(__dirname, '.env');
        await fs.writeFile(envPath, updatedEnvLocalContent, 'utf-8');
        console.log('Updated .env NEXT_PUBLIC_APP_VERSION_DATE');

        // prod
        const prodPath = path.join(__dirname, '.env');
        await fs.writeFile(prodPath, updatedEnvLocalContent, 'utf-8');
        console.log('Updated .env.production NEXT_PUBLIC_APP_VERSION_DATE');
    } catch (error) {
        console.error('Error updating .env.local or .env:', error);
    }
};

updateEnvLocalVersionDate();
