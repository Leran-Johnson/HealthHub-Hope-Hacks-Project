const mysql = require('mysql')

const con = mysql.createPool({connectionLimit:40,host:"sql5.freemysqlhosting.net",user:"sql5672097",password:"f5tmGjzrBC", database: "sql5672097",debug: false})

function signUp(username, password, middlename, hex){
    return new Promise((resolve,reject)=>{
        con.getConnection( (err,connection) =>{
            if (err) throw err
            // select query to check if username already exists in database
            let sql = `SELECT username FROM accounts WHERE username = "${username}"`
            connection.query(sql, (err, result)=>{
                if (err) throw err
                if (result.length) reject({error: "Username already taken"})
                else {
                    // if it doesnt exist it enters user and password into database
                    sql = `INSERT INTO accounts (username, password, middle_name, hex) VALUES ("${username}","${password}","${middlename}",${hex})`
                    connection.query(sql, (err,result)=>{
                        if (err) throw err;
                        resolve({result: 'Success'})
                    })
                    sql = `INSERT INTO roles (role) VALUES ("user")`
                    connection.query(sql, (err,result)=>{
                        if (err) throw err;
                        resolve({result: 'Success'})
                    })
                }
            })
            connection.release()
        })
    })
}

function logIn(username,password){
    return new Promise((resolve,reject)=>{
        con.getConnection( (err,connection) =>{
            if (err) throw err
            // select query to see if user and password match
            let sql = `
            SELECT accounts.username, accounts.password, accounts.hex, roles.role
            FROM accounts
            LEFT JOIN roles ON accounts.idaccounts = roles.idaccounts
            WHERE username = '${username}' AND password = '${password}'`
            connection.query(sql, (err, result)=>{
                if (err) throw err
                // if none show up one of them is invalid and error is returned
                if (!result.length) reject({error: "Invalid username/password"})
                else {
                    // returns success
                    resolve({result})
                }
            })
            connection.release()
        })
    })
}

function resetPassword(username,password,middlename){
    return new Promise((resolve,reject)=>{
        con.getConnection( (err,connection) =>{
            if (err) throw err
            let sql = `SELECT * FROM accounts WHERE username = "${username}" AND middle_name = "${middlename}"`
            connection.query(sql, (err, result)=>{
                if (err) throw err
                // if none show up one of them is invalid and error is returned
                if (!result.length) reject({error: "Invalid username/middlename"})
                else {
                    sql = `UPDATE accounts SET password = '${password}' WHERE username = '${username}'`
                    connection.query(sql, (err, result)=>{
                        if (err) throw err
                        else {resolve({result: "Reset Successful"})}
                    })
                }
            })
            connection.release()
        })
    })
}

function uploadHistory(username,diagnosis,diagnosisID){
    con.getConnection((err, connection)=>{
        if (err) throw err
        let sql = `SELECT idaccounts FROM accounts WHERE username = "${username}"`
        connection.query(sql, (err, result)=>{
            sql = `INSERT INTO history (idaccounts, diagnosis, diagnosisID) VALUES (${result[0].idaccounts},"${diagnosis}",${diagnosisID})`
            connection.query(sql, (err,result)=>{
                if (err) throw err
            })
        })
    })
}

function retrieveHistory(username){
    return new Promise((resolve,reject)=>{
        con.getConnection((err, connection)=>{
            if (err) throw err
            let sql = `SELECT idaccounts FROM accounts WHERE username = "${username}"`
            connection.query(sql, (err,result)=>{
                sql = `SELECT DISTINCT diagnosis, diagnosisID FROM history WHERE idaccounts = ${result[0].idaccounts}`
                connection.query(sql,(err,result)=>{
                    if (err) throw err
                    else {resolve(result)}
                })
            })
        })
    })
}

function removeDiagnosis(username, diagnosisID){
    con.getConnection((err,connection)=>{
        if (err) throw err
        let sql = `SELECT idaccounts FROM accounts WHERE username = "${username}"`
        connection.query(sql, (err,result)=>{
            sql = `DELETE FROM history WHERE idaccounts = ${result[0].idaccounts} AND diagnosisID = ${diagnosisID}`
            connection.query(sql,(err,result)=>{
                if (err) throw err
            })
        })
    })
}

module.exports = {
    signUp,
    logIn,
    resetPassword,
    uploadHistory,
    retrieveHistory,
    removeDiagnosis,
}