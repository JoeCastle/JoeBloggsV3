import globals from './globals';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';

/**
 * @deprecated This function should not be used.
 * @param imageIds
 */
const getGoogleImageExportURL = (imageId: string): string => {
    if (imageId !== '' && imageId !== null && imageId !== undefined) {
        //return "https://drive.google.com/uc?export=view&id=" + imageId;
        return 'https://drive.google.com/uc?id=' + imageId;
    }

    return '';
};

/**
 * @deprecated This function should not be used.
 * @param imageIds
 */
const getGoogleImageExportURLs = (imageIds: string[]): string[] => {
    let urls: string[] = [];

    if (imageIds.length > 0) {
        for (let i = 0; i < imageIds.length; i++) {
            let url = getGoogleImageExportURL(imageIds[i]);

            if (url !== '') {
                urls.push(url);
            }
        }
    }

    return urls;
};

/**
 * https://gomakethings.com/decoding-html-entities-with-vanilla-javascript/
 * @deprecated No longer required.
 * @param html
 * @returns
 */
const decodeHTML = (html: string): string => {
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    txt.id = 'temporary-textarea';
    var val = txt.value;
    txt.remove();
    return val;
};

/**
 * Opens the users default email program and populates it's subject and body.
 * @param subject Subject of the email.
 * @param body Body of the email.
 */
const navigateToEmail = (subject: string, body: string): void => {
    window.location.href = `mailto:${utils.decodeHTML(globals.obfuscatedEmailAddress)}?subject=${subject}&body=${body}`;
};

/**
 * Calculates my years of experience in the industry.
 * Yes I'm that lazy.
 * @returns Number of years.
 */
const getYearsOfExperience = (): number => {
    // (Started August 2019, but need to consider the additional year from placement)
    const startDate: Date = new Date('2018-08-01');

    const currentDate: Date = new Date();

    let yearsOfExperience: number = currentDate.getFullYear() - startDate.getFullYear();

    // Check if the current month and day is before your start date
    if (currentDate.getMonth() < startDate.getMonth() || (currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() < startDate.getDate())) {
        yearsOfExperience--;
    }

    return yearsOfExperience;
};

/**
 * Validates whether the form input is valid.
 * @param value The text input by the user.
 */
const isFormInputValid = (value: string): boolean => {
    return value.replace(' ', '') !== '';
};

/**
 * @deprecated This function should not be used.
 * @param slug
 * @param coverImage
 * @returns
 */
const getCoverImageUrl = (slug: string, coverImage: string) => `${SITE_URL}/posts/${slug}/${coverImage.replace('./', '')}`;

/**
 * Calculate the reading time for a blog post.
 * @param text Text of the blog post.
 * @returns String describing reading time.
 */
const calculateReadingTime = (text: string): string => {
    const wordsPerMinute = 200;
    const numberOfWords: number = text.trim().split(/\s+/).length;
    if (numberOfWords === 0) {
        return '0 min read';
    }
    const minutes: number = Math.ceil(numberOfWords / wordsPerMinute);
    return `${minutes} min read`;
};

const utils = {
    getGoogleImageExportURL,
    getGoogleImageExportURLs,
    decodeHTML,
    navigateToEmail,
    getYearsOfExperience,
    isFormInputValid,
    getCoverImageUrl,
    calculateReadingTime,
    SITE_URL
};

export default utils;
