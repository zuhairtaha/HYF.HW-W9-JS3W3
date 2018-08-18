"use strict";

const usersURL = "https://jsonplaceholder.typicode.com/users";
fetch(usersURL)
    .then(data => data.json())
    .catch(error => console.log('Error loading users: ', error))
    .then(users => {
        users.forEach((user, i) => {
            /*
             or we can use for (let i = 0; i < users.length; i++) {...}
             replace var with let, let create a new binding for per loop iteration
             then closure function (fetch) will get i per loop iteration
             */
            const todosURL = `https://jsonplaceholder.typicode.com/users/${user.id}/todos`;
            fetch(todosURL)
                .then(data => data.json())
                .catch(error => console.log('Error loading todos for user ', i, ' :', error))
                .then(todos => {
                    user.todos = todos
                })
        });
        return users;
    })
    .then(users => console.log(users));