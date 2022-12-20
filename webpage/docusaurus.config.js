// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lightCodeTheme = require('prism-react-renderer/themes/github');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const title = 'azure functions decorators';

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: title,
    tagline: 'Spring / NestJS like decorators for your Azure functions.',
    url: 'https://your-docusaurus-test-site.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'NicolasBissig', // Usually your GitHub org/user name.
    projectName: 'azure-functions-decorators', // Usually your repo name.

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/NicolasBissig/azure-functions-decorators/tree/main/webpage/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: title,
                logo: {
                    alt: title,
                    src: 'img/logo.svg',
                },
                items: [
                    {
                        type: 'doc',
                        docId: 'overview',
                        position: 'left',
                        label: 'Documentation',
                    },
                    {
                        href: 'https://github.com/NicolasBissig/azure-functions-decorators',
                        label: 'GitHub',
                        position: 'right',
                    },
                    {
                        href: 'https://www.npmjs.com/package/azure-functions-decorators',
                        label: 'npm',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Docs',
                        items: [
                            {
                                label: 'Documentation',
                                to: '/docs/overview',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Stack Overflow',
                                href: 'https://stackoverflow.com/questions/tagged/azure-functions-decorators',
                            },
                            // {
                            //     label: 'Discord',
                            //     href: 'https://discordapp.com/invite/docusaurus',
                            // },
                            // {
                            //     label: 'Twitter',
                            //     href: 'https://twitter.com/docusaurus',
                            // },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: 'GitHub',
                                href: 'https://github.com/facebook/docusaurus',
                            },
                            {
                                label: 'npm',
                                href: 'https://www.npmjs.com/package/azure-functions-decorators',
                            },
                        ],
                    },
                ],
                copyright: `MIT License ${new Date().getFullYear()} Nicolas Bissig. Built with Docusaurus.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
