const con = require('../db/connection.js')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

exports.getLogin = (req, res) => {
     if(req.session.user) {
          res.redirect('/home');
     }

     const error = req.flash('error');
     const notif = req.flash('notif');

     res.render('login', {error, notif});
}

exports.postLogin = (req, res) => {
     let email = req.body.email;
     let password = req.body.password;

     const sql = "SELECT * FROM users WHERE user_email=?";

     con.query(sql, [email], (err, result) => {
          if(err) {
               console.log(err.message);
          }

          else {
               if(result.length > 0) {
                    const hash = result[0].user_password;

                    bcrypt.compare(password, hash, function(err, match) {
                         if(err) {
                              console.log(err.message);
                         }
                         else {
                              if(match) {
                                   if(result[0].user_isVerified == 0) {
                                        let user_key = result[0].user_key;

                                        let transporter = nodemailer.createTransport({
                                             host: "smtp.elasticemail.com",
                                             port: 2525,
                                             secure: false,
                                             auth: {
                                               user: 'marvin.directobautista@gmail.com',
                                               pass: 'D45AB4295D0EA021E959236C3D4C3F73D9F7',
                                               
                                             },
                                             tls: {
                                                  ciphers: 'SSLv3'
                                             }
                                        });
          
                                        let info = transporter.sendMail({
                                             from: 'marvin.directobautista@gmail.com', // sender address
                                             to: email, // list of receivers
                                             subject: 'Email verification | Acer PH', // Subject line
                                             text: user_key, // plain text body
                                             html: "<h1>Verify to use your account</h1><br><p>You have just signed up using this email. To confirm, click <a href='localhost:5000/verify/"+ user_key +"'>here</a>.</p>", // html body
                                        });

                                        req.flash('error', 'Verify your account first!');
                                        res.redirect('login');
                                   }
                                   
                                   else {
                                        if(result[0].user_isBanned == 0) {
                                             req.session.user = result[0].user_id;
                                             res.redirect('home');
                                        }

                                        else if(result[0].user_isBanned == 1) {
                                             req.flash('error', 'Your account is banned.');
                                             res.redirect('login');
                                        }
                                   }
                              }
                         
                              else {
                                   req.flash('error', 'Incorrect email/password.');
                                   res.redirect('login');
                              }
                         }
                    })
               }

               else {
                    req.flash('error', 'Incorrect email/password.')
                    res.redirect('login');
               }
          }
     });
}

exports.getHome = (req, res) => {
     const sql = "SELECT * FROM products INNER JOIN categories WHERE products.product_isFeatured = ? AND products.category_id = categories.category_id";
     con.query(sql, [1], (err, result) => {
          if(err) console.log(err.message);

          else {
               let user = req.session.user;

               const sql = "SELECT COUNT(order_id) AS count_order FROM orders WHERE user_id = ? AND order_status = ?"
               con.query(sql, [user, 1], (err, counter) => {
                    if(err) console.log(err.message);

                    else {
                         const user = req.session.user;
                         const sql = "SELECT * FROM users WHERE user_id = ?";

                         con.query(sql, [user], (err, info) => {
                              if(err) console.log(err.message);

                              else {
                                   res.render('home', {result, counter, info});
                              }
                         });
                    }
               });
          }
     });
}

exports.getProducts = (req, res) => {
     const sql = "SELECT * FROM products INNER JOIN categories WHERE products.category_id = categories.category_id GROUP BY products.category_id";
     let search = '';

     con.query(sql, (err, category) => {
          if(err) console.log(err.message);

          else {
               const sql = "SELECT * FROM products";

               con.query(sql, (err, products) => {
                    if(err) console.log(err.message);

                    else {
                         let user = req.session.user;

                         const sql = "SELECT COUNT(order_id) AS count_order FROM orders WHERE user_id = ? AND order_status = ?"
                         con.query(sql, [user, 1], (err, counter) => {
                              if(err) console.log(err.message);
          
                              else {
                                   let user = req.session.user;

                                   const sql = "SELECT COUNT(order_id) AS count_order FROM orders WHERE user_id = ? AND order_status = ?"
                                   con.query(sql, [user, 1], (err, counter) => {
                                        if(err) console.log(err.message);
                    
                                        else {
                                             const user = req.session.user;
                                             const sql = "SELECT * FROM users WHERE user_id = ?";
                    
                                             con.query(sql, [user], (err, info) => {
                                                  if(err) console.log(err.message);
                    
                                                  else {
                                                       res.render('products', {category, products, counter, search, info});
                                                  }
                                             });
                                        }
                                   });
                              }
                         });
                    }
               });
          }
     });
}

