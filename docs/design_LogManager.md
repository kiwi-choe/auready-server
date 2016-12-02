# Main Goal
; synchronize with server  
Data(Task, TaskHead) is stored in LocalDB - LogManager table - when several events is invoked.  
At this time, this data is the diff between serverDB and localDB. This is, LogManager roles the 'Diff Buffer'.  
=> When a problem occurs on the network, the data couldn't be sent the server is stored in LogManager.  

# Process
On Client Side,  
1) Record all the logs using Task, TaskHead of LocalDB in Log table.
2) Before writing on Log table, optimize with filtering according to rules.
3) When user request the sync with server, read Log table and then send.
4)
    1) If the response 200 from server, clear Log table
    2) 400, request again.

On Server side,  
1) Release Log data list from client and update the serverDB.
2) Send response 200 or 400 code

# Filtering Rules
On client side, there are several rules to increase the performance that is the second goal.  

- DEL
if command == DEL,  
    find same taskId,  
        if exists, command == MOD,  
            remove all Logs of this taskId, must write this DEL log  
        if exists, command == ADD,  
            remove all logs of this taskId, no need to write this DEL log  

- MOD
if command == MOD,  
    find same taskId && command == MOD,  
        if exists,  
            remove log of this taskId  

* When synchronize, Order is important! Send first and then take.

* Best way to maintain referential integrity between local and remote db  
1) Model 'Task' and 'TaskHead' have two ids. One is local id 'id', other is 'remote_id' which is ObjectId of Server DB.  
'remote_id' is used in Log table.    
Client's Entity 'Log' { command, id(remote_id), jsonStrOfObj }  

2)
    1) membersCnt: 1,  
    2) membersCnt: not 1,  
     Each Client has a LogManager, roles the Diff buffer, in here, Diff is within Local. 
     Server receives as many logs as there are clients, store several logs to DB. 
     That is why, even if the Diff log is stored to Server DB, it is not exactly matched that server's task collection and task table of each client. 
     So, for perfect sync, server responses not only status code but also taskhead doc that is parent of this task.  
     (Actually, this response can be two steps. response code only and Client requests GET /taskhead:id.)  
     There are some examples on below;
     
     
        1) 
        request POST /task + {taskhead_id, task obj}, Server returns a taskhead has this task.
        request PUT /task + {taskhead_id, updating task obj}, Server returns a taskhead has this task.
        ...
        Any request for a Task, server returns a taskhead which is parent doc of this task.      
        2) Overwrite this taskhead row with new taskhead doc from server
        3) Update UI ListView.
    
ref.  
- [StackExchange1](http://softwareengineering.stackexchange.com/questions/132735/maintaining-referential-integrity-between-a-mobile-client-and-a-server/132742#132742)
- [StackExchange2](http://softwareengineering.stackexchange.com/questions/132735/maintaining-referential-integrity-between-a-mobile-client-and-a-server/132742#132742)