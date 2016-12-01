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
4-1) If the response 200 from server, clear Log table
4-2) 400, request again.

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
- [StackExchange1]: http://softwareengineering.stackexchange.com/questions/132735/maintaining-referential-integrity-between-a-mobile-client-and-a-server/132742#132742
- [StackExchange2]: http://softwareengineering.stackexchange.com/questions/132735/maintaining-referential-integrity-between-a-mobile-client-and-a-server/132742#132742