exports.postSearch = (req, res) => {
     let search = req.body.search;

     const sql = "SELECT * FROM products INNER JOIN categories WHERE products.category_id = categories.category_id AND products.product_desc LIKE ? GROUP BY products.category_id";
     
     con.query(sql, ['%'+search+'%'], (err, category) => {
          if(err) console.log(err.message);

          else {
               const sql = "SELECT * FROM products WHERE product_desc LIKE ?";

               con.query(sql, ['%'+search+'%'], (err, products) => {
                    if(err) console.log(err.message);

                    else {
                         let user = req.session.user;

                         const sql = "SELECT COUNT(order_id) AS count_order FROM orders WHERE user_id = ? AND order_status = ?"
                         con.query(sql, [user, 1], (err, counter) => {
                              if(err) console.log(err.message);
          
                              else {
                                   let user = req.session.user;

                                   const sql = "SELECT COUNT(order_id) AS count_order FROM orders WHERE user_id = ? AND order_status = ?"
                                   con.query(sql, [user, 1], (err, counter) => {
                                        if(err) console.log(err.message);
                    
                                        else {
                                             const user = req.session.user;
                                             const sql = "SELECT * FROM users WHERE user_id = ?";
                    
                                             con.query(sql, [user], (err, info) => {
                                                  if(err) console.log(err.message);
                    
                                                  else {
                                                       res.render('products', {category, products, counter, search, info});
                                                  }
                                             });
                                        }
                                   });
                              }
                         });
                    }
               });
          }
     });
}

exports.getOrders = (req, res) => {
     let user = req.session.user;
     let success = req.flash('success');
     let deleted = req.flash('deleted');
     const sql = "SELECT * FROM orders INNER JOIN products ON orders.product_id = products.product_id INNER JOIN categories ON categories.category_id = products.category_id WHERE orders.user_id = ? ORDER BY orders.order_dateTime DESC";

     con.query(sql, [parseInt(user)], (err, result) => {
          if(err) console.log(err.message);

          else {
               let user = req.session.user;

               const sql = "SELECT COUNT(order_id) AS count_order FROM orders WHERE user_id = ? AND order_status = ?"
               con.query(sql, [user, 1], (err, counter) => {
                    if(err) console.log(err.message);

                    else {
                         let user = req.session.user;

                         const sql = "SELECT COUNT(order_id) AS count_order FROM orders WHERE user_id = ? AND order_status = ?"
                         con.query(sql, [user, 1], (err, counter) => {
                              if(err) console.log(err.message);
          
                              else {
                                   const user = req.session.user;
                                   const sql = "SELECT * FROM users WHERE user_id = ?";
          
                                   con.query(sql, [user], (err, info) => {
                                        if(err) console.log(err.message);
          
                                        else {
                                             res.render('orders', {result, counter, success, deleted, info});
                                        }
                                   });
                              }
                         });
                    }
               });
          }
     });
}

exports.getFinalOrder = (req, res) => {
     let product_id = req.body.product_id;
     const sql = "SELECT * FROM products INNER JOIN categories WHERE products.product_id = ?";

     con.query(sql, [product_id], (err, result) => {
          if(err) console.log;

          else {
               let user = req.session.user;

               const sql = "SELECT COUNT(order_id) AS count_order FROM orders WHERE user_id = ? AND order_status = ?"
               con.query(sql, [user, 1], (err, counter) => {
                    if(err) console.log(err.message);

                    else {
                         const user = req.session.user;
                         const sql = "SELECT * FROM users WHERE user_id = ?";

                         con.query(sql, [user], (err, info) => {
                              if(err) console.log(err.message);

                              else {
                                   res.render('finalize-order', {result, info, counter, info});
                              }
                         });
                    }
               });
          }
     });
}

exports.postInsertOrder = (req, res) => {
     let user = req.session.user;
     let product = req.body.product_id;
     let qty = req.body.qty_input;
     const dateTime = new Date();

     const sql = "INSERT INTO orders VALUES (NULL, ?, ?, ?, ?, ?)";

     con.query(sql, [user, product, qty, 0, dateTime], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('success', 'Order placed successfully!');
               res.redirect('orders');
          }
     });
}

exports.postCancelOrder = (req, res) => {
     let order = req.body.order_id;
     let deleted = req.flash('deleted');

     const sql = "DELETE FROM orders WHERE order_id = ?";

     con.query(sql, [order], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('deleted', "Order deleted!");
               res.redirect('orders');
          }
     });
}

