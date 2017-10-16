module.exports = {

    read: (req,res) => {

        console.log('req.user is...',req.user);

        req.app.get('db').get_all_goals([req.user]).then(response=>{
            res.send(response); //should add 200
        })
        // console.log(req.body)
    },

    unique: (req, res) => {
        console.log(req.params.id);
        
        req.app.get('db').get_goal([req.params.id]).then(response=>{
            res.send(response)
        })
    },

    update: (req,res) => {

        //req.user will grab the id of the user

        const d = new Date();
        const startdate = `${d.getFullYear()} ${d.getMonth()+1} ${d.getDate()}`;

        let goalid = null;
        
        console.log('update funtion is firing')

        let args = [req.body.goalname, req.body.daysoutofseven, req.body.goodHabit, req.user, startdate]

        req.app.get('db').create_new_habit(args).then(response=>{
            
            res.send(response);

        })  

    },

    createSuccesses: (req,res) => {

        console.log('createSuccesses function is firing');

        console.log(req.body);

        req.app.get('db').create_success_logs([req.body.id])
        res.sendStatus(200)
    },

    fillmissingdays: (req,res) => {
        function days(start,today){
            
            const calender = [0,31,28,31,30,31,30,31,31,30,31,30,31];
              
            start = start.split(' ').map(e=>parseInt(e));
            today = today.split(' ').map(e=>parseInt(e));
              
            var days = calender[start[1]];
              
            if(start[0]===today[0] && start[1]===today[1]){
                return today[2] - start[2];
            }else if(start[0]===today[0]){
                return calender.slice(start[1],today[1]).reduce((a,c)=>a+c)-start[2]+today[2];
            }else{
                return calender.slice(start[1]).reduce((a,c)=>a+c)-start[2] + calender.slice(0,today[1]).reduce((a,c)=>a+c)+today[2] + (today[0]-start[0]-1)*365;
            }
        //function will go out of sync on leap day 2020... oh well
        }

        console.log('fillmissingdays function fired');
        console.log(req.params.id);
        const goalid = req.params.id;
        let days_since_start = 0;
        d = new Date();
        const today = `${d.getFullYear()} ${d.getMonth()+1} ${d.getDate()+7}`;
        let startdate = null;
        req.app.get('db').get_startdate([goalid]).then( res => {
            startdate = res[0].startdate;
            let index = days(startdate,today);

            req.app.get('db').grab_last_day([goalid]).then(day=>{

                for(var i = day[0].dayof+1; i <= index; i++){
                    console.log(i);
                    req.app.get('db').fill_missing_days([goalid,i])
                    .then(theResponse=>theResponse.sendStatus(200));
                }

            }).then(anotherOne=>anotherOne.sendStatus(200))

            console.log(days(startdate,today))//number of rows to insert into success for this goal
        })
         
        res.sendStatus(200);
    },

    getbools: (req,res) => {
        // console.log('from getbools', req.params.id)
        const goalid = req.params.id;
        const db = req.app.get('db');
        db.get_booleans([goalid]).then(res2=>{
            res.send(res2)
        })
    },

    getallbools: (req,res) => {
        // console.log('from get all bools', req.params.id)
        const goalid = req.params.id;
        const db = req.app.get('db');
        db.get_all_booleans([goalid]).then(res2=>{
            res.send(res2)
        })
    },

    changebool: (req,res) => {
        console.log('from changebool', req.body.day) //day clicked on
        console.log('from changebool', req.params.id) //goal id
        const db = req.app.get('db')
        const dayclicked = req.body.day;
        const goalid = req.params.id;

        db.grab_last_day([req.params.id]).then(res2=>{
            console.log('from changebool', res2[0].dayof)
            const day = res2[0].dayof - dayclicked;
            db.update_bool([goalid, day]).then(res3=>{

                res3.sendStatus(200);
            })


            res2.sendStatus(200);
        })

        // db.update_bool([req.params.id, req.body.day])




        res.sendStatus(200);
    }

}