const obfuscatedEmailAddress = String.fromCharCode(
    106, 111, 101, 99, 97, 115, 116, 108, 101, 57, 55, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109
);
const obfuscatedEmailMailto = `mailto:${obfuscatedEmailAddress}`;

type SocialDataType = {
    url: string;
    displayName: string;
};

type MetaDataType = {
    title: string;
    description: string;
    keywords: string;
};

const gitHubData: SocialDataType = {
    url: 'https://github.com/JoeCastle',
    displayName: 'JoeCastle',
};

const linkedInData: SocialDataType = {
    url: 'https://linkedin.com/in/joseph-castle-19170b188',
    displayName: 'Joseph Castle',
};

/** The number of project tiles to display in the projects section on the homepage. */
const numOfSummaryProjectsToDisplay: number = 8;

/** The number of technologies to display on each project tile in the projects section on the homepage. */
const numOfTechsToDisplayPerProject: number = 7;

const isDarkModeDefault: boolean = false;

const metaData: MetaDataType = {
    title: 'JoeBloggs | A blog by Joseph Castle',
    description: 'The personal blog of Joseph Castle, a Senior Full-Stack Software Developer writing about React, .NET, and SQL Server.',
    keywords:
        'joseph castle, joe castle, software developer blog, uk software engineer blog, full stack developer, senior software engineer, react developer, typescript developer, next.js blog, .NET developer, C# developer, SQL Server developer, junior developer advice, software engineering career tips',
};

const globals = {
    obfuscatedEmailAddress,
    obfuscatedEmailMailto,
    gitHubData,
    linkedInData,
    numOfSummaryProjectsToDisplay,
    numOfTechsToDisplayPerProject,
    isDarkModeDefault,
    metaData,
};

export default globals;
