var express = require("express");
var router = express.Router(); 
var authentication = require("../core/authentication");

var nodemailer = require("nodemailer")


router.use(function(req,res,next){
    res.locals.username = req.session.username;
    next();
});


router.get("/", index);
router.get("/freetrial", freetrial);
router.get("/villas", villas); 
router.get("/housings", housings);
router.get("/apartments", apartments);
router.get("/about", about);
router.get("/contact", contact);
router.get("/postdetail",postdetail);
router.post("/emailsent", emailsentPOST);

/**
 * If the user isLoggedIn when accessing this route, then redirect user to 
 * corresponding role.
 */
var preventMiddleware = function(req,res,next){
    if(req.session.login == true){
        res.redirect("/" + req.session.user.role);
    } else {
        next();
    }
};

router.get("/login", preventMiddleware, login);
router.get("/register", preventMiddleware, register);
router.post("/login", preventMiddleware, loginPOST);
router.post("/register", preventMiddleware, registerPOST);


module.exports = router;

/**
 * Controller untuk menghandle data yang dikirim dari contact.ejs ke route '/emailsent'
 * melalui html form.
 */
function emailsentPOST(req,res){

    var transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'cs.carikosidaman@gmail.com',
            pass: 'bisnissukses'
        }
    });

    var html = "";
    html = html + "Name     : " + req.body.name + " ("+req.body.email+")<br>";
    html = html + "Date     : " + Date.now().toString() + "<br>";
    html = html + "Subject  : " + req.body.subj + "<br><br>";
    html = html + "-- Message -- <br><br>" + req.body.subj + "<br><br>";
    html = html + req.body.msg;

    var mailOptionsAdmin = {
        from    : 'cs.carikosidaman@gmail.com',
        to      : 'helena_nt@live.com',
        subject : 'Cari Kos Idaman - Contact Form',
        html    : html
    };
    var mailOptionsAdminDar = {
        from    : 'cs.carikosidaman@gmail.com',
        to      : 'darwan318@gmail.com',
        subject : 'Cari Kos Idaman - Contact Form',
        html    : html
    };
    var mailOptionsSender = {
        from    : 'cs.carikosidaman@gmail.com',
        to      : req.body.email,
        subject : 'Cari Kos Idaman - Contact Form',
        html    : "Thank you for contacting us. We've received your email. Here's a copy of your mail: <br><br><br>" + html
    };

    transport.sendMail(mailOptionsAdmin, function(err,info){ // ni buat ngirim ke email elu
        if(err) throw err;
        
        transport.sendMail(mailOptionsSender, function(err,i){ // bakal ngirim ke (sesuai dengan inputan di form nya) :te"st) test local dlu aja ba
            if (err) throw err;
            res.redirect("/");
        });

    });
    
}

function index(req,res){

    res.render("_master", {
        page: "Home"
    });

    //res.render("index");
}

function freetrial(req,res){
    res.render("ok", {
        page: "Free Trial"
    })
}

function postdetail(req,res){
    res.render("_master",{
        page: "postdetail",
    })
}

function villas(req,res){
    res.send("ok")
}
var Post = require("../schema/post");
function housings(req,res){


    Post.find({}, function(err,docs){

        if(err){
            res.send(err);
            return;
        }

        docs.push(new Post({
            tanggal: Date.now(),
            nama: "Kost Grahayu Denpasar",
            alamat: "Jl. Pemuda IV No. 25 Renon Denpasar",
            genderPenghuni: "Campur",
            jumlahKamar: 15,
            luas: 16,
            jamBertamu: "Dibatasi",
            hewanPeliharaan: "Tidak",
            harga: 5000000,
            _owner: null,
            fasilitasKamar: ["AC", "Lemari","Kipas Angin", "Matras", "Meja Belajar"],
            fasilitasSekitar : ["ATM", "Tempat Ibadah", "Sekolah", "Lapangan", "Gym", "Mall", "Pom Bensin" ,"Kolam Renang", "Warteg" , "Satpam"]
        }))

        var pics = new Array("images/sb.jpg","images/sb1.jpg","images/sb2.jpg","images/sb3.jpg","images/sb4.jpg","images/sb5.jpg","images/sb6.jpg");
        pics = shuffle(pics);

        res.render("_master",{
            page: "housings",
            posts : docs,
            pics : pics
        });
    });
}

function  apartments(req, res){
    res.send("ok")
}

function about(req, res){
    res.render("_master",{
        page: "about"
    });
}

function contact(req, res){
    
    res.render("_master", {
        page: "contact"
    });

}

function login(req, res){
    res.render("_master", {
        page: "login"
    });
}

function register(req, res){
    res.render("_master",{
        page: "register",
    });
} 

function loginPOST(req,res){
    console.log(req.body);
    var uname = req.body.uname;
    var pass = req.body.pass;


    authentication.login(req.session, uname, pass, function(err, account, role){

        if(err) return res.send(err);
        res.redirect("/" + role);

    });
}

var accountFactory = require("../schema/account-factory");

function registerPOST(req,res){
    var buyer = accountFactory.makeBuyer(req.body.fullname, req.body.uname, req.body.password, req.body.email, req.body.phone);

    buyer.save(function(err, acc){

        if(err) throw err;
        authentication.login(req.session, acc.username, req.body.password, function(err, account){

            
            if(err) return res.send(err);
            res.redirect("/" + acc.role);
            
        });

    });
}


//------------------------------------------------------------


/**
 * The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
