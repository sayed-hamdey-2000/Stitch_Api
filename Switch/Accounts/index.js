import path from "path";
import axios from 'axios';
import { fileURLToPath } from 'url';
import fs from "fs/promises";
import { User } from '../../Database/Mongo/models.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiRoutes = [
    {
        status: true,
        author: global.author,
        data: [],
    }
];

const categorizedApis = {
    status: true,
    author: global.author,
    data: {},
};

const errorLogs = [];

async function loadRouters(directoryPath, version, app) {
    try {
        const filesAndDirs = await fs.readdir(directoryPath);

        const folders = [];
        for (const item of filesAndDirs) {
            const itemPath = path.join(directoryPath, item);
            const stats = await fs.stat(itemPath);

            if (stats.isDirectory()) {
                folders.push(item);
            }
        }

        const paths = folders.reduce((obj, folder) => {
            obj[folder] = path.join(directoryPath, folder);
            return obj;
        }, {});

        for (const [key, dirPath] of Object.entries(paths)) {
            const files = await fs.readdir(dirPath);

            for (const file of files) {
                if (file.endsWith('.js')) {
                    try {
                        const fileName = file.replace('.js', '');
                        const filePath = path.join(dirPath, file);
                        const routerModule = await import(filePath);
                        const router = routerModule.default;
                        //const metadata = routerModule.usedRouterKeys;

                        const metadata = Object.keys(routerModule).reduce((acc, key) => {
              if (key !== 'default') {
              Object.assign(acc, routerModule[key]);
               }
               return acc;
               }, {});

                        if (typeof router === 'function') {
                            const baseRoute = `/api/${version}/${key}`;
                            app.use(baseRoute, router);

                            if (router.stack) {
                                router.stack.forEach(layer => {
                                    if (layer.route && layer.route.path) {
                                        let fullUrl = `${baseRoute}${layer.route.path}`;
                                        const method = Object.keys(layer.route.methods)[0]?.toUpperCase() || "UNKNOWN";

                                        const routeData = {
          title: fileName,
          type: key,
          method: method,
          url: fullUrl,
          path: layer.route.path,
          file: path.join(dirPath, file),
          ...metadata,
          };

                                        categorizedApis.data[key] = categorizedApis.data[key] || { data: [] };
                                        categorizedApis.data[key].data.push(routeData);

                                        if (!apiRoutes[0].data.some(route => route.url === fullUrl)) {
                                            apiRoutes[0].data.push(routeData);
                                        }
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        errorLogs.push({ file: path.join(dirPath, file), error: error.message });
                        console.error(`Error loading ${file}:`, error.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading routers:', error.message);
    }
}

export async function setupDatabase(app) {
    const directoryPath = path.join(__dirname, '../../Accounts');
    
    app.use(async (req, res, next) => {
    
    if (!req.originalUrl.toLowerCase().includes('/api/v1') && !req.originalUrl.toLowerCase().includes('/api/v2')) return next();
    if (req.originalUrl.toLowerCase().includes('/api/v1/Auth')) return next();
    if (req.originalUrl.toLowerCase().includes('/api/v1/User/CreateApikey')) return next();    
        
    const apiKeyHeader = req.headers['apikey'];
    if (!apiKeyHeader) {
        return res.status(400).json({ status: false, message: 'Missing API Key' });
    }
/*
    let matchedApi = null;
    let section = null;

    for (const [sec, secData] of Object.entries(categorizedApis.data)) {
        const foundApi = secData.data.find(api => req.originalUrl.startsWith(api.url));
        if (foundApi) {
            matchedApi = foundApi;
            section = sec;
            break;
        }
    }

    if (!matchedApi) {
        return res.status(404).json({ status: false, message: 'API not found in catalog' });
    }

    const limitedUsage = parseInt(matchedApi.limited || 1); 
    const apiType = matchedApi.title;

    try {
        const user = await User.findOne({ 'apiKey.value': apiKeyHeader });
        if (!user) return res.status(401).json({ status: false, message: 'Invalid API Key' });

        if (user.limited < limitedUsage) {
            return res.status(403).json({ status: false, message: 'Usage limit exceeded' });
        }

        user.limited -= limitedUsage;
        user.usage.total += limitedUsage;
        user.usage.lastUse = new Date();

        const sectionUsage = user.usage.sections.get(section) || {
            usage: 0,
            lastUse: new Date(),
            api: new Map()
        };

        sectionUsage.usage += limitedUsage;
        sectionUsage.lastUse = new Date();

        const apiData = sectionUsage.api.get(apiType) || {
            type: apiType,
            usage: 0,
            lastUse: new Date(),
            lastRequest: req.originalUrl
        };

        apiData.usage += limitedUsage;
        apiData.lastUse = new Date();
        apiData.lastRequest = req.originalUrl;

        sectionUsage.api.set(apiType, apiData);
        user.usage.sections.set(section, sectionUsage);

        await user.save();
        req.user = user;
        
        next();
    } catch (err) {
        console.error('Middleware error:', err);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
    */
       next();
});

    await loadRouters(directoryPath, "v1", app);

    Object.keys(categorizedApis.data).forEach((key) => {
        app.get(`/api/v3/accounts/sections/${key}/api`, (req, res) => {
            const apisForCategory = categorizedApis.data[key].data.map(api => ({
                ...api,
                url: `${req.protocol}://${req.get('host')}${api.url}`,
            }));
            res.status(200).json({
                status: true,
                author: global.author,
                data: apisForCategory
            });
        });
    });

    app.get('/api/v3/accounts', (req, res) => {
        const fullApiRoutes = apiRoutes.map(route => ({
            status: route.status,
            author: route.author,
            data: route.data.map(api => ({
                ...api,
                url: `${req.protocol}://${req.get('host')}${api.url}`,
            })),
        }));
        res.status(200).json(fullApiRoutes);
    });

    app.get('/api/v3/accounts/sections', (req, res) => {
        const categorizedWithHost = Object.entries(categorizedApis.data).reduce(
            (result, [key, apis]) => {
                result[key] = apis.data.map(api => ({
                    ...api,
                    url: `${req.protocol}://${req.get('host')}${api.url}`,
                }));
                return result;
            },
            {}
        );
        res.status(200).json(categorizedWithHost);
    });

    app.get('/api/v3/accounts/errorlog', (req, res) => {
        res.status(200).json(errorLogs);
    });
}