exports.userLogout = (req, res) => {
     req.session.destroy();
     res.redirect('/login');
}

exports.getRegister = (req, res) => {
     let error = req.flash('error');

     res.render('register', {error});
}

exports.postRegister = (req, res) => {
     function generateRandomString(n) {
          let randomString = '';
          let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      
          for ( let i = 0; i < n; i++ ) {
            randomString += characters.charAt(Math.floor(Math.random()*characters.length));
          }

         return randomString;
     }

     let email = req.body.email;
     let fname = req.body.fname;
     let lname = req.body.lname;
     let password = req.body.password;
     let saltRounds = 10;
     const user_key = generateRandomString(120);

     const sql = "SELECT * FROM users where user_email = ?";

     con.query(sql, [email], (err, result) => {
          if(err) {
               console.log(err.message);
          }

          else {
               if(result.length > 0) {
                    req.flash('error', 'Email already exists!');
                    res.redirect('register');
               }

               else {
                    bcrypt.hash(password, saltRounds, function(err, hash) {
                         const sql = "INSERT INTO users VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)";

                         con.query(sql, [fname, lname, email, hash,0, 0, user_key], (err) => {
                              if(err) console.log(err.message);

                              let transporter = nodemailer.createTransport({
                                   host: "smtp.elasticemail.com",
                                   port: 2525,
                                   secure: false,
                                   auth: {
                                     user: 'marvin.directobautista@gmail.com',
                                     pass: 'D45AB4295D0EA021E959236C3D4C3F73D9F7',
                                     
                                   },
                                   tls: {
                                        ciphers: 'SSLv3'
                                   }
                              });

                              let info = transporter.sendMail({
                                   from: 'marvin.directobautista@gmail.com', // sender address
                                   to: email, // list of receivers
                                   subject: 'Email verification | Acer PH', // Subject line
                                   text: user_key, // plain text body
                                   html: "<h1>Verify to use your account</h1><br><p>You have just signed up using this email. To confirm, click <a href='localhost:5000/verify/"+ user_key +"'>here</a>.</p>", // html body
                              });

                              req.flash('notif', 'Email verification link is sent to your email.')
                              res.redirect('login');
                              
                         })
                    });
               }
          }
     });
}

exports.getVerify = (req, res) => {
     let user_key = req.params.auth;
     const sql = "SELECT * FROM users where user_key=?";

     con.query(sql, [user_key], (err, result) => {
          if(result.length > 0) {
               const sql = "UPDATE users SET user_isVerified = ? WHERE user_key = ?";

               con.query(sql, [1, user_key], (err) => {

                    if(err) console.log(err.message);
                    
                    else{
                         function generateRandomString(n) {
                              let randomString = '';
                              let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                          
                              for ( let i = 0; i < n; i++ ) {
                                randomString += characters.charAt(Math.floor(Math.random()*characters.length));
                              }
                    
                             return randomString;
                         }

                         const newKey = generateRandomString(120);

                         const sql = "UPDATE users SET user_key = ? WHERE user_key = ?";

                         con.query(sql, [newKey, user_key], (err) => {

                         });
                         res.render('verify', {auth: true});
                    }
               });
          }

          else {
               res.render('verify', {auth: false});
          }
     });
}

exports.getForgot = (req, res) => {
     let error = req.flash('error');

     res.render('forgot-password', {error});
}

exports.postForgot = (req, res) => {
     let email = req.body.email;

     const sql = "SELECT * FROM users WHERE user_email = ?";

     con.query(sql, [email], (err, result) => {
          if(err) console.log(err.message);

          else {
               if(result.length < 1) {
                    req.flash('error', 'Email does not exists!');
                    res.redirect('forgot-password');
                        
               }

                else {
                    let user_key = result[0].user_key;

                    let transporter = nodemailer.createTransport({
                         host: "smtp.elasticemail.com",
                         port: 2525,
                         secure: false,
                         auth: {
                           user: 'marvin.directobautista@gmail.com',
                           pass: 'D45AB4295D0EA021E959236C3D4C3F73D9F7',
                           
                         },
                         tls: {
                              ciphers: 'SSLv3'
                         }
                    });

                    let info = transporter.sendMail({
                         from: 'marvin.directobautista@gmail.com', // sender address
                         to: email, // list of receivers
                         subject: 'Reset link | Acer PH', // Subject line
                         text: user_key, // plain text body
                         html: "<h1>Password reset</h1><br><p>You have requested a password reset link. To change your password, click <a href='localhost:5000/new-password/"+ user_key +"'>here</a>.</p>", // html body
                    });

                    req.flash('notif', 'Password reset link sent!');
                    res.redirect('login');
                }
          }
     });
}

