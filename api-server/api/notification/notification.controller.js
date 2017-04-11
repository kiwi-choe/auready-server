const User = require(__appbase_dirname + '/api-server/api/user/user.controller');

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

/*
 * 1. Get an instanceId of toUser
 * 2. Send the message to FCM server
 * 3. returns the result
 * */
exports.sendNotification = (type, toUserId, fromUser, done) => {

    // 1. Get an instanceId of toUser
    User.getInstanceIdByUserId(toUserId, (err, instanceId) => {
        if (err) {
            console.log('get instanceId is failed');
            return done(false);
        }

        if(!instanceId) {
            console.log('\ncouldnt find instanceId');
            return done(false);
        }

        let noti_body;
        let noti_title;
        if (type === TYPES.friend_request) {
            noti_title = '친구 요청';
            noti_body = fromUser.name + ' 님이 친구하고 싶답니다.';
        }
        let message = {
            to: instanceId,
            data: {
                noti_type: TYPES.friend_request,
                fromUserId: fromUser.id,
                fromUserName: fromUser.name
            },
            notification: {
                title: noti_title,
                body: noti_body
            }
        };

        console.log('\nmessage - ', message);

        fcm.send(message, (err, res) => {
            if (err) {
                console.log('something has gone wrong!');
                return done(false);
            }
            console.log('Successfully sent with response:', res);
            return done(true);
        });

    });
};