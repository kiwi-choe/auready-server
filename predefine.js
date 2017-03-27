
const _port = {
    httpPort: 3000,
    httpsPort: 3443
};

const _oauth2 = {
    // you can customize token_duration for each grant type and refreshable
    // (implicit grant type's token_refreshable must be always 'false' by spec
    type : {
        password: {
            name: "password",
            token_refreshable: true,
            token_duration: 3600 * 24 * 365
        }
    }
};

const _fcmServerKey = {
    key: 'AAAACVgPAgs:APA91bFP-ZHBMhBmH74D5SaMBkrQDug7B7Uy1keZZkwQzi0fSLiLXdoHU99HoGdG3R99bFngbRRDQa3Osgl3QglO-6HxxfFMNexKxrmNuK7o3RgTb72x4gDq2CARs0uinu_GOdmDLMLQ',
    senderId: 851140601460
};
const _test_instanceID = 'eoRdwykeO5I:APA91bHEoV7NqJp33KvDC4woUmllJJ_NmHlDF7j_lz8_X-YsucDBa27qhh5S_tlUEW_kZULUfIHTXCby4iTo06ayJ7pqyyr-lDA5KSPDjHXPMNE47CEQOLg38hD1_vQ5tl1qCdXUPQNR';

// local client info
const _trustedClientInfo = {
    name: 'localAccount',
    grantType: [
        _oauth2.type.password.name,
        _oauth2.type.password.token_refreshable
    ],
    clientId: 'tEYQAFiAAmLrS2Dl',
    clientSecret: 'YmE2LYTGKunlVW5OrKNlWF9KQZUZOHDy'
};

const _socialAuthInfo = {
    'google' : {
        'clientId': '40132084235-d35aomfismjre6uc5pg8uac6f1vd3ja8.apps.googleusercontent.com',
        'clientSecret': 'SPQkt1eQi5OF5dtryCy-Aqlc'
    }
};

const _authHeader = {
    basic: 'Basic dEVZUUFGaUFBbUxyUzJEbDpZbUUyTFlUR0t1bmxWVzVPcktObFdGOUtRWlVaT0hEeQ=='
};

module.exports = {
    port: _port,
    oauth2: _oauth2,
    fcmServerKey: _fcmServerKey,
    trustedClientInfo: _trustedClientInfo,
    socialAuthInfo: _socialAuthInfo,
    authHeader: _authHeader,
    test_instanceID: _test_instanceID
}