exports.getNew = (req, res) => {
     let user_key = req.params.auth;

     const sql = "SELECT * FROM users WHERE user_key = ?";

     con.query(sql, [user_key], (err, result) => {
          if(result.length > 0) {
               res.render('new-password', {auth: true, user_key});
          }

          else {
               res.render('new-password', {auth: false});
          }
     });
}

exports.postNew = (req, res) => {
     let user_key = req.body.user_key;
     let new_password = req.body.new_password;
     const saltRounds = 10;

     bcrypt.hash(new_password, saltRounds, (err, hash) => {
          const sql = "UPDATE users SET user_password = ? WHERE user_key = ?";

          con.query(sql, [hash, user_key], (err) => {
               function generateRandomString(n) {
                    let randomString = '';
                    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                
                    for ( let i = 0; i < n; i++ ) {
                      randomString += characters.charAt(Math.floor(Math.random()*characters.length));
                    }
          
                   return randomString;
               }

               const newKey = generateRandomString(120);

               const sql = "UPDATE users SET user_key = ? WHERE user_key = ?";

               con.query(sql, [newKey, user_key], (err) => {
                    req.flash('notif', 'Password successfully changed!');
                    res.redirect('login');
               })
          });
     })
}

// admin

exports.getAdminLogin = (req, res) => {
     if(req.session.admin) {
          res.redirect('/home');
     }

     let error = req.flash('error');
     let notif = req.flash('notif');

     res.render('./admin/login', {error, notif});
}

exports.postAdminLogin = (req, res) => {
     let email = req.body.email;
     let password = req.body.password;

     const sql = "SELECT * FROM admin WHERE admin_email=?";

     con.query(sql, [email], (err, result) => {
          if(err) {
               console.log(err.message);
          }

          else {
               if(result.length > 0) {
                    const hash = result[0].admin_password;

                    bcrypt.compare(password, hash, function(err, match) {
                         if(err) {
                              console.log(err.message);
                         }
                         else {
                              if(match) {
                                   req.session.admin = result[0].admin_email;
                                   res.redirect('home');
                              }
                         
                              else {
                                   req.flash('error', 'Incorrect email/password.');
                                   res.redirect('login');
                              }
                         }
                    })
               }

               else {
                    req.flash('error', 'Incorrect email/password.')
                    res.redirect('login');
               }
          }
     });
}

exports.getAdminHome = (req, res) => {
     let deleted = req.flash('deleted');
     let added = req.flash('added');

     const sql = "SELECT * FROM products INNER JOIN categories WHERE products.category_id = categories.category_id";

     con.query(sql, (err, products) => {
          if(err) console.log(err.message);

          else {
               res.render('./admin/home', {products, deleted, added});
          }
     });
}

exports.productDelete = (req, res) => {
     let id = req.body.p_id;

     const sql = "DELETE FROM products WHERE product_id = ?";

     con.query(sql, [id], (err, products) => {
          if(err) console.log(err.message);

          else {
               req.flash('deleted', 'Product deleted');
               res.redirect('home');
          }
     });
}

exports.getAddProduct = (req, res) => {
     const sql = "SELECT * FROM categories";

     con.query(sql, (err, category) => {
          if(err) console.log(err.message);

          else {
               res.render('./admin/add-product', {category});
          }
     });
}

exports.postAddProduct = (req, res) => {
     let p_name = req.body.p_name;
     let p_category = req.body.p_category;
     let p_desc = req.body.p_desc;
     let p_price = req.body.p_price;
     let p_image = req.file.filename;

     const sql = "INSERT INTO products VALUES (NULL, ?, ?, ?, ?, ?, ?)";

     con.query(sql, [p_category, p_name, p_desc, p_price, 0, p_image], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('added', 'Product added');
               res.redirect('home');
          }
     });
}

exports.addFeature = (req, res) => {
     let p_id = req.body.p_id;

     const sql = "UPDATE products SET product_isFeatured = ? WHERE product_id = ?";

     con.query(sql, [1, p_id], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('added', 'Product set to featured items');
               res.redirect('home');
          }
     })
}

exports.getEdit = (req, res) => {
     let p_id = req.params.id;

     const sql = "SELECT * FROM products INNER JOIN categories on products.category_id = categories.category_id WHERE products.product_id = ?";

     con.query(sql, [p_id], (err, result) => {
          if(err) console.log(err.message);

          else {
               const sql = "SELECT * FROM categories";

               con.query(sql, (err, category) => {
                    if(err) console.log(err.message);

                    else {
                         res.render('./admin/edit-product', {result, category});
                    }
               });
          }
     });
}

