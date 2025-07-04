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

/**
 * Formats the date as "12 Apr 2025"
 * @param date Date value to be formatted.
 * @returns Date as formatted string.
 */
const formatDate = (date: string): string =>
    new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

const truncateTextAtWordBoundary = (text: string, maxLength: number = 500): string => {
    if (text.length <= maxLength) return text;

    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace === -1) return truncated + '…';

    let clean = truncated.slice(0, lastSpace).trim();

    // Ensure we end with a period if it's missing
    if (!/[.?!]$/.test(clean)) {
        clean += '…';
    }

    return clean;
}


const utils = {
    getYearsOfExperience,
    calculateReadingTime,
    formatDate,
    truncateTextAtWordBoundary
};

export default utils;
