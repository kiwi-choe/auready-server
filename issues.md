Trouble.
schema.pre('save', ...); 적용 안 됨.
column 'status'를 따로 넣어주지 않으면, 콘솔에서 확인할 때 {fromUserId, toUserId}만 보임.
실제 db에서 확인결과, db에도 'status'가 저장되지 않는다.