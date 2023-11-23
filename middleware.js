/*
You can choose to define all your middleware functions here, 
export them and then import them into your app.js and attach them that that.
add.use(myMiddleWare()). you can also just define them in the app.js if you like as seen in lecture 10's lecture code example. If you choose to write them in the app.js, you do not have to use this file. 
*/
export const rootRouteMiddleware = (req, res, next) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/protected');
        }
    } else {
        res.redirect('/login');
    }
}

export const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.redirect('/error');
    }
};

export const requireUser = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'user') {
        next();
    } else {
        res.redirect('/error');
    }
};
