const pool = require("../_Database");
const fn = require("../functions");

const context = {
    title : "Create Favorite Lists",
    message : "",
    titleError : '',
    authError : ""
}

exports.getAllList = async function(req, res) {
    try{
        // TODO: add pagination
        const {title} = req.query;
        let lists;
        if (title) {
            /*
            select lm.*, u.name, p.picture, count(li.itemid) from users as u inner join profile as p on p.uid = u.uid left join list_meta as lm on lm.uid = u.uid left join list_item as li on li.lid = lm.lid where lm.lid = 9 group by lm.lid, lm.description, lm.title, lm.uid, u.name, p.picture;



            with limit and sort order
                        
            moovey=# select lm.*, u.name, p.picture, count(li.itemid) from users as u inner join profile as p on p.uid = u.uid left join list_meta as lm on lm.uid = u.uid left join list_item as li on li.lid = lm.lid group by lm.lid, lm.description, lm.title, lm.uid, u.name, p.picture order by date_created desc limit 10;
            */
            const {rows} = await pool.query(`SELECT u.name, p.picture, lm.*,COUNT(li.itemid) AS itemCount FROM users AS u INNER JOIN profile AS p ON p.uid = u.uid INNER JOIN list_meta AS lm ON lm.uid = u.uid LEFT JOIN list_item AS li ON lm.lid = li.lid WHERE lm.title ILIKE $1 GROUP BY  lm.lid, lm.description, lm.title, lm.uid, u.name, p.picture`, ['%' + title.toLowerCase().trim() + '%']);
            if (rows.length === 0){
                context.message = `No list found with the title "${title.trim()}"`
            }
            lists = rows;
        }
        else {
            const {rows} = await pool.query(`SELECT u.name, p.picture, lm.*,COUNT(li.itemid) AS itemCount FROM users AS u INNER JOIN profile AS p ON p.uid = u.uid INNER JOIN list_meta AS lm ON lm.uid = u.uid LEFT JOIN list_item AS li ON lm.lid = li.lid GROUP BY  lm.lid, lm.description, lm.title, lm.uid, u.name, p.picture`);
            lists = rows;
        }
        context.message = title?.trim().length > 0 ? title.trim() : undefined;
        context.loggedIn = req.session?.name;
        context.authorized = req.session?.uid
        context.data = lists ?? [];
        context.data?.forEach(datum => {
            datum.date_created = fn.readableDateStringFormat(`${datum.date_created}`)
        })
        return res.render("pages/list_list", context)
    }
    catch(err){
        console.log(err);
        return res.redirect("/")
    }
}


exports.getListByID = async function(req, res) { 
    try{
        const {id} = req.params;
        const {rows} = await pool.query("select u.name,picture, u.uid, lm.title as list_title,lm.lid,li.imdbid,li.description, lm.description as list_desc,lm.date_created, mm.poster, mm.title, mm.year from list_meta as lm inner join users as u on u.uid = lm.uid left join profile as p on p.uid = u.uid left join list_item as li on li.lid = lm.lid left join movies_meta as mm on mm.imdbid = li.imdbid where lm.lid = $1", [id])
        
        // add recommendation field to items
        if (rows.length === 0){
            throw Error
        }
        const formattedData = { movies : []}
        rows.forEach(row => {
            if (!formattedData.lid){
                formattedData.lid = row.lid
            }
            if (!formattedData.list_title){
                formattedData.list_title = row.list_title
            }
            if (!formattedData.list_desc){
                formattedData.list_desc = row.list_desc
            }
            if (!formattedData.date){
                formattedData.date = fn.readableDateStringFormat(""+row.date_created)
            }
            if (!formattedData.name){
                formattedData.name = row.name
            }
            if (!formattedData.uid){
                formattedData.uid = row.uid
            }
            if (row.imdbid) {
                if (formattedData.movies?.length === 0){
                    formattedData.movies = [
                        {
                            imdbid : row.imdbid,
                            desc : row.description,
                            poster : row.poster,
                            title : row.title,
                            year : row.year,
                        }
                    ]
                } 
                else {
                    formattedData.movies.push({
                            imdbid : row.imdbid,
                            desc : row.description,
                            poster : row.poster,
                            title : row.title,
                            year : row.year,
                        })
                }
            }
        })
        context.title = formattedData.list_title
        const url = await fn.getAbsoluteURL(req)
        context.currentURL = url
        context.meta_property = {
            "og:url" : url,
            "og:type" : "list",
            "og:title" : formattedData.list_title,
            "og:description" : formattedData.name + "'s list named " + formattedData.list_desc,
            "og:image" : "https://www.google.com/search?q=random+image&rlz=1C1NHXL_enIN815IN815&sxsrf=AOaemvL93BGM2raZIj4ePqJluCZrqH5Iow:1631568022720&source=lnms&tbm=isch&sa=X&ved=2ahUKEwiH2q7D8PzyAhXTFlkFHXBUDP0Q_AUoAXoECAEQAw&biw=1536&bih=754&dpr=1.25#imgrc=EpwlzJ8ekN85kM"
        }
        context.user = {
            name : rows[0]?.name,
            picture : rows[0]?.picture,
            uid : rows[0]?.uid,
        }
        context.loggedIn = req.session?.name;
        context.authorized = req.session?.uid && (req.session?.uid === formattedData.uid)
        context.data = formattedData;
        context.showSearchForm = false;
        context.showAddModal = false;
        context.searchFor = ''
        return res.render("pages/list_detail", {...context})
    }
    catch(err){
        console.log(err);
        return res.redirect("/pageNotFound")
    }
}


