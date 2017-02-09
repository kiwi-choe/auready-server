
### To do 
*[ ] schema.pre('save', ...); 적용 안 됨.  
column 'status'를 따로 넣어주지 않으면, 콘솔에서 확인할 때 {fromUserId, toUserId}만 보임.
실제 db에서 확인결과, db에도 'status'가 저장되지 않는다.

*[ ] Network problems  
On mobile networks, where latency is constantly high, this is a big drawback. So how can you design an API following REST principles, without forcing the clients to make too many requests?
 
*[ ] LogManager
*[ ] To refine the response to each request  
*[x] Which one of 'Task', 'TaskHead' are more accessible?  
Client 구현하면서 어떤 데이터에 더 많은 접근을 하는 지에 따라 DB디자인을 수정할 예정.
Task에 대한 접근이 더 많으면, 현재 구조인 TaskHead{Members{Tasks{}}}에서 
Task를 빼는 식으로 수정해야한다. like below  
TaskHead{Members{}}  
Task{'memberIdOfTaskHead': String, ...}  
Task{'memberIdOfTaskHead': String, ...}  
=> Solve. 1 collection - TaskHead, 2 types subDocuments - Member, Task