exports.updateProduct = (req, res) => {
     let p_id = parseInt(req.params.id);

     let p_name = req.body.p_name;
     let p_category = req.body.p_category;
     let p_desc = req.body.p_desc;
     let p_price = req.body.p_price;
     let p_image = req.file.filename;

     const sql = "UPDATE products SET product_name = ?, category_id = ?, product_desc = ?, product_price = ?, product_image = ? WHERE product_id = ?";

     con.query(sql, [p_name, p_category, p_desc, p_price, p_image, p_id], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('added', 'Product updated!');
               res.redirect('/admin/home');
          }
     })
}

exports.getFeatured = (req, res) => {
     let deleted = req.flash('deleted');

     const sql = "SELECT * FROM products INNER JOIN categories WHERE products.category_id = categories.category_id AND products.product_isFeatured = ?";

     con.query(sql, [1], (err, products) => {
          if(err) console.log(err.message);

          else {
               res.render('./admin/featured-products', {products, deleted});
          }
     });
}

exports.delFeatured = (req, res) => {
     let p_id = req.body.p_id;

     const sql = "UPDATE products SET product_isFeatured = ? WHERE product_id = ?";

     con.query(sql, [0, p_id], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('deleted', 'Product removed.');
               res.redirect('featured-products');
          }
     })
}

exports.getCategories = (req, res) => {
     const sql = "SELECT * FROM categories";
     let deleted = req.flash('deleted');
     let added = req.flash('added');

     con.query(sql, (err, category) => {
          if(err) console.log(err.message);

          else {
               res.render('./admin/categories', {category, deleted, added});
          }
     })
}

exports.addCategories = (req, res) => {
     const cat_desc = req.body.new_cat;

     const sql = "INSERT INTO categories VALUES (NULL, ?)";

     con.query(sql, [cat_desc], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('added', 'Category added!');
               res.redirect('categories');
          }
     });
}

exports.delCat = (req, res) => {
     const cat_id = req.body.c_id;

     const sql = "DELETE FROM categories WHERE category_id = ?";

     con.query(sql, [cat_id], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('deleted', 'Category deleted!');
               res.redirect('categories');
          }
     });
}

exports.getClientOrders = (req, res) => {
     let deleted = req.flash('deleted');
     let added = req.flash('added');
     const sql = "SELECT * FROM orders INNER JOIN products ON orders.product_id = products.product_id INNER JOIN categories ON products.category_id = categories.category_id INNER JOIN users ON orders.user_id = users.user_id";

     con.query(sql, (err, result) => {
          if(err) console.log(err.message);
          
          else {
               res.render('./admin/client-orders', {result, deleted, added});
          }
     });
}

exports.approveOrder = (req, res) => {
     const order_id = parseInt(req.body.order_id);

     const sql = "UPDATE orders SET order_status = ? WHERE order_id = ?";

     con.query(sql, [1, order_id], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('added', 'Order approved!');
               res.redirect('client-orders');
          }
     });
}

exports.disapproveOrder = (req, res) => {
     const order_id = parseInt(req.body.order_id);

     const sql = "UPDATE orders SET order_status = ? WHERE order_id = ?";

     con.query(sql, [2, order_id], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('deleted', 'Order disapproved!');
               res.redirect('client-orders');
          }
     });
}

exports.getClientUsers = (req, res) => {
     const sql = "SELECT * FROM users";
     let added = req.flash('added');
     let deleted = req.flash('deleted');
     
     con.query(sql, (err, result) => {
          if(err) console.log(err.message);

          else {
               res.render('./admin/client-users', {result, deleted, added});
          }
     })
}

exports.banUser = (req, res) => {
     const user_id = parseInt(req.body.user_id);

     const sql = "UPDATE users SET user_isBanned = ? WHERE user_id = ?";

     con.query(sql, [1, user_id], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('deleted', 'User is banned!');
               res.redirect('client-users');
          }
     });
}

exports.undoAction = (req, res) => {
     const user_id = parseInt(req.body.user_id);

     const sql = "UPDATE users SET user_isBanned = ? WHERE user_id = ?";

     con.query(sql, [0, user_id], (err) => {
          if(err) console.log(err.message);

          else {
               req.flash('added', 'Updated successfully!');
               res.redirect('client-users');
          }
     });
}

exports.getLogout = (req, res) => {
     req.session.destroy();
     res.redirect('/admin/login');
}