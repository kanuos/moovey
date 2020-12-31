const list = [];

exports.getDashboardListPage = (req, res) => {
    return res.render("pages/dashboard/listMode", 
    {
        title: "Create Your Favorite Lists",
        listCount: list.length,
        list
    }
)}


exports.createNewList = (req, res) => {
    const {listName} = req.body;
    list.push({
        title : listName.trim(),
        user : ['sounak', 'rimi', 'drisana'][Math.floor(Math.random() * 3)],
        id: list.length + 1
    })
    return res.redirect("/dashboard/list")
}
