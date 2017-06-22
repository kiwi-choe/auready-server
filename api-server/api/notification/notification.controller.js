const User = require(__appbase_dirname + '/api-server/api/user/user.controller');
const TokenController = require(__appbase_dirname + '/models/token.controller');

const FCM = require('fcm-push');
const fcmServerKey = require(__appbase_dirname + '/predefine').fcmServerKey.key;
const fcm = new FCM(fcmServerKey);

const TYPES = require('../notification/notificationUtils').types;

exports.register = (req, res) => {
    console.log('post /notifications/:instanceId');
    const instanceId = req.params.instanceId;
    User.putInstanceId(req.user._id, instanceId, (err, isUpdated) => {
        if (err) {
            console.log('updateInstanceId is failed');
            return res.sendStatus(400);
        }
        if (!isUpdated) {
            console.log('update fail');
            return res.sendStatus(400);
        }
        return res.sendStatus(201);
    });
};

exports.auready = (req, res) => {
    console.log('get /notifications/auready');

    const toUserId = req.params.userId;
    const fromUser = {
        id: req.user.id,
        name: req.user.name
    };
    _sendNotification(TYPES.auready, toUserId, fromUser, isSuccess => {
        if (!isSuccess) {
            console.log('send notification failed');
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    });
};

const _checkToUserIsLoggedIn = (toUserId, done) => {
    TokenController.findByUserId(toUserId, (err, token) => {
        if(err) {
            console.log('toUser is not logged in user');
            return done(false);
        }
        if(!token) {
            console.log('toUser is not logged in user');
            return done(false);
        }
        // Validate the accessToken
        TokenController.validate(token, (err, token) => {
            if(err) {
                console.log('accessToken validate returns err');
                return done(false);
            }
            return done(true);
        });
    });
};

const _sendNotification = (type, toUserId, fromUser, done) => {
    // Check toUserId is logged in
    _checkToUserIsLoggedIn(toUserId, (isOkToSendNotification) => {
        if(!isOkToSendNotification) {
            return done(false);
        }
        // 1. Get an instanceId of toUser
        User.getInstanceIdByUserId(toUserId, (err, instanceId) => {
            if (err) {
                console.log('get instanceId is failed');
                return done(false);
            }

            if (!instanceId) {
                console.log('\ncouldn\'t find instanceId');
                return done(false);
            }

            let noti_body;
            let noti_title;
            if (type === TYPES.friend_request) {
                noti_title = '친구 요청';
                noti_body = fromUser.name + ' 님이 친구하고 싶답니다.';
            } else if (type === TYPES.exit_group_taskhead) {
                noti_title = 'Group TaskHead';
                noti_body = '';
            } else if (type === TYPES.auready) {
                noti_title = 'A U Ready';
                noti_body = 'Move- Move-';
            }

            let message = {
                to: instanceId,
                data: {
                    notiType: type,
                    fromUserId: fromUser.id,
                    fromUserName: fromUser.name,
                    notiTitle: noti_title,
                    notiBody: noti_body
                }
            };

            console.log('\nmessage - ', message);

            fcm.send(message, (err, res) => {
                if (err) {
                    console.log('something has gone wrong!, err- ', err);
                    return done(false);
                }
                console.log('Successfully sent with response:', res);
                return done(true);
            });

        });
    });
};

/*
 * 1. Get an instanceId of toUser
 * 2. Send the message to FCM server
 * 3. returns the result
 * */
exports.sendNotification = (type, toUserId, fromUser, done) => {
    _sendNotification(type, toUserId, fromUser, done);
};

exports.exitTaskHead = (toUserIds, fromUser, taskHeadTitle, done) => {

    const notiTitle = 'Group TaskHead';
    const notiBody = fromUser.name + '님이 ' + taskHeadTitle + ' 에서 나갔습니다.';
    // 1. Get the instanceId of toUsers
    toUserIds.forEach((id, i) => {
        User.getInstanceIdByUserId(id, (err, instanceId) => {
            if (err) {
                console.log('get instanceId is failed of ', id);
                return done(false);
            }

            if (!instanceId) {
                console.log('\ncouldnt find instanceId of ', id);
                return done(false);
            }

            let message = {
                to: instanceId,
                data: {
                    notiType: TYPES.exit_group_taskhead,
                    fromUserId: fromUser.id,
                    fromUserName: fromUser.name,
                    notiTitle: notiTitle,
                    notiBody: notiBody
                }
            };
            console.log('\nmessage - ', message);

            // Send notifications to Users
            // todo find the way that send a message to users at once
            fcm.send(message, (err, res) => {
                if (err) {
                    console.log('something has gone wrong!, err- ', err);
                    return done(false);
                }
                console.log('Successfully sent with response:', res);
            });

            if (i === toUserIds.length - 1) {
                // success to send all the messages
                return done(true);
            }
        });
    });
};