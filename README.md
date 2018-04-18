# Node.js JWT Authentication Example


* Node.js
* Express
* sequelize
* MySQL

## Prerequisite


In order to run this example, MySQL server is needed to be run and database named 'sample' created before.
Install MySQL and edit the following MySQL connection code in the *index.ts* if needed.


```
/* By default, try to connect the databse named 'sample' with root user at MySQL running on localhost. And root user's password is null. */
const sequelize = new Sequelize('sample', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: Op
});
```


## Getting Started

```
yarn
yarn run build
node app/index.js
```

And application will run on http://localhost:3000. Open *index.html* with browser. And set JWT token and consume API the requires the token. 
